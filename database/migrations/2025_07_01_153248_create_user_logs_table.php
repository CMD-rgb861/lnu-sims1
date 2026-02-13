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
        if(!Schema::hasTable('user_logs'))
        {
            Schema::create('user_logs', function (Blueprint $table) {
                $table->id();
                $table->text('log_description');
                $table->foreignId('user_account_id')
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
        Schema::dropIfExists('user_logs');
    }
};
