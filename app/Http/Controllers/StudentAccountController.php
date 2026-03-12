<?php

namespace App\Http\Controllers;

use App\Mail\NewStudentAccountMail;
use App\Models\Barangay;
use App\Models\College;
use App\Models\Department;
use App\Models\EducBackground;
use App\Models\EnrollmentDetail;
use App\Models\FamBackground;
use App\Models\FamBackgroundRelation;
use App\Models\Municipality;
use App\Models\Program;
use App\Models\Province;
use App\Models\Region;
use App\Models\SchoolYear;
use App\Models\StudentAccount;
use App\Models\StudentProfile;

use App\Providers\StudentLogsProvider;
use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Yajra\DataTables\Facades\DataTables;


class StudentAccountController extends Controller
{

    // // Show student account index
    // public function studentAccountsIndex()
    // {
    //     return view('pages.employees.user_management.student_accounts_layout');
    // }

    // STUDENT ACCOUNT FUNCTIONS 

    // Reusable function for student profile information
    private function getStudentProfileData($id)
    {
        $studentAccount = StudentAccount::findOrFail($id);
        $studentProfile = StudentProfile::where('student_account_id', $id)->first();
        $educBackgrounds = EducBackground::where('student_account_id', $id)->get();
        $famBackgrounds = FamBackground::where('student_account_id', $id)->get();

        $nationalities = DB::table('nationalities')->orderBy('nationality', 'asc')->get();
        $academicLevels = DB::table('educ_background_levels')->orderBy('id', 'asc')->get();
        $famRelations = DB::table('fam_background_relations')->orderBy('id', 'asc')->get();

        $activeEnrollment = $studentAccount->enrollment_detail()
            ->whereHas('school_year', function ($query) {
                $query->where('is_active', 1);
            })
            ->with('school_year')
            ->first();

        $activeSchoolYear = SchoolYear::where('is_active', 1)->first();
        $activeSchoolYearId = $activeSchoolYear->id;

        $previousEnrollments = EnrollmentDetail::where('student_account_id', $id)
                                              ->where('school_year_id', '!=', $activeSchoolYearId)
                                              ->orderBy('school_year_id', 'desc')
                                              ->get();
                                              
        $currentEnrollment = EnrollmentDetail::with('schedule_slot')
                                             ->where('student_account_id', $id)
                                             ->where('school_year_id', $activeSchoolYearId)
                                             ->first();

        return compact(
            'studentAccount',
            'studentProfile',
            'educBackgrounds',
            'famBackgrounds',
            'nationalities',
            'academicLevels',
            'famRelations',
            'activeEnrollment',
            'previousEnrollments',
            'currentEnrollment'
        );
    }

    // Show student profile in employee account
    public function fetchStudentAccountDetails($id)
    {
        $data = $this->getStudentProfileData($id);
        $profile = $data['studentProfile'];
        
        $data['regions'] = Region::all();
        $data['provinces'] = ($profile && $profile->address_region_id)
                    ? Province::where('region_id', $profile->address_region_id)->get() 
                    : [];
        $data['municipalities'] = ($profile && $profile->address_province_id) 
                    ? Municipality::where('province_id', $profile->address_province_id)->get() 
                    : [];
        $data['barangays'] = ($profile && $profile->address_municipality_id)
                    ? Barangay::where('municipality_id', $profile->address_municipality_id)->get() 
                    : [];

        return response()->json($data);
    }

