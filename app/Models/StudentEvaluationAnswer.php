<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentEvaluationAnswer extends Model
{
    protected $table = 'student_evaluation_submission_answers';

    protected $fillable = [
        'submission_id',
        'question_key',
        'score',
    ];

    public function submission()
    {
        return $this->belongsTo(StudentEvaluation::class, 'submission_id');
    }
}
