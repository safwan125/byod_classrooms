<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create("activities", function (Blueprint $table) {
            $table->id();
            $table->foreignId("user_id")->constrained()->cascadeOnDelete();
            $table->foreignId("classroom_id")->constrained()->cascadeOnDelete();
            $table->string("website");
            $table->enum("activity_type", ["educational", "non-educational"])->default("educational");
            $table->integer("time_spent")->default(0);
            $table->string("productivity_status")->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("activities"); }
};