<?php
namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\BlockedSite;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function getReports(Request $request, $classroomId)
    {
        $classroom     = Classroom::findOrFail($classroomId);
        $totalStudents = $classroom->students()->count();

        $activities    = Activity::where('classroom_id', $classroomId)->get();
        $totalTime     = $activities->sum('time_spent');
        $educationalTime = $activities->where('activity_type', 'educational')->sum('time_spent');
        $productivityScore = $totalTime > 0 ? round(($educationalTime / $totalTime) * 100) : 100;

        // Top websites by time
        $websiteStats = Activity::where('classroom_id', $classroomId)
            ->select('website', DB::raw('sum(time_spent) as total_time'), DB::raw('count(*) as visits'))
            ->groupBy('website')
            ->orderByDesc('total_time')
            ->take(8)
            ->get();

        // Daily activity trend (last 7 days)
        $dailyTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date    = now()->subDays($i)->toDateString();
            $dayActs = Activity::where('classroom_id', $classroomId)
                ->whereDate('created_at', $date)->get();
            $dayTotal = $dayActs->sum('time_spent');
            $dayEdu   = $dayActs->where('activity_type', 'educational')->sum('time_spent');
            $dailyTrend[] = [
                'date'            => now()->subDays($i)->format('M d'),
                'total_time'      => $dayTotal,
                'educational'     => $dayEdu,
                'non_educational' => $dayTotal - $dayEdu,
            ];
        }

        // Per-student productivity
        $studentStats = $classroom->students()->get()->map(function ($student) use ($classroomId) {
            $acts  = Activity::where('user_id', $student->id)
                ->where('classroom_id', $classroomId)->get();
            $total = $acts->sum('time_spent');
            $edu   = $acts->where('activity_type', 'educational')->sum('time_spent');
            return [
                'name'               => $student->name,
                'productivity_score' => $total > 0 ? round(($edu / $total) * 100) : 100,
                'total_time'         => $total,
            ];
        });

        return response()->json([
            'total_students'     => $totalStudents,
            'productivity_score' => $productivityScore,
            'total_time_spent'   => $totalTime,
            'educational_time'   => $educationalTime,
            'website_stats'      => $websiteStats,
            'daily_trend'        => $dailyTrend,
            'student_stats'      => $studentStats,
        ]);
    }

    public function teacherOverview(Request $request)
    {
        if ($request->user()->role !== 'teacher') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $classroomIds = $request->user()->classrooms()->pluck('id');

        $dailyTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date    = now()->subDays($i)->toDateString();
            $dayActs = Activity::whereIn('classroom_id', $classroomIds)
                ->whereDate('created_at', $date)->get();
            $dayTotal = $dayActs->sum('time_spent');
            $dayEdu   = $dayActs->where('activity_type', 'educational')->sum('time_spent');
            $dailyTrend[] = [
                'date'        => now()->subDays($i)->format('M d'),
                'educational' => $dayEdu,
                'non_educational' => $dayTotal - $dayEdu,
            ];
        }

        $recentActivities = Activity::whereIn('classroom_id', $classroomIds)
            ->with(['user', 'classroom'])
            ->latest()
            ->take(20)
            ->get()
            ->map(fn($a) => [
                'id'                  => $a->id,
                'student'             => $a->user?->name ?? 'Unknown',
                'classroom'           => $a->classroom?->classroom_name ?? 'Unknown',
                'website'             => $a->website,
                'activity_type'       => $a->activity_type,
                'time_spent'          => $a->time_spent,
                'productivity_status' => $a->productivity_status,
                'is_blocked_attempt'  => (bool)$a->is_blocked_attempt,
                'created_at'          => $a->created_at,
            ]);

        return response()->json([
            'daily_trend'        => $dailyTrend,
            'recent_activities'  => $recentActivities,
        ]);
    }
}
