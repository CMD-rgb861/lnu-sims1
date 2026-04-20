<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EnrollmentCourse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\SchoolYear;
use App\Models\StudentEvaluation;
use App\Models\StudentEvaluationAnswer;
use Illuminate\Validation\Rule;

class StudentEvaluationController extends Controller
{
    /**
     * Return the current student's enrollment rows (used to populate the evaluation page).
     *
     * Returns a list of enrollment rows with sample columns: id, id_no, course info,
     * section_code, school_year_id and instructor relation.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Match enrollments by student id_number (project convention)
        $studentIdNumber = $user->id_number;

        // Build base query
        $query = EnrollmentCourse::with([
                'course',
                'schoolYear',
                'program.department.college',
                // eager-load instructor and their program/college roles so frontend can display program/college
                'instructor.user_account_role.role_program_coordinator',
                'instructor.user_account_role.role_enrolling_teacher',
                'instructor.user_account_role.role_dean',
                'instructor',
            ]);

        $query->where('id_number', $studentIdNumber)
              ->whereIn('status', ['advised', 'enrolled']);

        // Apply server-side filters from query params
        $termParam = $request->query('term', null);
        $availability = $request->query('availability', 'all');

        // Determine active term id
        $activeTerm = SchoolYear::where('is_active', 1)->first();
        $activeTermId = $activeTerm?->id;

        // Interpret term param: 'current' or null means active term; otherwise numeric id
        if (!$termParam || $termParam === 'current' || $termParam === 'all') {
            $termId = $activeTermId;
        } else {
            $termId = is_numeric($termParam) ? (int) $termParam : $activeTermId;
        }

        if ($termId) {
            $query->where('school_year_id', $termId);
        }

        // We'll compute availability (instructor assigned + schedule open) after fetching enrollments

        $enrollments = $query->get([
            'id',
            'id_no',
            DB::raw('instructor as instructor_text'),
            'school_year_id',
            'year_level',
            'program_id',
            'course_id',
            'course_code',
            'course_description',
            'section_code',
            'schedule_time',
            'schedule_days',
        ]);

        // Load evaluation schedules for the terms present in these enrollments
        $termIds = $enrollments->pluck('school_year_id')->unique()->filter()->values()->all();
        $schedules = collect();
        if (!empty($termIds)) {
            $schedules = DB::table('evaluation_schedules')
                ->whereIn('school_year_id', $termIds)
                ->get()
                ->keyBy('school_year_id');
        }

        // Helper to check if a schedule is open for a given term id
        $isScheduleOpen = function ($termId) use ($schedules) {
            $schedule = $schedules->get($termId);
            if (!$schedule) return false;
            $now = \Illuminate\Support\Carbon::now();
            $from = \Illuminate\Support\Carbon::parse($schedule->date_from)->startOfDay();
            $endDate = $schedule->date_extension ? $schedule->date_extension : $schedule->date_to;
            $end = \Illuminate\Support\Carbon::parse($endDate)->endOfDay();
            return $now->between($from, $end);
        };

        // Compute is_available using both instructor assignment and schedule window
        $enrollments->transform(function ($e) use ($isScheduleOpen) {
            $instructorAssigned = !empty($e->id_no) || (!empty($e->instructor_text) && trim($e->instructor_text) !== '');
            $scheduleOpen = $isScheduleOpen($e->school_year_id);
            $e->is_available = $instructorAssigned && $scheduleOpen;
            return $e;
        });

        // Apply availability filter if requested (now considers schedule)
        if ($availability === 'available') {
            $enrollments = $enrollments->filter(fn($x) => ($x->is_available ?? false))->values();
        } elseif ($availability === 'unavailable') {
            $enrollments = $enrollments->filter(fn($x) => !($x->is_available ?? false))->values();
        }

        // Mark which enrollments already have submissions by this student for the term
        $enrollmentIds = $enrollments->pluck('id')->filter()->values()->all();
        if (!empty($enrollmentIds)) {
            $existing = StudentEvaluation::where('student_id_number', $studentIdNumber)
                        ->whereIn('subject_id', $enrollmentIds)
                        ->where('term_id', $termId)
                        ->get()
                        ->keyBy('subject_id');

            $enrollments->transform(function ($e) use ($existing) {
                $sub = $existing->get($e->id);
                $e->is_submitted = $sub ? true : false;
                if ($sub) {
                    $e->submission_id = $sub->id;
                    $e->submitted_at = $sub->submitted_at;
                    // once submitted, mark not available for further evaluation
                    $e->is_available = false;
                }
                return $e;
            });
        }

        // Flatten related program/department/college and course data into each enrollment
        $enrollments->transform(function ($e) {
            // program
            $e->course_id = $e->course_id ?? ($e->course?->id ?? null);
            $e->course_code = $e->course_code ?? ($e->course?->course_code ?? null);
            $e->course_title = $e->course_description ?? ($e->course?->course_name ?? null);
            

            // course
            $e->program_id = $e->program_id ?? ($e->program?->id ?? null);
            $e->program_name = $e->program?->program_name ?? null;
            $e->department_name = $e->program?->department?->dept_name ?? null;
            $e->college_name = $e->program?->department?->college?->college_name ?? null;

            return $e;
        });

        // Fetch terms for the frontend term selector
        $terms = SchoolYear::orderByDesc('school_year_from')->orderByDesc('semester')->get(['id', 'school_year_from', 'school_year_to', 'semester']);

        return response()->json([
            'enrollments' => $enrollments,
            'terms' => $terms,
            'active_term_id' => $activeTermId,
        ]);
    }

    /**
     * Store a student evaluation submission.
     * Expected payload: subject_id, instructor_id (nullable), term_id, answers (object), comment (nullable)
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $data = $request->validate([
            'subject_id' => ['required', 'integer'],
            'instructor_id' => ['nullable', 'integer'],
            'term_id' => ['required', 'integer'],
            'answers' => ['required', 'array'],
            'comment' => ['nullable', 'string'],
        ]);

        $answers = $data['answers'];

        // validate each score is integer 1..5
        foreach ($answers as $key => $value) {
            if (!is_numeric($value) || (int)$value < 1 || (int)$value > 5) {
                return response()->json(['message' => "Invalid score for {$key}. Must be integer 1..5."], 422);
            }
        }

        $termId = $data['term_id'];

        // Check evaluation schedule open for term
        $schedule = DB::table('evaluation_schedules')->where('school_year_id', $termId)->first();
        if (!$schedule) {
            return response()->json(['message' => 'Evaluation schedule not found for term'], 422);
        }

        $now = now()->startOfDay();
        $dateFrom = \Illuminate\Support\Carbon::parse($schedule->date_from)->startOfDay();
        $effectiveEnd = $schedule->date_extension ? \Illuminate\Support\Carbon::parse($schedule->date_extension)->endOfDay() : \Illuminate\Support\Carbon::parse($schedule->date_to)->endOfDay();

        if (!($now->between($dateFrom, $effectiveEnd))) {
            return response()->json(['message' => 'Evaluation is not open for the selected term'], 422);
        }

        $studentIdNumber = $user->id_number;

        // enforce unique submission
        $exists = StudentEvaluation::where('student_id_number', $studentIdNumber)
                    ->where('subject_id', $data['subject_id'])
                    ->where('term_id', $termId)
                    ->exists();

        if ($exists) {
            return response()->json(['message' => 'You have already submitted an evaluation for this subject and term.'], 409);
        }

        // compute totals
        $total = 0;
        $count = 0;
        foreach ($answers as $v) {
            $s = (int)$v;
            $total += $s;
            $count++;
        }
        $max = $count * 5;
        $rating = $max > 0 ? round(($total / $max) * 100, 2) : 0.00;

        // save in transaction
        try {
            $submission = DB::transaction(function () use ($studentIdNumber, $data, $answers, $total, $max, $rating) {
                $s = StudentEvaluation::create([
                    'student_id_number' => $studentIdNumber,
                    'subject_id' => $data['subject_id'],
                    'instructor_id' => $data['instructor_id'] ?? null,
                    'term_id' => $data['term_id'],
                    'total_score' => $total,
                    'max_score' => $max,
                    'rating_percentage' => $rating,
                    'comment' => $data['comment'] ?? null,
                    'submitted_at' => now(),
                    'status' => 'submitted',
                ]);

                foreach ($answers as $k => $v) {
                    $s->answers()->create([
                        'question_key' => $k,
                        'score' => (int)$v,
                    ]);
                }

                return $s;
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to save evaluation', 'error' => $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Evaluation submitted', 'submission_id' => $submission->id], 201);
    }
}
