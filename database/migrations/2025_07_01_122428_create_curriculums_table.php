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
        // You don't really need the if-check; Laravel won't recreate existing tables unless forced.
        Schema::create('curriculums', function (Blueprint $table) {
            $table->id();
            $table->string('curriculum_name');
            $table->string('curriculum_code')->unique();

            // Foreign key to programs table
            $table->foreignId('program_id')
                ->nullable()
                ->constrained('programs')
                ->nullOnDelete();

            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curriculums');
    }
};
