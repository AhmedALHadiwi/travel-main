
<?php

use App\Http\Controllers\TestController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\ToDoController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\BreakkController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\EmailAccountController;

// Auth Routes =================================================================================================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
// ToDo Routes =================================================================================================
Route::get('/todos', [ToDoController::class , 'index' ]);
Route::post('/todos', [ToDoController::class , 'store' ]);
Route::delete('/todos/{id}', [ToDoController::class , 'destroy' ]);
Route::put('/todos/{id}', [ToDoController::class , 'update' ]);
// Users Routes
// Route::get('/users', [UserController::class , 'index' ]);
// Route::post('/users', [UserController::class , 'store' ]);
// Route::delete('/users/{id}', [UserController::class , 'destroy' ]);

// Users And Role ===================================================================================
Route::apiResource('users', UserController::class);
Route::apiResource('roles', RoleController::class);
// routes/api.php====================================================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/users/{id}', [UserController::class, 'update']); // لو FormData مع صورة
});
// Update Change Password Of Login user
Route::middleware('auth:sanctum')->group(function () {
    Route::put('/profile/password', [UserController::class, 'updatePassword']);
});
// Leave Request==================================================================================
Route::get('leave-requests', [LeaveRequestController::class, 'index']);
// Route::post('leave-requests', [LeaveRequestController::class, 'store']);
Route::middleware('auth:sanctum')->post('/leave-requests', [LeaveRequestController::class, 'store']);

Route::put('/leave-requests/{id}', [LeaveRequestController::class, 'update']);
Route::delete('/leave-requests/{id}', [LeaveRequestController::class, 'destroy']);

//Notifications ==========================================================================================
// Route::get('/notifications', [NotificationController::class, 'index']);
// Route::get('/roles-notifications', [NotificationController::class, 'getRoles']);
// Route::post('/notifications', [NotificationController::class, 'store']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/notifications/user', [NotificationController::class, 'getUserNotifications']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::get('/roles-notifications', [NotificationController::class, 'getRoles']);
});
// Company Routes======================================================================================
Route::get('/company/{id}', [CompanyController::class, 'show']);
Route::get('/company/subdomain/{subdomain}', [CompanyController::class, 'getBySubdomain']);
Route::patch('/company/{id}/settings', [CompanyController::class, 'updateSettings']);
Route::patch('/company/{id}/navigation', [CompanyController::class, 'updateNavigation']);
Route::post('/company/{id}/save-all-settings', [CompanyController::class, 'saveAllSettings']);

// Email Accounts Routes======================================================================================
Route::middleware('auth:sanctum')->group(function () {
    // Get all email accounts
    Route::get('/email-accounts', [EmailAccountController::class, 'index']);

    // Add a new email account
    Route::post('/email-accounts', [EmailAccountController::class, 'store']);

    // Delete an email account
    Route::delete('/email-accounts/{emailAccount}', [EmailAccountController::class, 'destroy']);

    // Send an email via selected account
    Route::post('/emails/send', [EmailAccountController::class, 'sendEmail']);
    // Shifts  Routes======================================================================================
    // شيفتات
    Route::get('/shifts', [ShiftController::class, 'index']);
    Route::get('/shifts/report', [ShiftController::class, 'getShiftsReport']);
    Route::get('/shifts/active', [ShiftController::class, 'active']);
    Route::get('/shifts/count-today', [ShiftController::class, 'countToday']);
    Route::post('/shifts/start', [ShiftController::class, 'startShift']);
    Route::put('/shifts/end/{id}', [ShiftController::class, 'endShift']);
    Route::post('/shifts/day/{user_id}', [ShiftController::class, 'dayShifts']);
    Route::get('/shifts/month/{month}', [ShiftController::class, 'monthStats']);

    // بريك
    Route::post('/breaks/start', [BreakkController::class, 'startBreak']);
    Route::put('/breaks/end/{id}', [BreakkController::class, 'endBreak']);

    Route::get('get_leaves', [LeaveRequestController::class, 'get_leaves']);


    // إجازات
    Route::get('/leave-requests/count-approved', [LeaveRequestController::class, 'countApproved']);
});


// Broadcasting Authentication Route ================================================================

Route::middleware(['auth:sanctum'])->group(function () {
    // Your existing routes...

    // Broadcasting authentication
    Route::post('/broadcasting/auth', function (Request $request) {
        return response()->json([
            'auth' => hash_hmac('sha256', $request->socket_id . ':' . $request->channel_name, config('reverb.app_secret')),
        ]);
    });
});

// OR if you're using web routes, add this to routes/web.php
Route::middleware(['auth:sanctum'])->post('/broadcasting/auth', function (Request $request) {
    $user = Auth::user();

    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // For private channels, verify the user can access the channel
    if (str_contains($request->channel_name, 'private-notifications.user.')) {
        $userId = str_replace('private-notifications.user.', '', $request->channel_name);
        if ($user->id != $userId) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
    }

    return response()->json([
        'auth' => hash_hmac('sha256', $request->socket_id . ':' . $request->channel_name, config('reverb.app_secret')),
        'channel_data' => json_encode(['user_id' => $user->id, 'user_info' => $user]),
    ]);
});


Route::get('/fire', [TestController::class, 'fire']);

# Reservation Routes======================================================================================
use App\Http\Controllers\ReservationController;


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::put('/reservations/{id}', [ReservationController::class, 'update']);
    Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);
    // routes/api.php
Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
Route::post('/reservations/{id}/send', [ReservationController::class, 'sendReservation']);
Route::get('/reservations/sent', [ReservationController::class, 'getSentReservations']);
});
