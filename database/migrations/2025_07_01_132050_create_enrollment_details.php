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
        if(!Schema::hasTable('enrollment_details'))
        {
            Schema::create('enrollment_details', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_account_id')
                    ->constrained('student_accounts')
                    ->onDelete('cascade');
                $table->foreignId('program_id')
                    ->nullable()
                    ->constrained('programs')
                    ->nullOnDelete();
                $table->foreignId('curriculum_id')
                    ->nullable()
                    ->constrained('curriculums')
                    ->nullOnDelete();
                $table->unsignedTinyInteger('year_level');
                $table->unsignedTinyInteger('acad_standing')
                    ->nullable();
                $table->unsignedTinyInteger('enrollment_type');
                $table->foreignId('school_year_id')
                    ->nullable()
                    ->constrained('school_years')
                    ->nullOnDelete();
                $table->unsignedTinyInteger('enrolling_teacher_status');
                $table->dateTime('enrolling_teacher_timestamp');
                $table->foreignId('enrolling_teacher_id')
                    ->nullable()
                    ->constrained('user_accounts')
                    ->nullOnDelete();
                $table->unsignedTinyInteger('eaf_status')->nullable();
                $table->dateTime('eaf_timestamp')->nullable();
                $table->unsignedTinyInteger('enrollment_status')->nullable();
                $table->dateTime('enrollment_timestamp')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollment_details');
    }
};
