<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnrollmentCourse extends Model
{
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
    'status_course',
        'section_code',
        'id_no',
        'instructor',
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

    public function curriculum()
    {
        return $this->belongsTo(Curriculum::class, 'curriculum_id');
    }

    /**
     * Instructor relationship using id_no column.
     * id_no is populated on enrollment and references user_accounts.id (instructor user)
     */
    public function instructor()
    {
        return $this->belongsTo(UserAccount::class, 'id_no');
    }
}
