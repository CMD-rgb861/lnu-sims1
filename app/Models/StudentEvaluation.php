<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class StudentEvaluation extends Model
{
	protected $table = 'student_evaluation_submissions';

	protected $fillable = [
		'student_id_number',
		'subject_id',
		'instructor_id',
		'term_id',
		'total_score',
		'max_score',
		'rating_percentage',
		'comment',
		'submitted_at',
		'status',
	];

	protected $casts = [
		'submitted_at' => 'datetime',
		'rating_percentage' => 'decimal:2',
	];

	public function answers()
	{
		return $this->hasMany(StudentEvaluationAnswer::class, 'submission_id');
	}

	public function student()
	{
		return $this->belongsTo(StudentAccount::class, 'student_id_number', 'id_number');
	}

	public function instructor()
	{
		return $this->belongsTo(UserAccount::class, 'instructor_id');
	}

	/**
	 * Convenience factory to create a submission with answers in a transaction.
	 * Expects $payload = [subject_id, instructor_id, term_id, answers (key=>score), comment]
	 */
	public static function createWithAnswers(array $payload)
	{
		$user = Auth::user();
		$studentId = $user?->id_number;

		$answers = $payload['answers'] ?? [];

		$totalScore = 0;
		$count = 0;
		foreach ($answers as $k => $v) {
			$score = (int) $v;
			if ($score < 1) $score = 1;
			if ($score > 5) $score = 5;
			$totalScore += $score;
			$count++;
		}

		$maxScore = $count * 5;
		$rating = $maxScore > 0 ? ($totalScore / $maxScore) * 100 : 0;

		$submission = self::create([
			'student_id_number' => $studentId,
			'subject_id' => $payload['subject_id'],
			'instructor_id' => $payload['instructor_id'] ?? null,
			'term_id' => $payload['term_id'],
			'total_score' => $totalScore,
			'max_score' => $maxScore,
			'rating_percentage' => round($rating, 2),
			'comment' => $payload['comment'] ?? null,
			'submitted_at' => now(),
			'status' => 'submitted',
		]);

		// attach answers
		foreach ($answers as $key => $value) {
			$submission->answers()->create([
				'question_key' => $key,
				'score' => (int) $value,
			]);
		}

		return $submission;
	}
}

