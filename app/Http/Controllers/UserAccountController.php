<?php

namespace App\Http\Controllers;

use App\Models\UserAccount;
use App\Models\UserRole;
use App\Models\UserType;
use App\Mail\NewEmployeeAccountMail;
use App\Models\College;
use App\Models\Program;
use App\Models\UserAccountRole;
use App\Notifications\NotificationHandler;
use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use Yajra\DataTables\Facades\DataTables;

class UserAccountController extends Controller
{
    // Show emmployee accounts index
    public function employeeAccountsIndex()
    {
        $userTypeId = '';
        $userTypes = UserType::all();
        $userTypeDesc = '';
        $employeeName = '';
        $userRoles = UserRole::all();
        $programs = Program::all();
        $colleges = College::all();

        return view('pages.employees.user_management.employee_accounts_layout', compact('userTypes', 'userRoles', 'programs', 'colleges', 'userTypeId', 'userTypeDesc', 'employeeName'));
    }

    // Fetch employee accounts
    public function fetchEmployeeAccounts()
    {
        $currentUser = Auth::user();

        $employeeAccounts = UserAccount::with(['user_type'])
                                        ->where('id', '!=', $currentUser->id)
                                        ->get();

        $formattedAccounts = $employeeAccounts->map(function($employee) {
            return [
                'id'           => $employee->id, 
                'id_number'    => (string) $employee->id_number, 
                'display_name' => $employee->display_name,
                'first_name'   => $employee->first_name,
                'last_name'    => $employee->last_name,
                'user_type'    => $employee->user_type ? $employee->user_type->user_type_description : 'Unknown',
                'created_at'   => $employee->created_at ? Carbon::parse($employee->created_at)->format('m-d-Y h:i A') : null,
                'updated_at'   => $employee->updated_at ? Carbon::parse($employee->updated_at)->format('m-d-Y h:i A') : null,
                'last_login'   => $employee->last_login ? Carbon::parse($employee->last_login)->format('m-d-Y h:i A') : null,
                'is_verified'  => $employee->profile_verified === true ? 'Verified' : 'Unverified',
            ];
        });

        // 3. Return a standard JSON response
        return response()->json($formattedAccounts);
    }

    // Update basic account details from the account settings page
    public function updateAccountDetails(Request $request)
    {
        $id = $request->id;
        $userAccount = UserAccount::find($id);

        $validated = $request->validate([
            'email_address' => 'required|email|unique:user_accounts,email_address,' . $userAccount->id,
            'first_name' => 'required|string|max:255|unique:user_accounts,first_name,' . $userAccount->id,
            'last_name' => 'required|string|max:255|unique:user_accounts,last_name,' . $userAccount->id,
        ]);

        $userAccount->update($validated);

        // Log user activity
        UserLogsProvider::log(
            'Updated account password',
            3,
            'Account Settings'
        );

        return response()->json([
            'type'  => 'success',
            'message' => 'Account preferences updated successfully.'
        ]);
    }

    // Update account password from the account settings page
    public function updateAccountSecurity(Request $request)
    {
        $id = $request->id;
        $userAccount = UserAccount::find($id);

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $userAccount->update([
            'password' => Hash::make($validated['password']),
        ]);

        $userAccount->tokens()->delete();

        // Log user activity
        UserLogsProvider::log(
            'Updated account password',
            3,
            'Account Settings'
        );

        // Generate notification
        $userAccount->notify(new NotificationHandler(
            'Updated Account Security', 
            'You changed your account password.'
        ));

        return response()->json([
            'type'  => 'success',
            'message' => 'Password updated successfully. Please log in again.'
        ]);
    }

    // // Create employee accounts
    // public function createEmployeeAccount(Request $request)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'id_number' => 'required|string|unique:user_accounts,id_number',
    //         'first_name'=> 'required|string|max:255',
    //         'middle_name'=> 'nullable|max:255',
    //         'last_name'=> 'required|string|max:255',
    //         'email_address'=> 'required|email|max:255|unique:user_accounts,email_address',
    //         'user_roles' => 'required|array|min:1',
    //         'user_roles.*' => 'exists:user_roles,id',
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

    //         // Generate temp password
    //         $temporaryPassword = Str::random(10);
    //         $fullName = $request->first_name . ' ' . $request->last_name;

