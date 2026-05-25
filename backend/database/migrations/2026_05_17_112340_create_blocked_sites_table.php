<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create("blocked_sites", function (Blueprint $table) {
            $table->id();
            $table->foreignId("classroom_id")->constrained()->cascadeOnDelete();
            $table->string("website_url");
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("blocked_sites"); }
};