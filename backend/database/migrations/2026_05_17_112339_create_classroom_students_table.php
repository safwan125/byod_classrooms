<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create("classroom_students", function (Blueprint $table) {
            $table->id();
            $table->foreignId("classroom_id")->constrained()->cascadeOnDelete();
            $table->foreignId("student_id")->constrained("users")->cascadeOnDelete();
            $table->timestamp("joined_at")->useCurrent();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("classroom_students"); }
};