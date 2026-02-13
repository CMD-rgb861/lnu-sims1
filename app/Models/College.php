<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class College extends Model
{
    protected $fillable = [
        'college_name',
        'college_acronym',
        'dean_id',
    ];

    public function dean()
    {
        return $this->belongsTo(UserAccount::class, 'dean_id');
    }

    public function departments()
    {
        return $this->hasMany(Department::class);
    }
    
    public function schedule_slots()
    {
        return $this->hasMany(ScheduleSlot::class);
    }
}
