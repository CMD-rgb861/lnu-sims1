<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    protected $fillable = [
        'program_name',
        'program_acronym',
        'dept_id',
        'coordinator_id',
        'program_level_id',
        'status'
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'dept_id');
    }

    public function coordinator()
    {
        return $this->belongsTo(UserAccount::class, 'coordinator_id');
    }

    public function programLevel()
    {
        return $this->belongsTo(ProgramLevel::class, 'program_level_id');
    }

    public function enrollment_details(): HasMany
    {
        return $this->hasMany(EnrollmentDetail::class, 'program_id');
    }

    public function user_account_roles(): HasMany
    {
        return $this->hasMany(UserAccountRole::class, 'program_id');
    }

    public function studentCourses()
    {
        return $this->hasMany(EnrollmentCourse::class, 'program_id');
    }
}
