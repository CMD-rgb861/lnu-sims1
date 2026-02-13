<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\Curriculum;
use App\Models\EnrollmentDetail;
use App\Models\GeneratedReport;
use App\Models\Program;
use App\Models\Schedule;
use App\Models\ScheduleStudent;
use App\Models\SchoolYear;
use App\Models\UserAccount;
use App\Models\UserAccountRole;
use App\Models\UserRole;
use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReportsExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage; 
use Illuminate\Support\Str;             
use SimpleSoftwareIO\QrCode\Facades\QrCode;


class StudentAdvisementController extends Controller
{

    // Show assigned programs index
    public function assignedProgramsIndex()
    {
        $user = '';

        if (Auth::guard('employee')->check()) {
            $user = Auth::guard('employee')->user();
        }

        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();
        $enrollingTeacherRoleId = 6;

        $query = Program::whereHas('user_account_roles', function ($q) use ($user, $enrollingTeacherRoleId) {
            $q->where('user_account_id', $user->id)->where('user_role_id', $enrollingTeacherRoleId);
        });

        $programs = $query->get();

        // Add counts to the base query and get the results for the initial display
        $assignedPrograms = $query->withCount([
                'enrollment_details as pending_advisement_count' => fn($q) => $q->where('enrolling_teacher_status', 0)->where('school_year_id', $currentSchoolYear->id),
                'enrollment_details as advised_count' => fn($q) => $q->where('enrolling_teacher_status', 1)->where('school_year_id', $currentSchoolYear->id),
            ])
            ->get();

        return view('pages.employees.student_advisement.student_advisement_layout', compact('assignedPrograms', 'programs'));
    }

    //Show pending enrollees index
    public function pendingEnrolleesIndex(Request $request)
    {   
        $progId = $request->input('progId');
        $pendingProgram = Program::where('id', $progId)->first();

        return view('pages.employees.student_advisement.student_advisement_layout', compact('pendingProgram'));
    }

    public function advisedEnrolleesIndex()
    {   
        return view('pages.employees.student_advisement.student_advisement_layout');
    }

    public function filterAssignedPrograms(Request $request)
    {
        $user = '';

        if (Auth::guard('employee')->check()) {
            $user = Auth::guard('employee')->user();
        }

        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();
        $enrollingTeacherRoleId = 6;

        if (! $user || ! $currentSchoolYear) {
            return response('<div class="col-12 text-center p-5 text-muted">Error: User or school year not found.</div>', 500);
        }

        $query = Program::whereHas('user_account_roles', function ($q) use ($user, $enrollingTeacherRoleId) {
            $q->where('user_account_id', $user->id)
                  ->where('user_role_id', $enrollingTeacherRoleId);
        });

        $query->when($request->filled('program'), function ($q) use ($request) {
            return $q->where('id', $request->program);
        }); 

        $assignedPrograms = $query->withCount([
                'enrollment_details as pending_advisement_count' => fn($q) => $q->where('enrolling_teacher_status', 0)->where('school_year_id', $currentSchoolYear->id),
                'enrollment_details as advised_count' => fn($q) => $q->where('enrolling_teacher_status', 1)->where('school_year_id', $currentSchoolYear->id),
            ])
            ->get();

        return view('pages.employees.student_advisement.student_advisement_program_cards', compact('assignedPrograms'));
    }

    public function studentAdvisementLogsIndex()
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();

