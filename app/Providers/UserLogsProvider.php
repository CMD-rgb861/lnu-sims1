<?php

namespace App\Providers;

use App\Models\UserLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class UserLogsProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }

    public static function log($description, $event, $scope, $userId = null)
    {
        try {
            $employeeId = $userId ?? Auth::guard('employee')->id();

            if ($employeeId) {
                UserLog::create([
                    'log_description' => $description,
                    'event' => $event,
                    'scope' => $scope,
                    'user_account_id' => $employeeId,
                ]);
            }

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to log user activity.' . $e->getMessage(),
                'type' => 'error',
            ]);
        }
    }

}
