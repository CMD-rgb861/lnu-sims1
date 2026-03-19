<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ProgramLevel extends Model
{
    protected $fillable = [
        'name',
        'period',
        'order',
        'order_view'
    ];

    public function programs(): HasMany
    {
        return $this->hasMany(Program::class, 'program_level_id');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'program_level_id');
    }
}
