<?php

namespace App\Http\Controllers;

use App\Models\EducBackground;
use App\Models\FamBackground;
use App\Models\StudentAccount;
use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class FamBackgroundController extends Controller
{

   public function fetchFamilyBackground($id)
    {
        try {

            StudentAccount::findOrFail($id);

            $famBackgrounds = FamBackground::where('student_account_id', $id)->get();
            $famRelations = DB::table('fam_background_relations')->orderBy('id', 'asc')->get();

            // Return clean JSON for React
            return response()->json([
                'records' => $famBackgrounds,
                'relations' => $famRelations,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch family background data. ' . $e->getMessage()
            ], 500);
        }
    }

    // // Create family background
    // public function createFamilyBackground(Request $request)
    // {

    //     $currentStudentId = Auth::id();
        
    //     $validator = Validator::make($request->all(), [
    //         'relation_id'         => 'required|array',
    //         'relation_id.*'       => 'required|integer',

    //         'is_guardian'        => 'required|array',
    //         'is_guardian.*'      => 'required|integer',

    //         'first_name'      => 'required|array',
    //         'first_name.*'    => 'required|string|max:255',

    //         'middle_name'        => 'nullable|array',
    //         'middle_name.*'      => 'nullable|string|max:255',

    //         'last_name'   => 'required|array',
    //         'last_name.*' => 'required|string|max:255', 

    //         'ext_name'           => 'nullable|array',
    //         'ext_name.*'         => 'nullable|string|max:20',

    //         'birthday'           => 'nullable|array',
    //         'birthday.*'         => 'nullable|date',

    //         'occupation'     => 'nullable|array',
    //         'occupation.*'   => 'nullable|string|max:50',

    //         'employer'     => 'nullable|array',
    //         'employer.*'   => 'nullable|string|max:100',
            
    //         'employer_address'     => 'nullable|array',
    //         'employer_address.*'   => 'nullable|string|max:255',

    //         'employer_contact'     => 'nullable|array',
    //         'employer_contact.*'   => 'nullable|string|max:11',
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
    //         $editIds = $request->input('edit_id');
    //         $relations = $request->input('relation_id');
    //         $isGuardians = $request->input('is_guardian', 0);
    //         $firstNames = $request->input('first_name', []);
    //         $middleNames = $request->input('middle_name', []); 
    //         $lastNames = $request->input('last_name', []); 
    //         $extNames = $request->input('ext_name', []); 
    //         $birthdays = $request->input('birthday', []); 
    //         $contactNumbers = $request->input('contact_number', []); 
    //         $emailAddresses = $request->input('email_address', []); 
    //         $occupations = $request->input('occupation', []); 
    //         $employers = $request->input('employer', []); 
    //         $employerAddresses = $request->input('employer_address', []); 
    //         $employerContacts = $request->input('employer_contact', []); 

    //         foreach ($relations as $i => $relationId) {
                
    //             $editId = $editIds[$i] ?? null;
    //             $isGuardian = $isGuardians[$i] ?? 0;
    //             $firstName = $firstNames[$i] ?? null;
    //             $middleName = $middleNames[$i] ?? null;
    //             $lastName = $lastNames[$i] ?? null;
    //             $extName = $extNames[$i] ?? null;
    //             $birthday = $birthdays[$i] ?? null;
    //             $contactNumber = $contactNumbers[$i] ?? null;
    //             $emailAddress = $emailAddresses[$i] ?? null;
    //             $occupation = $occupations[$i] ?? null;
    //             $employer = $employers[$i] ?? null;
    //             $employerAddress = $employerAddresses[$i] ?? null;
    //             $employerContact = $employerContacts[$i] ?? null;

    //             $famBackground = FamBackground::firstOrNew([
    //                 'student_account_id' => $currentStudentId,
    //                 'relation_id' => $relationId,
    //                 'id' => $editId
    //             ]);

    //             if ($isGuardian == 1) {
    //                 FamBackground::where('id', '!=', $editId)
    //                     ->update(['is_guardian' => 0]);
    //             }

    //             $famBackground->is_guardian = $isGuardian;
    //             $famBackground->first_name  = $firstName;
    //             $famBackground->middle_name  = $middleName;
    //             $famBackground->last_name  = $lastName;
    //             $famBackground->ext_name = $extName;
    //             $famBackground->birthday = $birthday;
    //             $famBackground->contact_number = $contactNumber;
    //             $famBackground->email_address = $emailAddress;
    //             $famBackground->occupation = $occupation;
    //             $famBackground->employer = $employer;
    //             $famBackground->employer_address = $employerAddress;
    //             $famBackground->employer_contact = $employerContact;

    //             $famBackground->save();

    //             FamBackground::where('id', $editId)
    //                     ->update(['is_guardian' => 0]);
    //         }

    //         DB::commit();

    //         // Log user activity
    //         UserLogsProvider::log('updated own family background');

    //         if ($request->ajax()) {
    //             return response()->json([
    //                 'message' => 'Student profile update successfully!',
    //                 'type' => 'success',
    //             ], 200);
    //         } else {
    //             // If it's a normal form submission
    //             return redirect()->back()->with('toast', [
    //                 'text' => 'Student profile update successfully!',
    //                 'type' => 'success',
    //             ]);
    //         }

    //     }catch (\Exception $e) {
    //         DB::rollBack();
    //         if ($request->ajax()) {
    //             return response()->json([
    //                 'message' => 'Failed updating student profile!' . $e->getMessage(),
    //                 'type' => 'success',
    //             ], 200);
    //         } else {
    //             return redirect()->back()->with('toast', [
    //                 'text' => 'Failed updating student profile!' . $e->getMessage(),
    //                 'type' => 'success',
    //             ]);
    //         }
    //     }
         
    // }

    // // Update guardian information
    // public function updateGuardian($id)
    // {
    //     DB::beginTransaction();
    //     try{
    //         FamBackground::where('id', $id)
    //             ->update(['is_guardian' => 1]);

    //         FamBackground::where('id', '!=', $id)
    //             ->update(['is_guardian' => 0]);

    //         DB::commit();
                
    //         return response()->json([
    //             'type' => 'success',
    //             'message' => 'Guardian updated successfully!',
    //         ]);

    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         return response()->json([
    //             'type' => 'error',
    //             'message' => 'Failed updating guardian details ' . $e->getMessage(),
    //         ], 500);
    //     }

    // }

    // // Delete family background
    // public function deleteFamilyBackground($id)
    // {
    //     DB::beginTransaction();
    //     try {
    //         $famBackground = FamBackground::with(['student_account'])->findOrFail($id);
    //         $famBackground->delete();

    //         DB::commit();

    //         // Log user activity
    //         UserLogsProvider::log('deleted family background record for account: ' . $famBackground->student_account->first_name . ' ' . $famBackground->student_account->last_name);

    //         return response()->json([
    //             'message' => 'Family background record deleted successfully!',
    //             'type' => 'success',
    //         ], 200);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed to delete educational background record. ' . $e->getMessage(),
    //             'type' => 'error',
    //         ], 500);
    //     }
    // }

}