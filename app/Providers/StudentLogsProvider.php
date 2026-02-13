<?php

namespace App\Providers;

use App\Models\StudentLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class StudentLogsProvider extends ServiceProvider
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

    public static function log($description, $event, $scope)
    {
        try {
            $user = Auth::user();

            if ($user) {
                StudentLog::create([
                    'log_description' => $description,
                    'event' => $event,
                    'scope' => $scope,
                    'student_account_id' => $user->id,
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
