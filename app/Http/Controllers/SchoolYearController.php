<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\Course;
use App\Models\Department;
use App\Models\Program;
use App\Models\Schedule;
use App\Models\SchoolYear;
use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;


class SchoolYearController extends Controller
{

    // Show school year index
    public function index()
    {
        return view('pages.employees.schedule_management.school_year_layout');
    }

    public function schoolYearSchedulesIndex(Request $request)
    {
        $id = $request->input('id');
        $schoolYearId = $request->input('id');

        //School year
        $schoolYear = SchoolYear::with('schedules')->findOrFail($schoolYearId);
        $schoolYearName = 'S.Y. '. $schoolYear->school_year_from .'-'. $schoolYear->school_year_to;
        $semesterName = '';
        
        if($schoolYear->semester == 1){
            $semesterName = "1st Semester";
        }else if($schoolYear->semester == 2){
            $semesterName = "2nd Semester";
        }else{
            $semesterName = "Summer";
        }

        // Schedules
        $schedules = Schedule::with('slots.college')
                       ->where('school_year_id', $id) 
                       ->get();
        $groupedSchedules = $schedules->groupBy('schedule_type');
        $scheduleTypes = ['Regular Students', 'Irregular Students', 'Residual Students'];

        //College
        $colleges = College::orderBy('college_name')->get();

        foreach ($schedules as $schedule) {
            $lookup = ['am' => [], 'pm' => []]; 

            foreach ($schedule->slots as $slot) {
                if ($slot->am_slots) {
                    $lookup['am'][$slot->college_id] = $slot;
                }
                if ($slot->pm_slots) {
                    $lookup['pm'][$slot->college_id] = $slot;
                }
            }
            $schedule->slotsLookup = $lookup;
        }

        return view('pages.employees.schedule_management.school_year_layout', 
            compact('schoolYear', 
                    'schoolYearName', 
                    'semesterName', 
                    'groupedSchedules', 
                    'scheduleTypes',
                    'colleges',
            )
        );
    }

    // Fetch school years
    public function fetchSchoolYears()
    {
        $schoolYears = SchoolYear::all();

        return DataTables::of($schoolYears)
            ->addColumn('school_year', function($schoolYear) {
                return 'S.Y. '. $schoolYear->school_year_from .'-'. $schoolYear->school_year_to;
            })
            ->editColumn('semester_start_date', function($schoolYears) {
                return $schoolYears->semester_start_date
                    ? Carbon::parse($schoolYears->semester_start_date)->format('F d, Y')
                    : 'N/A';
            })
            ->editColumn('semester_end_date', function($schoolYears) {
                return $schoolYears->semester_end_date
                    ? Carbon::parse($schoolYears->semester_end_date)->format('F d, Y')
                    : 'N/A';
            })
            ->editColumn('created_at', function($schoolYears) {
                return Carbon::parse($schoolYears->created_at)->format('m-d-Y h:i A');
            })
            ->editColumn('updated_at', function($schoolYears) {
                return Carbon::parse($schoolYears->updated_at)->format('m-d-Y h:i A');
            })
            ->make(true);
    }

    // Check if the semester is already existing
    public function checkSemesters(Request $request)
    {
        $request->validate([
            'year_from' => 'required|integer',
            'year_to' => 'required|integer',
        ]);

        $existingSemesters = SchoolYear::where('school_year_from', $request->year_from)
                                    ->where('school_year_to', $request->year_to)
                                    ->pluck('semester'); 

        return response()->json($existingSemesters);
    }

