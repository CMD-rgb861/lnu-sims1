<?php

namespace App\Http\Controllers;

use App\Models\StudentAccount;
use App\Models\StudentLog;
use App\Models\UserAccount;
use App\Models\UserLog;
use App\Providers\UserLogsProvider;
use App\Providers\StudentLogsProvider;

use App\Mail\PasswordResetMail;
use App\Models\SchoolYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;


class AuthController extends Controller
{
    // public function resetProcess(Request $request)
    // {
    //     $request->validate([
    //         'id_number' => 'required|numeric|digits_between:6,7',
    //     ]);

    //     $idNumber = $request->id_number;
    //     $length = strlen((string)$idNumber);
        
    //     $user = null;

    //     if ($length === 6) {
    //         $user = UserAccount::where('id_number', $idNumber)->first();
    //     } elseif ($length === 7) {
    //         $user = StudentAccount::where('id_number', $idNumber)->first();
    //     } 

    //     // 3. Check if user exists
    //     if (!$user) {
    //         return response()->json([
    //             'type' => 'error', 
    //             'message' => 'Invalid ID number.'
    //         ]);
    //     }

    //     $rawOtp = rand(100000, 999999); 
    //     $hashedOtp = Hash::make($rawOtp);

    //     DB::beginTransaction();

    //     try {
    //         $user->otp = $hashedOtp;
    //         $user->save();
    //         DB::commit();
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'type' => 'error', 
    //             'message' => 'Unable to generate OTP. Please try again.',
    //         ]);
    //     }

    //     $emailAddress = $user->email_address;
    //     $fullName = $user->first_name . ' ' . $user->last_name;

    //     if (!$emailAddress) {
    //         return response()->json([
    //             'type' => 'error', 
    //             'message' => 'User found, but no email address is linked to this account.'
    //         ]);
    //     }

    //     try {
    //         Mail::to($emailAddress)->send(new PasswordResetMail(
    //             $fullName,
    //             $rawOtp 
    //         ));

    //         return response()->json([
    //             'type' => 'success', 
    //             'message' => 'OTP has been sent to your email.',
    //             'id_number' => $idNumber
    //         ]);

    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'type' => 'error', 
    //             'message' => 'Failed to send email: ' . $e->getMessage(),
    //         ]);
    //     }
    // }

    // public function verifyOtp(Request $request)
    // {
    //     $request->validate([
    //         'id_number' => 'required',
    //         'otp' => 'required|numeric|digits:6'
    //     ]);

    //     $length = strlen((string)$request->id_number);
    //     $user = ($length === 6) 
    //         ? UserAccount::where('id_number', $request->id_number)->first() 
    //         : StudentAccount::where('id_number', $request->id_number)->first();

    //     if (!$user) {
    //         return response()->json(['type' => 'error', 'message' => 'User not found.']);
    //     }

    //     // 2. Check OTP
    //     if (Hash::check($request->otp, $user->otp)) {

    //         session(['verified_id' => $user->id]);
            
    //         return response()->json(['type' => 'success', 'message' => 'OTP verified. Provide a new password.']);
    //     }

    //     return response()->json(['type' => 'error', 'message' => 'Invalid OTP Code.']);
    // }

    // public function changePass(Request $request)
    // {
    //     $request->validate([
    //         'id_number' => 'required',
    //         'new_password' => [
    //             'required', 
    //             'confirmed', 
    //             'min:8', 
    //             'regex:/[A-Z]/',    
    //             'regex:/[0-9]/',     
    //             'regex:/[@$!%*#?&]/', 
    //         ],
    //     ]);

    //     $length = strlen((string)$request->id_number);
    //     $user = ($length === 6) 
    //         ? UserAccount::where('id_number', $request->id_number)->first() 
    //         : StudentAccount::where('id_number', $request->id_number)->first();

    //     if (!$user) {
    //         return response()->json(['type' => 'error', 'message' => 'User not found.']);
    //     }

    //     $user->password = Hash::make($request->new_password);
    //     $user->otp = null; 
    //     $user->save();

    //     return response()->json([
    //         'type' => 'success',
    //         'message' => 'Password changed successfully!',
    //         'redirect_url' => route('login') 
    //     ]);
    // }

    // // Temporary password reset logic
    // public function resetPassword(Request $request)
    // {
    //     // 1. Validate the ID number
    //     $request->validate([
    //         'id_number' => 'required|numeric|digits_between:6,7',
    //     ]);

    //     $idNumber = $request->id_number;
    //     $length = strlen((string)$idNumber);
        
    //     $user = null;

    //     if ($length === 6 || $length === 5) {
    //         $user = UserAccount::where('id_number', $idNumber)->first();
    //     } elseif ($length === 7) {
    //         $user = StudentAccount::where('id_number', $idNumber)->first();
    //     } 

    //     if (!$user) {
    //         return response()->json([
    //             'type' => 'error', 
    //             'message' => 'Invalid ID number. No account found.'
    //         ], 404);
    //     }

    //     DB::beginTransaction();

    //     try {
    //         $user->password = null; 
    //         $user->profile_verified = 0;
    //         $user->otp = null; 

    //         $user->save();
            
    //         DB::commit();

    //         session()->flash('toast', [
    //             'text' => 'Your password has been reverted to your default password. Please login to set a new password.',
    //             'type' => 'success'
    //         ]);

    //         return response()->json([
    //             'type' => 'success', 
    //             'redirect_url' => route('login') 
    //         ]);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'type' => 'error', 
    //             'message' => 'An error occurred while resetting the account.' . $e->getMessage(),
    //         ], 500);
    //     }
    // }

