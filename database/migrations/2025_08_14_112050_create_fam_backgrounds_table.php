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
        if(!Schema::hasTable('fam_backgrounds'))
        {
            Schema::create('fam_backgrounds', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_account_id')
                    ->constrained('student_accounts')
                    ->onDelete('cascade');
                $table->foreignId('relation_id')
                    ->constrained('fam_background_relations')
                    ->onDelete('cascade');
                $table->string('first_name')
                    ->nullable();
                $table->string('middle_name')
                    ->nullable();
                $table->string('last_name')
                    ->nullable();
                $table->string('ext_name')
                    ->nullable();
                $table->string('birthday')
                    ->nullable();
                $table->string('contact_number')
                    ->nullable();
                $table->string('email_address')
                    ->nullable();
                $table->string('occupation')
                    ->nullable();
                $table->string('employer')
                    ->nullable();
                $table->string('employer_address')
                    ->nullable();
                $table->string('employer_contact')
                    ->nullable();
                $table->boolean('is_guardian')
                    ->default(false);
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
        Schema::dropIfExists('fam_backgrounds');
    }
};
