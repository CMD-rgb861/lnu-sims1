<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentEvaluation extends Model
{
    // This model maps to enrollment_courses to provide a focused resource for the
    // student evaluation page without changing the existing EnrollmentCourse model.
    protected $table = 'enrollment_courses';

    protected $fillable = [
        'school_year_id',
        'id_number',
        'course_id',
        'program_id',
        'curriculum_id',
        'year_level',
        'course_code',
        'course_description',
        'course_units',
        'status',
        'grade',
        'final_grade',
        'inc',
        'section_code',
        'instructor',
        'id_no',
        'schedule_time',
        'schedule_days',
        'schedule_days_no',
        'room',
        'date_dropped_removed',
    ];

    public function schoolYear()
    {
        return $this->belongsTo(SchoolYear::class, 'school_year_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function program()
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    /**
     * Instructor relation using id_no (populated on enrollment).
     */
    public function instructor()
    {
        return $this->belongsTo(UserAccount::class, 'id_no');
    }
}
