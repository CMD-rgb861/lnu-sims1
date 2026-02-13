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
        if(!Schema::hasTable('educ_backgrounds'))
        {
            Schema::create('educ_backgrounds', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_account_id')
                    ->constrained('student_accounts')
                    ->onDelete('cascade');
                $table->foreignId('level_id')
                    ->constrained('educ_background_levels')
                    ->onDelete('cascade');
                $table->foreignId('school_id')
                    ->nullable()
                    ->constrained('educ_background_schools')
                    ->nullOnDelete();
                $table->string('degree')
                    ->nullable();
                $table->integer('units_earned')
                    ->nullable();
                $table->string('period_from')
                    ->nullable();
                $table->string('period_to')
                    ->nullable();
                $table->string('year_graduated')
                    ->nullable();
                $table->string('honors')
                    ->nullable();
                $table->boolean('status_ids')
                    ->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('educ_backgrounds');
    }
};
