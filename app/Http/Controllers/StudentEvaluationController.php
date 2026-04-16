<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EnrollmentCourse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\SchoolYear;

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

        if ($availability === 'available') {
            // available if id_no is present OR instructor text exists
            $query->where(function ($q) {
                $q->whereNotNull('id_no')
                  ->orWhereRaw("COALESCE(instructor, '') <> ''");
            });
        } elseif ($availability === 'unavailable') {
            // unavailable if no id_no AND no instructor text
            $query->whereNull('id_no')->whereRaw("COALESCE(instructor, '') = ''");
        }

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

        // Add an is_available flag so frontend doesn't need to infer it
        $enrollments->transform(function ($e) {
            $e->is_available = !empty($e->id_no) || (!empty($e->instructor_text) && trim($e->instructor_text) !== '');
            return $e;
        });

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
}
