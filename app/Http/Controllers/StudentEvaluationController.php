<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StudentEvaluation;
use Illuminate\Support\Facades\Auth;

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

        $enrollments = StudentEvaluation::with(['course', 'schoolYear', 'instructor'])
            ->where('id_number', $studentIdNumber)
            ->whereIn('status', ['advised', 'enrolled'])
            ->get([
                'id',
                'id_no',
                'school_year_id',
                'course_id',
                'course_code',
                'course_description',
                'section_code',
                'schedule_time',
                'schedule_days',
            ]);

        return response()->json($enrollments);
    }
}
