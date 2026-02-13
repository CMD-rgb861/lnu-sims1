<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduleSlot extends Model
{
    protected $fillable = [
        'schedule_id',
        'college_id',
        'am_slots',
        'pm_slots',
    ];

    public function schedule()
    {
        return $this->belongsTo(Schedule::class, 'schedule_id');
    }

    public function college()
    {
        return $this->belongsTo(College::class);
    }
}
