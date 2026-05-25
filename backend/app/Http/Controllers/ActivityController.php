<?php
namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\BlockedSite;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    /** Normalize a URL to bare domain */
    private function normalizeDomain(string $url): string
    {
        $url = preg_replace('/^(https?:\/\/)?(www\.)?/', '', strtolower(trim($url)));
        return explode('/', $url)[0];
    }

    /** Check if a domain matches any blocked site in a classroom */
    private function findBlocked(string $domain, int $classroomId): ?BlockedSite
    {
        return BlockedSite::where('classroom_id', $classroomId)
            ->get()
            ->first(function ($site) use ($domain) {
                $siteDomain = $this->normalizeDomain($site->website_url);
                return str_contains($domain, $siteDomain) || str_contains($siteDomain, $domain);
            });
    }

    /**
     * POST /api/activity/store
     * Called by the student browser heartbeat to log accumulated time.
     */
    public function store(Request $request)
    {
        $fields = $request->validate([
            'classroom_id'        => 'required|integer|exists:classrooms,id',
            'website'             => 'required|string|max:255',
            'time_spent'          => 'required|integer|min:0',
            'activity_type'       => 'required|in:educational,non-educational',
            'productivity_status' => 'nullable|in:productive,unproductive',
        ]);

        $domain = $this->normalizeDomain($fields['website']);
        $blocked = $this->findBlocked($domain, $fields['classroom_id']);

        if ($blocked) {
            // Log the blocked attempt and return 403
            $request->user()->activities()->create([
                'classroom_id'        => $fields['classroom_id'],
                'website'             => $domain,
                'activity_type'       => 'non-educational',
                'time_spent'          => 0,
                'productivity_status' => 'unproductive',
                'is_blocked_attempt'  => true,
            ]);
            return response()->json(['message' => 'BLOCKED', 'blocked_site' => $blocked], 403);
        }

        $fields['productivity_status'] = $fields['productivity_status']
            ?? ($fields['activity_type'] === 'educational' ? 'productive' : 'unproductive');
        $fields['website']             = $domain;
        $fields['is_blocked_attempt']  = false;

        $activity = $request->user()->activities()->create($fields);
        return response()->json($activity, 201);
    }

    /**
     * POST /api/activity/heartbeat
     * Lightweight heartbeat — appends time to an existing activity for the
     * current session, or creates a new one. Accepts seconds; converts to minutes.
     */
    public function heartbeat(Request $request)
    {
        $fields = $request->validate([
            'classroom_id' => 'required|integer|exists:classrooms,id',
            'website'      => 'required|string|max:255',
            'seconds'      => 'required|integer|min:1',
            'activity_type'=> 'required|in:educational,non-educational',
        ]);

        $domain  = $this->normalizeDomain($fields['website']);
        $minutes = max(1, (int) round($fields['seconds'] / 60));

        // Find an existing activity record for this student+site+classroom within the last hour
        $existing = Activity::where('user_id', $request->user()->id)
            ->where('classroom_id', $fields['classroom_id'])
            ->where('website', $domain)
            ->where('is_blocked_attempt', false)
            ->where('created_at', '>=', now()->subHour())
            ->latest()
            ->first();

        if ($existing) {
            $existing->increment('time_spent', $minutes);
            return response()->json($existing);
        }

        $activity = $request->user()->activities()->create([
            'classroom_id'        => $fields['classroom_id'],
            'website'             => $domain,
            'activity_type'       => $fields['activity_type'],
            'time_spent'          => $minutes,
            'productivity_status' => $fields['activity_type'] === 'educational' ? 'productive' : 'unproductive',
            'is_blocked_attempt'  => false,
        ]);

        return response()->json($activity, 201);
    }

    /**
     * POST /api/activity/check-site
     * Used by the student browser to check a URL before visiting.
     * Automatically logs a blocked attempt if the site is blocked.
     */
    public function checkSite(Request $request)
    {
        $fields = $request->validate([
            'classroom_id' => 'required|integer|exists:classrooms,id',
            'website'      => 'required|string',
        ]);

        $domain  = $this->normalizeDomain($fields['website']);
        $blocked = $this->findBlocked($domain, $fields['classroom_id']);

        if ($blocked) {
            // Auto-log the blocked attempt — no manual action needed from student
            $request->user()->activities()->create([
                'classroom_id'        => $fields['classroom_id'],
                'website'             => $domain,
                'activity_type'       => 'non-educational',
                'time_spent'          => 0,
                'productivity_status' => 'unproductive',
                'is_blocked_attempt'  => true,
            ]);
        }

        return response()->json([
            'is_blocked'   => (bool) $blocked,
            'blocked_site' => $blocked,
            'domain'       => $domain,
        ]);
    }

    /**
     * GET /api/classrooms/{id}/activities
     * Paginated classroom activity feed for teacher.
     */
    public function index(Request $request, $classroomId)
    {
        $activities = Activity::where('classroom_id', $classroomId)
            ->with('user')
            ->latest()
            ->paginate(25);

        return response()->json($activities);
    }

    /**
     * GET /api/my-activities
     * Student's own activity history.
     */
    public function myActivities(Request $request)
    {
        $activities = Activity::where('user_id', $request->user()->id)
            ->with('classroom')
            ->latest()
            ->paginate(20);

        return response()->json($activities);
    }

    /**
     * GET /api/teacher/blocked-alerts
     * Returns recent blocked site attempts for the teacher's classrooms.
     * Accepts optional ?since=ISO8601 query param for polling.
     */
    public function blockedAlerts(Request $request)
    {
        if ($request->user()->role !== 'teacher') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $since        = $request->query('since', now()->subMinutes(30)->toISOString());
        $classroomIds = $request->user()->classrooms()->pluck('id');

        $alerts = Activity::whereIn('classroom_id', $classroomIds)
            ->where('is_blocked_attempt', true)
            ->where('created_at', '>=', $since)
            ->with(['user', 'classroom'])
            ->latest()
            ->take(30)
            ->get()
            ->map(fn ($a) => [
                'id'         => $a->id,
                'student'    => $a->user?->name ?? 'Unknown',
                'classroom'  => $a->classroom?->classroom_name ?? 'Unknown',
                'website'    => $a->website,
                'created_at' => $a->created_at,
            ]);

        return response()->json($alerts);
    }

    /**
     * GET /api/teacher/live-activity
     * All recent activity (blocked + normal) for the teacher's classrooms.
     */
    public function liveActivity(Request $request)
    {
        if ($request->user()->role !== 'teacher') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $since        = $request->query('since', now()->subMinutes(60)->toISOString());
        $classroomIds = $request->user()->classrooms()->pluck('id');

        $activities = Activity::whereIn('classroom_id', $classroomIds)
            ->where('created_at', '>=', $since)
            ->with(['user', 'classroom'])
            ->latest()
            ->take(50)
            ->get()
            ->map(fn ($a) => [
                'id'                  => $a->id,
                'student'             => $a->user?->name ?? 'Unknown',
                'classroom'           => $a->classroom?->classroom_name ?? 'Unknown',
                'website'             => $a->website,
                'activity_type'       => $a->activity_type,
                'time_spent'          => $a->time_spent,
                'productivity_status' => $a->productivity_status,
                'is_blocked_attempt'  => $a->is_blocked_attempt,
                'created_at'          => $a->created_at,
            ]);

        return response()->json($activities);
    }
}
