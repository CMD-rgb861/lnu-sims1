<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class EnrollmentDetail extends Model
{
    protected $fillable = [
        'student_account_id',
        'program_id',
        'curriculum_id',
        'year_level',
        'acad_standing',
        'enrollment_type',
        'school_year_id',
        'enrolling_teacher_status',
        'enrolling_teacher_timestamp',
        'enrolling_teacher_id',
        'eaf_status',
        'eaf_timestamp',
        'enrolling_personnel_id',
        'enrollment_status',
        'enrollment_timestamp',
    ];

    protected $casts = [
        'enrolling_teacher_status' => 'boolean',
        'eaf_status' => 'boolean',
        'enrollment_status' => 'boolean',
        'enrolling_teacher_timestamp' => 'datetime',
        'eaf_timestamp' => 'datetime',
        'enrollment_timestamp' => 'datetime',
    ];

    public function getFormattedYearLevelAttribute(): string
    {
        return match ($this->year_level) {
            1 => 'First Year',
            2 => 'Second Year',
            3 => 'Third Year',
            4 => 'Fourth Year',
            default => 'Undefined', 
        };
    }

    public function getFormattedEnrollmentTypeAttribute(): string
    {
        return match ($this->enrollment_type) {
            1 => 'New Student',
            2 => 'Continuing Student',
            3 => 'Shiftee/Returnee',
            4 => 'Transferee',
            default => 'Undefined', 
        };
    }

    public function getFormattedAcadStandingAttribute(): string
    {
       $value = $this->attributes['acad_standing'] ?? null;

        return match ($value) {
            1, "1" => 'Regular Student',
            2, "2" => 'Irregular Student',
            default => 'N/A', 
        };
    }

    public function student()
    {
        return $this->belongsTo(StudentAccount::class, 'student_account_id');
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function school_year()
    {
        return $this->belongsTo(SchoolYear::class);
    }

    public function enrolling_teacher()
    {
        return $this->belongsTo(UserAccount::class, 'enrolling_teacher_id');
    }

    public function enrolling_personnel()
    {
        return $this->belongsTo(UserAccount::class, 'enrolling_personnel_id');
    }

    public function schedule_slot()
    {
        return $this->hasMany(ScheduleStudent::class);
    }

    public function schedule_student()
    {
        return $this->hasOne(ScheduleStudent::class, 'enrollment_detail_id', 'id');
    }


    public function curriculum()
    {
        return $this->belongsTo(Curriculum::class);
    }
}
