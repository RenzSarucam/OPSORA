<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ContainerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HealthCheckController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ServerController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:10,1');

Route::middleware(['auth:sanctum', 'throttle:120,1'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('projects', ProjectController::class);
    Route::get('/projects/{project}/health', [HealthCheckController::class, 'show']);
    Route::get('/projects/{project}/health-history', [HealthCheckController::class, 'history']);

    Route::get('/alerts', [AlertController::class, 'index']);
    Route::post('/alerts/{alert}/resolve', [AlertController::class, 'resolve']);

    Route::apiResource('servers', ServerController::class);

    Route::get('/containers', [ContainerController::class, 'index']);
    Route::post('/containers/{id}/restart', [ContainerController::class, 'restart']);

    Route::get('/activity', [ActivityController::class, 'index']);
});