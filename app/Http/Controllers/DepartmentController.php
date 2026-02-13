<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\Department;

use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;


class DepartmentController extends Controller
{
    // Fetch departments for dropdown
    public function data()
    {
        $departments = Department::all();

        return response()->json([
            'id' => $departments->id,
            'dept_name' => $departments->dept_name,
            'college_id' => $departments->college_id,
        ]);
    }

    // // Show departments index
    // public function index()
    // {
    //     $colleges = College::all();
    
    //     return view('pages.employees.system_management.departments_layout', compact('colleges'));
    // }

    // // Fetch departments
    // public function fetchDepartments()
    // {
    //     $departments = Department::with(['college', 'chair'])->get();

    //     return DataTables::of($departments)
    //         ->editColumn('created_at', function($departments) {
    //             return Carbon::parse($departments->created_at)->format('m-d-Y h:i A');
    //         })
    //         ->editColumn('updated_at', function($departments) {
    //             return Carbon::parse($departments->updated_at)->format('m-d-Y h:i A');
    //         })
    //         ->addColumn('college', function($departments) {
    //         if ($departments->college) {
    //             $college_name = $departments->college->college_name;

    //             return "$college_name";
    //         }
    //         return 'Unknown';
    //         })
    //         ->addColumn('chair', function($departments) {
    //         if ($departments->chair) {
    //             $first = $departments->chair->first_name;
    //             $last = $departments->chair->last_name;

    //             return "{$first} {$last}";
    //         }
    //         return 'Unknown';
    //         })
    //         ->make(true);
    // }

    // // Create departments
    // public function createDepartment(Request $request)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'dept_name' => 'required|string|max:255|unique:departments,dept_name',
    //         'dept_acronym'=> 'required|string|max: 10|unique:departments,dept_acronym',
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
    //         $department = new Department();

    //         // Handle form fields 
    //         $department->dept_name = $request->dept_name;
    //         $department->dept_acronym = $request->dept_acronym;
    //         $department->college_id = $request->college_id;

    //         $department->save();

    //         DB::commit();

    //         //Log user activity
    //         UserLogsProvider::log('created a new department: ' . $department->dept_name);

    //         return redirect()->back()->with('toast', [
    //             'text' => 'Department successfully created!',
    //             'type' => 'success',
    //         ]);

    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         return redirect()->back()->with('toast', [
    //             'text' => 'Failed creating new department.' . $e->getMessage(),
    //             'type' => 'error',
    //         ]);
    //     }
         
    // }

    // // Edit department
    // public function editDepartment($id)
    // {
    //     $department = Department::find($id);
    //     return response()->json([
    //         'id' => $department->id,
    //         'dept_name' => $department->dept_name,
    //         'dept_acronym' => $department->dept_acronym,
    //         'college_id' => $department->college_id
    //     ]);
    // }

    // // Update department
    // public function updateDepartment(Request $request, $id)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'dept_name' => 'required|string|max:255',
    //         'dept_acronym'=> 'required|string|max:10'
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
    //         $updateDepartment = Department::findOrFail($id);
    //         $updateDepartment->dept_name = $request->dept_name;
    //         $updateDepartment->dept_acronym = $request->dept_acronym;
    //         $updateDepartment->college_id = $request->college_id;

    //         $updateDepartment->save();

    //         DB::commit();

    //         //Log user activity
    //         UserLogsProvider::log('updated department: ' . $updateDepartment->dept_name);

    //         return response()->json([
    //             'message' => 'Department succesfully updated!',
    //             'type' => 'success',
    //         ]);

    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed to update department.' . $e->getMessage(),
    //             'type' => 'error',
    //         ]);
    //     }
         
    // }

    // // Delete department
    // public function deleteDepartment($id)
    // {
    //     DB::beginTransaction();
    //     try {
    //         $department = Department::findOrFail($id);
    //         $department->delete();
            
    //         DB::commit();
            
    //         // Log user activity
    //         UserLogsProvider::log('deleted department: ' . $department->dept_name);

    //         return response()->json([
    //             'message' => 'Department deleted successfully!',
    //             'type' => 'success',
    //         ], 200);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed to delete department. ' . $e->getMessage(),
    //             'type' => 'error',
    //         ], 500);
    //     }
    // }
    
}