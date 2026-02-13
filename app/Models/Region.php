<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{

    protected $fillable = [
        'psgc_code',
        'name',
        'is_ncr'
    ];

    protected function casts(): array
    {
        return [
            'is_ncr' => 'boolean',
        ];
    }
}