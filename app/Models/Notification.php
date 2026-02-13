<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['notification_description', 'user_account_id', 'notification_type'];

    public function user_account() {
        return $this->belongsTo(UserAccount::class);
    }

    public function student_account() {
        return $this->belongsTo(StudentAccount::class);
    }
}