    //         $userAccount = new UserAccount();
    //         $userAccount->id_number = $request->id_number;
    //         $userAccount->first_name = $request->first_name;
    //         $userAccount->middle_name = $request->middle_name;
    //         $userAccount->last_name = $request->last_name;
    //         $userAccount->email_address = $request->email_address;
    //         $userAccount->user_type_id = $request->user_type_id;
    //         $userAccount->temp_password = Hash::make($temporaryPassword);

    //         $userAccount->save();

    //         $roles = $request->input('user_roles');
    //         $collegeIds = $request->input('college_id', []); 
    //         $programIds = $request->input('program_id', []); 

    //         foreach ($roles as $i => $roleId) {
    //             $collegeId = $collegeIds[$i] ?? null;
    //             $programId = $programIds[$i] ?? null;

    //             DB::table('user_account_roles')->insert([
    //                 'user_account_id' => $userAccount->id,
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
    //                     'dean_id' => $userAccount->id,
    //                     'updated_at' => now(),
    //                 ]);
    //             }

    //             // If Program Head, update coordinator_id of the program
    //             if ($roleId == 5 && $programId) {
    //                 DB::table('programs')->where('id', $programId)->update([
    //                     'coordinator_id' => $userAccount->id,
    //                     'updated_at' => now(),
    //                 ]);
    //             }

    //         }

    //         // If email sending fails silently, Mail::failures() returns failed recipients
    //         try {
    //             Mail::to($request->email_address)->send(new NewEmployeeAccountMail(
    //                 $fullName,
    //                 $temporaryPassword
    //             ));
    //         } catch (\Exception $e) {
    //             return redirect()->back()->with('toast', [
    //                 'text' => 'Failed to send email: ' . $e->getMessage(),
    //                 'type' => 'error',
    //             ]);
    //         }
            

    //         DB::commit();

    //         // Log user activity
    //         UserLogsProvider::log('created a new employee account: ' . $userAccount->first_name . ' ' . $userAccount->last_name);

    //         return redirect()->back()->with('toast', [
    //             'text' => 'Employee account successfully created!',
    //             'type' => 'success',
    //         ]);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return redirect()->back()->with('toast', [
    //             'text' => 'Failed creating new employee account. ' . $e->getMessage(),
    //             'type' => 'error',
    //         ]);
    //     }
         
    // }

    // // Edit employee account
    // public function editEmployeeAccount($id)
    // {
    //     $userAccount = UserAccount::find($id);
    //     return response()->json([
    //         'id' => $userAccount->id,
    //         'id_number' => $userAccount->id_number,
    //         'email_address' => $userAccount->email_address,
    //         'first_name' => $userAccount->first_name,
    //         'middle_name' => $userAccount->middle_name,
    //         'last_name' => $userAccount->last_name
    //     ]);
    // }

    // // Update department
    // public function updateEmployeeAccount(Request $request, $id)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'id_number' => 'required|string|max:10',
    //         'first_name'=> 'required|string|max:255',
    //         'middle_name'=> 'max:255',
    //         'last_name'=> 'required|string|max:255',
    //         'email_address'=> 'required|email|max:255'
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
    //         $updateUserAccount = UserAccount::findOrFail($id);
    //         $updateUserAccount->id_number = $request->id_number;
    //         $updateUserAccount->email_address = $request->email_address;
    //         $updateUserAccount->first_name = $request->first_name;
    //         $updateUserAccount->middle_name = $request->middle_name;
    //         $updateUserAccount->last_name = $request->last_name;

    //         $updateUserAccount->save();

    //         DB::commit();

    //         //Log user activity
    //         UserLogsProvider::log('updated employee account details for: ' . $updateUserAccount->first_name . ' ' . $updateUserAccount->last_name);

    //         return response()->json([
    //             'message' => 'User account succesfully updated!',
    //             'type' => 'success',
    //         ]);

    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed to update user account.' . $e->getMessage(),
    //             'type' => 'error',
    //         ]);
    //     }
         
    // }

    // // Delete department
    // public function deleteEmployeeAccount($id)
    // {
    //     DB::beginTransaction();
    //     try {
    //         $userAccount = UserAccount::findOrFail($id);
    //         $userAccount->delete();
            
    //         DB::commit();
            
    //         // Log user activity
    //         UserLogsProvider::log('deleted user acount: ' . $userAccount->first_name . ' ' . $userAccount->last_name);

    //         return response()->json([
    //             'message' => 'User account deleted successfully!',
    //             'type' => 'success',
    //         ], 200);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed to delete user account. ' . $e->getMessage(),
    //             'type' => 'error',
    //         ], 500);
    //     }
    // }

}
