<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentLog extends Model
{
    protected $fillable = ['log_description', 'student_account_id', 'event', 'scope'];

    protected $appends = ['event_description'];

    public function student_account() {
        return $this->belongsTo(StudentAccount::class);
    }

    public function getEventDescriptionAttribute(): string
    {
        return match ($this->event) {
            1 => 'Auth',
            2 => 'Create',
            3 => 'Update',
            4 => 'Delete',
            5 => 'Import',
            6 => 'Export',
            7 => 'Process',
            default => 'Unknown', 
        };
    }
}
