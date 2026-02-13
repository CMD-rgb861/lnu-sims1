<?php

namespace App\Http\Controllers;

use App\Models\EnrollmentCourse;
use App\Models\Program;
use App\Models\SchoolYear;
use App\Models\StudentAccount;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StudentGradeController extends Controller
{
    public function index()
    {
        return view('pages.students.grades.grades_layout');
    }

    public function grades(Request $request)
    {
        $student = Auth::user();

        $studentId = $student->id;
        $id_number = $student->id_number;

        $lastUpdated = EnrollmentCourse::where('id_number', $id_number)
            ->max('updated_at');

        $cacheKey = "grades_{$studentId}_" . md5($lastUpdated);

        return Cache::remember($cacheKey, 300, function () use ($studentId, $request) {
            return $this->fetchGrades($studentId, $request);
        });
    }

    public function getSemesters()
    {
        $student = Auth::user();

        return $this->fetchSemesters($student);
    }

    public function getPrograms()
    {
        $student = Auth::user();

        return $this->fetchPrograms($student);
    }

    public function studentGrades(Request $request)
    {
        $studentId = $request->studentId;        
        if (!$studentId) {
            return response()->json([], 200);
        }
        
        return $this->fetchGrades($studentId, $request);
    }

    public function studentSemesters(Request $request)
    {
        $studentId = $request->studentId;        
        if (!$studentId) {
            return response()->json([], 200);
        }

        $student = StudentAccount::find($studentId);
        if (!$student) {
            return response()->json([], 200);
        }

        return $this->fetchSemesters($student);
    }

    public function studentPrograms(Request $request)
    {
        $studentId = $request->studentId;        
        if (!$studentId) {
            return response()->json([], 200);
        }

        $student = StudentAccount::find($studentId);
        if (!$student) {
            return response()->json([], 200);
        }

        return $this->fetchPrograms($student);
    }

    private function fetchGrades($studentId, $request)
    {
        $semesterFilter = $request->input('semester', 'all');
        $programFilter = $request->input('program', 'all');        

        $query = EnrollmentCourse::join('student_accounts', 'student_accounts.id_number', '=', 'enrollment_courses.id_number')
            ->leftJoin('school_years', 'school_years.id', '=', 'enrollment_courses.school_year_id')
            ->leftJoin('programs', 'programs.id', '=', 'enrollment_courses.program_id')
            ->where('student_accounts.id', $studentId)
            ->whereIn('enrollment_courses.status', ['enrolled', 'dropped'])
            ->select([
                // enrollment_courses
                'enrollment_courses.course_code',
                'enrollment_courses.course_description',
                'enrollment_courses.course_units',
                'enrollment_courses.instructor',
                'enrollment_courses.grade',
                'enrollment_courses.final_grade',
                'enrollment_courses.inc',
                'enrollment_courses.status',

                // programs
                'programs.program_name',
                'programs.program_acronym',

                // school_years
                'school_years.id as school_year_id',
                'school_years.school_year_from',
                'school_years.school_year_to',
                'school_years.semester',
            ])
            ->orderByDesc('school_years.school_year_from')
            ->orderByDesc('school_years.semester');

        if ($semesterFilter !== 'all') {
            $query->where('enrollment_courses.school_year_id', $semesterFilter);
        }

        if ($programFilter !== 'all') {
            $query->where('enrollment_courses.program_id', $programFilter);
        }

        $records = $query->get();

        // $groupedByProgram = $records->groupBy(function ($item) {
        //     if (!$item->program_name) {
        //         return '';
        //     }

        //     return $item->program_name . ' (' . $item->program_acronym . ')';
        // });

        $response = [];

        $groupedByTerm = $records->groupBy(function ($item) {
            $semName = $item->semester == 1 ? 'First Semester' : 'Second Semester';
            return "{$semName} S.Y. {$item->school_year_from}-{$item->school_year_to}";
        });

        foreach ($groupedByTerm as $termName => $termRecords) {

            // Group programs inside the term
            $groupedPrograms = $termRecords->groupBy(function ($item) {
                return $item->program_name
                    ? $item->program_name . ' (' . $item->program_acronym . ')'
                    : '';
            });

            $rows = [];
            $lastProgram = null;

            foreach ($groupedPrograms as $programName => $subjects) {

                foreach ($subjects as $index => $s) {

                    $inc = $s->inc == 'INC' ? $s->inc . ':' : '';
                    $rating = $s->status === 'dropped'
                        ? 'DR'
                        : ($inc . ($s->final_grade ?? $s->grade));

                    $rows[] = [
                        // show program only once per group
                        'program' => $programName === $lastProgram ? '' : $programName,
                        'code' => $s->course_code,
                        'title' => $s->course_description,
                        'rating' => $rating,
                        'units' => number_format((float) $s->course_units, 2),
                        'instructor' => $s->instructor,
                    ];

                    $lastProgram = $programName;
                }
            }

            // compute GWA per term
            $totalWeighted = 0;
            $totalUnits = 0;

            foreach ($termRecords as $subject) {
                $grade = floatval($subject->final_grade ?? $subject->grade);
                $units = floatval($subject->course_units);

                $totalWeighted += $grade * $units;
                $totalUnits += $units;
            }

            $semGWA = $totalUnits > 0
                ? number_format($totalWeighted / $totalUnits, 2)
                : 0;

            $response[] = [
                'term' => $termName,
                'semGWA' => $semGWA,
                'rows' => $rows
            ];
        }

        // foreach ($groupedByProgram as $programName => $programRecords) {

        //     $groupedTerms = $programRecords->groupBy(function ($item) {
        //         $sy = $item->schoolYear;
        //         $semName = $sy->semester == 1 ? 'First Semester' : 'Second Semester';
        //         return "{$semName} S.Y. {$sy->school_year_from}-{$sy->school_year_to}";
        //     });

        //     $termsArray = [];

        //     foreach ($groupedTerms as $termName => $subjects) {

        //         $totalWeighted = 0;
        //         $totalUnits = 0;

        //         foreach ($subjects as $subject) {
        //             $grade = floatval($subject->final_grade ?? $subject->grade);
        //             $units = floatval($subject->course_units);

        //             $totalWeighted += $grade * $units;
        //             $totalUnits += $units;
        //         }

        //         $semGWA = $totalUnits > 0 ? number_format($totalWeighted / $totalUnits, 2) : 0;
                

        //         $termsArray[] = [
        //             "term" => $termName,
        //             "subjects" => $subjects->map(function ($s) {

        //                 $inc = $s->inc ? $s->inc.':' : '';

        //                 $date_dropped_removed = $s->status == 'dropped' ? 'DR' : $inc.$s->final_grade ?? $inc.$s->grade;

        //                 return [
        //                     "code" => $s->course_code,
        //                     "title" => $s->course_description,
        //                     "rating" => $date_dropped_removed,
        //                     "units" => $s->course_units,
        //                     "instructor" => $s->instructor,
        //                 ];
        //             }),
        //             "semGWA" => $semGWA
        //         ];
        //     }

        //     $response[] = [
        //         "program" => $programName,
        //         "terms" => $termsArray
        //     ];
        // }


        // $query = DB::table('enrollment_courses as ec')
        //     ->join('school_years as sy', 'sy.id', '=', 'ec.school_year_id')
        //     ->join('programs as p', 'p.id', '=', 'ec.program_id')
        //     ->where('ec.id_number', $student->id_number)
        //     ->where('ec.status', 'enrolled')
        //     ->whereNotNull('ec.program_id');

        // if ($semesterFilter !== 'all') {
        //     $query->where('ec.school_year_id', $semesterFilter);
        // }

        // if ($programFilter !== 'all') {
        //     $query->where('ec.program_id', $programFilter);
        // }

        // $rows = $query
        //     ->select([
        //         'p.program_name',
        //         'p.program_acronym',
        //         'sy.id as school_year_id',
        //         'sy.school_year_from',
        //         'sy.school_year_to',
        //         'sy.semester',

        //         // subject info
        //         'ec.course_code',
        //         'ec.course_description',
        //         'ec.course_units',
        //         'ec.instructor',
        //         'ec.status as course_status',
        //         'ec.inc',
        //         DB::raw('COALESCE(ec.final_grade, ec.grade) as grade'),

        //         // aggregation per term
        //         DB::raw('SUM(COALESCE(ec.final_grade, ec.grade) * ec.course_units)
        //                 OVER (PARTITION BY ec.program_id, ec.school_year_id) as total_weighted'),

        //         DB::raw('SUM(ec.course_units)
        //                 OVER (PARTITION BY ec.program_id, ec.school_year_id) as total_units')
        //     ])
        //     ->orderByDesc('sy.school_year_from')
        //     ->orderByDesc('sy.semester')
        //     ->get();

        // $groupedByProgram = $rows->groupBy(fn ($r) =>
        //     "{$r->program_name} ({$r->program_acronym})"
        // );

        // $response = [];

        // foreach ($groupedByProgram as $programName => $programRecords) {

        //     $groupedTerms = $programRecords->groupBy(function ($r) {
        //         $semName = $r->semester == 1 ? 'First Semester' : 'Second Semester';
        //         return "$semName S.Y. {$r->school_year_from}-{$r->school_year_to}";
        //     });

        //     $termsArray = [];

        //     foreach ($groupedTerms as $termName => $subjects) {

        //         // ✅ SQL already computed this
        //         $first = $subjects->first();
        //         $semGWA = $first->total_units > 0
        //             ? number_format($first->total_weighted / $first->total_units, 2)
        //             : '0.00';

        //         $termsArray[] = [
        //             'term' => $termName,
        //             'subjects' => $subjects->map(function ($s) {

        //                 $rating = $s->course_status === 'dropped'
        //                     ? 'DR'
        //                     : ($s->inc ? $s->inc . ':' : '') . $s->grade;

        //                 return [
        //                     'code' => $s->course_code,
        //                     'title' => $s->course_description,
        //                     'rating' => $rating,
        //                     'units' => $s->course_units,
        //                     'instructor' => $s->instructor,
        //                 ];
        //             }),
        //             'semGWA' => $semGWA,
        //         ];
        //     }

        //     $response[] = [
        //         'program' => $programName,
        //         'terms' => $termsArray,
        //     ];
        // }

        return response()->json($response);
    }

    private function fetchSemesters($student)
    {
        $semesters = SchoolYear::whereHas('studentCourses', function ($query) use ($student) {
            $query->where('id_number', $student->id_number)
                ->where('status', 'enrolled');
        })
        ->distinct()
        ->orderByDesc('school_year_from')
        ->orderByDesc('semester')
        ->get(['id', 'semester', 'school_year_from', 'school_year_to'])
        ->map(function ($item) {
            $semester = $item->semester == 1 ? 'First Semester' : 'Second Semester';
            $semesterLabel = "{$semester} S.Y. {$item->school_year_from}-{$item->school_year_to}";

            return [
                'id' => $item->id,
                'label' => $semesterLabel,
            ];
        });

        return response()->json($semesters);
    }

    private function fetchPrograms($student)
    {
        $programs = Program::whereHas('studentCourses', function ($query) use ($student) {
            $query->where('id_number', $student->id_number)
                ->where('status', 'enrolled');
        })
        ->distinct()
        ->orderByDesc('program_name')
        ->get(['id', 'program_name', 'program_acronym'])
        ->map(function ($item) {
            $label = $item->program_name.' (' .$item->program_acronym. ')';

            return [
                'id' => $item->id,
                'label' => $label, 
            ];
        });

        return response()->json($programs);
    }


}