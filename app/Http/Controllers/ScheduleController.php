<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\Course;
use App\Models\Department;
use App\Models\Program;
use App\Models\Schedule;
use App\Models\ScheduleSlot;
use App\Models\SchoolYear;
use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;


class ScheduleController extends Controller
{


    // Show schedules page
    public function index()
    {
        return view('pages.employees.schedule_management.schedules_layout');
    }

    // Fetch schedules
    public function fetchSchedules()
    {
        $schedules = Schedule::with('school_year', 'slots')
                    ->orderBy('schedule_date', 'ASC')
                    ->get();

        return DataTables::of($schedules)
            ->addColumn('school_year', function($schedules) {
                return 'S.Y. '. $schedules->school_year->school_year_from .'-'. $schedules->school_year->school_year_to;
            })
            ->addColumn('total_slots', function($schedules) {
                return $schedules->slots->sum('am_slots') + $schedules->slots->sum('pm_slots') . ' slots';
            })
            ->editColumn('schedule_date', function($schedules) {
                return $schedules->schedule_date
                    ? Carbon::parse($schedules->schedule_date)->format('F d, Y')
                    : 'N/A';
            })
            ->editColumn('semester', function($schedules) {
                return $schedules->school_year->semester;
            })
            ->editColumn('created_at', function($schedules) {
                return Carbon::parse($schedules->created_at)->format('m-d-Y h:i A');
            })
            ->editColumn('updated_at', function($schedules) {
                return Carbon::parse($schedules->updated_at)->format('m-d-Y h:i A');
            })
            ->make(true);
    }

    public function fetchSlots(Schedule $schedule)
    {
        $schedule->load('slots');
        $colleges = College::orderBy('college_name', 'asc')->get();

        $slotsLookup = [
            'am' => [],
            'pm' => [],
        ];

        foreach ($schedule->slots as $slot) {
            if ($slot->am_slots > 0) {
                $slotsLookup['am'][$slot->college_id] = $slot;
            }
            if ($slot->pm_slots > 0) {
                $slotsLookup['pm'][$slot->college_id] = $slot;
            }
        }

        return view('pages.employees.schedule_management.schedule_slots_table', [
            'schedule' => $schedule,
            'colleges' => $colleges,
            'slotsLookup' => $slotsLookup,
        ]);
    }

