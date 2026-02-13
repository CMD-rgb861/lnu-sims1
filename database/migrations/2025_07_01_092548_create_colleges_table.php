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
        if(!Schema::hasTable('colleges'))
        {
            Schema::create('colleges', function (Blueprint $table) {
                $table->id();
                $table->string('college_name');
                $table->string('college_acronym');
                $table->foreignId('dean_id')
                    ->nullable()
                    ->constrained('user_accounts')
                    ->nullOnDelete();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('colleges');
    }
};
