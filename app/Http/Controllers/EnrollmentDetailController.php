<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\Department;
use App\Models\EnrollmentDetail;
use App\Models\Program;
use App\Models\SchoolYear;
use App\Models\StudentAccount;
use App\Providers\StudentLogsProvider;
use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;


class EnrollmentDetailController extends Controller
{

    public function fetchAdvisedSubjects($targetId)
    {
        $activeSchoolYear = Cache::remember('active_school_year', 86400, function () {
            return SchoolYear::where('is_active', 1)->first();
        });

        if (!$activeSchoolYear) {
            return response()->json(['advisedSubjects' => null]);
        }

        $advisedSubjects = EnrollmentDetail::with([
            'school_year', 
            'enrolling_teacher', 
            'program', 
            'curriculum.courses' 
        ])
        ->where('school_year_id', $activeSchoolYear->id)
        ->where('student_account_id', $targetId)
        ->whereNotNull('curriculum_id') 
        ->first();

        if ($advisedSubjects) {
            $advisedSubjects->advisement_date = $advisedSubjects->enrolling_teacher_timestamp 
                ? Carbon::parse($advisedSubjects->enrolling_teacher_timestamp)->format('F d, Y h:i A') 
                : 'N/A';

            $totalUnits = 0;
            if ($advisedSubjects->curriculum && $advisedSubjects->curriculum->courses) {
                $totalUnits = $advisedSubjects->curriculum->courses->sum('units');
            }
            $advisedSubjects->total_units = $totalUnits;
        }

        return response()->json([
            'advisedSubjects' => $advisedSubjects
        ]);
    }

    public function fetchStatusMonitoring($targetId)
    {
        $activeSchoolYear = Cache::remember('active_school_year', 86400, function () {
            return SchoolYear::where('is_active', 1)->first();
        });

        if (!$activeSchoolYear) {
            return response()->json(['steps' => []]);
        }

        $enrollmentDetail = EnrollmentDetail::with([
            'school_year', 
            'enrolling_teacher', 
            'enrolling_personnel', 
            'program', 
            'curriculum.courses'
        ])
        ->where('school_year_id', $activeSchoolYear->id)
        ->where('student_account_id', $targetId)
        ->first();

        $steps = [];
        
        if ($enrollmentDetail) {
            $activeStepFound = false;

            $enrollingTeacher = $enrollmentDetail->enrolling_teacher?->display_name ?? 'N/A';
            $enrollingPersonnel = $enrollmentDetail->enrolling_personnel?->display_name ?? 'N/A';

            $stepDefinitions = [
                [
                    'is_complete'       => true,
                    'title'             => 'Updating of Pre-Enrollment Details',
                    'subtitle_complete' => 'Pre-Enrollment Detail Successfully Updated',
                    'timestamp'         => $enrollmentDetail->created_at,
                ],
                [
                    'is_complete'       => (bool) $enrollmentDetail->enrolling_teacher_status,
                    'title'             => 'Subject Advisement',
                    'subtitle_complete' => ($enrollmentDetail->acad_standing == 2)
                                        ? "Please see your advisement teacher for on-site student advisement [{$enrollingTeacher}]"
                                        : "Subjects Advised by Enrolling Teacher [{$enrollingTeacher}]",
                    'timestamp'         => $enrollmentDetail->enrolling_teacher_timestamp,
                ],
                [
                    'is_complete'       => (bool) $enrollmentDetail->eaf_status,
                    'title'             => 'Subject Enrollment and Issuance of Validated Enrollment Slip',
                    'subtitle_complete' => "Subjects Enlisted by ITSO Personnel [Processed by: {$enrollingPersonnel}]",
                    'timestamp'         => $enrollmentDetail->eaf_timestamp,
                ],
                [
                    'is_complete'       => (bool) $enrollmentDetail->enrollment_status,
                    'title'             => 'Officially Enrolled',
                    'subtitle_complete' => 'You are now officially enrolled!',
                    'timestamp'         => $enrollmentDetail->enrollment_timestamp,
                ],
            ];

            foreach ($stepDefinitions as $step) {
                $status = 'pending';
                $subtitle = 'Pending';
                $date = null; 

                if ($step['is_complete']) {
                    $status = 'completed';
                    $subtitle = $step['subtitle_complete'];
                    if ($step['timestamp']) {
                        $date = Carbon::parse($step['timestamp'])->format('F d, Y h:i A');
                    }
                } elseif (!$activeStepFound) {
                    $status = 'active';
                    $subtitle = 'Active - Currently Processing';
                    $activeStepFound = true;
                }

                $steps[] = [
                    'title'    => $step['title'],
                    'subtitle' => $subtitle,
                    'date'     => $date,
                    'status'   => $status,
                ];
            }
        }

        return response()->json(['steps' => $steps]);
    }

