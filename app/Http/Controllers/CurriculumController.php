<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\Course;
use App\Models\Curriculum;
use App\Models\Department;
use App\Models\Program;
use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;


class CurriculumController extends Controller
{

    // Show curriculum index
    public function curriculumIndex()
    {
        return view('pages.employees.curriculum_management.curriculums_layout');
    }

    public function curriculumBuilderIndex()
    {
        $programs = Program::all();
        $courses = Course::all();

        return view('pages.employees.curriculum_management.curriculums_layout', compact('programs', 'courses'));
    }

    public function curriculumDetailsIndex(Request $request)
    {
        $curriculumId = $request->input('id');

        $curriculum = Curriculum::with('courses', 'program')->findOrFail($curriculumId);
        $curriculumCourses = $curriculum->courses;

        $programs = Program::all();
        $courses = Course::all();

        $addedCourseIds = $curriculum->courses->pluck('id');
        $availableCourses = $curriculumCourses->whereNotIn('id', $addedCourseIds);
        $groupedCourses = $curriculum->courses->groupBy(['pivot.year_level', 'pivot.semester']);

        return view('pages.employees.curriculum_management.curriculums_layout', compact('curriculum', 'programs', 'courses', 'groupedCourses'));
    }

    // Show curriculum builder index
    public function curriculumBuilderStep2($id)
    {

        $curriculum = Curriculum::with('courses')->findOrFail($id);
        $curriculumCourses = $curriculum->courses;

        $addedCourseIds = $curriculum->courses->pluck('id');
        $availableCourses = $curriculumCourses->whereNotIn('id', $addedCourseIds);

        $groupedCourses = $curriculum->courses->groupBy(['pivot.year_level', 'pivot.semester']);

        return view('pages.employees.curriculum_management.curriculums_layout', compact('curriculum', 'programName', 'availableCourses', 'groupedCourses'));
    }

    // Fetch courses
    public function fetchCurriculums()
    {
        $query = Curriculum::with('program', 'courses');

        return DataTables::of($query)
            ->editColumn('created_at', function($curriculum) {
                return $curriculum->created_at 
                    ? Carbon::parse($curriculum->created_at)->format('m-d-Y h:i A')
                    : null;
            })
            ->editColumn('updated_at', function($curriculum) {
                return $curriculum->updated_at
                    ? Carbon::parse($curriculum->updated_at)->format('m-d-Y h:i A')
                    : null;
            })
            ->addColumn('program_name', function ($curriculum) {
                return $curriculum->program->program_name ?? 'Unknown';
            })
            ->addColumn('course_count', function ($curriculum) {
                return $curriculum->courses->count();
            })
            ->addColumn('total_units', function ($curriculum) {
                return $curriculum->courses->sum('units'); 
            })
            ->make(true);
    }

