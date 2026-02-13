<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Municipality extends Model
{

    protected $fillable = [
        'psgc_code',
        'name',
    ];

    public function barangays()
    {
        return $this->hasMany(Barangay::class);
    }
    
    // public function admins()
    // {
    //     return $this->hasMany(User::class)->whereHas('role', fn($q) => $q->where('name', 'admin'));
    // }
}