    // Fetch pre-enrollment details 
    public function fetchPreEnrollmentDetails($targetId)
    {
        $activeSchoolYear = Cache::remember('active_school_year', 86400, function () {
            return SchoolYear::where('is_active', 1)->first();
        });

        if (!$activeSchoolYear) {
            return response()->json(['message' => 'No active school year found.'], 404);
        }

        $activeSchoolYearId = $activeSchoolYear->id;

        $previousEnrollments = EnrollmentDetail::with(['school_year', 'program'])
            ->where('student_account_id', $targetId)
            ->where('school_year_id', '!=', $activeSchoolYearId)
            ->orderBy('school_year_id', 'desc')
            ->first();

        $currentEnrollment = EnrollmentDetail::with(['school_year', 'program', 'schedule_slot.schedule'])
            ->where('student_account_id', $targetId)
            ->where('school_year_id', $activeSchoolYearId)
            ->first();

        $enrollmentSchedule = 'TBA';
        $enrollmentScheduleTime = 'TBA';
        $rescheduled = false;

        if ($currentEnrollment && $currentEnrollment->schedule_slot->isNotEmpty()) {
            $firstScheduleSlot = $currentEnrollment->schedule_slot->first();
            
            $scheduleDate = optional($firstScheduleSlot->schedule)->schedule_date;
            $enrollmentSchedule = $scheduleDate ? Carbon::parse($scheduleDate)->format('F j, Y') : 'TBA';
            
            $enrollmentScheduleTime = $firstScheduleSlot->formatted_schedule_time ?? 'TBA';
            $rescheduled = $firstScheduleSlot->reschedule_status == 1;
        }

        // 5. Return clean JSON to React
        return response()->json([
            'currentEnrollment'      => $currentEnrollment,
            'previousEnrollments'    => $previousEnrollments,
            'rescheduled'            => $rescheduled,
            'enrollmentSchedule'     => $enrollmentSchedule,
            'enrollmentScheduleTime' => $enrollmentScheduleTime,
        ]);
    }

    // public function showEnrollmentUpdate()
    // {
    //     return view('pages.students.pre_enrollment.pre_enrollment_layout');
    // }

    // public function filterPreviousEnrollments(Request $request)
    // {

    //     $studentAccount = '';

    //     if (Auth::guard('student')->check()) {
    //         $studentAccount = Auth::guard('student')->user();
    //     }

    //     $activeSchoolYear = SchoolYear::where('is_active', 1)->first();
    //     $activeSchoolYearId = $activeSchoolYear->id;

    //     $studentId = $studentAccount->id;
    //     $query = EnrollmentDetail::query()->where('student_account_id', $studentId)
    //             ->where('school_year_id', '!=', $activeSchoolYearId)
    //     ; 

    //     $query->when($request->filled('school_year'), function ($q) use ($request) {
    //         return $q->where('school_year_id', $request->school_year);
    //     });

    //     $query->when($request->filled('acad_standing'), function ($q) use ($request) {
    //         return $q->where('acad_standing', $request->acad_standing);
    //     });

    //     $previousEnrollments = $query->latest()->get();
    //     return view('pages.students.pre_enrollment.pre_enrollment_previous_records', compact('previousEnrollments'));
    // }

    // Create enrollment data for the current semester
    public function createEnrollmentDetail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'program_id' => 'required',
            'year_level'=> 'required',
            'enrollment_type'=> 'required'
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

        $studentAccount = '';

        if (Auth::guard('student')->check()) {
            $studentAccount = Auth::guard('student')->user();
        }

        $studentId = $studentAccount->id;

        $activeSchoolYear = SchoolYear::where('is_active', 1)->first();
        $activeSchoolYearId = $activeSchoolYear->id;

        DB::beginTransaction();

        try{
            $enrollmentDetails = new EnrollmentDetail();

            // Handle form fields 
            $enrollmentDetails->student_account_id = $studentId;
            $enrollmentDetails->program_id = $request->program_id;
            $enrollmentDetails->year_level = $request->year_level;
            $enrollmentDetails->enrollment_type = $request->enrollment_type;
            $enrollmentDetails->school_year_id = $activeSchoolYearId;
            $enrollmentDetails->enrolling_teacher_status = 0;
            $enrollmentDetails->eaf_status = 0;
            $enrollmentDetails->enrollment_status = 0;

            $enrollmentDetails->save();

            DB::commit();

            // Log user activity
            StudentLogsProvider::log(
                'Updated pre-enrollment details for the current semester',
                3,
                'My Profile'
            );

            return response()->json([
                'message' => 'Enrollment detail successfully updated!',
                'type' => 'success',
            ], 200);

        }catch(\Exception $e){
            DB::rollBack();
            return response()->json([
                'message' => 'Failed updating enrollment detail.' . $e->getMessage(),
                'type' => 'error',
            ], 500);
        }
    }

    // // Update current pre-enrollment details
    // public function updatePreEnrollment(Request $request, $id)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'program_id' => 'required',
    //         'year_level'=> 'required',
    //         'enrollment_type'=> 'required'
    //     ]);

    //     if ($validator->fails()) 
    //     {
    //         if ($request->ajax()) 
    //         {
    //             return response()->json([
    //                 'errors' => $validator->errors(),
    //             ], 422);
    //         }
    //     }

    //     DB::beginTransaction();

    //     try{
    //         $updatePreEnrollment = EnrollmentDetail::findOrFail($id);
    //         $updatePreEnrollment->program_id = $request->program_id;
    //         $updatePreEnrollment->year_level = $request->year_level;
    //         $updatePreEnrollment->enrollment_type = $request->enrollment_type;

    //         $updatePreEnrollment->save();

    //         DB::commit();

    //         // //Log user activity
    //         // UserLogsProvider::log('updated pre-enrollment details: ' . $updatePreEnrollment->dept_name);

    //         return response()->json([
    //             'message' => 'Pre-enrollment details succesfully updated!',
    //             'type' => 'success',
    //         ]);

    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed to update pre-enrollment details.' . $e->getMessage(),
    //             'type' => 'error',
    //         ]);
    //     }
         
    // }
    
}