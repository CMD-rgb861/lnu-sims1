<?php

namespace App\Http\Controllers;

use App\Models\StudentProgram;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\EnrollmentCourse;
use App\Models\StudentAccount;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StudentProgramController extends Controller
{
    /**
     * Display a listing of the student's program records.
     */
    public function index(Request $request, $studentId = null): JsonResponse
    {
        $query = StudentProgram::with(['studentAccount', 'program', 'curriculum']);

        // Accept filtering via route param or query param
        if ($studentId) {
            $query->where('student_account_id', $studentId);
        }

        if ($request->filled('student_account_id')) {
            $query->where('student_account_id', $request->input('student_account_id'));
        }

        if ($request->filled('id_number')) {
            $query->where('id_number', $request->input('id_number'));
        }

        $items = $query->orderBy('id', 'desc')->paginate(25);

        return response()->json($items);
    }

    /**
     * Return the curriculum courses that belong to the student's chosen program/curriculum.
     * This ensures the frontend only shows courses for the student's selected program.
     */
    public function courses($studentId): JsonResponse
    {
        // Find the latest student_program record for the student
        $studentProgram = StudentProgram::where('student_account_id', $studentId)->orderBy('id', 'desc')->first();

        if (! $studentProgram) {
            return response()->json(['data' => []]);
        }

        // Prefer an explicitly chosen curriculum on the student_program record
        $curriculumId = $studentProgram->curriculum_id;

        // If no curriculum chosen, try to pick the active curriculum for the program
        if (! $curriculumId && $studentProgram->program_id) {
            $curr = Curriculum::where('program_id', $studentProgram->program_id)->where('is_active', true)->first();
            if ($curr) $curriculumId = $curr->id;
        }

        if (! $curriculumId) {
            return response()->json(['data' => []]);
        }

        $courses = CurriculumCourse::with('course')
            ->where('curriculum_id', $curriculumId)
            ->orderBy('year_level')
            ->orderBy('semester')
            ->get();

        return response()->json($courses);
    }

    /**
     * Return the curriculum courses for a specific student_program record.
     */
    public function coursesByStudentProgram($studentProgramId): JsonResponse
    {
        $studentProgram = StudentProgram::find($studentProgramId);

        if (! $studentProgram) {
            return response()->json(['data' => []], 404);
        }

        $curriculumId = $studentProgram->curriculum_id;

        if (! $curriculumId && $studentProgram->program_id) {
            $curr = Curriculum::where('program_id', $studentProgram->program_id)->where('is_active', true)->first();
            if ($curr) $curriculumId = $curr->id;
        }

        if (! $curriculumId) {
            return response()->json(['data' => []]);
        }

        $courses = CurriculumCourse::with('course')
            ->where('curriculum_id', $curriculumId)
            ->orderBy('year_level')
            ->orderBy('semester')
            ->get();

        return response()->json($courses);
    }

    /**
     * Return the student's program records and, for each student_program record,
     * the curriculum courses grouped by year_level and semester.
     *
     * This consolidates the frontend's multiple requests into a single endpoint
     * so the backend handles fetching and grouping logic.
     */
    public function programsWithCourses($studentId): JsonResponse
    {
        $programs = StudentProgram::with(['program', 'curriculum'])
            ->where('student_account_id', $studentId)
            ->orderBy('id', 'desc')
            ->get();

    $studentAccount = StudentAccount::find($studentId);
    $fallbackIdNumber = $studentAccount?->id_number;

        $result = [];

        $normalize = function ($value) {
            if (! $value) return null;
            $normalized = strtoupper(preg_replace('/[^A-Z0-9]/i', '', (string) $value));
            return $normalized !== '' ? $normalized : null;
        };

        foreach ($programs as $sp) {
            $curriculumId = $sp->curriculum_id;

            if (! $curriculumId && $sp->program_id) {
                $curr = Curriculum::where('program_id', $sp->program_id)->where('is_active', true)->first();
                if ($curr) $curriculumId = $curr->id;
            }

            if (! $curriculumId) {
                $result[$sp->id] = ['grouped' => (object) []];
                continue;
            }

            $courses = CurriculumCourse::with('course')
                ->where('curriculum_id', $curriculumId)
                ->orderBy('year_level')
                ->orderBy('semester')
                ->get();

            $enrollmentMap = collect();
            $idNumber = $sp->id_number ?: $fallbackIdNumber;
            if ($idNumber) {
                $enrollments = EnrollmentCourse::where('enrollment_courses.id_number', $idNumber)
                    ->where('enrollment_courses.program_id', $sp->program_id)
                    ->join('school_years', 'enrollment_courses.school_year_id', '=', 'school_years.id')
                    ->orderByDesc('school_years.school_year_from')
                    ->orderByDesc('school_years.semester')
                    ->orderByDesc('enrollment_courses.id') // fallback (optional)
                    ->select('enrollment_courses.*') // IMPORTANT
                    ->get();

                // Build map by course_id (prefer latest)
                $mapById = [];
                foreach ($enrollments as $en) {
                    if ($en->course_id && !isset($mapById[$en->course_id])) {
                        $mapById[$en->course_id] = $en;
                    }
                }
                $enrollmentMap = collect($mapById);
            }
            
            // group by year_level then semester
            $grouped = [];
            foreach ($courses as $c) {
                $yl = $c->year_level ?? 'Unknown';
                $sem = $c->semester ?? 0;
                if (! isset($grouped[$yl])) $grouped[$yl] = [];
                if (! isset($grouped[$yl][$sem])) $grouped[$yl][$sem] = [];
                $enrollment = $enrollmentMap->get($c->course_id);

                if ($enrollment) {
                    $c->status_course = $enrollment->status_course;
                    $c->final_grade = $enrollment->final_grade;
                }
                $grouped[$yl][$sem][] = $c;
            }

            $result[$sp->id] = [
                'student_program' => $sp,
                'grouped' => $grouped,
            ];
        }

        return response()->json([
            'student_programs' => $programs,
            'courses_by_student_program' => $result,
        ]);
    }

    /**
     * Store a newly created student program record.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_account_id' => ['required', 'exists:student_accounts,id'],
            'id_number' => ['nullable', 'string', 'max:64'],
            'program_id' => ['nullable', 'exists:programs,id'],
            'curriculum_id' => ['nullable', 'exists:curriculums,id'],
            'year_from' => ['nullable', 'integer'],
            'year_to' => ['nullable', 'integer'],
        ]);

        $record = StudentProgram::create($validated);

        return response()->json($record, 201);
    }

    /**
     * Display the specified record.
     */
    public function show($id): JsonResponse
    {
        $record = StudentProgram::with(['studentAccount', 'program', 'curriculum'])->findOrFail($id);
        return response()->json($record);
    }

    /**
     * Update the specified record.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $record = StudentProgram::findOrFail($id);

        $validated = $request->validate([
            'student_account_id' => ['sometimes', 'exists:student_accounts,id'],
            'id_number' => ['nullable', 'string', 'max:64'],
            'program_id' => ['nullable', 'exists:programs,id'],
            'curriculum_id' => ['nullable', 'exists:curriculums,id'],
            'year_from' => ['nullable', 'integer'],
            'year_to' => ['nullable', 'integer'],
        ]);

        $record->update($validated);

        return response()->json($record);
    }

    /**
     * Remove the specified record from storage.
     */
    public function destroy($id): JsonResponse
    {
        $record = StudentProgram::findOrFail($id);
        $record->delete();

        return response()->json(null, 204);
    }
}
