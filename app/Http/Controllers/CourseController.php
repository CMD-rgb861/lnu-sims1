<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\Course;
use App\Models\Department;
use App\Models\Program;
use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;


class CourseController extends Controller
{

    // Show courses index
    public function index()
    {
        return view('pages.employees.curriculum_management.course_catalog_layout');
    }

    // Fetch courses
    public function fetchCourses()
    {
        $courses = Course::all();

        return DataTables::of($courses)
            ->editColumn('created_at', function($courses) {
                return Carbon::parse($courses->created_at)->format('m-d-Y h:i A');
            })
            ->editColumn('updated_at', function($courses) {
                return Carbon::parse($courses->updated_at)->format('m-d-Y h:i A');
            })
            ->make(true);
    }

    // Create course
    public function createCourse(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_code' => 'required|string|max:10|unique:courses,course_code',
            'course_name'=> 'required|string|max:255',
            'units'=> 'required|numeric:strict|max:9'
        ]);

        if ($validator->fails()) 
        {
            if ($request->ajax()) 
            {
                return response()->json([
                    'errors' => $validator->errors(),
                ], 422);
            }
        }

        DB::beginTransaction();

        try{
            $course = new Course();
            $course->course_code = $request->course_code;
            $course->course_name = $request->course_name;
            $course->units = $request->units;

            $course->save();

            DB::commit();

            //Log user activity
            UserLogsProvider::log('created a new course: ' . $course->course_code .' - '. $course->course_name);

            if ($request->ajax()) {
                return response()->json([
                    'message' => 'Course successfully created!',
                    'type' => 'success',
                ], 200);
            } else {
                return redirect()->back()->with('toast', [
                    'text' => 'Course successfully created!',
                    'type' => 'success',
                ]);
            }

        }catch(\Exception $e){
            DB::rollBack();
            return redirect()->back()->with('toast', [
                'text' => 'Failed creating new course.' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
         
    }

    // Edit program
    public function editCourse($id)
    {
        $course = Course::find($id);
        return response()->json([
            'id' => $course->id,
            'course_code' => $course->course_code,
            'course_name' => $course->course_name,
            'units' => $course->units,
        ]);
    }

    // Update program
    public function updateCourse(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'course_code' => 'required|string|max:10',
            'course_name'=> 'required|string|max:255',
            'units'=> 'required|numeric:strict|max:9'
        ]);

        if ($validator->fails()) 
        {
            if ($request->ajax()) 
            {
                return response()->json([
                    'errors' => $validator->errors(),
                ], 422);
            }
        }

        DB::beginTransaction();

        try{
            $updateCourse = Course::findOrFail($id);
            $updateCourse->course_code = $request->course_code;
            $updateCourse->course_name = $request->course_name;
            $updateCourse->units = $request->units;

            $updateCourse->save();

            DB::commit();

            //Log user activity
            UserLogsProvider::log('updated course: ' . $updateCourse->course_code .' - '. $updateCourse->course_name);

            return response()->json([
                'message' => 'Course succesfully updated!',
                'type' => 'success',
            ]);

        }catch(\Exception $e){
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update course.' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
         
    }

    // Delete course
    public function deleteCourse($id)
    {
        DB::beginTransaction();
        try {
            $course = Course::findOrFail($id);
            $course->delete();

            DB::commit();

            // Log user activity
            UserLogsProvider::log('deleted course: ' . $course->course_code .' - '. $course->course_name);

            return response()->json([
                'message' => 'Course deleted successfully!',
                'type' => 'success',
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete course. ' . $e->getMessage(),
                'type' => 'error',
            ], 500);
        }
    }
    
}