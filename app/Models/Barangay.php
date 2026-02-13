<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{

    protected $fillable = [
        'psgc_code',
        'name'
    ];

    public function municipality()
    {
        return $this->belongsTo(Municipality::class);
    }

    // public function users()
    // {
    //     return $this->hasMany(User::class)->whereHas('role', fn($q) => $q->where('name', 'barangay'));
    // }
}