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
        if (!Schema::hasTable('student_program')) {
            Schema::create('student_program', function (Blueprint $table) {
                $table->id();

                // Reference to the student account (cascade on delete to keep data consistent)
                $table->foreignId('student_account_id')
                    ->constrained('student_accounts')
                    ->onDelete('cascade');

                // Store the id_number snapshot from student_accounts for quick lookups
                $table->string('id_number')->nullable()->index();

                // Program and curriculum references
                $table->foreignId('program_id')
                    ->nullable()
                    ->constrained('programs')
                    ->nullOnDelete();

                $table->foreignId('curriculum_id')
                    ->nullable()
                    ->constrained('curriculums')
                    ->nullOnDelete();

                // Optional year range
                $table->unsignedSmallInteger('year_from')->nullable();
                $table->unsignedSmallInteger('year_to')->nullable();

                $table->timestamps();

                // Optional FK to keep id_number aligned with student_accounts.id_number
                $table->foreign('id_number')
                    ->references('id_number')
                    ->on('student_accounts')
                    ->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_program');
    }
};
