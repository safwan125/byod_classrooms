<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create("classrooms", function (Blueprint $table) {
            $table->id();
            $table->foreignId("teacher_id")->constrained("users")->cascadeOnDelete();
            $table->string("classroom_name");
            $table->string("classroom_code")->unique();
            $table->text("description")->nullable();
            $table->enum("status", ["active", "inactive"])->default("active");
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("classrooms"); }
};