    // Create school years
    public function createSchoolYear(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_year_from' => 'required',
            'school_year_to'=> 'required',
            'semester'=> 'required',
            'semester_start_date' => 'required',
            'semester_end_date' => 'required'
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
            $schoolYear = new SchoolYear();

            // Handle form fields 
            $schoolYear->school_year_from = $request->school_year_from;
            $schoolYear->school_year_to = $request->school_year_to;
            $schoolYear->semester = $request->semester;
            $schoolYear->semester_start_date = $request->semester_start_date;
            $schoolYear->semester_end_date = $request->semester_end_date;
            $schoolYear->is_active = 0;

            $schoolYear->save();

            DB::commit();

            //Log user activity
            UserLogsProvider::log('created a new school_year: ' . $schoolYear->school_year_from .'-'. $schoolYear->school_year_to .', Sem ' . $schoolYear->semester);

            if ($request->ajax()) {
                return response()->json([
                    'message' => 'School year and semester successfully created!',
                    'type' => 'success',
                ], 200);
            } else {
                // If it's a normal form submission
                return redirect()->back()->with('toast', [
                    'text' => 'School year and semester successfully created!',
                    'type' => 'success',
                ]);
            }

        }catch(\Exception $e){
            DB::rollback();
            return redirect()->back()->with('toast', [
                'text' => 'Failed creating new school year and semester.' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
         
    }

    // Edit school year
    public function editSchoolYear($id)
    {
        $schoolYear = SchoolYear::find($id);
        $semesterStart = $schoolYear->semester_start_date->format('Y-m-d');
        $semesterEnd = $schoolYear->semester_end_date->format('Y-m-d');

        return response()->json([
            'id' => $schoolYear->id,
            'school_year_from' => $schoolYear->school_year_from,
            'school_year_to' => $schoolYear->school_year_to,
            'semester' => $schoolYear->semester,
            'semester_start_date' => $semesterStart,
            'semester_end_date' => $semesterEnd
        ]);
    }

    // Update school year
    public function updateSchoolYear(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'edit_school_year_from' => 'required',
            'edit_school_year_to'=> 'required',
            'edit_semester'=> 'required',
            'edit_semester_start_date' => 'required',
            'edit_semester_end_date' => 'required'
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
            $updateSchoolYear = SchoolYear::findOrFail($id);
            $updateSchoolYear->school_year_from = $request->edit_school_year_from;
            $updateSchoolYear->school_year_to = $request->edit_school_year_to;
            $updateSchoolYear->semester = $request->edit_semester;
            $updateSchoolYear->semester_start_date = $request->edit_semester_start_date;
            $updateSchoolYear->semester_end_date = $request->edit_semester_end_date;

            $updateSchoolYear->save();

            DB::commit();

            //Log user activity
            UserLogsProvider::log('updated sschool year: ' . $updateSchoolYear->school_year_from .'-'. $updateSchoolYear->school_year_to .', Sem ' . $updateSchoolYear->semester);

            return response()->json([
                'message' => 'School year and semester succesfully updated!',
                'type' => 'success',
            ]);

        }catch(\Exception $e){
            DB::rollback();
            return response()->json([
                'message' => 'Failed to update school year and semester.' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
         
    }

    // Update school year status
    public function updateSchoolYearStatus(Request $request, $id)
    {
        DB::beginTransaction();

        try{

            if ($request->is_active) {
                SchoolYear::where('id', '!=', $id)->update(['is_active' => 0]);
            }

            $updateSchoolYear = SchoolYear::findOrFail($id);
            $updateSchoolYear->is_active = $request->is_active;

            $updateSchoolYear->save();

            DB::commit();

            //Log user activity
            UserLogsProvider::log('updated school year status: ' . $updateSchoolYear->school_year_from .'-'. $updateSchoolYear->school_year_to .', Sem ' . $updateSchoolYear->semester);

            return response()->json([
                'message' => 'School year status succesfully updated!',
                'type' => 'success',
            ]);

        }catch(\Exception $e){
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update school year status.' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
         
    }

    // Delete school year
    public function deleteSchoolYear($id)
    {
        DB::beginTransaction();
        
        try {
            $schoolYear = SchoolYear::findOrFail($id);

            DB::commit();

            // Log user activity
            UserLogsProvider::log('deleted school year: ' . $schoolYear->school_year_from .'-'. $schoolYear->school_year_to .', Sem ' . $schoolYear->semester);
            $schoolYear->delete();

            return response()->json([
                'message' => 'School year and semester deleted successfully!',
                'type' => 'success',
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed deleting school year and semester. ' . $e->getMessage(),
                'type' => 'error',
            ], 500);
        }
    }
    
}