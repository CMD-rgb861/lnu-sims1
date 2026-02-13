<?php

namespace App\Http\Controllers;

use App\Models\EnrollmentDetail;
use App\Models\Schedule;
use App\Models\ScheduleStudent;
use App\Models\SchoolYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StudentScheduleController extends Controller
{
    public function index()
    {
        return view('pages.students.enrollment_schedule.enrollment_schedule_layout');
    }

    public function checkBooking()
    {
        $student = Auth::user();
        if (!$student) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        $schoolYear = SchoolYear::where('is_active',1)
            ->orderByDesc('school_year_from')
            ->orderByDesc('semester')
            ->first();

        if(!$schoolYear){
            return response()->json(['error' => 'Not Availalble.'], 401);
        }

        $currentSchoolYearId = $schoolYear->id;

        $enrollmentDetails = EnrollmentDetail::with('program')
            ->where('student_account_id', $student->id)
            ->where('school_year_id', $currentSchoolYearId)
            ->first();

        if (!$enrollmentDetails) {
            return response()->json(['error' => 'No active enrollment details found for this year.'], 404);
        }

        $studentProgramLevelId = $enrollmentDetails->program->program_level_id; 

        if($studentProgramLevelId !== 7 && $studentProgramLevelId !== 8){
            return response()->json(['error' => '', 403]);
        }
        
        $activeSy = SchoolYear::where('is_active', 1)->first();

        if (!$activeSy) {
            return response()->json(['exists' => false]);
        }        

        $booking = ScheduleStudent::where('enrollment_detail_id', $enrollmentDetails->id)
            ->whereHas('schedule', function($query) use ($activeSy) {
                $query->where('school_year_id', $activeSy->id);
            })
            ->with('schedule')
            ->first();

        if ($booking) {
            $timeLabel = ($booking->schedule_time == 1) ? 'AM' : 'PM';

            return response()->json([
                'exists' => true,
                'schedule_id' => $booking->schedule_id,
                'date' => Carbon::parse($booking->schedule->schedule_date)->format('Y-m-d'),
                'formattedDate' => Carbon::parse($booking->schedule->schedule_date)->format('F j, Y'),
                'time' => $timeLabel,
                'schedule_time_code' => $booking->schedule_time,
                'remarks' => $booking->remarks,
            ]);
        }

        return response()->json(['exists' => false]);
    }

    public function getSchedules(Request $request)
    {
        $student = Auth::user();
        if (!$student) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        $schoolYear = SchoolYear::where('is_active',1)
            ->orderByDesc('school_year_from')
            ->orderByDesc('semester')
            ->first();

        if(!$schoolYear){
            return response()->json(['error' => 'Not Availalble.'], 401);
        }

        $currentSchoolYearId = $schoolYear->id;

        $enrollmentDetails = EnrollmentDetail::with('program')
            ->where('student_account_id', $student->id)
            ->where('school_year_id', $currentSchoolYearId)
            ->first();

        if (!$enrollmentDetails) {
            return response()->json(['error' => 'No active enrollment details found for this year.'], 404);
        }

        $studentProgramLevelId = $enrollmentDetails->program->program_level_id; 
        $studentCollegeId = $enrollmentDetails->program->college_id; 

        if($studentProgramLevelId !== 7 && $studentProgramLevelId !== 8){
            return response()->json(['error' => 'Not available for your program level.', 403]);
        }
        
        $schedules = Schedule::query()
            ->with(['slots' => function ($query) use ($studentCollegeId) {
                $query->where('college_id', $studentCollegeId); 
            }])
            ->withCount([
                'students as am_booked_count' => function ($query) {
                    $query->where('schedule_time', 1); // 1 for AM
                }
            ])
            ->withCount([
                'students as pm_booked_count' => function ($query) {
                    $query->where('schedule_time', 2); // 2 for PM
                }
            ])
            ->where('program_level_id', $studentProgramLevelId)
            ->whereHas('slots', function ($query) use ($studentCollegeId) {
                $query->where('college_id', $studentCollegeId); 
            })
            ->where('school_year_id', $currentSchoolYearId)
            ->orderBy('schedule_date', 'asc')
            ->get();
            
        $groupedSchedules = $schedules->map(function ($schedule) {
            $slot = $schedule->slots->first();
            
            if (!$slot) {
                return null;
            }

            $date = Carbon::parse($schedule->schedule_date);
            
            $amTotal = $slot->am_slots;
            $pmTotal = $slot->pm_slots;
            
            $amAvailable = max(0, $amTotal - $schedule->am_booked_count);
            $pmAvailable = max(0, $pmTotal - $schedule->pm_booked_count);

            return [
                'monthYear' => $date->format('F Y'),
                'date' => $date->toDateString(),
                'day' => $date->format('D'),
                'scheduleId' => $schedule->id,
                'amSlotsCount' => $schedule->am_booked_count,
                'amSlotsTotal' => $amTotal,
                'pmSlotsCount' => $schedule->pm_booked_count,
                'pmSlotsTotal' => $pmTotal,
            ];
        })
        ->filter()
        ->groupBy('monthYear')
        ->map(function ($days, $monthYear) {
            return [
                'monthYear' => $monthYear,
                'days' => $days->values()->all(),
            ];
        })
        ->values()
        ->all();

        return response()->json($groupedSchedules);
    }

    public function bookSchedule(Request $request)
    {
        $request->validate([
            'schedule_id'    => 'required|integer|exists:schedules,id',
            'schedule_time'  => 'required|in:1,2', 
            'date'           => 'required|date',
        ]);

        $student = Auth::user();
        if (!$student) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        return DB::transaction(function () use ($request, $student) {
            
            $currentSchoolYearId = SchoolYear::where('is_active', 1)
                ->orderByDesc('school_year_from')
                ->value('id');

            if (!$currentSchoolYearId) {
                return response()->json(['error' => 'No active school year.'], 401);
            }

            $enrollmentDetails = EnrollmentDetail::with('program')
                ->where('student_account_id', $student->id)
                ->where('school_year_id', $currentSchoolYearId)
                ->first();

            if (!$enrollmentDetails) {
                return response()->json(['error' => 'No enrollment details found.'], 404);
            }

            $enrollmentDetailId = $enrollmentDetails->id;
            $studentProgramLevelId = $enrollmentDetails->program->program_level_id;
            $studentCollegeId = $enrollmentDetails->program->college_id;

            $schedule = Schedule::with(['slots' => function ($query) use ($studentCollegeId) {
                    $query->where('college_id', $studentCollegeId);
                }])
                ->where('id', $request->schedule_id)
                ->where('program_level_id', $studentProgramLevelId)
                ->where('school_year_id', $currentSchoolYearId)
                ->lockForUpdate()
                ->first();

            if (!$schedule) {
                return response()->json(['error' => 'Schedule not found or not available for your level.'], 404);
            }

            $slot = $schedule->slots->first();
            if (!$slot) {
                return response()->json(['error' => 'No slots allocation found for your college.'], 404);
            }

            if ($request->schedule_time == 1) {
                $maxSlots = $slot->am_slots;
                $bookedCount = $schedule->students()->where('schedule_time', 1)->count();
            } else {
                $maxSlots = $slot->pm_slots;
                $bookedCount = $schedule->students()->where('schedule_time', 2)->count();
            }

            if ($bookedCount >= $maxSlots) {
                return response()->json(['error' => 'Slot is fully booked.'], 409);
            }

            $alreadyBooked = ScheduleStudent::where('schedule_id', $schedule->id)
                ->where('enrollment_detail_id', $enrollmentDetailId)
                ->where('schedule_time', $request->schedule_time)
                ->exists();
            if ($alreadyBooked) {
                return response()->json(['error' => 'You have already booked this schedule.'], 409);
            }

            $checkExistingBooking = ScheduleStudent::where('enrollment_detail_id', $enrollmentDetailId)
                ->whereHas('schedule', function($query) use ($currentSchoolYearId) {
                    $query->where('school_year_id', $currentSchoolYearId);
                })
                ->first();
            if ($checkExistingBooking) {
                if($checkExistingBooking->remarks == 1){
                    return response()->json(['error' => 'Your existing schedule is finalized and cannot be changed.'], 403);
                }

                $insert = ScheduleStudent::where('enrollment_detail_id', $enrollmentDetailId)
                    ->whereHas('schedule', function($query) use ($currentSchoolYearId) {
                        $query->where('school_year_id', $currentSchoolYearId);
                    })
                    ->update([
                        'schedule_id' => $schedule->id,
                        'schedule_time' => $request->schedule_time,
                        'college' => $studentCollegeId,
                        'remarks' => 0,
                        'reschedule_status' => 0,
                    ]);
            }else{
                $insert = ScheduleStudent::create([
                    'schedule_id' => $schedule->id,
                    'enrollment_detail_id' => $enrollmentDetailId,
                    'schedule_time' => $request->schedule_time,
                    'college' => $studentCollegeId,
                    'remarks' => 0,
                    'reschedule_status' => 0,
                ]);
            }            

            if (!$insert) {
                return response()->json(['error' => 'Failed to book the schedule.'], 500);
            }
            return response()->json(['message' => 'Schedule booked successfully.'], 200);

        });
    }
}