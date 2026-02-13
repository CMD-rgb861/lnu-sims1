<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\UserAccount;
use App\Models\UserAccountRole;
use App\Models\UserRole;
use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

use Carbon\Carbon;
use Yajra\DataTables\Facades\DataTables;


class CollegeController extends Controller
{
    
    // Fetch colleges for dropdown
    public function data()
    {
        $colleges = College::all();

        return response()->json([
            'id' => $colleges->id,
            'college_name' => $colleges->college_name,
            'college_acronym' => $colleges->college_acronym,
        ]);
    }

    // // Show colleges index
    // public function index()
    // {
    //     return view('pages.employees.system_management.colleges_layout');
    // }

    // // Fetch colleges
    // public function fetchColleges()
    // {
    //     $colleges = College::with(['dean'])->get();

    //     return DataTables::of($colleges)
    //         ->editColumn('created_at', function($colleges) {
    //             return Carbon::parse($colleges->created_at)->format('m-d-Y h:i A');
    //         })
    //         ->editColumn('updated_at', function($colleges) {
    //             return Carbon::parse($colleges->updated_at)->format('m-d-Y h:i A');
    //         })
    //         ->addColumn('dean', function($colleges) {
    //         if ($colleges->dean) {
    //             $first = $colleges->dean->first_name;
    //             $last = $colleges->dean->last_name;

    //             return "{$first} {$last}";
    //         }
    //         return 'Unknown';
    //         })
    //         ->make(true);
    // }

    // // Create colleges
    // public function createCollege(Request $request)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'college_name' => 'required|string|max:255|unique:colleges,college_name',
    //         'college_acronym'=> 'required|string|max: 10|unique:colleges,college_acronym',
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
    //         $college = new College();

    //         // Handle form fields 
    //         $college->college_name = $request->college_name;
    //         $college->college_acronym = $request->college_acronym;

    //         $college->save();

    //         DB::commit();

    //         //Log user activity
    //         UserLogsProvider::log(
    //             'Logged in on the system',
    //             1,
    //             'Authentication'
    //         );

    //         return redirect()->back()->with('toast', [
    //             'text' => 'College successfully created!',
    //             'type' => 'success',
    //         ]);

    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         return redirect()->back()->with('toast', [
    //             'text' => 'Failed creating new college.' . $e->getMessage(),
    //             'type' => 'error',
    //         ]);
    //     }
         
    // }

    // // Edit college
    // public function editCollege($id)
    // {
    //     $college = College::find($id);
    //     return response()->json([
    //         'id' => $college->id,
    //         'college_name' => $college->college_name,
    //         'college_acronym' => $college->college_acronym,
    //     ]);
    // }

    // // Update college
    // public function updateCollege(Request $request, $id)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'college_name' => 'required|string|max:255',
    //         'college_acronym'=> 'required|string|max:10'
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
    //         $updateCollege = College::findOrFail($id);
    //         $updateCollege->college_name = $request->college_name;
    //         $updateCollege->college_acronym = $request->college_acronym;

    //         $updateCollege->save();

    //         DB::commit();

    //         //Log user activity
    //         UserLogsProvider::log('updated college: ' . $updateCollege->college_name);

    //         return response()->json([
    //             'message' => 'College succesfully updated!',
    //             'type' => 'success',
    //         ]);

    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed to update college.' . $e->getMessage(),
    //             'type' => 'error',
    //         ]);
    //     }
         
    // }

    // // Delete college
    // public function deleteCollege($id)
    // {
        
    //     try {
    //         DB::beginTransaction();

    //         $college = College::findOrFail($id);
    //         $college->delete();

    //         DB::commit();

    //         // Log user activity
    //         UserLogsProvider::log('deleted college: ' . $college->college_name);

    //         return response()->json([
    //             'message' => 'College deleted successfully!',
    //             'type' => 'success',
    //         ], 200);

    //     } catch (\Exception $e) {
    //         DB::rollback();
    //         return response()->json([
    //             'message' => 'Failed to delete college. ' . $e->getMessage(),
    //             'type' => 'error',
    //         ], 500);
    //     }
    // }
    
}