<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = [
        'dept_name',
        'dept_acronym',
        'college_id',
        'chair_id',
    ];

    public function college()
    {
        return $this->belongsTo(College::class);
    }

    public function chair()
    {
        return $this->belongsTo(UserAccount::class, 'chair_id');
    }

    public function programs()
    {
        return $this->hasMany(Program::class, 'dept_id');
    }
}
