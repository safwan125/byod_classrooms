<?php
namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Activity;
use App\Models\BlockedSite;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ClassroomController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role === 'teacher') {
            return response()->json(
                $request->user()->classrooms()->withCount('students')->latest()->get()
            );
        }
        return response()->json(
            $request->user()->joinedClassrooms()->with('teacher')->latest()->get()
        );
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'teacher') {
            return response()->json(['message' => 'Unauthorized. Only teachers can create classrooms.'], 403);
        }

        $fields = $request->validate([
            'classroom_name' => 'required|string|max:255',
            'description'    => 'nullable|string|max:1000',
        ]);

        $classroom = $request->user()->classrooms()->create([
            'classroom_name' => $fields['classroom_name'],
            'description'    => $fields['description'] ?? null,
            'classroom_code' => strtoupper(Str::random(6)),
            'status'         => 'active',
        ]);

        return response()->json($classroom, 201);
    }

    public function show($id)
    {
        $classroom = Classroom::with(['teacher', 'students', 'blockedSites', 'announcements'])
            ->findOrFail($id);
        return response()->json($classroom);
    }

    public function update(Request $request, $id)
    {
        $classroom = Classroom::findOrFail($id);

        if ($classroom->teacher_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $fields = $request->validate([
            'classroom_name' => 'required|string|max:255',
            'description'    => 'nullable|string|max:1000',
            'status'         => 'nullable|in:active,inactive',
        ]);

        $classroom->update($fields);
        return response()->json($classroom);
    }

    public function destroy(Request $request, $id)
    {
        $classroom = Classroom::findOrFail($id);

        if ($classroom->teacher_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $classroom->delete();
        return response()->json(['message' => 'Classroom deleted successfully']);
    }

    public function join(Request $request)
    {
        if ($request->user()->role !== 'student') {
            return response()->json(['message' => 'Only students can join classrooms.'], 403);
        }

        $fields = $request->validate([
            'classroom_code' => 'required|string|size:6',
        ]);

        $classroom = Classroom::where('classroom_code', strtoupper($fields['classroom_code']))->first();

        if (!$classroom) {
            return response()->json(['message' => 'Invalid classroom code. Please check and try again.'], 404);
        }

        if ($classroom->students()->where('student_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'You have already joined this classroom.'], 400);
        }

        $classroom->students()->attach($request->user()->id, ['joined_at' => now()]);

        return response()->json([
            'message'   => 'Successfully joined the classroom!',
            'classroom' => $classroom->load('teacher'),
        ]);
    }

    public function students(Request $request, $id)
    {
        $classroom = Classroom::findOrFail($id);

        $students = $classroom->students()->get()->map(function ($student) use ($id) {
            $activities = Activity::where('user_id', $student->id)
                ->where('classroom_id', $id)->get();
            $totalTime     = $activities->sum('time_spent');
            $eduTime       = $activities->where('activity_type', 'educational')->sum('time_spent');
            $productivity  = $totalTime > 0 ? round(($eduTime / $totalTime) * 100) : 100;

            return [
                'id'                 => $student->id,
                'name'               => $student->name,
                'email'              => $student->email,
                'joined_at'          => $student->pivot->joined_at,
                'productivity_score' => $productivity,
                'total_time_spent'   => $totalTime,
                'activity_count'     => $activities->count(),
            ];
        });

        return response()->json($students);
    }

    public function stats(Request $request)
    {
        if ($request->user()->role !== 'teacher') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $classrooms    = $request->user()->classrooms()->pluck('id');
        $totalStudents = \DB::table('classroom_students')
            ->whereIn('classroom_id', $classrooms)
            ->distinct('student_id')->count('student_id');

        $blockedSites  = BlockedSite::whereIn('classroom_id', $classrooms)->count();

        $activities    = Activity::whereIn('classroom_id', $classrooms)->get();
        $totalTime     = $activities->sum('time_spent');
        $eduTime       = $activities->where('activity_type', 'educational')->sum('time_spent');
        $productivity  = $totalTime > 0 ? round(($eduTime / $totalTime) * 100) : 100;

        // Students active in the last 7 days (matches demo seeded data range)
        $activeToday = Activity::whereIn('classroom_id', $classrooms)
            ->where('created_at', '>=', now()->subDays(7))
            ->distinct('user_id')->count('user_id');

        return response()->json([
            'total_students'    => $totalStudents,
            'active_students'   => $activeToday,
            'blocked_sites'     => $blockedSites,
            'productivity_score'=> $productivity,
            'total_classrooms'  => $classrooms->count(),
        ]);
    }
}
