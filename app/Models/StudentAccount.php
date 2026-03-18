<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable; 

class StudentAccount extends Authenticatable
{

    protected $fillable = [
        'id_number',
        'first_name',
        'middle_name',
        'last_name',
        'ext_name',
        'email_address',
        'password',
        'temp_password',
        'user_type_id',
        'profile_verified',
        'is_logged_in',
        'last_login'
    ];

    protected $hidden = [
        'password',
        'temp_password',
    ];

    protected $casts = [
        'profile_verified' => 'boolean',
        'last_login' => 'datetime',
    ];

    public function getDisplayNameAttribute()
    {
        return collect([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
            $this->ext_name
        ])->filter()->implode(' ');
    }

    public function student_profile()
    {
        return $this->hasOne(StudentProfile::class, 'student_account_id');
    }

    public function educ_background()
    {
        return $this->hasOne(EducBackground::class, 'student_account_id');
    }

    public function fam_background()
    {
        return $this->hasOne(FamBackground::class, 'student_account_id');
    }

    public function enrollment_detail()
    {
        return $this->hasMany(EnrollmentDetail::class, 'student_account_id');
    }

}
