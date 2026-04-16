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
            // Add id_no after section_code to match requested position.
            // Use unsignedBigInteger since this will be used as a foreign id.
            // Note: ->after() works on MySQL; if using another DB, the column will be added but position is ignored.
            $table->unsignedBigInteger('id_no')->nullable()->index()->after('section_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollment_courses', function (Blueprint $table) {
            if (Schema::hasColumn('enrollment_courses', 'id_no')) {
                // Drop index then column. If your DB/lara ver requires index name, adjust accordingly.
                $table->dropIndex(['id_no']);
                $table->dropColumn('id_no');
            }
        });
    }
};
