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
        if(!Schema::hasTable('schedules'))
        {
            Schema::create('schedules', function (Blueprint $table) {
                $table->id();
                $table->unsignedTinyInteger('year_level');
                $table->unsignedTinyInteger('schedule_type');
                $table->foreignId('school_year_id')
                    ->constrained('school_years')
                    ->onDelete('cascade');
                $table->date('schedule_date');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