    // Create programs
    public function createCurriculum(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'curriculum_name' => 'required|string|max:255',
            'curriculum_code'=> 'required|string|max:255|unique:curriculums,curriculum_code',
            'program_id'=> 'required|exists:programs,id'
        ]);

        if ($validator->fails()) {
            if ($request->ajax()) {
                return response()->json([
                    'success' => false, 
                    'errors'  => $validator->errors(),
                ], 422);
            }
            return redirect()->back()->withErrors($validator)->withInput();
        }

        DB::beginTransaction();

        try{

            $curriculum = Curriculum::create([
                'curriculum_code' => $request->curriculum_code,
                'curriculum_name' => $request->curriculum_name,
                'program_id' => $request->program_id,
            ]);

            //Log user activity
            UserLogsProvider::log('created a new curriculum: ' . $curriculum->curriculum_code);

            $program = Program::find($curriculum->program_id);

            $allCourses = Course::all(); 
            $availableCourses = $allCourses;
            $groupedCourses = collect([]);

            $builderHtml = view('pages.employees.curriculum_management.curriculum_builder_add_courses', compact('curriculum', 'program', 'availableCourses', 'groupedCourses'))->render();

            return response()->json([
                'success'      => true,
                'message'      => 'Curriculum created successfully!',
                'type' => 'success',
                'builder_html' => $builderHtml
            ]);

            DB::commit();

        }catch(\Exception $e){
            DB::rollBack();
            if ($request->ajax()) {
                $errorMessage = config('app.debug') 
                    ? 'Error: ' . $e->getMessage() 
                    : 'A server error occurred while creating the curriculum.';

                return response()->json([
                    'success' => false,
                    'message' => $errorMessage
                ], 500); // 500 Internal Server Error
            }

            // Fallback for non-AJAX requests
            return redirect()->back()->with('toast', [
                'text' => 'Failed creating new curriculum.',
                'type' => 'error',
            ]);
        }
         
    }

    public function updateCurriculum(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'curriculum_name' => 'string|max:255',
            'curriculum_code'=> 'string|max:255',
            'program_id'=> 'exists:programs,id',
        ]);

        if ($validator->fails()) {
            if ($request->ajax()) {
                return response()->json([
                    'success' => false, 
                    'errors'  => $validator->errors(),
                ], 422);
            }
            return redirect()->back()->withErrors($validator)->withInput();
        }

        DB::beginTransaction();

        try{
            $updateCurriculum = Curriculum::findOrFail($id);
            $updateCurriculum->curriculum_code = $request->edit_curriculum_code;
            $updateCurriculum->curriculum_name = $request->edit_curriculum_name;
            $updateCurriculum->program_id = $request->edit_program_id;

            $updateCurriculum->save();

            DB::commit();

            //Log user activity
            UserLogsProvider::log('updated curriculum: ' . $updateCurriculum->curriculum_code .' - '. $updateCurriculum->curriculum_name);

            return response()->json([
                'message' => 'Curriculum updated successfully!',
                'type' => 'success',
            ], 200);

        }catch(\Exception $e){
            DB::rollBack();
            return response()->json([
                'message' => 'There was an error updating this curriculum: '. $e->getMessage(),
                'type' => 'error',
            ], 200);
        }
    }

    public function addCourses(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'course_ids'   => 'required|array',
            'course_ids.*' => 'exists:courses,id',
            'year_level'   => 'required|integer',
            'semester'     => 'required|integer',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try{
            $curriculum = Curriculum::findOrFail($id);
        
            foreach ($request->course_ids as $courseId) {
                $curriculum->courses()->attach($courseId, [
                    'year_level' => $request->year_level,
                    'semester'   => $request->semester,
                ]);
            }

            DB::commit();

            // Return the updated view for the entire builder
            if($request->routeIs('employee.curriculum_details.storeCourse')){
                return response()->json([
                    'message' => 'Course/s added successfully!',
                    'type' => 'success',
                ], 200);
            }else{
                return $this->getRefreshedBuilder($curriculum->id);
            }

        }catch(\Exception $e){
            DB::rollBack();
            return response()->json([
                'message' => 'There was a problem adding course/s ' . $e->getMessage(),
                'type' => 'success',
            ], 404);
        }
    }

    public function removeCourse(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'course_id'  => 'required|exists:courses,id',
            'year_level' => 'required|integer',
            'semester'   => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        
        try{
            $curriculum = Curriculum::findOrFail($id);
            $curriculum->courses()
                ->wherePivot('year_level', $request->year_level)
                ->wherePivot('semester', $request->semester)
                ->detach($request->course_id);

            DB::commit();

            if($request->routeIs('employee.curriculum_details.deleteCourse')){
                return redirect()->back()->with('toast', [
                    'text' => 'Course/s successfully deleted!',
                    'type' => 'success',
                ]);
            }else{
                return $this->getRefreshedBuilder($curriculum->id);
            }


        }catch(\Exception $e){
            DB::rollBack();
            return redirect()->back()->with('toast', [
                'text' => 'There was an error removing course/s ' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
    }

    private function getRefreshedBuilder($id)
    {
        $curriculum = Curriculum::with('courses', 'program')->findOrFail($id);
        $program = $curriculum->program;
        
        $addedCourseIds = $curriculum->courses->pluck('id');
        $allCourses = Course::all();
        $availableCourses = $allCourses->whereNotIn('id', $addedCourseIds);

        $groupedCourses = $curriculum->courses->groupBy(['pivot.year_level', 'pivot.semester']);

        $builderHtml = view('pages.employees.curriculum_management.curriculum_builder_add_courses', compact('curriculum', 'program', 'availableCourses', 'groupedCourses'))->render();

        return response()->json(['success' => true, 'builder_html' => $builderHtml]);
    }

    // Update curriculum status
    public function updateCurriculumStatus(Request $request, $id)
    {
        DB::beginTransaction();

        try{

            $updateCurriculum = Curriculum::findOrFail($id);

            if ($request->is_active) {
                Curriculum::where('program_id', $updateCurriculum->program_id)
                        ->update(['is_active' => 0]);
            }

            $updateCurriculum->is_active = $request->is_active;
            $updateCurriculum->save();

            DB::commit();

            //Log user activity
            UserLogsProvider::log('updated curriculum status for: ' . $updateCurriculum->curriculum_name);

            return response()->json([
                'message' => 'Curriculum status succesfully updated!',
                'type' => 'success',
            ]);

        }catch(\Exception $e){
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update curriculum status.' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
         
    }

    // Delete curriculum
    public function deleteCurriculum($id)
    {
        DB::beginTransaction();
        try {
            $curriculum = Curriculum::findOrFail($id);
            $curriculum->delete();

            DB::commit();

            // Log user activity
            UserLogsProvider::log('deleted curriculum: ' . $curriculum->curriculum_code .' - '. $curriculum->curriculum_name);

            return response()->json([
                'message' => 'Curriculum deleted successfully!',
                'type' => 'success',
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete curriculum. ' . $e->getMessage(),
                'type' => 'error',
            ], 500);
        }
    }
    
}