    // Create schedules
    public function createSchedule(Request $request, $id)
    {

        $colleges = College::all();

        $rules = [
            'schedule_date' => 'required|date',
            'schedule_type' => 'required|integer',
            'year_level'    => 'required|integer',
        ];

        foreach ($colleges as $college) {
            $rules[$college->college_acronym . '_am_slots'] = 'required|integer';
            $rules[$college->college_acronym . '_pm_slots'] = 'required|integer';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) 
        {
            if ($request->ajax()) 
            {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            return redirect()->back()->withErrors($validator)->withInput();
        }

        DB::beginTransaction();

        try {
            $schedule = new Schedule();
            $scheduleId = $request->input('id');

            $schedule->school_year_id = $scheduleId;
            $schedule->schedule_date = $request->schedule_date;
            $schedule->schedule_type = $request->schedule_type;
            $schedule->year_level = $request->year_level;
            $schedule->save(); 

            foreach ($colleges as $college) {
                $am_slots_value = $request->input($college->college_acronym . '_am_slots');
                $pm_slots_value = $request->input($college->college_acronym . '_pm_slots');

                ScheduleSlot::create([
                    'schedule_id' => $schedule->id,
                    'college_id'  => $college->id,
                    'am_slots'    => $am_slots_value,
                    'pm_slots'    => $pm_slots_value,
                ]);
            }

            $schedType = '';

            if ($request->schedule_type == 1) {
                $schedType = "Regular Students";
            } else if ($request->schedule_type == 2) {
                $schedType = "Irregular Students";
            } else {
                $schedType = "Residual Students";
            }

            DB::commit(); 

            UserLogsProvider::log('created a new schedule: ' . 'Year ' . $schedule->year_level . ' on ' . $schedule->schedule_date . ' for ' . $schedType);

            return redirect()->back()->with('toast', [
                'text' => 'Schedule successfully created!',
                'type' => 'success',
            ]);

        } catch (\Exception $e) {
            DB::rollback(); 
            return redirect()->back()->with('toast', [ 
                'text' => 'Failed creating new schedule. ' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
    }

    // Edit schedule
    public function editSchedule(Schedule $schedule)
    {
        $schedule->load('slots');
        $colleges = College::all();
        $slotsByCollegeId = $schedule->slots->keyBy('college_id');

        return response()->json([
            'id' => $schedule->id,
            'schedule_date' => $schedule->schedule_date->format('Y-m-d'),
            'schedule_type' => $schedule->schedule_type,
            'year_level' => $schedule->year_level,
            'colleges' => $colleges,
            'slotsByCollegeId' => $slotsByCollegeId
        ]);
    }

    // Update school year
    public function updateSchoolYear(Request $request, $id)
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
            $updateSchoolYear = SchoolYear::findOrFail($id);
            $updateSchoolYear->school_year_from = $request->school_year_from;
            $updateSchoolYear->school_year_to = $request->school_year_to;
            $updateSchoolYear->semester = $request->semester;
            $updateSchoolYear->semester_start_date = $request->semester_start_date;
            $updateSchoolYear->semester_end_date = $request->semester_end_date;

            $updateSchoolYear->save();

            DB::commit();

            //Log user activity
            UserLogsProvider::log('updated school year: ' . $updateSchoolYear->school_year_from .'-'. $updateSchoolYear->school_year_to .', Sem ' . $updateSchoolYear->semester);

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
            return response()->json([
                'message' => 'Failed to update school year status.' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
         
    }

    // Update schedule
    public function updateSchedule(Request $request, $id)
    {
        // 1. Basic Validation for static fields
        $validator = Validator::make($request->all(), [
            'schedule_date' => 'date',
            'schedule_type' => 'string',
            'year_level' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try {
            $schedule = Schedule::findOrFail($id);

            $schedule->update([
                'schedule_date' => $request->input('edit_schedule_date'),
                'schedule_type' => $request->input('edit_schedule_type'),
                'year_level' => $request->input('edit_year_level'),
            ]);

            $schedType = '';

            if ($request->input('edit_schedule_type') == 1) {
                $schedType = "Regular Students";
            } else if ($request->input('edit_schedule_type') == 2) {
                $schedType = "Irregular Students";
            } else {
                $schedType = "Residual Students";
            }

            $colleges = College::all();
            foreach ($colleges as $college) {
                $acronym = $college->college_acronym;

                $am_slots_name = "edit_{$acronym}_am_slots";
                $pm_slots_name = "edit_{$acronym}_pm_slots";

                if ($request->has($am_slots_name) && $request->has($pm_slots_name)) {
                    
                    ScheduleSlot::updateOrCreate(
                        [
                            'schedule_id' => $schedule->id,
                            'college_id'  => $college->id,
                        ],
                        [
                            'am_slots' => $request->input($am_slots_name, 0), // Default to 0 if null
                            'pm_slots' => $request->input($pm_slots_name, 0), // Default to 0 if null
                        ]
                    );
                }
            }

            DB::commit(); 

            UserLogsProvider::log('Update the schedule for: ' . 'Year ' . $request->input('edit_year_level') . ' on ' . $request->input('edit_schedule_date') . ' for ' . $schedType);

            return response()->json([
                'message' => 'Schedule succesfully updated!',
                'type' => 'success',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to update schedule status.' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
    }

    // Delete schedule
    public function deleteSchedule($id)
    {
        DB::beginTransaction();
        
        try {
            $schedule = Schedule::findOrFail($id);
            $schedule->delete();

            DB::commit();
            // Log user activity
            UserLogsProvider::log('deleted schedule: ' . $schedule->schedule_date);

            return response()->json([
                'message' => 'Schedule deleted successfully!',
                'type' => 'success',
            ], 200);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Failed deleting schedule. ' . $e->getMessage(),
                'type' => 'error',
            ], 500);
        }
    }
    
}