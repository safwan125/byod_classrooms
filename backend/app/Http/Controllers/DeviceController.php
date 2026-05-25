<?php
namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index(Request $request)
    {
        $devices = Device::where('user_id', $request->user()->id)->latest()->get();
        return response()->json($devices);
    }

    public function allForClassroom(Request $request, $classroomId)
    {
        if ($request->user()->role !== 'teacher') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $devices = Device::whereHas('user.joinedClassrooms', function ($q) use ($classroomId) {
            $q->where('classrooms.id', $classroomId);
        })->with('user')->get();

        return response()->json($devices);
    }
}
