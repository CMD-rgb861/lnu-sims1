<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EducBackground extends Model
{
     protected $fillable = [
        'student_account_id',
        'level_id',
        'school_id',
        'degree',
        'units_earned',
        'period_from',
        'period_to',
        'year_graduated',
        'honors'
    ];

    protected $casts = [
        'status_ids' => 'boolean'
    ];

    public function student_account()
    {
        return $this->belongsTo(StudentAccount::class, 'student_account_id');
    }

    public function level()
    {
        return $this->belongsTo(EducBackgroundLevel::class, 'level_id');
    }

    public function school()
    {
        return $this->belongsTo(EducBackgroundSchool::class, 'school_id');
    }
}
