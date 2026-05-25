<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function teacher() {
        return $this->belongsTo(User::class, "teacher_id");
    }

    public function students() {
        return $this->belongsToMany(User::class, "classroom_students", "classroom_id", "student_id")->withPivot("joined_at");
    }

    public function blockedSites() {
        return $this->hasMany(BlockedSite::class);
    }

    public function activities() {
        return $this->hasMany(Activity::class);
    }

    public function announcements() {
        return $this->hasMany(Announcement::class);
    }
}
