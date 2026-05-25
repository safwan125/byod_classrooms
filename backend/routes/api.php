<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\BlockedSiteController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\DeviceController;

// Public
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard/stats',    [ClassroomController::class, 'stats']);
    Route::get('/dashboard/overview', [AnalyticsController::class, 'teacherOverview']);

    // Teacher alerts & live feed
    Route::get('/teacher/blocked-alerts', [ActivityController::class, 'blockedAlerts']);
    Route::get('/teacher/live-activity',  [ActivityController::class, 'liveActivity']);

    // Classrooms — specific paths BEFORE {id} wildcard
    Route::get('/classrooms',       [ClassroomController::class, 'index']);
    Route::post('/classrooms',      [ClassroomController::class, 'store']);
    Route::post('/classrooms/join', [ClassroomController::class, 'join']);

    Route::get('/classrooms/{id}',               [ClassroomController::class, 'show']);
    Route::put('/classrooms/{id}',               [ClassroomController::class, 'update']);
    Route::delete('/classrooms/{id}',            [ClassroomController::class, 'destroy']);
    Route::get('/classrooms/{id}/students',      [ClassroomController::class, 'students']);
    Route::get('/classrooms/{id}/activities',    [ActivityController::class, 'index']);
    Route::get('/classrooms/{id}/blocked-sites', [BlockedSiteController::class, 'index']);
    Route::get('/classrooms/{id}/announcements', [AnnouncementController::class, 'index']);
    Route::get('/classrooms/{id}/reports',       [AnalyticsController::class, 'getReports']);
    Route::get('/classrooms/{id}/devices',       [DeviceController::class, 'allForClassroom']);

    // Activity logging
    Route::post('/activity/store',      [ActivityController::class, 'store']);
    Route::post('/activity/heartbeat',  [ActivityController::class, 'heartbeat']);
    Route::post('/activity/check-site', [ActivityController::class, 'checkSite']);
    Route::get('/my-activities',        [ActivityController::class, 'myActivities']);

    // Blocked Sites
    Route::post('/block-site',           [BlockedSiteController::class, 'store']);
    Route::delete('/blocked-sites/{id}', [BlockedSiteController::class, 'destroy']);

    // Announcements
    Route::post('/announcements',        [AnnouncementController::class, 'store']);
    Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);

    // Devices
    Route::get('/devices',             [DeviceController::class, 'index']);
});
