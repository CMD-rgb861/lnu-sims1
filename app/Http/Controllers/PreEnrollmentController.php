<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\Department;
use App\Models\EnrollmentDetail;
use App\Models\Program;
use App\Models\Schedule;
use App\Models\ScheduleStudent;
use App\Models\SchoolYear;
use App\Models\StudentAccount;
use App\Providers\UserLogsProvider;
use App\Models\GeneratedReport;

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


class PreEnrollmentController extends Controller
{

    // Show pending colleges index for pre-enrollment
    public function collegesIndex()
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();
        
        if (!$currentSchoolYear) {
            return view('pages.employees.pre_enrollment.pre_enrollment_layout', [
                'colleges' => collect(), 
                'schedules' => collect()
            ]);
        }

        $schedules = Schedule::where('school_year_id', $currentSchoolYear->id)->get();
        
        $colleges = College::query()
            ->addSelect([
                'pending_enrollees_count' => EnrollmentDetail::query()
                ->selectRaw('count(*)')
                ->join('programs', 'enrollment_details.program_id', '=', 'programs.id')
                ->join('departments', 'programs.dept_id', '=', 'departments.id')
                ->whereColumn('departments.college_id', 'colleges.id') 
                ->where('school_year_id', $currentSchoolYear->id)
                ->where('eaf_status', 0)
                ->whereHas('schedule_slot.schedule', function ($q) { 
                    $q->whereDate('schedule_date', today());
                }),

            'processed_enrollees_count' => EnrollmentDetail::query()
                ->selectRaw('count(*)')
                ->join('programs', 'enrollment_details.program_id', '=', 'programs.id')
                ->join('departments', 'programs.dept_id', '=', 'departments.id')
                ->whereColumn('departments.college_id', 'colleges.id')
                ->where('school_year_id', $currentSchoolYear->id)
                ->where('eaf_status', 1)
                ->whereHas('schedule_slot.schedule', function ($q) {
                    $q->whereDate('schedule_date', today());
                }),
            ])
            ->get();

