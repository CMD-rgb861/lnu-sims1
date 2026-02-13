<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            // Step 1: If a broken or manual FK exists, drop it safely (Laravel won't error if it doesn't exist)
            try {
                $table->dropForeign(['college_id']);
            } catch (\Exception $e) {
                // Ignore exception if FK doesn't exist
            }

            // Step 2: Make column nullable
            $table->unsignedBigInteger('college_id')->nullable()->change();

            // Step 3: Re-apply the foreign key with null on delete
            $table->foreign('college_id')
                ->references('id')
                ->on('colleges')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['college_id']);
            $table->unsignedBigInteger('college_id')->nullable(false)->change();
            $table->foreign('college_id')
                ->references('id')
                ->on('colleges')
                ->onDelete('cascade');
        });
    }
};