        return view('pages.employees.student_advisement.student_advisement_logs_layout', compact('currentSchoolYear'));
    }

    // Fetch pending enrollees
    public function fetchPendingEnrollees(Request $request)
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();
        $progId = $request->input('progId');
        $search = $request->input('search');
        $yearLevel = $request->input('yearLevel');

        // 1. Initialize Query with Eager Loading
        $query = EnrollmentDetail::with(['student'])
            ->where('school_year_id', $currentSchoolYear->id)
            ->where('program_id', $progId)
            ->where('enrolling_teacher_status', 0);

        // 2. Apply Search Filter (SQL Level)
        if (!empty($search)) {
            $query->whereHas('student', function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('id_number', 'like', "%{$search}%");
            });
        }

        // Filter by year level
        if (!empty($yearLevel)) {
            $query->where('year_level', $yearLevel);
        }

        // 3. Use Paginate instead of Get
        $paginatedData = $query->paginate(50);

        // 4. Transform the Data (Equivalent to DataTables logic)
        $paginatedData->getCollection()->transform(function($row) {
            return [
                'id' => $row->id,
                'student_id' => optional($row->student)->id,
                'id_number' => optional($row->student)->id_number ?? 'N/A',
                'student_name' => optional($row->student)->display_name ?? 'Student name undefined',
                'year_level' => $row->formatted_year_level,
                'enrollment_type' => $row->formatted_enrollment_type,
                'created_at' => $row->created_at->format('m-d-Y h:i A'),
            ];
        });

        return response()->json($paginatedData);
    }

    //Fetch previous enrollment detail
    public function fetchPreviousEnrollmentRecord($studentId)
    {
        $lastRecord = EnrollmentDetail::with(['student', 'program', 'school_year'])
                                      ->where('student_account_id', $studentId)
                                      ->latest('created_at') 
                                      ->first();
        if (!$lastRecord) {
            return redirect()->back()->with('toast', [
                'text' => 'No previous enrollment records found',
                'type' => 'error',
            ]);
        }

        $studentName = $lastRecord->student->display_name;

        $schoolYear = 'S.Y. ' . $lastRecord->school_year->school_year_from . '-' . $lastRecord->school_year->school_year_to;

        $data = [
            'student_name' => $studentName,
            'student_number' => $lastRecord->student->id_number,
            'school_year' => $schoolYear, 
            'acad_standing' => $lastRecord->formatted_acad_standing,
            'semester' => $lastRecord->school_year->formatted_semester,
            'program' => $lastRecord->program->program_name, 
            'year_level' => $lastRecord->formatted_year_level,
            'enrollment_type' => $lastRecord->formatted_enrollment_type,
        ];

        return response()->json($data);
    }

    //Fetch advised enrollees
    public function fetchAdvisedEnrollees()
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();
        $user = Auth::guard('employee')->user();

        if (!$currentSchoolYear || !$user) {
            return DataTables::of(collect([]))->make(true);
        }

        // 1. Get Authorized Program IDs
        $programHeadIds = $user->user_account_role
            ->where('user_role_id', 6)
            ->pluck('program_id')
            ->filter();

        // 2. Build the Query (DO NOT call ->get() here)
        // We use join/with to make related columns searchable
        $query = EnrollmentDetail::with(['student', 'program'])
            ->where('school_year_id', $currentSchoolYear->id)
            ->where('enrolling_teacher_status', 1);

        // 3. Apply the Program Head filter
        if ($programHeadIds->isNotEmpty()) {
            $query->whereIn('program_id', $programHeadIds);
        }

        // 4. Initialize DataTables with the Query Builder
        return DataTables::of($query)
            // Enable search for columns that don't exist in the main table
            ->filterColumn('student_name', function($query, $keyword) {
                $query->whereHas('student', function($q) use ($keyword) {
                    $q->where('first_name', 'like', "%{$keyword}%")
                    ->orWhere('last_name', 'like', "%{$keyword}%")
                    ->orWhere('middle_name', 'like', "%{$keyword}%");
                });
            })
            ->filterColumn('id_number', function($query, $keyword) {
                $query->whereHas('student', function($q) use ($keyword) {
                    $q->where('id_number', 'like', "%{$keyword}%");
                });
            })
            ->editColumn('enrolling_teacher_timestamp', function($advisedEnrollees) {
                return Carbon::parse($advisedEnrollees->enrolling_teacher_timestamp)->format('m-d-Y h:i A');
            })
            ->editColumn('year_level', function($advisedEnrollees) {
                return $advisedEnrollees->formatted_year_level;
            })
            ->editColumn('program_name', function($advisedEnrollees) {
                return $advisedEnrollees->program->program_name ?? 'N/A';
            })
            ->editColumn('enrollment_type', function($advisedEnrollees) {
                return $advisedEnrollees->formatted_enrollment_type;
            })
            ->editColumn('acad_standing', function($advisedEnrollees) {
                return $advisedEnrollees->formatted_acad_standing;
            })
            ->addColumn('student_name', function($advisedEnrollees) {
                if ($advisedEnrollees->student_account_id && $advisedEnrollees->student) {
                    return $advisedEnrollees->student->display_name;
                }
                return 'Student name undefined';
            })
            ->addColumn('id_number', function($advisedEnrollees) {
                return $advisedEnrollees->student->id_number ?? '';
            })
            ->addColumn('student_id', function($advisedEnrollees) {
                return $advisedEnrollees->student->id ?? '';
            })
            ->addColumn('enrollment_status', function($advisedEnrollees) {
                // FIXED: changed = to == to prevent overwriting data
                return $advisedEnrollees->enrollment_status == 1 ? 'disabled' : '';
            })
            ->make(true);
    }

    //Fetch advisement logs 
    private function getStudentAdvisementLogsQuery()
    {
        $user = '';

        if (Auth::guard('employee')->check()) {
            $user = Auth::guard('employee')->user();
        }

        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();

        if (!$currentSchoolYear) {
            return EnrollmentDetail::query()->whereRaw('1 = 0'); 
        }

        // 1. Initialize the Query Builder
        $query = EnrollmentDetail::with([
                'student', 
                'program', 
                'enrolling_teacher', 
                'schedule_slot'
            ])
            ->where('school_year_id', $currentSchoolYear->id)
            ->where('enrolling_teacher_status', 1)
            ->where('enrolling_teacher_id', $user->id);

        // 2. Identify the Programs the user is authorized to see
        $programHeadProgramIds = $user->user_account_role
            ->where('user_role_id', 6)
            ->pluck('program_id')
            ->filter(); 

        // 3. Apply the Program ID filter if they are a Program Head
        // If you want to RESTRICT results to only their programs:
        if ($programHeadProgramIds->isNotEmpty()) {
            $query->whereIn('program_id', $programHeadProgramIds);
        }

        return $query;
    }


    private function transformStudentAdvisementtLog(EnrollmentDetail $log)
    {
        return [
            'enrolling_teacher_timestamp'     => Carbon::parse($log->enrolling_teacher_timestamp)->format('F d, Y h:i A'),
            'id_number'         => optional($log->student)->id_number ?? 'N/A',
            'student_name'      => optional($log->student)->display_name ?? 'N/A',
            'year_level'        => $log->formatted_year_level,
            'program'           => optional($log->program)->program_acronym ?? 'N/A',
            'enrollment_type' => $log->formatted_enrollment_type ?? 'N/A',
            'acad_standings'   =>  $log->formatted_acad_standing ?? 'N/A',
            'enrolling_teacher' => optional($log->enrolling_teacher)->display_name ?? 'N/A',
            'acad_standing'   =>  optional($log->acad_standing)->formatted_acad_standing ?? 'N/A'
        ];
    }

    //Fetch pre enrollment logs 
    public function fetchStudentAdvisementLogs()
    {
        $query = $this->getStudentAdvisementLogsQuery();

        return DataTables::of($query)
            ->filterColumn('student_name', function($query, $keyword) {
                $query->whereHas('student', function($q) use ($keyword) {
                    $q->where('first_name', 'like', "%{$keyword}%")
                    ->orWhere('last_name', 'like', "%{$keyword}%");
                });
            })
            ->filterColumn('id_number', function($query, $keyword) {
                $query->whereHas('student', function($q) use ($keyword) {
                    $q->where('id_number', 'like', "%{$keyword}%");
                });
            })
            ->editColumn('enrolling_teacher_timestamp', function($log) {
                return Carbon::parse($log->enrolling_teacher_timestamp)->format('F d, Y h:i A');
            })
            ->editColumn('year_level', function($log) {
                return $log->formatted_year_level;
            })
            ->editColumn('program_name', function($log) {
                return $log->program->program_acronym;
            })
            ->editColumn('enrollment_type', function($log) {
                return $log->formatted_enrollment_type;
            })
            ->editColumn('acad_standing', function($log) {
                return $log->formatted_acad_standing;
            })
            ->addColumn('student_name', function($log) {
                return $log->student->display_name ? $log->student->display_name : 'N/A';
            })
            ->addColumn('enrolling_teacher', function($log) {
                return $log->enrolling_teacher->display_name ? $log->enrolling_teacher->display_name : 'N/A';
            })
            ->addColumn('program', function($log) {
                return $log->program->program_acronym ? $log->program->program_acronym : 'N/A';
            })
            ->addColumn('id_number', function($log) {
                return $log->student->id_number;
            })
            ->addColumn('student_id', function($log) {
                return $log->student->id;
            })
            ->make(true);
    }

    // Export student advisement logs using various formats
    public function exportStudentAdvisementLogs(Request $request)
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();
        $schoolYearHeader = $currentSchoolYear->display_name;

        $format = $request->input('format', 'xlsx');

        $query = $this->getStudentAdvisementLogsQuery();
        
        $logs = $query->get();
        $advisingTeacher = $query->first()->enrolling_teacher->display_name ?? '--';

        $headings = [
            'Advisement Timestamp',
            'ID Number',
            'Student Name',
            'Year Level',
            'Program',
            'Enrollee Type',
            'Academic Standing',
        ];

        $data = $logs->map(function($log) {
            return $this->transformStudentAdvisementtLog($log);
        });

        $fileType = $format;
        $fileId = (string) Str::uuid(); 
        $fileName = $fileId . '.' . $fileType;
        $relativePath = 'reports/' . $fileName; 
        $fullPath = Storage::disk('public')->path($relativePath); 

        Storage::disk('public')->makeDirectory('reports');

        $qrCode = null; 
        $finalResponse = null; 

        if ($format == 'pdf') {
            
            $viewUrl = route('reports.verify', ['reportId' => $fileId]);
            $qrCode = base64_encode(QrCode::format('svg')->size(200)->errorCorrection('H')->generate($viewUrl));

            $pdf = PDF::loadView('reports.student_advisement_report', [
                'logs' => $data,
                'headings'  => $headings,
                'logo_path' => public_path('images/email_header_logo.png'),
                'qr_code'   => $qrCode, 
                'advising_teacher' => $advisingTeacher,
                'sy' => $schoolYearHeader
            ])->setPaper('a4', 'landscape');

            $pdf->save($fullPath);
            $finalResponse = $pdf->stream($fileName);

        } else {
            Excel::store(
                new ReportsExport($data, $headings), 
                $relativePath, 
                'public' 
            );

            $finalResponse = response()->download($fullPath, $fileName);
        }

        GeneratedReport::create([
            'id' => $fileId,
            'file_name' => $fileName,
            'path' => $relativePath,
            'file_type' => $fileType,
            'report_type' => "Student Advisement Logs"
        ]);

        return $finalResponse;
    }

    //Advise Students
    public function adviseStudent(Request $request)
    {
        $user = '';

        if (Auth::guard('employee')->check()) {
            $user = Auth::guard('employee')->user();
        }

        $validator = Validator::make($request->all(), [
            'enrollment_id' => 'required',
            'acad_standing' => 'required'
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

            $enrollmentId = $request->enrollment_id;
            $acadStanding = $request->acad_standing;

            $curriculum = null;

            // Update current enrollment status
            $adviseStudent = EnrollmentDetail::findOrFail($enrollmentId);
            $adviseStudent->enrolling_teacher_status  = 1;
            $adviseStudent->enrolling_teacher_id = $user->id;
            $adviseStudent->enrolling_teacher_timestamp = date('Y-m-d H:i:s');
            $adviseStudent->acad_standing = $acadStanding;

            // Find active curriculum if the academic standing is regular
            if($acadStanding == 1){
                $activeCurriculum = Curriculum::where('program_id', $adviseStudent->program_id)
                                        ->where('is_active', 1)
                                        ->first();
                $curriculum = $activeCurriculum->id;
            }

            $adviseStudent->curriculum_id = $curriculum;
            $adviseStudent->save();

            //Find available schedule based on the college id and year level
            $collegeId = $adviseStudent->program->department->college_id; 
            $yearLevel = $adviseStudent->year_level;
            $activeSchoolYear = $adviseStudent->school_year_id;

            $schedule = Schedule::where('school_year_id', $activeSchoolYear)
                ->where('year_level', $yearLevel)
                ->where('schedule_type', $acadStanding)
                ->whereDate('schedule_date', '>=', now())
                ->whereHas('slots', function ($query) use ($collegeId) {
                    $query->where('college_id', $collegeId)
                    ->where(function ($slotQuery) {
                        $slotQuery->where('am_slots', '>', 0)
                                  ->orWhere('pm_slots', '>', 0);
                    });
                })
                ->with(['slots' => function ($query) use ($collegeId) {
                    $query->where('college_id', $collegeId);
                }])
                ->first();
            

            if ($acadStanding == 1 && !$schedule) {
                $schedule = Schedule::where('school_year_id', $activeSchoolYear)
                    ->where('year_level', $yearLevel)
                    ->where('schedule_type', 2) 
                    ->whereDate('schedule_date', '>=', now()) 
                    ->whereHas('slots', function ($query) use ($collegeId) {
                        $query->where('college_id', $collegeId);
                    })
                    ->with(['slots' => function ($query) use ($collegeId) {
                        $query->where('college_id', $collegeId);
                    }])
                    ->first();
            }

            // Fall back to residual schedule
            if (!$schedule) {
                $schedule = Schedule::where('school_year_id', $activeSchoolYear)
                    ->where('year_level', $yearLevel)
                    ->where('schedule_type', 3) 
                    ->whereDate('schedule_date', '>=', now()) 
                    ->whereHas('slots', function ($query) use ($collegeId) {
                        $query->where('college_id', $collegeId);
                    })
                    ->with(['slots' => function ($query) use ($collegeId) {
                        $query->where('college_id', $collegeId);
                    }])
                    ->first();
            }

            if (!$schedule || $schedule->slots->isEmpty()) {
                return response()->json([
                    'message' => 'No available schedules found. Please contact the administrator for assistance.',
                    'type'    => 'error'
                ]);
            }

            //Determine slot availability for selected schedule
            $scheduleSlot = $schedule->slots->first();

            $enrolledCounts = ScheduleStudent::select('schedule_time', DB::raw('count(*) as total'))
                ->where('schedule_id', '==', $schedule->id)
                ->groupBy('schedule_time')
                ->pluck('total', 'schedule_time');

            $amEnrolledCount = $enrolledCounts->get(1, 0); 
            $pmEnrolledCount = $enrolledCounts->get(2, 0); 

            $assignedTime = null; 

            if ($amEnrolledCount < $scheduleSlot->am_slots) {
                $assignedTime = 1; 
            } elseif ($pmEnrolledCount < $scheduleSlot->pm_slots) {
                $assignedTime = 2;
            } else {
                return response()->json([
                    'message' => 'No available schedules found. Please contact the administrator for assistance.',
                    'type'    => 'error'
                ]);
            }

            //Save the schedule details
            ScheduleStudent::create([
                'enrollment_detail_id' => $adviseStudent->id,
                'schedule_id'          => $schedule->id,
                'schedule_time'      => $assignedTime, 
                'college' => $collegeId,
                'remarks' => 0,
                'reschedule_status' => 0
            ]);

            DB::commit();

            //Log user activity
            UserLogsProvider::log('advised student: ' . $adviseStudent->student->display_name);

            return response()->json([
                'message' => 'Student succesfully advised!',
                'type' => 'success',
            ]);

        }catch(\Exception $e){
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to advise student.' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
    }

    public function resetAdvisement($enrollmentId)
    {
        $user = '';

        if (Auth::guard('employee')->check()) {
            $user = Auth::guard('employee')->user();
        }

        DB::beginTransaction();

        try{

            $enrollmentDetails = EnrollmentDetail::findOrFail($enrollmentId);
            $enrollmentDetails->curriculum_id = null;
            $enrollmentDetails->acad_standing = 0;
            $enrollmentDetails->enrolling_teacher_status = 0;
            $enrollmentDetails->enrolling_teacher_timestamp = null;
            $enrollmentDetails->enrolling_teacher_id = null;
            $enrollmentDetails->enrollment_status = 0;
            $enrollmentDetails->save();

            ScheduleStudent::where('enrollment_detail_id', $enrollmentDetails->id)->delete();

            DB::commit();

            //Log user activity
            UserLogsProvider::log('reset advisement status of: ' . $enrollmentDetails->student->display_name . 'by advising teacher: ' . $user->display_name);

            return response()->json([
                'message' => 'Student advisement succesfully reset!',
                'type' => 'success',
            ]);

        } catch(\Exception $e){
            DB::rollback();

            return response()->json([
                'message' => 'There was a problem resetting student advisement. Please try again.',
                'type' => 'error',
            ]);
        }

    }

    private function getStudentAdvisementLogsExportQuery()
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();

        // If no school year, return a query that finds nothing
        if (!$currentSchoolYear) {
            return EnrollmentDetail::query()->whereRaw('1 = 0'); // Empty query
        }

        return EnrollmentDetail::with(
                'student', 
                'program', 
                'enrolling_personnel', 
                'schedule_slot'
            )
            ->where('school_year_id', $currentSchoolYear->id)
            ->where('eaf_status', 1);
    }

    private function transformStudentAdvisement(EnrollmentDetail $log)
    {
        return [
            'eaf_timestamp'     => Carbon::parse($log->eaf_timestamp)->format('F d, Y h:i A'),
            'id_number'         => optional($log->student)->id_number ?? 'N/A',
            'student_name'      => optional($log->student)->display_name ?? 'N/A',
            'year_level'        => $log->formatted_year_level,
            'program'           => optional($log->program)->program_acronym ?? 'N/A',
            'enrolling_personnel' => optional($log->enrolling_personnel)->display_name ?? 'N/A',
            'schedule'          => Carbon::parse($log->schedule_date)->format('F d, Y h:i A'),
        ];
    }

    //Fetch pre enrollment logs 
    public function fetchPreEnrollmentLogs()
    {
        $query = $this->getStudentAdvisementLogsExportQuery();

        if ($query->toSql() == EnrollmentDetail::query()->whereRaw('1 = 0')->toSql()) {
            return DataTables::of(collect())->make(true);
        }

        return DataTables::of($query) // Pass the query builder
            ->editColumn('eaf_timestamp', function($log) {
                return Carbon::parse($log->eaf_timestamp)->format('F d, Y h:i A');
            })
            ->editColumn('year_level', function($log) {
                return $log->formatted_year_level;
            })
            ->addColumn('id_number', function($log) {
                return optional($log->student)->id_number ?? 'N/A';
            })
            ->addColumn('student_name', function($log) {
                return optional($log->student)->display_name ?? 'N/A';
            })
            ->addColumn('program', function($log) {
                return optional($log->program)->program_acronym ?? 'N/A';
            })
            ->addColumn('enrolling_personnel', function($log) {
                return optional($log->enrolling_personnel)->display_name ?? 'N/A';
            })
            ->addColumn('schedule', function($log) {
                return Carbon::parse($log->schedule_date)->format('F d, Y h:i A');
            })
            ->make(true);
    }

    // Export pre-enrollment logs using various formats
    public function exportStudentAdvisementtLogs(Request $request)
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();
        $schoolYearHeader = $currentSchoolYear->display_name;

        $format = $request->input('format', 'xlsx');

        $query = $this->getStudentAdvisementLogsExportQuery();
        
        $logs = $query->get();
        $headings = [
            'Enrollment Timestamp',
            'ID Number',
            'Student Name',
            'Year Level',
            'Program',
            'Enrolling Personnel',
            'Schedule',
        ];

        $data = $logs->map(function($log) {
            return $this->transformStudentAdvisement($log);
        });

        $fileType = $format;
        $fileId = (string) Str::uuid(); 
        $fileName = $fileId . '.' . $fileType;
        $relativePath = 'reports/' . $fileName; 
        $fullPath = Storage::disk('public')->path($relativePath); 

        Storage::disk('public')->makeDirectory('reports');

        $qrCode = null; 
        $finalResponse = null; 

        if ($format == 'pdf') {
            
            $viewUrl = route('reports.verify', ['reportId' => $fileId]);
            $qrCode = base64_encode(QrCode::format('svg')->size(200)->errorCorrection('H')->generate($viewUrl));

            $pdf = PDF::loadView('reports.pre_enrollment_report', [
                'logs' => $data,
                'headings'  => $headings,
                'logo_path' => public_path('images/email_header_logo.png'),
                'qr_code'   => $qrCode, 
                'sy' => $schoolYearHeader
            ])->setPaper('a4', 'landscape');

            $pdf->save($fullPath);
            $finalResponse = $pdf->stream($fileName);

        }  else {
            Excel::store(
                new ReportsExport($data, $headings), 
                $relativePath, 
                'public' 
            );

            $finalResponse = response()->download($fullPath, $fileName);
        }

        GeneratedReport::create([
            'id' => $fileId,
            'file_name' => $fileName,
            'path' => $relativePath,
            'file_tyoe' => $fileType,
            'report_type' => 'Student Advisement Logs'
        ]);

        return $finalResponse;
    }
    
}