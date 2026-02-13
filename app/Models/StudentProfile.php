<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    protected $fillable = [
        'student_account_id',
        'birthday',
        'gender',
        'blood_type',
        'civil_status',
        'nationality',
        'contact_number',
        'address_region_id',
        'address_province_id',
        'address_municipality_id',
        'address_barangay_id',
        'address_street',
        'address_zip_code',
        'profile_pic',
        'e_signature',
        'has_committed',
        'profile_updated',
        'update_ids',
    ];

    protected $casts = [
        'has_committed' => 'boolean',
        'profile_updated' => 'boolean',
        'update_ids' => 'boolean',
    ];

    public function student_account()
    {
        return $this->belongsTo(StudentAccount::class, 'student_account_id');
    }
}
