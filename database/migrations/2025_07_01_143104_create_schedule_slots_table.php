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
        if(!Schema::hasTable('schedule_slots'))
        {
            Schema::create('schedule_slots', function (Blueprint $table) {
                $table->id();
                $table->foreignId('schedule_id')
                    ->constrained('schedules')
                    ->onDelete('cascade');
                $table->foreignId('college_id')
                    ->constrained('colleges')
                    ->onDelete('cascade');
                $table->integer('am_slots')
                    ->nullable();
                $table->integer('pm_slots')
                    ->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_slots');
    }
};
