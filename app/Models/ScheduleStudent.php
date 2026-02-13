<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduleStudent extends Model
{
    protected $fillable = [
        'schedule_id',
        'schedule_time',
        'enrollment_detail_id',
        'college',
        'remarks',
        'reschedule_status',
    ];

    protected $casts = [
        'schedule_time' => 'integer', 
        'remarks' => 'integer',
        'reschedule_status' => 'integer',
    ];

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class, 'schedule_id');
    }

    public function getFormattedScheduleTimeAttribute(): string
    {
        return match ($this->schedule_time) {
            1 => 'Morning (8:00AM-12:00NN)',
            2 => 'Afternoon (1:00PM-5:00PM)',
            default => 'TBA', 
        };
    }

    public function enrollment_detail()
    {
        return $this->belongsTo(EnrollmentDetail::class, 'enrollment_detail_id');
    }
}
