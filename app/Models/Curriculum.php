<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Curriculum extends Model
{

    protected $table = 'curriculums';
    
    protected $fillable = [
        'curriculum_name',
        'curriculum_code',
        'program_id'
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function courses()
    {
        return $this->belongsToMany(
            Course::class, 
            'curriculum_courses',   // The pivot table name
            'curriculum_id',        // The foreign key for this model (Curriculum)
            'course_id'             // The foreign key for the related model (Course)
        )
        ->withPivot('year_level', 'semester')
        ->withTimestamps();  
    }

    public function enrollment_detail()
    {
        return $this->belongTo(EnrollmentDetail::class);
    }
}
