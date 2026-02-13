<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAccountRole extends Model
{

    protected $fillable = [
        'user_account_id',
        'user_role_id',
        'college_id',
        'program_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function user_account()
    {
        return $this->belongsTo(UserAccount::class, 'user_account_id');
    }

    public function role()
    {
        return $this->belongsTo(UserRole::class, 'user_role_id');
    }

    public function role_id()
    {
        return $this->role()->pluck('user_role_id')->toArray();
    }

    public function role_dean()
    {
        return $this->belongsTo(College::class, 'college_id');
    }

    public function role_department_chair()
    {
        return $this->hasOne(Department::class, 'chair_id');
    }

    public function role_program_coordinator()
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    public function role_enrolling_teacher()
    {
        return $this->belongsTo(Program::class, 'program_id');
    }
}