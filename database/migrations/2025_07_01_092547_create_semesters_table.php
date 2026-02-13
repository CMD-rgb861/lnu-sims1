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
        if(!Schema::hasTable('school_years'))
        {
            Schema::create('school_years', function (Blueprint $table) {
                $table->id();
                $table->string('school_year_from');
                $table->string('school_year_to');
                $table->unsignedTinyInteger('semester');
                $table->date('semester_start_date');
                $table->date('semester_end_date');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_years');
    }
};
