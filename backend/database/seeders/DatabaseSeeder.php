<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Classroom;
use App\Models\Activity;
use App\Models\BlockedSite;
use App\Models\Announcement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create teacher
        $teacher = User::create([
            'name'     => 'Dr. Sarah Johnson',
            'email'    => 'teacher@example.com',
            'password' => Hash::make('password'),
            'role'     => 'teacher',
        ]);

        // Create 10 students
        $studentNames = [
            'Alice Thompson', 'Bob Martinez', 'Carol Wilson', 'David Lee',
            'Emma Davis', 'Frank Garcia', 'Grace Kim', 'Henry Brown',
            'Iris Chen', 'Jack Taylor',
        ];
        $students = [];
        foreach ($studentNames as $i => $name) {
            $students[] = User::create([
                'name'     => $name,
                'email'    => 'student' . ($i + 1) . '@example.com',
                'password' => Hash::make('password'),
                'role'     => 'student',
            ]);
        }

        // Create classrooms
        $classroom1 = Classroom::create([
            'teacher_id'     => $teacher->id,
            'classroom_name' => 'Computer Science 101',
            'classroom_code' => 'CS1010',
            'description'    => 'Introduction to programming and computational thinking.',
            'status'         => 'active',
        ]);

        $classroom2 = Classroom::create([
            'teacher_id'     => $teacher->id,
            'classroom_name' => 'Web Development Advanced',
            'classroom_code' => 'WD2025',
            'description'    => 'Advanced web development with modern frameworks.',
            'status'         => 'active',
        ]);

        // Enroll students in classrooms
        foreach (array_slice($students, 0, 7) as $student) {
            $classroom1->students()->attach($student->id, ['joined_at' => now()->subDays(rand(1, 30))]);
        }
        foreach (array_slice($students, 3, 7) as $student) {
            $classroom2->students()->attach($student->id, ['joined_at' => now()->subDays(rand(1, 20))]);
        }

        // Create blocked sites
        $blockedSites1 = [
            ['classroom_id' => $classroom1->id, 'website_url' => 'youtube.com'],
            ['classroom_id' => $classroom1->id, 'website_url' => 'facebook.com'],
            ['classroom_id' => $classroom1->id, 'website_url' => 'instagram.com'],
        ];
        $blockedSites2 = [
            ['classroom_id' => $classroom2->id, 'website_url' => 'tiktok.com'],
            ['classroom_id' => $classroom2->id, 'website_url' => 'twitter.com'],
        ];
        foreach (array_merge($blockedSites1, $blockedSites2) as $site) {
            BlockedSite::create($site);
        }

        // Create announcements
        Announcement::create([
            'classroom_id' => $classroom1->id,
            'title'        => 'Welcome to CS 101!',
            'message'      => 'Welcome everyone to Computer Science 101. Please make sure your devices are registered before our first session.',
            'created_at'   => now()->subDays(5),
        ]);
        Announcement::create([
            'classroom_id' => $classroom1->id,
            'title'        => 'Assignment 1 Due Friday',
            'message'      => 'Reminder: Assignment 1 on algorithms is due this Friday. Submit via the course portal.',
            'created_at'   => now()->subDays(2),
        ]);
        Announcement::create([
            'classroom_id' => $classroom2->id,
            'title'        => 'Lab Session Tomorrow',
            'message'      => 'We will have a hands-on lab session tomorrow. Bring your laptops fully charged.',
            'created_at'   => now()->subDay(),
        ]);

        // Create demo activities for classroom 1 students (7 days including today)
        $educationalSites    = ['github.com', 'stackoverflow.com', 'w3schools.com', 'developer.mozilla.org', 'docs.python.org'];
        $nonEducationalSites = ['reddit.com', 'news.ycombinator.com'];

        $enrolledStudents1 = array_slice($students, 0, 7);
        foreach ($enrolledStudents1 as $student) {
            for ($day = 6; $day >= 0; $day--) {  // 0 = today, 6 = 6 days ago
                $numEdu = rand(2, 4);
                for ($e = 0; $e < $numEdu; $e++) {
                    Activity::create([
                        'user_id'            => $student->id,
                        'classroom_id'       => $classroom1->id,
                        'website'            => $educationalSites[array_rand($educationalSites)],
                        'activity_type'      => 'educational',
                        'time_spent'         => rand(5, 45),
                        'productivity_status'=> 'productive',
                        'created_at'         => now()->subDays($day)->addMinutes(rand(0, 480)),
                        'updated_at'         => now()->subDays($day)->addMinutes(rand(0, 480)),
                    ]);
                }
                $numNonEdu = rand(0, 1);
                for ($n = 0; $n < $numNonEdu; $n++) {
                    Activity::create([
                        'user_id'            => $student->id,
                        'classroom_id'       => $classroom1->id,
                        'website'            => $nonEducationalSites[array_rand($nonEducationalSites)],
                        'activity_type'      => 'non-educational',
                        'time_spent'         => rand(1, 15),
                        'productivity_status'=> 'unproductive',
                        'created_at'         => now()->subDays($day)->addMinutes(rand(0, 480)),
                        'updated_at'         => now()->subDays($day)->addMinutes(rand(0, 480)),
                    ]);
                }
            }
        }

        // Create demo activities for classroom 2 students
        $enrolledStudents2 = array_slice($students, 3, 7);
        $eduSites2 = ['css-tricks.com', 'javascript.info', 'reactjs.org', 'vuejs.org', 'tailwindcss.com'];
        foreach ($enrolledStudents2 as $student) {
            for ($day = 6; $day >= 0; $day--) {
                $numEdu = rand(2, 3);
                for ($e = 0; $e < $numEdu; $e++) {
                    Activity::create([
                        'user_id'            => $student->id,
                        'classroom_id'       => $classroom2->id,
                        'website'            => $eduSites2[array_rand($eduSites2)],
                        'activity_type'      => 'educational',
                        'time_spent'         => rand(10, 50),
                        'productivity_status'=> 'productive',
                        'created_at'         => now()->subDays($day)->addMinutes(rand(0, 480)),
                        'updated_at'         => now()->subDays($day)->addMinutes(rand(0, 480)),
                    ]);
                }
            }
        }
    }
}
