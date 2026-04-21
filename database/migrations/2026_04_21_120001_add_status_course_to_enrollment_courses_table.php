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
        Schema::table('enrollment_courses', function (Blueprint $table) {
            if (!Schema::hasColumn('enrollment_courses', 'status_course')) {
                $table->enum('status_course', ['Ongoing', 'Passed', 'Fail', 'INC'])->nullable()->after('inc');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollment_courses', function (Blueprint $table) {
            if (Schema::hasColumn('enrollment_courses', 'status_course')) {
                $table->dropColumn('status_course');
            }
        });
    }
};
