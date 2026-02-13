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
        if(!Schema::hasTable('student_logs'))
        {
            Schema::create('student_logs', function (Blueprint $table) {
                $table->id();
                $table->text('log_description');
                $table->foreignId('student_account_id')
                    ->constrained()
                    ->onDelete('cascade');
                $table->integer('event');
                $table->text('scope');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_logs');
    }
};