    // Create/Update student's personal information from their own account
    public function updateStudentProfileInfo(Request $request)
    {
        // 1. Validation
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:student_accounts,id', // Safety check added
            'id_number' => 'required|string|min:7|max:10',
            'first_name'=> 'required|string|max:255',
            'middle_name'=> 'max:255',
            'last_name'=> 'required|string|max:255',
            'email_address'=> 'required|max:255',
            'birthday'=> 'required',
            'gender'=> 'required',
            'civil_status'=> 'required',
            'contact_number'=> 'required|digits:11',
            'nationality'=> 'required',
            'blood_type'=> 'required',
            'address_region_id'=> 'required',
            'address_province_id'=> 'required',
            'address_municipality_id'=> 'required',
            'address_barangay_id'=> 'required',
            'address_zip_code'=> 'required',
        ]);

        // Always return JSON 422 if validation fails
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();

        try {
            // 2. Use 'id' to match your React payload
            $studentId = $request->id;

            // Update student account details
            $studentAccount = StudentAccount::findOrFail($studentId);
            $studentAccount->id_number = $request->id_number;
            $studentAccount->email_address = $request->email_address;
            $studentAccount->first_name = $request->first_name;
            $studentAccount->middle_name = $request->middle_name;
            $studentAccount->last_name = $request->last_name;
            $studentAccount->save();

            // Create or update student profile
            $studentProfile = StudentProfile::firstOrNew(['student_account_id' => $studentId]);
            
            foreach ([
                'birthday', 'gender', 'civil_status', 'contact_number', 'nationality', 'blood_type',
                'address_region_id', 'address_province_id', 'address_municipality_id', 'address_barangay_id', 
                'address_street', 'address_zip_code'
            ] as $field) {
                if ($request->filled($field)) {
                    $studentProfile->$field = $request->$field;
                }
            }
            $studentProfile->save();

            DB::commit();

            //Log user activity
            StudentLogsProvider::log(
                'Created/Updated student personal information',
                3,
                'My Profile'
            );

            // 3. Always return a 200 JSON success response
            return response()->json([
                'message' => 'Personal information successfully updated!',
                'type' => 'success',
            ], 200);

        } catch(\Exception $e) {
            DB::rollBack();
        
            return response()->json([
                'message' => 'Failed updating personal information!',
                'error' => $e->getMessage(), 
                'type' => 'error',
            ], 500); 
        }
    }

    // Upload profile picture and e-signature 
    public function uploadStudentPictures(Request $request)
    {
        $request->validate([
            'profile_pic' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'e_signature' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'id' => 'required|integer|exists:student_profiles,student_account_id' 
        ]);

        $studentProfile = StudentProfile::where('student_account_id', $request->id)->firstOrFail();
        $studentNumber = StudentAccount::findOrFail($request->id);

        DB::beginTransaction();

        try {
            // Profile picture
            if ($request->hasFile('profile_pic')) {
                // Delete old file
                if ($studentProfile->profile_pic && Storage::disk('public')->exists($studentProfile->profile_pic)) {
                    Storage::disk('public')->delete($studentProfile->profile_pic);
                }

                $extension = $request->file('profile_pic')->getClientOriginalExtension();
                $customName = "{$studentNumber->id_number}_profile." . $extension; // Added a suffix to avoid overriding

                $path = $request->file('profile_pic')->storeAs('images/profile_pictures',  $customName, 'public');
                $studentProfile->profile_pic = $path;
            }

            // E-signature
            if ($request->hasFile('e_signature')) {
                // Delete old file
                if ($studentProfile->e_signature && Storage::disk('public')->exists($studentProfile->e_signature)) {
                    Storage::disk('public')->delete($studentProfile->e_signature);
                }

                $extension = $request->file('e_signature')->getClientOriginalExtension();
                $customName = "{$studentNumber->id_number}_signature." . $extension; 

                $path = $request->file('e_signature')->storeAs('images/e_signature',  $customName, 'public');
                $studentProfile->e_signature = $path;
            }

            $studentProfile->save();
            $studentProfile->refresh();

            //Log user activity
            StudentLogsProvider::log(
                'Uploaded/Updated profile picture/e-signature',
                5,
                'My Profile'
            );

            DB::commit();

            return response()->json([
                'message' => 'Student pictures updated successfully',
                'type' => 'success',
                'newProfilePicUrl' => $studentProfile->profile_pic ? asset('storage/' . $studentProfile->profile_pic) : null,
                'newSignatureUrl' => $studentProfile->e_signature ? asset('storage/' . $studentProfile->e_signature) : null,
            ], 200);

        } catch(\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed uploading photo.',
                'error' => $e->getMessage(),
                'type' => 'error',
            ], 500);
        }

    }

    // // Show student profile in student account
    // public function studentInformationIndex()
    // {
    //     $id = Auth::id();
    //     $data = $this->getStudentProfileData($id);
    //     $profile = $data['studentProfile'];
        
    //     $regions = Region::all();
    //     $provinces = ($profile && $profile->address_region_id)
    //                 ? Province::where('region_id', $profile->address_region_id)->get() 
    //                 : collect();
    //     $municipalities = ($profile && $profile->address_province_id) 
    //                 ? Municipality::where('province_id', $profile->address_province_id)->get() 
    //                 : collect();
    //     $barangays = ($profile && $profile->address_municipality_id)
    //                 ? Barangay::where('municipality_id', $profile->address_municipality_id)->get() 
    //                 : collect();

    //     return view('pages.students.my_profile.personal_information_layout', $data, compact('regions', 'provinces', 'municipalities', 'barangays'));
    // }

    // // Fetch student accounts
    // public function fetchStudentAccounts(Request $request)
    // {
    //     // 1. Pass the Eloquent Builder instance instead of the final Collection
    //     $query = StudentAccount::with(['student_profile', 'enrollment_detail']);
        
    //     return DataTables::of($query)
    //         ->addColumn('full_name', function ($studentAccount) {

    //             // Middle initial (e.g., "D.")
    //             $middleInitial = $studentAccount->middle_name
    //                 ? strtoupper(substr($studentAccount->middle_name, 0, 1)) . '.'
    //                 : '';

    //             // Extension (ensure it ends with a period, e.g., "Jr.")
    //             $ext = $studentAccount->ext_name
    //                 ? rtrim($studentAccount->ext_name, '.') . '.'
    //                 : '';

    //             // Build full name in order
    //             $parts = [
    //                 $studentAccount->first_name,
    //                 $middleInitial,
    //                 $studentAccount->last_name,
    //                 $ext
    //             ];

    //             return implode(' ', array_filter($parts));
    //         })
    //         ->editColumn('created_at', function($studentAccount) {
    //             // Note: Use $studentAccount for clarity in the callback
    //             // Ensure you import Carbon at the top of your file
    //             return $studentAccount->created_at 
    //                 ? Carbon::parse($studentAccount->created_at)->format('m-d-Y h:i A')
    //                 : null;
    //         })
    //         ->editColumn('updated_at', function($studentAccount) {
    //             return $studentAccount->updated_at
    //                 ? Carbon::parse($studentAccount->updated_at)->format('m-d-Y h:i A')
    //                 : null;
    //         })
    //         ->editColumn('last_login', function($studentAccount) {
    //             return $studentAccount->last_login
    //                 ? Carbon::parse($studentAccount->last_login)->format('m-d-Y h:i A')
    //                 : null;
    //         })
    //         ->addColumn('role', function() {
    //             // This column is static and does not rely on row data, so it's fine.
    //             return session('user_type') && session('user_type') === 'Administrator'
    //                 ? 'Administrator'
    //                 : 'Employee';
    //         })
    //         ->filterColumn('full_name', function($query, $keyword) {
    //             $query->where(function($q) use ($keyword) {
    //                 $q->where('first_name', 'LIKE', "%{$keyword}%")
    //                 ->orWhere('middle_name', 'LIKE', "%{$keyword}%")
    //                 ->orWhere('last_name', 'LIKE', "%{$keyword}%")
    //                 ->orWhere('ext_name', 'LIKE', "%{$keyword}%");
    //             });
    //         })
    //         // 2. Add 'role' to rawColumns if you were returning HTML/buttons, 
    //         // but not necessary here.
    //         ->make(true);
    // }

    // // Create student account
    // public function createStudentAccount(Request $request)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'id_number' => 'required|digits:7|unique:student_accounts,id_number',
    //         'first_name'=> 'required|string|max:255',
    //         'middle_name'=> 'max:255',
    //         'last_name'=> 'required|string|max:255',
    //         'email'=> 'required|max:255',
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
    //         $studentAccount = new StudentAccount();

    //         // Generate temp password
    //         $temporaryPassword = Str::random(10);
    //         $fullName = $request->first_name . ' ' . $request->last_name;

    //         // Handle form fields 
    //         $studentAccount->id_number = $request->id_number;
    //         $studentAccount->first_name = $request->first_name;
    //         $studentAccount->middle_name = $request->middle_name;
    //         $studentAccount->last_name = $request->last_name;
    //         $studentAccount->email_address = $request->email_address;
    //         $studentAccount->status = 1;
    //         $studentAccount->temp_password = Hash::make($temporaryPassword);

    //         $studentAccount->save();

    //         // Email temporary password
    //         try {
    //             Mail::to($request->email_address)->send(new NewStudentAccountMail(
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
    //         UserLogsProvider::log('created a new student account: ' . $studentAccount->first_name . ' ' . $studentAccount->last_name);

    //         return redirect()->back()->with('toast', [
    //             'text' => 'Student account successfully created!',
    //             'type' => 'success',
    //         ]);

    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         return redirect()->back()->with('toast', [
    //             'text' => 'Failed creating new student account.' . $e->getMessage(),
    //             'type' => 'error',
    //         ]);
    //     }
         
    // }

    // public function validateStudentInfo(Request $request) {

    //      $validator = Validator::make($request->all(), [
    //         'id_number' => 'required|string|min:7|max:10',
    //         'first_name'=> 'required|string|max:255',
    //         'middle_name'=> 'max:255',
    //         'last_name'=> 'required|string|max:255',
    //         'email_address'=> 'required|max:255',
    //         'birthday'=> 'required',
    //         'gender'=> 'required',
    //         'civil_status'=> 'required',
    //         'contact_number'=> 'required|digits:11',
    //         'nationality'=> 'required',
    //         'blood_type'=> 'required',
    //         'address_region_id'=> 'required',
    //         'address_province_id'=> 'required',
    //         'address_municipality_id'=> 'required',
    //         'address_barangay_id'=> 'required',
    //         'address_zip_code'=> 'required',
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

    //     return response()->json(['status' => 'ok']);
    // }

    // // Create student profile
    // public function updateStudentProfileInfo(Request $request)
    // {
    //     // 1. Validation
    //     $validator = Validator::make($request->all(), [
    //         'id' => 'required|exists:student_accounts,id', // Safety check added
    //         'id_number' => 'required|string|min:7|max:10',
    //         'first_name'=> 'required|string|max:255',
    //         'middle_name'=> 'max:255',
    //         'last_name'=> 'required|string|max:255',
    //         'email_address'=> 'required|max:255',
    //         'birthday'=> 'required',
    //         'gender'=> 'required',
    //         'civil_status'=> 'required',
    //         'contact_number'=> 'required|digits:11',
    //         'nationality'=> 'required',
    //         'blood_type'=> 'required',
    //         'address_region_id'=> 'required',
    //         'address_province_id'=> 'required',
    //         'address_municipality_id'=> 'required',
    //         'address_barangay_id'=> 'required',
    //         'address_zip_code'=> 'required',
    //     ]);

    //     // Always return JSON 422 if validation fails
    //     if ($validator->fails()) {
    //         return response()->json([
    //             'errors' => $validator->errors(),
    //         ], 422);
    //     }

    //     DB::beginTransaction();

    //     try {
    //         // 2. Use 'id' to match your React payload
    //         $studentId = $request->id;

    //         // Update student account details
    //         $studentAccount = StudentAccount::findOrFail($studentId);
    //         $studentAccount->id_number = $request->id_number;
    //         $studentAccount->email_address = $request->email_address;
    //         $studentAccount->first_name = $request->first_name;
    //         $studentAccount->middle_name = $request->middle_name;
    //         $studentAccount->last_name = $request->last_name;
    //         $studentAccount->save();

    //         // Create or update student profile
    //         $studentProfile = StudentProfile::firstOrNew(['student_account_id' => $studentId]);
            
    //         foreach ([
    //             'birthday', 'gender', 'civil_status', 'contact_number', 'nationality', 'blood_type',
    //             'address_region_id', 'address_province_id', 'address_municipality_id', 'address_barangay_id', 
    //             'address_street', 'address_zip_code'
    //         ] as $field) {
    //             // $request->filled() ignores null/empty values from React
    //             if ($request->filled($field)) {
    //                 $studentProfile->$field = $request->$field;
    //             }
    //         }
    //         $studentProfile->save();

    //         DB::commit();

    //         // Log user activity
    //         StudentLogsProvider::log(
    //             'Student logged in on the system',
    //             1,
    //             'Authentication'
    //         );

    //         // 3. Always return a 200 JSON success response
    //         return response()->json([
    //             'message' => 'Personal information successfully updated!',
    //             'type' => 'success',
    //         ], 200);

    //     } catch(\Exception $e) {
    //         DB::rollBack();
            
    //         // 4. Return a 500 error code so Axios knows it failed
    //         return response()->json([
    //             'message' => 'Failed updating personal information!',
    //             'error' => $e->getMessage(), // Optional: Helps you debug in React console
    //             'type' => 'error',
    //         ], 500); 
    //     }
    // }

    // // Finish initial student profile update process
    // public function finishStudentProfileUpdate(Request $request)
    // {
    //     DB::beginTransaction();
    //     $studentProfile = StudentProfile::where('student_account_id', $request->userId)->first();

    //     try{
    //         if ($studentProfile) {
    //             $studentProfile->profile_updated = 1;
    //             $studentProfile->save();

    //             DB::commit();

    //             return response()->json([
    //                 'message' => 'Student profile update finished. You may now access other POES functionalities',
    //                 'type' => 'success',
    //             ], 200);
    //         }
    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'There was a problem finishing the update process. Please try again!' . $e->getMessage(),
    //             'type' => 'error',
    //         ], 200);
    //     }
    // }

    // // Edit student account
    // public function editStudentAccount($id)
    // {
    //     $studentAccount = StudentAccount::find($id);
    //     return response()->json([
    //         'id' => $studentAccount->id,
    //         'id_number' => $studentAccount->id_number,
    //         'email_address' => $studentAccount->email_address,
    //         'first_name' => $studentAccount->first_name,
    //         'middle_name' => $studentAccount->middle_name,
    //         'last_name' => $studentAccount->last_name
    //     ]);
    // }

    // // Edit student profile info
    // public function editStudentProfileInfo($id)
    // {
    //     $studentProfile = StudentProfile::where('student_account_id', $id)->first();
        
    //     if($studentProfile)
    //     {
    //         return response()->json([
    //             'birthday' => $studentProfile->birthday,
    //             'gender' => $studentProfile->gender,
    //             'civil_status' => $studentProfile->civil_status,
    //             'nationality' => $studentProfile->nationality,
    //             'blood_type' => $studentProfile->blood_type,
    //             'contact_number'=> $studentProfile->contact_number,
    //             'address_region_id' => $studentProfile->address_region_id,
    //             'address_province_id' => $studentProfile->address_province_id,
    //             'address_municipality_id' => $studentProfile->address_municipality_id,
    //             'address_barangay_id' => $studentProfile->address_barangay_id,
    //             'address_street' => $studentProfile->address_street,
    //             'address_zip_code' => $studentProfile->address_zip_code
    //         ]);
    //     }else
    //     {
    //         return response()->json([
    //             'message' => 'Student profile not yet updated'
    //         ]);
    //     }
        
    // }

    // // Update student account
    // public function updateStudentAccount(Request $request, $id)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'id_number' => 'required|string|min:7|max:10',
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
    //         $updateStudentAccount = StudentAccount::findOrFail($id);
    //         $updateStudentAccount->id_number = $request->id_number;
    //         $updateStudentAccount->email_address = $request->email_address;
    //         $updateStudentAccount->first_name = $request->first_name;
    //         $updateStudentAccount->middle_name = $request->middle_name;
    //         $updateStudentAccount->last_name = $request->last_name;

    //         $updateStudentAccount->save();

    //         DB::commit();

    //         //Log user activity
    //         UserLogsProvider::log('updated student account details for: ' . $updateStudentAccount->first_name . ' ' . $updateStudentAccount->last_name);

    //         if ($request->ajax()) {
    //             return response()->json([
    //                 'message' => 'Student account successfully updated!',
    //                 'type' => 'success',
    //             ], 200);
    //         } else {
    //             // If it's a normal form submission
    //             return redirect()->back()->with('toast', [
    //                 'text' => 'Student account successfully updated!',
    //                 'type' => 'success',
    //             ]);
    //         }

    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         if ($request->ajax()) {
    //             return response()->json([
    //                 'message' => 'Failed updating student account!' . $e->getMessage(),
    //                 'type' => 'success',
    //             ], 200);
    //         } else {
    //             // If it's a normal form submission
    //             return redirect()->back()->with('toast', [
    //                 'text' => 'Failed updating student account!' . $e->getMessage(),
    //                 'type' => 'success',
    //             ]);
    //         }
    //     }
         
    // }

    // // Delete student account
    // public function deleteStudentAccount($id)
    // {
    //     DB::beginTransaction();
    //     try {
    //         $studentAccount = StudentAccount::with(['student_profile'])->findOrFail($id);
    //         $studentAccount->delete();
            
    //         DB::commit();

    //         // Log user activity
    //         UserLogsProvider::log('deleted student acount: ' . $studentAccount->first_name . ' ' . $studentAccount->last_name);

    //         return response()->json([
    //             'message' => 'Student account deleted successfully!',
    //             'type' => 'success',
    //         ], 200);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed to delete student account. ' . $e->getMessage(),
    //             'type' => 'error',
    //         ], 500);
    //     }
    // }
    
}