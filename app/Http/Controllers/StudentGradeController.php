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
    
    /**
     * Helper to keep semester naming consistent
     */
    private function getSemesterName($val)
    {
        if ($val == 1) return 'First Semester';
        if ($val == 2) return 'Second Semester';
        if ($val == 3) return 'Summer';
        return 'Semester not specified';
    }

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

        // Grab the filters
        $semesterFilter = $request->input('semester', 'all');
        $programFilter = $request->input('program', 'all');

        // Add the filters to the cache key!
        $cacheKey = "grades_{$studentId}_" . md5($lastUpdated) . "_sem_{$semesterFilter}_prog_{$programFilter}";

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
                'enrollment_courses.course_code',
                'enrollment_courses.course_description',
                'enrollment_courses.course_units',
                'enrollment_courses.instructor',
                'enrollment_courses.grade',
                'enrollment_courses.final_grade',
                'enrollment_courses.inc',
                'enrollment_courses.status',
                'programs.program_name',
                'programs.program_acronym',
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

        $response = [];

        $groupedByTerm = $records->groupBy(function ($item) {
            $semName = $this->getSemesterName($item->semester);
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
                    $rawGrade = $s->final_grade ?? $s->grade;

                    // 1. FORMAT GRADE TO 2 DECIMAL POINTS
                    if (is_numeric($rawGrade)) {
                        $rawGrade = number_format((float) $rawGrade, 1);
                    }

                    $rating = $s->status === 'dropped'
                        ? 'DR'
                        : ($rawGrade ? ($inc . $rawGrade) : 'N/A');

                    // 2. FORMAT INSTRUCTOR NAME (First letter after comma)
                    $instructorName = $s->instructor ?? 'TBA';
                    
                    if ($instructorName !== 'TBA' && strpos($instructorName, ',') !== false) {
                        $parts = explode(',', $instructorName, 2);
                        $lastName = trim($parts[0]);
                        $firstName = isset($parts[1]) ? trim($parts[1]) : '';
                        
                        if (!empty($firstName)) {
                            $initial = mb_substr($firstName, 0, 1);
                            $instructorName = "{$lastName}, {$initial}.";
                        }
                    }

                    $rows[] = [
                        // show program only once per group
                        'program' => $programName === $lastProgram ? '' : $programName,
                        'code' => $s->course_code,
                        'title' => $s->course_description,
                        'rating' => $rating,
                        'units' => number_format((float) $s->course_units, 2),
                        'instructor' => $instructorName,
                    ];

                    $lastProgram = $programName;
                }
            }

            // compute GWA per term
            $totalWeighted = 0;
            $totalUnits = 0;

            foreach ($termRecords as $subject) {
                // Ignore dropped subjects or subjects marked strictly as INC for GWA
                if ($subject->status === 'dropped' || $subject->inc === 'INC') {
                    continue;
                }

                $gradeRaw = $subject->final_grade ?? $subject->grade;

                // Only calculate if the encoded grade is a valid number
                if (is_numeric($gradeRaw)) {
                    $grade = floatval($gradeRaw);
                    $units = floatval($subject->course_units);

                    $totalWeighted += $grade * $units;
                    $totalUnits += $units;
                }
            }

            $semGWA = $totalUnits > 0
                ? number_format($totalWeighted / $totalUnits, 2)
                : '0.00';

            $response[] = [
                'term' => $termName,
                'semGWA' => $semGWA,
                'rows' => $rows
            ];
        }

        return response()->json(array_values($response));
    }

    private function fetchSemesters($student)
    {
        $semesters = SchoolYear::whereHas('studentCourses', function ($query) use ($student) {
            $query->where('id_number', $student->id_number)
                ->whereIn('status', ['enrolled', 'dropped']); 
        })
        ->distinct()
        ->orderByDesc('school_year_from')
        ->orderByDesc('semester')
        ->get(['id', 'semester', 'school_year_from', 'school_year_to'])
        ->map(function ($item) {
            $semester = $this->getSemesterName($item->semester);
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
                ->whereIn('status', ['enrolled', 'dropped']); 
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