        return view('pages.employees.pre_enrollment.pre_enrollment_layout', compact('colleges', 'schedules'));
    }

    public function preEnrollmentLogsIndex()
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();

        return view('pages.employees.pre_enrollment.pre_enrollment_logs_layout', compact('currentSchoolYear'));
    }

    public function scheduleLookupIndex()
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();

        return view('pages.employees.pre_enrollment.pre_enrollment_schedule_lookup_layout', compact('currentSchoolYear'));
    }

    public function filterColleges(Request $request)
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();

        if (!$currentSchoolYear) {
            return response('<div class="col-12 text-center p-5 text-muted">Error: Active school year not found.</div>', 500);
        }

        $collegeId = $request->input('college');
        $scheduleId = $request->input('schedule');

        $query = College::query();

        $query->when($collegeId, function ($q) use ($collegeId) {
            return $q->where('id', $collegeId);
        });

        $query->addSelect([
            'pending_enrollees_count' => EnrollmentDetail::query()
                ->selectRaw('count(*)')
                ->join('programs', 'enrollment_details.program_id', '=', 'programs.id')
                ->join('departments', 'programs.dept_id', '=', 'departments.id')
                ->whereColumn('departments.college_id', 'colleges.id') 
                ->where('school_year_id', $currentSchoolYear->id)
                ->where('eaf_status', 0)
                ->when($scheduleId, function ($q) use ($scheduleId) {
                    $q->whereHas('schedule_slot', function ($subQuery) use ($scheduleId) {
                        $subQuery->where('schedule_id', $scheduleId);
                    });
                }),

            'processed_enrollees_count' => EnrollmentDetail::query()
                ->selectRaw('count(*)')
                ->join('programs', 'enrollment_details.program_id', '=', 'programs.id')
                ->join('departments', 'programs.dept_id', '=', 'departments.id')
                ->whereColumn('departments.college_id', 'colleges.id')
                ->where('school_year_id', $currentSchoolYear->id)
                ->where('eaf_status', 1)
                ->when($scheduleId, function ($q) use ($scheduleId) {
                    $q->whereHas('schedule_slot', function ($subQuery) use ($scheduleId) {
                        $subQuery->where('schedule_id', $scheduleId);
                    });
                }),
        ]);

        $colleges = $query->get();

        return view('pages.employees.pre_enrollment.pre_enrollment_college_cards', compact('colleges'));
    }

    //Show pending enrollees index
    public function pendingEnrolleesIndex(Request $request)
    {   
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();

        $collegeId = $request->input('collegeId');
        $scheduleId = $request->input('scheduleId');
        
        $college = College::where('id', $collegeId)->first();
        $schedule = Schedule::where('id', $scheduleId)->first();

        $schedules = Schedule::where('id', $scheduleId)->get();
        return view('pages.employees.pre_enrollment.pre_enrollment_layout', compact('college', 'schedule', 'schedules'));
    }

    //Show processed enrollees index
    public function processedEnrolleesIndex(Request $request)
    {   
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();

        $collegeId = $request->input('collegeId');
        $scheduleId = $request->input('scheduleId');
        
        $college = College::where('id', $collegeId)->first();
        $schedule = Schedule::where('id', $scheduleId)->first();
        return view('pages.employees.pre_enrollment.pre_enrollment_layout', compact('college', 'schedule'));
    }

    // // Fetch pending enrollees
    // public function fetchPendingEnrollees(Request $request)
    // {
    //     $currentSchoolYear = SchoolYear::where('is_active', 1)->first();
    //     $collegeId = $request->input('collegeId');
    //     $scheduleId = $request->input('scheduleId');

    //     if (!$currentSchoolYear) {
    //         return DataTables::of(collect())->make(true);
    //     }

    //     $query = EnrollmentDetail::query()
    //         ->with(['student', 'program', 'enrolling_teacher']) 
    //         ->where('school_year_id', $currentSchoolYear->id)
    //         ->where('eaf_status', 0)
    //         ->where('enrolling_teacher_id', '!=', null);
        
    //     $query->when($collegeId, function ($q) use ($collegeId) {
    //         $q->whereHas('program.department', function ($subQuery) use ($collegeId) {
    //             $subQuery->where('college_id', $collegeId);
    //         });
    //     });

    //     $query->when($scheduleId, function ($q) use ($scheduleId) {
    //         $q->whereHas('schedule_slot', function ($subQuery) use ($scheduleId) {
    //             $subQuery->where('schedule_id', $scheduleId);
    //         });
    //     });

    //     $pendingEnrollees = $query->get();
        
    //     return DataTables::of($query)
    //         ->filterColumn('student_name', function($q, $keyword) {
    //             $q->whereHas('student', function($sub) use ($keyword) {
    //                 $sub->where('first_name', 'like', "%{$keyword}%")
    //                 ->orWhere('last_name', 'like', "%{$keyword}%");
    //             });
    //         })
    //         ->filterColumn('id_number', function($q, $keyword) {
    //             $q->whereHas('student', function($sub) use ($keyword) {
    //                 $sub->where('id_number', 'like', "%{$keyword}%");
    //             });
    //         })
    //         ->editColumn('enrolling_teacher_timestamp', function($enrollee) {
    //             return $enrollee->enrolling_teacher_timestamp 
    //                 ? Carbon::parse($enrollee->enrolling_teacher_timestamp)->format('F d, Y h:i A') 
    //                 : 'N/A';
    //         })
    //         ->editColumn('year_level', function($enrollee) {
    //             return $enrollee->formatted_year_level;
    //         })
    //         ->editColumn('enrollment_type', function($enrollee) {
    //             return $enrollee->formatted_enrollment_type;
    //         })
    //         ->editColumn('acad_standing', function($enrollee) {
    //             return $enrollee->formatted_acad_standing;
    //         })
    //         ->addColumn('student_name', function($enrollee) {
    //             return optional($enrollee->student)->display_name ?? 'Student name undefined';
    //         })
    //         ->addColumn('id_number', function($enrollee) {
    //             return optional($enrollee->student)->id_number;
    //         })
    //         ->addColumn('student_id', function($enrollee) {
    //             return optional($enrollee->student)->id;
    //         })
    //         ->addColumn('program', function($enrollee) {
    //             return optional($enrollee->program)->program_acronym;
    //         })
    //         ->addColumn('enrolling_teacher', function($enrollee) {
    //             return optional($enrollee->enrolling_teacher)->display_name ?? 'N/A';
    //         })
    //         ->make(true);
    // }

    // public function fetchProcessedEnrollees(Request $request)
    // {
    //     $currentSchoolYear = SchoolYear::where('is_active', 1)->first();
    //     $collegeId = $request->input('collegeId');
    //     $scheduleId = $request->input('scheduleId');

    //     if (!$currentSchoolYear) {
    //         return DataTables::of(collect())->make(true);
    //     }

    //     $query = EnrollmentDetail::query()
    //         ->with('student') 
    //         ->where('school_year_id', $currentSchoolYear->id)
    //         ->where('eaf_status', 1);
        
    //     $query->when($collegeId, function ($q) use ($collegeId) {
    //         $q->whereHas('program.department', function ($subQuery) use ($collegeId) {
    //             $subQuery->where('college_id', $collegeId);
    //         });
    //     });

    //     $query->when($scheduleId, function ($q) use ($scheduleId) {
    //         $q->whereHas('schedule_slot', function ($subQuery) use ($scheduleId) {
    //             $subQuery->where('schedule_id', $scheduleId);
    //         });
    //     });

    //     $pendingEnrollees = $query->get();
        
    //     return DataTables::of($pendingEnrollees)
    //         ->editColumn('eaf_timestamp', function($enrollee) {
    //             return Carbon::parse($enrollee->eaf_timestamp)->format('F d, Y h:i A');
    //         })
    //         ->editColumn('year_level', function($enrollee) {
    //             return $enrollee->formatted_year_level;
    //         })
    //         ->editColumn('enrollment_type', function($enrollee) {
    //             return $enrollee->formatted_enrollment_type;
    //         })
    //         ->editColumn('acad_standing', function($enrollee) {
    //             return $enrollee->formatted_acad_standing;
    //         })
    //         ->addColumn('student_name', function($enrollee) {
    //             return optional($enrollee->student)->display_name ?? 'Student name undefined';
    //         })
    //         ->addColumn('id_number', function($enrollee) {
    //             return optional($enrollee->student)->id_number;
    //         })
    //         ->addColumn('student_id', function($enrollee) {
    //             return optional($enrollee->student)->id;
    //         })
    //         ->addColumn('program', function($enrollee) {
    //             return optional($enrollee->program)->program_acronym;
    //         })
    //         ->addColumn('enrolling_teacher', function($enrollee) {
    //             return optional($enrollee->enrolling_teacher)->display_name;
    //         })
    //         ->make(true);
    // }

    public function fetchPendingEnrollees(Request $request)
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();
        $collegeId = $request->input('collegeId');
        $scheduleId = $request->input('scheduleId');
        $search = $request->input('search'); 

        if (!$currentSchoolYear) {
            return response()->json(['data' => []]);
        }

        $query = EnrollmentDetail::query()
            ->with(['student', 'program', 'enrolling_teacher']) 
            ->where('school_year_id', $currentSchoolYear->id)
            ->where('eaf_status', 0);

        // 1. Manual Global Search Logic (Replacing DataTables search)
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->whereHas('student', function($sub) use ($search) {
                    $sub->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('id_number', 'like', "%{$search}%");
                });
            });
        }

        // 2. Filters
        $query->when($collegeId, function ($q) use ($collegeId) {
            $q->whereHas('program.department', function ($subQuery) use ($collegeId) {
                $subQuery->where('college_id', $collegeId);
            });
        });

        $query->when($scheduleId, function ($q) use ($scheduleId) {
            $q->whereHas('schedule_slot', function ($subQuery) use ($scheduleId) {
                $subQuery->where('schedule_id', $scheduleId);
            });
        });

        // 3. Execute Pagination (e.g., 50 items per page)
        $paginatedResults = $query->paginate(10);

        // 4. Transform the data (Replacing editColumn/addColumn)
        $paginatedResults->getCollection()->transform(function ($enrollee) {
            return [
                'id'   => $enrollee->id,
                'id_number'    => optional($enrollee->student)->id_number,
                'student_name' => optional($enrollee->student)->display_name ?? 'Student name undefined',
                'program'      => optional($enrollee->program)->program_acronym,
                'year_level'   => $enrollee->formatted_year_level,
                'enrollment_type' => $enrollee->formatted_enrollment_type,
                'acad_standing'   => $enrollee->formatted_acad_standing,
                'enrolling_teacher' => optional($enrollee->enrolling_teacher)->display_name ?? 'N/A',
                'enrolling_teacher_timestamp' => $enrollee->enrolling_teacher_timestamp 
                    ? Carbon::parse($enrollee->enrolling_teacher_timestamp)->format('F d, Y h:i A') 
                    : 'N/A',
            ];
        });

        return response()->json($paginatedResults);
    }

    // Fetch processed enrollees
    public function fetchProcessedEnrollees(Request $request)
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();
        $collegeId = $request->input('collegeId');
        $scheduleId = $request->input('scheduleId');
        $search = $request->input('search'); 

        if (!$currentSchoolYear) {
            return response()->json(['data' => []]);
        }

        $query = EnrollmentDetail::query()
            ->with(['student', 'program', 'enrolling_personnel']) 
            ->where('school_year_id', $currentSchoolYear->id)
            ->where('eaf_status', 1); 

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->whereHas('student', function($sub) use ($search) {
                    $sub->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('id_number', 'like', "%{$search}%");
                })
                // Optional: Search by program acronym
                ->orWhereHas('program', function($sub) use ($search) {
                    $sub->where('program_acronym', 'like', "%{$search}%");
                });
            });
        }

        $query->when($collegeId, function ($q) use ($collegeId) {
            $q->whereHas('program.department', function ($subQuery) use ($collegeId) {
                $subQuery->where('college_id', $collegeId);
            });
        });

        $query->when($scheduleId, function ($q) use ($scheduleId) {
            $q->whereHas('schedule_slot', function ($subQuery) use ($scheduleId) {
                $subQuery->where('schedule_id', $scheduleId);
            });
        });

        $paginatedResults = $query->paginate(10);

        $paginatedResults->getCollection()->transform(function ($enrollee) {
            return [
                'id'             => $enrollee->id,
                'student_id'     => optional($enrollee->student)->id,
                'id_number'      => optional($enrollee->student)->id_number,
                'student_name'   => optional($enrollee->student)->display_name ?? 'Student name undefined',
                'program'        => optional($enrollee->program)->program_acronym,
                'year_level'     => $enrollee->formatted_year_level,
                'enrollment_type'=> $enrollee->formatted_enrollment_type,
                'acad_standing'  => $enrollee->formatted_acad_standing,
                'enrolling_personnel' => optional($enrollee->enrolling_personnel)->display_name ?? 'N/A',
                'eaf_timestamp'  => $enrollee->eaf_timestamp 
                    ? Carbon::parse($enrollee->eaf_timestamp)->format('F d, Y h:i A') 
                    : 'N/A',
            ];
        });

        return response()->json($paginatedResults);
    }

    private function getPreEnrollmentLogsQuery()
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();

        if (!$currentSchoolYear) {
            return EnrollmentDetail::query()->whereRaw('1 = 0'); 
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

    private function transformPreEnrollmentLog(EnrollmentDetail $log)
    {
        return [
            'id_number'         => optional($log->student)->id_number ?? 'N/A',
            'student_name'      => optional($log->student)->display_name ?? 'N/A',
            'year_level'        => $log->formatted_year_level ?? 'N/A',
            'college'           => optional($log->program->department->college)->college_acronym ?? 'N/A',
            'program'           => optional($log->program)->program_acronym ?? 'N/A',
            'schedule'          => Carbon::parse($log->schedule_date)->format('F d, Y h:i A'),
            'enrolled_on'       => Carbon::parse($log->enrollment_timestamp)->format('F d, Y h:i A'),
            'enrolling_personnel' => optional($log->enrolling_personnel)->display_name ?? 'N/A',
        ];
    }

    //Fetch pre enrollment logs 
    public function fetchPreEnrollmentLogs(Request $request)
    {
        $query = $this->getPreEnrollmentLogsQuery();

        if ($query->toSql() == EnrollmentDetail::query()->whereRaw('1 = 0')->toSql()) {
            return DataTables::of(collect())->make(true);
        }

        $search = $request->input('search');
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->whereHas('student', function($sub) use ($search) {
                    $sub->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('id_number', 'like', "%{$search}%");
                });
            });
        }

        $paginated = $query->paginate(10);

        $paginated->getCollection()->transform(function ($log) {
            return $this->transformPreEnrollmentLog($log);
        });

        return response()->json($paginated);
    }

    // Export pre-enrollment logs using various formats
    public function exportPreEnrollmentLogs(Request $request)
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();
        $schoolYearHeader = $currentSchoolYear ? $currentSchoolYear->display_name : 'N/A';
        $format = $request->input('format', 'xlsx');
        $query = $this->getPreEnrollmentLogsQuery();

        $fileId = (string) Str::uuid(); 
        $fileName = $fileId . '.' . $format;
        $relativePath = 'reports/' . $fileName; 
        $fullPath = Storage::disk('public')->path($relativePath); 
        Storage::disk('public')->makeDirectory('reports');

        $headings = ['ID Number', 'Student Name', 'Year Level', 'College', 'Program', 'Schedule', 'Enrolled On', 'Enrolling Personnel'];

        if ($format == 'pdf') {
            // For PDF, use cursor() to iterate without loading everything at once
            // Note: DomPDF can still be memory intensive with huge tables.
            $data = $query->cursor()->map(function($log) {
                return $this->transformPreEnrollmentLog($log);
            });

            $viewUrl = route('reports.verify', ['reportId' => $fileId]);
            $qrCode = base64_encode(QrCode::format('svg')->size(200)->errorCorrection('H')->generate($viewUrl));

            $pdf = PDF::loadView('reports.pre_enrollment_report', [
                'logs' => $data, 
                'headings' => $headings,
                'logo_path' => public_path('images/email_header_logo.png'),
                'qr_code' => $qrCode, 
                'sy' => $schoolYearHeader
            ])->setPaper('a4', 'landscape');

            $pdf->save($fullPath);
            $finalResponse = $pdf->stream($fileName);

        } else {
            // EXCEL/CSV: Pass the $query (Builder), not the results
            Excel::store(
                new ReportsExport($query, $headings), 
                $relativePath, 
                'public' 
            );

            $finalResponse = response()->download($fullPath, $fileName);
        }

        GeneratedReport::create([
            'id' => $fileId,
            'file_name' => $fileName,
            'path' => $relativePath,
            'file_type' => $format,
            'report_type' => 'Pre-Enrollment Logs'
        ]);

        return $finalResponse;
    }

    // Fetch available schedules for individual student rescheduling
    public function fetchAvailableIndividualSchedules(EnrollmentDetail $enrollment)
    {
        $activeSchoolYear = SchoolYear::where('is_active', 1)->first();

        if (!$activeSchoolYear) {
            return response()->json([]); 
        }
        
        $enrollment->load('program.department');
        $enrollment->load('schedule_slot.schedule');
        
        $yearLevel = $enrollment->year_level;
        $acadStanding = $enrollment->acad_standing;
        $collegeId = $enrollment->program?->department?->college_id;

        if (!$collegeId) {
            return response()->json([]);
        }

        $currentScheduleId = 13;

        $schedules = Schedule::query()
            ->where('school_year_id', $activeSchoolYear->id)
            ->where('year_level', $yearLevel)
            ->where('schedule_type', $acadStanding)
            ->whereDate('schedule_date', '>=', now())
            ->when($currentScheduleId, function ($query) use ($currentScheduleId) {
                $query->where('id', '!=', $currentScheduleId);
            })
            ->whereHas('slots', function ($query) use ($collegeId) {
                $query->where('college_id', $collegeId)
                    ->where(function ($slotQuery) {
                        $slotQuery->where('am_slots', '>', 0)
                                ->orWhere('pm_slots', '>', 0);
                    });
            })
            ->orderBy('schedule_date', 'asc')
            ->get(); 

        if ($acadStanding == 1 && $schedules->isEmpty()) {
            $schedules = Schedule::query()
                ->where('school_year_id', $activeSchoolYear->id)
                ->where('year_level', $yearLevel)
                ->where('schedule_type', 2) // Look for irregular/open schedules
                ->whereDate('schedule_date', '>=', now())
                ->when($currentScheduleId, function ($query) use ($currentScheduleId) {
                    $query->where('id', '!=', $currentScheduleId);
                })
                ->whereHas('slots', function ($query) use ($collegeId) {
                    $query->where('college_id', $collegeId)
                        ->where(function ($slotQuery) {
                                $slotQuery->where('am_slots', '>', 0)
                                        ->orWhere('pm_slots', '>', 0);
                        });
                })
                ->orderBy('schedule_date', 'asc')
                ->get();
        }

        $formattedSchedules = $schedules->map(function ($schedule) {
            return [
                'id'   => $schedule->id,
                'text' => $schedule->schedule_date->format('F d, Y'),
            ];
        });

        $currentScheduleData = null;
        if ($enrollment->schedule_slot) {
            $currentScheduleData = [
                'text' => $enrollment->schedule_slot->first()->schedule->schedule_date->format('F d, Y'),
            ];
        }

        return response()->json([
            'available_schedules' => $formattedSchedules,
            'current_schedule'    => $currentScheduleData,
        ]);
    }

    // Schedule lookup
    public function scheduleLookup(Request $request)
    {
        $currentSchoolYear = SchoolYear::where('is_active', 1)->first();
        $search = $request->input('query'); 

        if (!$currentSchoolYear || !$search) {
            return response()->json(['status' => 1]); // Treat as not found
        }

        $enrollment = EnrollmentDetail::where('school_year_id', $currentSchoolYear->id)
            ->whereHas('student', function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('id_number', 'like', "%{$search}%");
            })
            ->with(['student', 'schedule_student.schedule'])
            ->first();


        if (!$enrollment) {
            return response()->json([
                'student_name' => null, 
                'schedule' => null,
                'status' => 1 
            ]);
        }

        $name = $enrollment->student->display_name ?? 'Student';
        $date = $enrollment->schedule_student->schedule->schedule_date ?? null;

        if (!$date) {
            return response()->json([
                'student_name' => $name, 
                'schedule' => null,
                'status' => 2 
            ]);
        }

        return response()->json([
            'student_name' => $name,
            'schedule' => $date->format('F d, Y'), 
            'status' => 0 
        ]);
    }

    // Process enrollment of student
    public function processEnrollment($id)
    {
        $user = '';

        if (Auth::guard('employee')->check()) {
            $user = Auth::guard('employee')->user();
        }

        DB::beginTransaction();

        try{

            $enrollmentId = $id;

            $processEnrollment = EnrollmentDetail::findOrFail($enrollmentId);
            $processEnrollment->eaf_status = 1;
            $processEnrollment->eaf_timestamp = date('Y-m-d H:i:s');
            $processEnrollment->enrollment_status = 1;
            $processEnrollment->enrollment_timestamp = date('Y-m-d H:i:s');
            $processEnrollment->enrolling_personnel_id = $user->id;
            $processEnrollment->save();

            $processEnrollment->schedule_slot()->update(['remarks' => 1]);

     
            DB::commit();

            //Log user activity
            UserLogsProvider::log('processed enrollment for student: ' . $processEnrollment->student->display_name);

            return response()->json([
                'message' => 'Student enrollment successfully processed!',
                'type' => 'success',
            ]);

        }catch(\Exception $e){
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to process student enrollment.' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
    }

    // Undo enrollment changes
    public function undoEnrollment($id)
    {

        DB::beginTransaction();
        try{

            $enrollmentId = $id;

            $undoEnrollment = EnrollmentDetail::findOrFail($enrollmentId);
            $undoEnrollment->eaf_status = 0;
            $undoEnrollment->eaf_timestamp = null;
            $undoEnrollment->enrollment_status = 0;
            $undoEnrollment->enrollment_timestamp = null;
            $undoEnrollment->enrolling_personnel_id = null;
            $undoEnrollment->save();

            $undoEnrollment->schedule_slot()->update(['remarks' => 0]);

            DB::commit();

            //Log user activity
            UserLogsProvider::log('reset enrollment status for student: ' . $undoEnrollment->student->display_name);

            return response()->json([
                'message' => 'Student enrollment successfully processed!',
                'type' => 'success',
            ]);

        }catch(\Exception $e){
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to reset student enrollment status.' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
    }

    // Reschedule selected student
    public function rescheduleStudent(Request $request, $id)
    {
        $user = '';

        if (Auth::guard('employee')->check()) {
            $user = Auth::guard('employee')->user();
        }

        $validator = Validator::make($request->all(), [
            'schedule_id' => 'required',
            'schedule_time'=> 'required',
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

            $enrollmentId = $id;

            $rescheduleStudent = EnrollmentDetail::findOrFail($enrollmentId);
            $rescheduleStudent->schedule_slot()->update([
                'schedule_id' => $request->schedule_id,
                'schedule_time' => $request->schedule_time,
                'reschedule_status' => 1
            ]);

            DB::commit();

            //Log user activity
            UserLogsProvider::log('rescheduled student' . $rescheduleStudent->student->display_name);

            return response()->json([
                'message' => 'Student rescheduled successfully!',
                'type' => 'success',
            ]);

        }catch(\Exception $e){
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to reschedule student.' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
    }
    
}