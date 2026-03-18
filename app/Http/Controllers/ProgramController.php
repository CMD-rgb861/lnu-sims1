<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\Department;
use App\Models\Program;
use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Yajra\DataTables\Facades\DataTables;


class ProgramController extends Controller
{

    // Fetch all programs for dropdown
    public function fetchPrograms()
    {
        $programs = Cache::remember('programs_dropdown', 86400, function () {
            return Program::select('id', 'program_name', 'program_level_id', 'dept_id')
                          ->where('status', '=', 1)
                          ->orderBy('program_name', 'asc')
                          ->get();
        });
        return response()->json($programs);
    }

    // // Show programs index
    // public function index()
    // {
    //     $departments = Department::all();
    
    //     return view('pages.employees.system_management.programs_layout', compact('departments'));
    // }

    // // Fetch programs
    // public function fetchPrograms()
    // {
    //     $programs = Program::with(['department', 'coordinator'])->get();

    //     return DataTables::of($programs)
    //         ->editColumn('created_at', function($programs) {
    //             return Carbon::parse($programs->created_at)->format('m-d-Y h:i A');
    //         })
    //         ->editColumn('updated_at', function($programs) {
    //             return Carbon::parse($programs->updated_at)->format('m-d-Y h:i A');
    //         })
    //         ->addColumn('department', function($programs) {
    //         if ($programs->department) {
    //             $dept_name = $programs->department->dept_name;

    //             return "$dept_name";
    //         }
    //         return 'Unknown';
    //         })
    //         ->addColumn('coordinator', function($programs) {
    //         if ($programs->coordinator) {
    //             $first = $programs->coordinator->first_name;
    //             $last = $programs->coordinator->last_name;

    //             return "{$first} {$last}";
    //         }
    //         return 'Unknown';
    //         })
    //         ->make(true);
    // }

    // // Create programs
    // public function createProgram(Request $request)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'program_name' => 'required|string|max:255|unique:programs,program_name',
    //         'program_acronym'=> 'required|string|max: 10|unique:programs,program_acronym',
    //         'dept_id'=> 'required',
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
    //         $program = new Program();

    //         // Handle form fields 
    //         $program->program_name = $request->program_name;
    //         $program->program_acronym = $request->program_acronym;
    //         $program->dept_id = $request->dept_id;
    //         $program->status = 1;

    //         $program->save();

    //         DB::commit();

    //         //Log user activity
    //         UserLogsProvider::log('created a new program: ' . $program->program_name);

    //         return redirect()->back()->with('toast', [
    //             'text' => 'Program successfully created!',
    //             'type' => 'success',
    //         ]);

    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         return redirect()->back()->with('toast', [
    //             'text' => 'Failed creating new program.' . $e->getMessage(),
    //             'type' => 'error',
    //         ]);
    //     }

            // Cache::forget('programs_dropdown');
         
    // }

    // // Edit program
    // public function editProgram($id)
    // {
    //     $program = Program::find($id);
    //     return response()->json([
    //         'id' => $program->id,
    //         'program_name' => $program->program_name,
    //         'program_acronym' => $program->program_acronym,
    //         'dept_id' => $program->dept_id,
    //     ]);
    // }

    // // Update program
    // public function updateProgram(Request $request, $id)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'program_name' => 'required|string|max:255',
    //         'program_acronym'=> 'required|string|max: 10',
    //         'dept_id'=> 'required',
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
    //         $updateProgram = Program::findOrFail($id);
    //         $updateProgram->program_name = $request->program_name;
    //         $updateProgram->program_acronym = $request->program_acronym;
    //         $updateProgram->dept_id = $request->dept_id;

    //         $updateProgram->save();

    //         DB::commit();

    //         //Log user activity
    //         UserLogsProvider::log('updated program: ' . $updateProgram->program_name);

    //         return response()->json([
    //             'message' => 'Program succesfully updated!',
    //             'type' => 'success',
    //         ]);

    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed to update program.' . $e->getMessage(),
    //             'type' => 'error',
    //         ]);
    //     }
         
    // }

    // // Update program status
    // public function updateProgramStatus(Request $request, $id)
    // {
    //     DB::beginTransaction();
    //     try{
    //         $updateProgram = Program::findOrFail($id);
    //         $updateProgram->status = $request->status;

    //         $updateProgram->save();

    //         DB::commit();

    //         //Log user activity
    //         UserLogsProvider::log('updated program status: ' . $updateProgram->program_name);

    //         return response()->json([
    //             'message' => 'Program status succesfully updated!',
    //             'type' => 'success',
    //         ]);

    //     }catch(\Exception $e){
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed to update program status.' . $e->getMessage(),
    //             'type' => 'error',
    //         ]);
    //     }
         
    // }

    // // Delete program
    // public function deleteProgram($id)
    // {
    //     DB::beginTransaction();
    //     try {
    //         $program = Program::findOrFail($id);
    //         $program->delete();

    //         DB::commit();

    //         // Log user activity
    //         UserLogsProvider::log('deleted program: ' . $program->program_name);

    //         return response()->json([
    //             'message' => 'Program deleted successfully!',
    //             'type' => 'success',
    //         ], 200);

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed to delete program. ' . $e->getMessage(),
    //             'type' => 'error',
    //         ], 500);
    //     }
    // }
    
}