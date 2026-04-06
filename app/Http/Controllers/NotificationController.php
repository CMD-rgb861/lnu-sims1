<?php 

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{

    // Helper functionfor determining logged-in user
    private function getAuthenticatedUser()
    {
        $guards = ['employee', 'student']; 

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                return Auth::guard($guard)->user(); 
            }
        }

        return null;
    }

    public function index()
    {
        $user = $this->getAuthenticatedUser();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized request.',
                'type' => 'error'
            ], 403);
        }
        
        return response()->json([
            'notifications' => $user->notifications,
            'unread_count' => $user->unreadNotifications->count()
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $this->getAuthenticatedUser();
        
        if ($request->has('id')) {
            $user->notifications->where('id', $request->id)->update(['read_at' => now()]);
        } else {
            $user->unreadNotifications->markAsRead();
        }

        return response()->json([
            'type' => 'success',
            'message' => 'Marked all notifications as read'
        ]);
    }

    public function markAsRead($id)
    {
        $user = $this->getAuthenticatedUser();

        $notification = $user->notifications->findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'type' => 'success',
            'message' => 'Marked as read'
        ]);
    }
}
