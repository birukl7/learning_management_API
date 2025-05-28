<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('paid_courses', function (Blueprint $table) {
            $table->decimal('course_price', 8, 2)->after('id'); // Adjust 'after' if needed
        });

        Schema::table('paid_exams', function (Blueprint $table) {
            $table->decimal('exam_price', 8, 2)->after('id'); // Adjust 'after' if needed
        });
    }

    public function down(): void
    {
        Schema::table('paid_courses', function (Blueprint $table) {
            $table->dropColumn('course_price');
        });

        Schema::table('paid_exams', function (Blueprint $table) {
            $table->dropColumn('exam_price');
        });
    }
};
