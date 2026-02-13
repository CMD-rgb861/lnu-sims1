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
        if(!Schema::hasTable('schedule_students'))
        {
            Schema::create('schedule_students', function (Blueprint $table) {
                $table->id();
                $table->foreignId('schedule_id')
                    ->constrained('schedules')
                    ->onDelete('cascade');
                $table->unsignedTinyInteger('schedule_time');
                $table->foreignId('enrollment_detail_id')
                    ->nullable()
                    ->constrained('enrollment_details')
                    ->nullOnDelete();
                $table->string('college');
                $table->unsignedTinyInteger('remarks');
                $table->unsignedTinyInteger('reschedule_status');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_students');
    }
};
