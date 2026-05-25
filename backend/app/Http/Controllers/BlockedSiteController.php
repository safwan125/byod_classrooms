<?php
namespace App\Http\Controllers;

use App\Models\BlockedSite;
use Illuminate\Http\Request;

class BlockedSiteController extends Controller
{
    public function index($classroomId)
    {
        return response()->json(
            BlockedSite::where('classroom_id', $classroomId)->latest()->get()
        );
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'teacher') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $fields = $request->validate([
            'classroom_id' => 'required|integer|exists:classrooms,id',
            'website_url'  => 'required|string|max:255',
        ]);

        // Check for duplicates
        $exists = BlockedSite::where('classroom_id', $fields['classroom_id'])
            ->where('website_url', $fields['website_url'])->exists();

        if ($exists) {
            return response()->json(['message' => 'This website is already blocked.'], 400);
        }

        $site = BlockedSite::create($fields);
        return response()->json($site, 201);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'teacher') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $site = BlockedSite::findOrFail($id);
        $site->delete();
        return response()->json(['message' => 'Website unblocked successfully']);
    }
}
