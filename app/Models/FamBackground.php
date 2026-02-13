<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FamBackground extends Model
{
     protected $fillable = [
        'student_account_id',
        'relation_id',
        'first_name',
        'middle_name',
        'last_name',
        'ext_name',
        'birthday',
        'contact_number',
        'email_address',
        'occupation',
        'employer',
        'employer_address',
        'employer_contact',
        'is_guardian'
    ];

    protected $casts = [
        'status_ids' => 'boolean'
    ];

    public function student_account()
    {
        return $this->belongsTo(StudentAccount::class, 'student_account_id');
    }

    public function relation()
    {
        return $this->belongsTo(FamBackgroundRelation::class, 'relation_id');
    }
}
