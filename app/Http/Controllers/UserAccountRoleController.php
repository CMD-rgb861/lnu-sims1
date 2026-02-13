<?php

namespace App\Http\Controllers;

use App\Models\UserAccount;
use App\Models\UserRole;
use App\Models\UserType;
use App\Mail\NewEmployeeAccountMail;
use App\Models\College;
use App\Models\Program;
use App\Models\UserAccountRole;
use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Yajra\DataTables\Facades\DataTables;

class UserAccountRoleController extends Controller
{
    // // Fetch employee account config
    // public function fetchEmployeeAccountConfig($id)
    // {
    //     $user = UserAccount::with('roles')->findOrFail($id);

    //     return response()->json([
    //         'user_type_id' => $user->user_type_id,
    //         'user_roles' => $user->roles->pluck('id')
    //     ]);
    // }

    // // Show employee accounts role index
    // public function employeeAccountsRoleIndex()
    // {
    //     $id = request('userId');
        
    //     $employeeAccount = UserAccount::findOrFail($id);
    //     $userTypeDesc = $employeeAccount->user_type->user_type_description;
    //     $employeeName = $employeeAccount->first_name . ' ' . $employeeAccount->last_name;
    //     $userTypes = UserType::all();
    //     $userRoles = UserRole::all();
    //     $colleges = College::all();
    //     $programs = Program::all();

    //     return view('pages.employees.user_management.employee_accounts_layout', compact('employeeAccount','userTypes', 'userRoles', 'colleges', 'programs', 'userTypeDesc', 'employeeName'));
    // }

    // // Fetch employee account roles
    // public function fetchEmployeeAccountRoles(Request $request)
    // {
    //     $userId = $request->user_id;

    //     $roles = UserAccountRole::with([
    //         'role',
    //         'role_dean',
    //         'role_program_coordinator',
    //         'role_enrolling_teacher'
    //     ])->where('user_account_id', $userId);

    //     return DataTables::of($roles)
    //         ->addColumn('role_description', function ($role) {
    //             return $role->role->user_role_description ?? 'Unknown';
    //         })
    //         ->addColumn('college', function ($role) {
    //             return $role->role_dean->college_name ?? 'N/A';
    //         })
    //         ->addColumn('program', function ($role) {
    //             if ($role->role->user_role_description === 'Enrolling Teacher') {
    //                 return $role->role_enrolling_teacher->program_name ?? 'N/A';
    //             } else if ($role->role->user_role_description === 'Program Head') {
    //                 return $role->role_program_coordinator->program_name ?? 'N/A';
    //             } else if ($role->role->user_role_description === 'Dean') {
    //                 return $role->role_program_coordinator->program_name ?? 'N/A';
    //             } else{
    //                 return 'N/A';
    //             }
    //         })
    //         ->editColumn('assigned_on', function ($role) {
    //             return optional($role->created_at)->format('m-d-Y h:i A');
    //         })
    //         ->editColumn('updated_at', function ($role) {
    //             return optional($role->updated_at)->format('m-d-Y h:i A');
    //         })
    //         ->make(true);
    // }

    // // Create employee accounts
    // public function createEmployeeAccountRole(Request $request)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'user_account_id' => 'required',
    //         'user_role_id'=> 'required'
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

    //     try {
    //         $id = request('userId');
    //         $employeeName = $request->employee_name;
    //         $roles = $request->input('user_roles');
    //         $collegeIds = $request->input('college_id', []); 
    //         $programIds = $request->input('program_id', []); 

    //         foreach ($roles as $i => $roleId) {
    //             $collegeId = $collegeIds[$i] ?? null;
    //             $programId = $programIds[$i] ?? null;

    //             $roleDescription = DB::table('user_roles')
    //                 ->where('id', $roleId)
    //                 ->value('user_role_description');

    //             DB::table('user_account_roles')->insert([
    //                 'user_account_id' => $id,
    //                 'user_role_id' => $roleId,
    //                 'college_id' => $collegeId,
    //                 'program_id' => $programId,
    //                 'created_at' => now(),
    //                 'updated_at' => now(),
    //                 'is_active' => 1,
    //             ]);

    //             // If Dean, update dean_id of the college
    //             if ($roleId == 4 && $collegeId) {
    //                 DB::table('colleges')->where('id', $collegeId)->update([
    //                     'dean_id' => $id,
    //                     'updated_at' => now(),
    //                 ]);
    //             }

    //             // If Program Head, update coordinator_id of the program
    //             if ($roleId == 5 && $programId) {
    //                 DB::table('programs')->where('id', $programId)->update([
    //                     'coordinator_id' => $id,
    //                     'updated_at' => now(),
    //                 ]);
    //             }

    //         }

    //         DB::commit();

    //         // Log user activity
    //         UserLogsProvider::log('added new role: ' . $roleDescription . ' to ' . $employeeName);

    //         return redirect()->back()->with('toast', [
    //             'text' => 'Role successfully added!',
    //             'type' => 'success',
    //         ]);

    //         } catch (\Exception $e) {
    //             DB::rollBack();
    //             return redirect()->back()->with('toast', [
    //                 'text' => 'Failed adding new role ' . $e->getMessage(),
    //                 'type' => 'error',
    //             ]);
    //         }
         
    // }

    // // Update program status
    // public function updateEmployeeAccountRoleStatus(Request $request, $userId, $roleId)
    // {
    //     DB::beginTransaction();
    //     try {
    //         $role = UserAccountRole::where('id', $roleId)
    //             ->where('user_account_id', $userId)
    //             ->firstOrFail();
    //         $roleDescription = $role->role->user_role_description;

    //         $user = UserAccount::findOrFail($userId);
    //         $userAccountName = $user->first_name . ' ' . $user->last_name;

    //         $role->is_active = $request->is_active;
    //         $role->save();

    //         DB::commit();

    //         // Log user activity
    //         UserLogsProvider::log("Updated role status for user: {$userAccountName}, for the role: {$roleDescription}");

    //         return response()->json([
    //             'message' => 'Role status successfully updated!',
    //             'type' => 'success',
    //         ]);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed to update role status. ' . $e->getMessage(),
    //             'type' => 'error',
    //         ]);
    //     }
    // }

    // // Delete employee account role
    // public function deleteEmployeeAccountRole($userId, $roleId)
    // {
    //     DB::beginTransaction();
    //     try {
    //         $role = UserAccountRole::findOrFail($roleId);
    //         $roleDescription = $role->role->user_role_description;

    //         $user = UserAccount::findOrFail($userId);
    //         $userAccountName = $user->first_name . ' ' . $user->last_name;
    //         $role->delete();

    //         DB::commit();

    //         // Log user activity
    //         UserLogsProvider::log("Removed role: {$roleDescription} from: {$userAccountName}");

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
