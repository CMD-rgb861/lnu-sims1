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
        // Schema::table('programs', function (Blueprint $table) {
        //     $table->unsignedBigInteger('program_level_id')->nullable()->after('coordinator_id');
        //     $table->foreign('program_level_id')->references('id')->on('program_levels')->nullOnDelete();
        // });

        Schema::table('schedules', function (Blueprint $table) {
            $table->unsignedBigInteger('program_level_id')->nullable()->after('id');
            $table->foreign('program_level_id')->references('id')->on('program_levels')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropForeign(['program_level_id']);
            $table->dropColumn('program_level_id');
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropForeign(['program_level_id']);
            $table->dropColumn('program_level_id');
        });
    }
};
