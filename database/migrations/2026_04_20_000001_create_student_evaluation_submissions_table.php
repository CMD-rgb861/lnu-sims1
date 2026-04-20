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
        Schema::create('student_evaluation_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('student_id_number')->index();
            $table->unsignedBigInteger('subject_id')->index();
            $table->unsignedBigInteger('instructor_id')->nullable()->index();
            $table->unsignedInteger('term_id')->index();
            $table->unsignedSmallInteger('total_score')->default(0);
            $table->unsignedSmallInteger('max_score')->default(0);
            $table->decimal('rating_percentage', 5, 2)->default(0.00);
            $table->text('comment')->nullable();
            $table->timestamp('submitted_at')->nullable()->index();
            $table->string('status')->default('submitted');
            $table->timestamps();

            $table->unique(['student_id_number', 'subject_id', 'term_id'], 'student_eval_unique_student_subject_term');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_evaluation_submissions');
    }
};
