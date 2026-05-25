<?php
$dir = 'c:/Users/safwa/Desktop/byod/backend/database/migrations';
$files = scandir($dir);

function w($f, $content) {
    global $dir, $files;
    foreach ($files as $file) {
        if (strpos($file, $f) !== false) {
            file_put_contents("$dir/$file", $content);
        }
    }
}

w('create_classrooms_table', '<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create("classrooms", function (Blueprint ) {
            ->id();
            ->foreignId("teacher_id")->constrained("users")->cascadeOnDelete();
            ->string("classroom_name");
            ->string("classroom_code")->unique();
            ->text("description")->nullable();
            ->enum("status", ["active", "archived"])->default("active");
            ->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("classrooms"); }
};');

w('create_classroom_students_table', '<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create("classroom_students", function (Blueprint ) {
            ->id();
            ->foreignId("classroom_id")->constrained()->cascadeOnDelete();
            ->foreignId("student_id")->constrained("users")->cascadeOnDelete();
            ->timestamp("joined_at")->useCurrent();
            ->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("classroom_students"); }
};');

w('create_devices_table', '<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create("devices", function (Blueprint ) {
            ->id();
            ->foreignId("user_id")->constrained()->cascadeOnDelete();
            ->string("device_name");
            ->string("browser")->nullable();
            ->string("ip_address")->nullable();
            ->string("operating_system")->nullable();
            ->enum("status", ["active", "inactive"])->default("active");
            ->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("devices"); }
};');

w('create_blocked_sites_table', '<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create("blocked_sites", function (Blueprint ) {
            ->id();
            ->foreignId("classroom_id")->constrained()->cascadeOnDelete();
            ->string("website_url");
            ->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("blocked_sites"); }
};');

w('create_activities_table', '<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create("activities", function (Blueprint ) {
            ->id();
            ->foreignId("user_id")->constrained()->cascadeOnDelete();
            ->foreignId("classroom_id")->constrained()->cascadeOnDelete();
            ->string("website");
            ->enum("activity_type", ["educational", "non-educational"])->default("educational");
            ->integer("time_spent")->default(0);
            ->string("productivity_status")->nullable();
            ->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("activities"); }
};');

w('create_announcements_table', '<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create("announcements", function (Blueprint ) {
            ->id();
            ->foreignId("classroom_id")->constrained()->cascadeOnDelete();
            ->string("title");
            ->text("message");
            ->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists("announcements"); }
};');
