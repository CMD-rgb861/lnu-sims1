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
        Schema::create('enrollment_courses', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('school_year_id')->index();
            $table->string('id_number')->index();
            $table->unsignedBigInteger('course_id')->index();
            $table->unsignedInteger('program_id')->index()->nullable();
            $table->unsignedInteger('curriculum_id')->index()->nullable();
            $table->unsignedTinyInteger('year_level')->index()->nullable();
            $table->string('course_code')->index()->nullable();
            $table->string('course_description')->nullable();
            $table->string('course_units')->nullable();
            $table->enum('status', ['advised', 'enrolled', 'dropped', 'removed'])->index();            
            $table->string('grade', 50)->nullable()->index();
            $table->string('final_grade', 50)->nullable()->index();
            $table->string('inc', 50)->nullable()->index();
            $table->string('section_code', 50)->nullable()->index();
            $table->string('instructor', 255)->nullable();
            $table->string('schedule_time', 255)->nullable();
            $table->string('schedule_days', 255)->nullable();
            $table->string('schedule_days_no', 255)->nullable();
            $table->string('room', 255)->nullable();
            $table->date('date_dropped_removed')->index()->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollment_courses');
    }
};
