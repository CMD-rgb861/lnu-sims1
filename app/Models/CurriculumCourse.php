<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CurriculumCourse extends Model
{
    protected $fillable = [
        'course_id',
        'curriculum_id',
        'course_id',
        'semester',
        'year_level'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function curriculum()
    {
        return $this->belongsTo(Curriculum::class, 'curriculum_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}
