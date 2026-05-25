<?php
namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index($classroomId)
    {
        return response()->json(
            Announcement::where('classroom_id', $classroomId)->latest()->get()
        );
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'teacher') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $fields = $request->validate([
            'classroom_id' => 'required|integer|exists:classrooms,id',
            'title'        => 'required|string|max:255',
            'message'      => 'required|string|max:2000',
        ]);

        $announcement = Announcement::create($fields);
        return response()->json($announcement, 201);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'teacher') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ann = Announcement::findOrFail($id);
        $ann->delete();
        return response()->json(['message' => 'Announcement deleted']);
    }
}
