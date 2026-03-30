<?php

namespace App\Http\Controllers;

use App\Models\EnrollmentDetail;
use App\Models\Schedule;
use App\Models\ScheduleStudent;
use App\Models\SchoolYear;
use App\Providers\StudentLogsProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class StudentScheduleController extends Controller
{

    private function getActiveSchoolYear()
    {
        return Cache::remember('active_school_year', 86400, function () {
            return SchoolYear::where('is_active', 1)
                ->orderByDesc('school_year_from')
                ->orderByDesc('semester')
                ->first();
        });
    }

    private function getActiveEnrollmentDetails($studentId, $schoolYearId)
    {
        return EnrollmentDetail::with('program')
            ->where('student_account_id', $studentId)
            ->where('school_year_id', $schoolYearId)
            ->first();
    }

    public function checkBooking()
    {
        $student = Auth::user();
        if (!$student) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        $activeSy = $this->getActiveSchoolYear();
        if (!$activeSy) {
            return response()->json(['error' => 'Not Available.'], 404);
        }

        $enrollmentDetails = $this->getActiveEnrollmentDetails($student->id, $activeSy->id);
        if (!$enrollmentDetails) {
            return response()->json(['error' => 'No active enrollment details found for this year.'], 404);
        }

        $studentProgramLevelId = $enrollmentDetails->program->program_level_id; 

        // Hardcoded program level check based on your logic
        if (!in_array($studentProgramLevelId, [7, 8])) {
            return response()->json(['error' => 'Not available for your program level.'], 403);
        }
        
        $booking = ScheduleStudent::where('enrollment_detail_id', $enrollmentDetails->id)
            ->whereHas('schedule', function($query) use ($activeSy) {
                $query->where('school_year_id', $activeSy->id);
            })
            ->with('schedule')
            ->first();

        if ($booking) {
            return response()->json([
                'exists'             => true,
                'schedule_id'        => $booking->schedule_id,
                'date'               => Carbon::parse($booking->schedule->schedule_date)->format('Y-m-d'),
                'formattedDate'      => Carbon::parse($booking->schedule->schedule_date)->format('F j, Y'),
                'time'               => ($booking->schedule_time == 1) ? 'AM' : 'PM',
                'schedule_time_code' => $booking->schedule_time,
                'remarks'            => $booking->remarks,
            ]);
        }

        return response()->json(['exists' => false]);
    }

    public function availableSchedules()
    {
        $student = Auth::user();
        if (!$student) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        $activeSy = $this->getActiveSchoolYear();
        if (!$activeSy) {
            return response()->json(['error' => 'Not Available.'], 404);
        }

        $enrollmentDetails = $this->getActiveEnrollmentDetails($student->id, $activeSy->id);
        if (!$enrollmentDetails) {
            return response()->json(['error' => 'No active enrollment details found for this year.'], 404);
        }

        $studentProgramLevelId = $enrollmentDetails->program->program_level_id; 
        $studentCollegeId = $enrollmentDetails->program->college_id; 

        // if (!in_array($studentProgramLevelId, [7, 8])) {
        //     return response()->json(['error' => 'Manual enrollment scheduling only available for Graduate School students.'], 403);
        // }
        
        $schedules = Schedule::query()
            ->with(['slots' => function ($query) use ($studentCollegeId) {
                $query->where('college_id', $studentCollegeId); 
            }])
            ->withCount([
                'students as am_booked_count' => function ($query) {
                    $query->where('schedule_time', 1); 
                },
                'students as pm_booked_count' => function ($query) {
                    $query->where('schedule_time', 2); 
                }
            ])
            ->where('program_level_id', $studentProgramLevelId)
            ->whereHas('slots', function ($query) use ($studentCollegeId) {
                $query->where('college_id', $studentCollegeId); 
            })
            ->where('school_year_id', $activeSy->id)
            ->orderBy('schedule_date', 'asc')
            ->get();
            
        $groupedSchedules = $schedules->map(function ($schedule) {
            $slot = $schedule->slots->first();
            
            if (!$slot) return null;

            $date = Carbon::parse($schedule->schedule_date);
            
            return [
                'monthYear'      => $date->format('F Y'),
                'date'           => $date->toDateString(),
                'day'            => $date->format('D'),
                'scheduleId'     => $schedule->id,
                'amSlotsCount'   => $schedule->am_booked_count,
                'amSlotsTotal'   => $slot->am_slots,
                'pmSlotsCount'   => $schedule->pm_booked_count,
                'pmSlotsTotal'   => $slot->pm_slots,
            ];
        })
        ->filter()
        ->groupBy('monthYear')
        ->map(function ($days, $monthYear) {
            return [
                'monthYear' => $monthYear,
                'days'      => $days->values()->all(),
            ];
        })
        ->values()
        ->all();

        return response()->json($groupedSchedules);
    }

    public function bookSchedule(Request $request)
    {
        $request->validate([
            'schedule_id'   => 'required|integer|exists:schedules,id',
            'schedule_time' => 'required|in:1,2', 
            'date'          => 'required|date',
        ]);

        $student = Auth::user();
        if (!$student) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        return DB::transaction(function () use ($request, $student) {
            
            $activeSy = $this->getActiveSchoolYear();
            if (!$activeSy) {
                return response()->json(['error' => 'No active school year.'], 401);
            }

            $enrollmentDetails = $this->getActiveEnrollmentDetails($student->id, $activeSy->id);
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
                ->where('school_year_id', $activeSy->id)
                ->lockForUpdate()
                ->first();

            if (!$schedule) {
                return response()->json(['error' => 'Schedule not found or not available for your level.'], 404);
            }

            $slot = $schedule->slots->first();
            if (!$slot) {
                return response()->json(['error' => 'No slots allocation found for your college.'], 404);
            }

            // Check if slot is fully booked
            $maxSlots = ($request->schedule_time == 1) ? $slot->am_slots : $slot->pm_slots;
            $bookedCount = $schedule->students()->where('schedule_time', $request->schedule_time)->count();

            if ($bookedCount >= $maxSlots) {
                return response()->json(['error' => 'Slot is fully booked.'], 409);
            }

            // Check if already booked exactly
            $alreadyBooked = ScheduleStudent::where('schedule_id', $schedule->id)
                ->where('enrollment_detail_id', $enrollmentDetailId)
                ->where('schedule_time', $request->schedule_time)
                ->exists();

            if ($alreadyBooked) {
                return response()->json(['error' => 'You have already booked this schedule.'], 409);
            }

            // Check existing active bookings for this school year
            $existingBooking = ScheduleStudent::where('enrollment_detail_id', $enrollmentDetailId)
                ->whereHas('schedule', function($query) use ($activeSy) {
                    $query->where('school_year_id', $activeSy->id);
                })
                ->first();

            if ($existingBooking) {
                if ($existingBooking->remarks == 1) {
                    return response()->json(['error' => 'Your existing schedule is finalized and cannot be changed.'], 403);
                }

                // Update existing
                $existingBooking->update([
                    'schedule_id'       => $schedule->id,
                    'schedule_time'     => $request->schedule_time,
                    'college'           => $studentCollegeId,
                    'remarks'           => 0,
                    'reschedule_status' => 0,
                ]);
                $insert = true;
            } else {
                // Create new
                $insert = ScheduleStudent::create([
                    'schedule_id'          => $schedule->id,
                    'enrollment_detail_id' => $enrollmentDetailId,
                    'schedule_time'        => $request->schedule_time,
                    'college'              => $studentCollegeId,
                    'remarks'              => 0,
                    'reschedule_status'    => 0,
                ]);
            }            

            if (!$insert) {
                return response()->json(['error' => 'Failed to book the schedule.'], 500);
            }

            // Log user activity
            StudentLogsProvider::log(
                'Selected/Changed enrollment schedule for graduate school students',
                3,
                'Enrollment Schedule'
            );

            return response()->json([
                'message' => 'Enrollment schedule successfully saved!',
                'type' => 'success',
            ], 200);
        });
    }
}