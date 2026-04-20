<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_evaluation_submission_answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('submission_id')->index();
            $table->string('question_key')->index();
            $table->unsignedTinyInteger('score');
            $table->timestamps();

            $table->unique(['submission_id', 'question_key'], 'student_eval_answer_unique_submission_question');

            $table->foreign('submission_id')->references('id')->on('student_evaluation_submissions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_evaluation_submission_answers');
    }
};
