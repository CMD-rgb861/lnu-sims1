<?php

namespace App\Http\Controllers;

use App\Models\UserRole;
use App\Providers\UserLogsProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;

class UserRoleController extends Controller
{
    // Fetch user roles for dropdown
    public function data()
    {
        $userRoles = UserRole::all();

        return response()->json([
            'id' => $userRoles->id,
            'user_role_description' => $userRoles->user_role_description,
            'user_role_level' => $userRoles->user_role_level,
        ]);
    }

    // // Show user types index
    // public function index()
    // {
    //     return view('pages.employees.system_management.user_roles_layout');
    // }

    // // Fetch colleges
    // public function fetchUserRoles()
    // {
    //     $userRoles = UserRole::orderBy('user_role_level', 'ASC')->get();

    //     return DataTables::of($userRoles)
    //         ->editColumn('created_at', function($userRoles) {
    //             return Carbon::parse($userRoles->created_at)->format('m-d-Y h:i A');
    //         })
    //         ->editColumn('updated_at', function($userRoles) {
    //             return Carbon::parse($userRoles->updated_at)->format('m-d-Y h:i A');
    //         })
    //         ->make(true);
    // }

    // // Create user roles
    // public function createUserRole(Request $request)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'user_role_description' => 'required|string|max:255|unique:user_roles,user_role_description',
    //         'user_role_level'=> 'required|integer|max: 10'
    //     ]);

    //     if ($validator->fails()) 
    //     {
    //         if ($request->ajax()) 
    //         {
    //             return response()->json([
    //                 'errors' => $validator->errors(),
    //             ], 422);
    //         }
    //     }

    //     DB::beginTransaction();

    //     try{
    //         $userRole = new UserRole();

    //         // Handle form fields 
    //         $userRole->user_role_description = $request->user_role_description;
    //         $userRole->user_role_level = $request->user_role_level;

    //         $userRole->save();

    //         DB::commit();

    //         //Log user activity
    //         UserLogsProvider::log('created a new user role: ' . $userRole->user_role_description);

    //         return redirect()->back()->with('toast', [
    //             'text' => 'User role successfully createed!',
    //             'type' => 'success',
    //         ]);

    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         return redirect()->back()->with('toast', [
    //             'text' => 'Failed creating new user role.' . $e->getMessage(),
    //             'type' => 'error',
    //         ]);
    //     }
         
    // }

    // // Edit user roles
    // public function editUserRole($id)
    // {
    //     $userRole = UserRole::find($id);
    //     return response()->json([
    //         'id' => $userRole->id,
    //         'user_role_description' => $userRole->user_role_description,
    //         'user_role_level' => $userRole->user_role_level,
    //     ]);
    // }

    // // Update user role
    // public function updateUserRole(Request $request, $id)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'user_role_description' => 'required|string|max:255',
    //         'user_role_level'=> 'required|integer|max:10'
    //     ]);

    //     if ($validator->fails()) 
    //     {
    //         if ($request->ajax()) 
    //         {
    //             return response()->json([
    //                 'errors' => $validator->errors(),
    //             ], 422);
    //         }
    //     }

    //     DB::beginTransaction();

    //     try{
    //         $updateUserRole = UserRole::findOrFail($id);
    //         $updateUserRole->user_role_description = $request->user_role_description;
    //         $updateUserRole->user_role_level = $request->user_role_level;

    //         $updateUserRole->save();

    //         DB::commit();

    //         //Log user activity
    //         UserLogsProvider::log('updated college: ' . $updateUserRole->user_role_description);

    //         return response()->json([
    //             'message' => 'User role succesfully updated!',
    //             'type' => 'success',
    //         ]);

    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed to update user role.' . $e->getMessage(),
    //             'type' => 'error',
    //         ]);
    //     }
         
    // }

    // // Delete user role
    // public function deleteUserRole($id)
    // {
    //     DB::beginTransaction();
    //     try {
    //         $userRole = UserRole::findOrFail($id);
    //         $userRole->delete();

    //         DB::commit();
            
    //         // Log user activity
    //         UserLogsProvider::log('deleted user role: ' . $userRole->user_role_description);

    //         return response()->json([
    //             'message' => 'User role deleted successfully!',
    //             'type' => 'success',
    //         ], 200);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed to delete user role. ' . $e->getMessage(),
    //             'type' => 'error',
    //         ], 500);
    //     }
    // }
}
