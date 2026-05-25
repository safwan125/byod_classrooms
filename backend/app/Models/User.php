<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        "name", "email", "password", "role"
    ];

    protected $hidden = [
        "password", "remember_token",
    ];

    protected function casts(): array
    {
        return [
            "email_verified_at" => "datetime",
            "password" => "hashed",
        ];
    }

    public function classrooms() {
        return $this->hasMany(Classroom::class, "teacher_id");
    }

    public function joinedClassrooms() {
        return $this->belongsToMany(Classroom::class, "classroom_students", "student_id", "classroom_id")->withPivot("joined_at");
    }

    public function activities() {
        return $this->hasMany(Activity::class);
    }

    public function devices() {
        return $this->hasMany(Device::class);
    }
}
