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
        if(!Schema::hasTable('curriculum_courses'))
        {
            Schema::create('curriculum_courses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('curriculum_id')
                    ->constrained('curriculums')
                    ->onDelete('cascade');
                $table->foreignId('course_id')
                    ->constrained('courses')
                    ->onDelete('cascade');
                $table->integer('semester');
                $table->integer('year_level');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curriculum_courses');
    }
};
 