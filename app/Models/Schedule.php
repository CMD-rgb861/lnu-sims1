<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'year_level',
        'schedule_type',
        'semester_id',
        'schedule_date',
    ];

    protected $casts = [
        'schedule_date' => 'datetime',
        'year_level' => 'integer',
        'schedule_type' => 'integer',
    ];

    public function school_year()
    {
        return $this->belongsTo(SchoolYear::class);
    }

    public function programLevel()
    {
        return $this->belongsTo(ProgramLevel::class, 'program_level_id');
    }

    public function slots()
    {
        return $this->hasMany(ScheduleSlot::class, 'schedule_id');
    }

    public function students()
    {
        return $this->hasMany(ScheduleStudent::class, 'schedule_id');
    }
}
