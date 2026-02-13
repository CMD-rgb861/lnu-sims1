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
        if(!Schema::hasTable('user_accounts'))
        {
            Schema::create('user_accounts', function (Blueprint $table) {
                $table->id();
                $table->string('id_number')
                    ->unique();
                $table->string('first_name');
                $table->string('middle_name')
                      ->nullable();
                $table->string('last_name');
                $table->string('email_address')
                    ->unique();
                $table->string('password')
                    ->nullable()
                    ->default(null);
                $table->string('temp_password');
                $table->string('otp')
                    ->nullable()
                    ->default(null);
                $table->foreignId('user_type_id')
                    ->nullable()
                    ->constrained('user_types');
                $table->boolean('profile_verified')->default(false);
                $table->boolean('is_logged_in')->default(false);
                $table->timestamp('last_login')->nullable()->default(null);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_accounts');
    }
};