    // Return user details
    public function user()
    {
        $user = Auth::user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user instanceof UserAccount) {
            return response()->json([
                'user' => $user,
                'user_type' => $user->user_type->user_type_description,
                'user_role_level' => $user->roles->pluck('user_role_level')->toArray()
            ]);
        }

        if ($user instanceof StudentAccount) {
            $hasProfile = $user->student_profile()->exists();
            $user->has_profile = $hasProfile;

            $activeSchoolYear = SchoolYear::where('is_active', 1)->first();
            $hasActiveEnrollment = false;

            if ($activeSchoolYear) {
                $hasActiveEnrollment = $user->enrollment_detail()
                    ->where('school_year_id', $activeSchoolYear->id)
                    ->exists();
            }

            $user->has_active_enrollment = $hasActiveEnrollment;
            $user->active_school_year = $activeSchoolYear;

            return response()->json([
                'user' => $user,
                'user_type' => 'Student',
                'user_role_level' => [],
                'profile_pic' => $user->student_profile?->profile_pic 
            ]);
        }

        return response()->json(['message' => 'Unknown user type'], 403);
    }

    public function employeeLogin(Request $request)
    {
        $request->validate([
            'idNum' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = UserAccount::where('id_number', $request->idNum)
                           ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid credentials. Please try again.',
                'type' => 'error',
            ]);
        }

        if (!$user->profile_verified) {
            // Use temporary password for unverified users
            if (!Hash::check($request->password, $user->temp_password)) {
                return response()->json([
                    'message' => 'Invalid credentials. Please try again.',
                    'type' => 'error',
                ]);
            }
        } else {
            // Use regular password for verified users
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials. Please try again.',
                    'type' => 'error',
                ]);
            }
        }

        Auth::guard('employee')->login($user);

        //Log user activity
        UserLogsProvider::log(
            'Employee logged in on the system',
            1,
            'Authentication'
        );

        $request->user('employee')->update([
            'last_login' => now(),
            'is_logged_in' => 1,
        ]);

        return response()->json([
            'message' => 'Login successful!',
            'type' => 'success',
            'user' => $user
        ]);
    }

    public function studentLogin(Request $request)
    {
        $request->validate([
            'idNum' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = StudentAccount::where('id_number', $request->idNum)
                              ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid credentials. Please try again.',
                'type' => 'error',
            ]);
        }

        // Check based on verification status
        if (!$user->profile_verified) {
            if (!Hash::check($request->password, $user->temp_password)) {
                return response()->json([
                    'message' => 'Invalid credentials. Please try again.',
                    'type' => 'error',
                ]);
            }
        } else {
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials. Please try again.',
                    'type' => 'error',
                ]);
            }
        }

        Auth::guard('student')->login($user);

        //Log user activity
        StudentLogsProvider::log(
            'Student logged in on the system',
            1,
            'Authentication'
        );

        $user->update([
            'last_login' => now(),
            'is_logged_in' => 1,
        ]);

        return response()->json([
            'message' => 'Login successful!',
            'type' => 'success',
            'user' => $user
        ]);
    }

    // Verify user account
    public function verifyAccount(Request $request)
    {
        $request->validate([
            'new_password' => 'required|string|min:8|confirmed'
        ]);

        $guards = ['employee', 'student']; 
        $user = null;
        $activeGuard = null;

        try {
            foreach ($guards as $guard) {
                if (Auth::guard($guard)->check()) {
                    $user = Auth::guard($guard)->user();
                    $activeGuard = $guard;
                    break;
                }
            }

            if (!$user) {
                return response()->json([
                    'message' => 'Unauthorized request.',
                    'type' => 'error'
                ], 403);
            }

            // Update the user
            $request->user($activeGuard)->update([
                'password' => Hash::make($request->new_password),
                'profile_verified' => 1,
                'is_logged_in' => 1
            ]);

            // Log user verification based on user guard
            if($activeGuard === 'employee'){
                UserLogsProvider::log(
                    'User account verified on first login',
                    1,
                    'Authentication'
                );
            } else if ($activeGuard == 'student') {
                StudentLogsProvider::log(
                    'Student account verified on first login',
                    1,
                    'Authentication'
                );
            }

            return response()->json([
                'message' => 'Account verified and password updated successfully!',
                'type' => 'success',
            ], 200);

        } catch(\Exception $e) {
            return response()->json([
                'message' => 'Account verification failed: ' . $e->getMessage(),
                'type' => 'error',
            ], 500);
        }
    }

    // Logout current user
    public function logout(Request $request)
    {
        $guards = ['employee', 'student']; 
        $user = null;
        $activeGuard = null;

        try {
            foreach ($guards as $guard) {
                if (Auth::guard($guard)->check()) {
                    $user = Auth::guard($guard)->user();
                    $activeGuard = $guard;
                    break;
                }
            }

            if($activeGuard === 'employee'){
                UserLogsProvider::log(
                    'Employee logged out of the system',
                    1,
                    'Authentication'
                );

            }else if($activeGuard === 'student'){
                StudentLogsProvider::log(
                    'Student logged out of the system',
                    1,
                    'Authentication'
                );
            }

            $request->user($activeGuard)->update([
                'is_logged_in' => 0
            ]);

            Auth::guard($activeGuard)->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'text' => 'Logged out successfully.',
                'type' => 'success',
            ]);

        } catch (\Exception $e) {
           return response()->json([
                'text' => 'There was a problem logging you out. Please try again.',
                'type' => 'error',
            ]);
        }

    }
}