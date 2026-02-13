<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolYear extends Model
{
    protected $fillable = [
        'school_year_from',
        'school_year_to',
        'semester',
        'semester_start_date',
        'semester_end_date',
        'is_active',
    ];

    protected $casts = [
        'semester_start_date' => 'datetime',
        'semester_end_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function getDisplayNameAttribute()
    {
        $semesterName = match ($this->semester) {
            1 => '1st Semester',
            2 => '2nd Semester',
            3 => 'Summer',
            default => 'Unknown Semester',
        };

        return "S.Y. {$this->school_year_from}–{$this->school_year_to} - {$semesterName}";
    }

    public function getFormattedSemesterAttribute(): string
    {
        return match ($this->semester) {
            1 => '1st Semester',
            2 => '2nd Semester',
            3 => 'Summer',
            default => 'Undefined', 
        };
    }

    public function enrollment_detail()
    {
        return $this->hasMany(EnrollmentDetail::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function studentCourses()
    {
        return $this->hasMany(EnrollmentCourse::class, 'school_year_id');
    }
}
