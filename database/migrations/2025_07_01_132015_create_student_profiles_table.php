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
        if(!Schema::hasTable('student_profiles'))
        {
            Schema::create('student_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_account_id')
                    ->constrained('student_accounts')
                    ->onDelete('cascade');
                $table->string('birthday');
                $table->string('gender');
                $table->string('blood_type');
                $table->string('civil_status');
                $table->string('nationality');
                $table->string('contact_number');
                $table->foreignId('address_region_id')
                    ->constrained('regions')
                    ->onDelete('cascade');
                $table->foreignId('address_province_id')
                    ->nullable()
                    ->constrained('provinces')
                    ->onDelete('cascade');
                $table->foreignId('address_municipality_id')
                    ->nullable()
                    ->constrained('municipalities')
                    ->onDelete('cascade');
                $table->foreignId('address_barangay_id')
                    ->nullable()
                    ->constrained('barangays')
                    ->onDelete('cascade');
                $table->string('address_street');
                $table->string('address_zip_code');
                $table->string('emergency_contact_person');
                $table->string('emergency_contact_number');
                $table->string('profile_pic');
                $table->string('e_signature');
                $table->boolean('has_committed')->default(false);
                $table->boolean('profile_updated')->default(false);
                $table->boolean('update_ids')->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
