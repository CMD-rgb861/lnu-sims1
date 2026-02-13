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
        'email_address',
        'password',
        'temp_password',
        'user_type_id',
        'profile_verified',
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
        if($this->middle_name){
            return "{$this->first_name} {$this->middle_name} {$this->last_name}";
        }else{
            return "{$this->first_name} {$this->last_name}";
        }
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
