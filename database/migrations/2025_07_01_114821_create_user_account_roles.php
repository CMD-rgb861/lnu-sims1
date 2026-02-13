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
        if(!Schema::hasTable('user_account_roles'))
        {
            Schema::create('user_account_roles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_account_id')
                    ->constrained('user_accounts')
                    ->onDelete('cascade');
                $table->foreignId('user_role_id')
                    ->constrained('user_roles')
                    ->onDelete('cascade');
                $table->foreignId('college_id')
                    ->nullable()
                    ->constrained('colleges')
                    ->nullOnDelete();
                $table->foreignId('program_id')
                    ->nullable()
                    ->constrained('programs')
                    ->nullOnDelete();
                $table->unique(['user_account_id', 'user_role_id', 'college_id', 'program_id'], 'unique_user_role');
                $table->boolean('is_active')->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_account_roles');
    }
};
