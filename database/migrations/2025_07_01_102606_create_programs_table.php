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
        if(!Schema::hasTable('programs'))
        {
            Schema::create('programs', function (Blueprint $table) {
                $table->id();
                $table->string('program_name');
                $table->string('program_acronym');
                $table->foreignId('dept_id')
                    ->nullable()
                    ->constrained('departments')
                    ->nullOnDelete();
                $table->foreignId('coordinator_id')
                    ->nullable()
                    ->constrained('user_accounts')
                    ->nullOnDelete();
                $table->boolean('status')->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
