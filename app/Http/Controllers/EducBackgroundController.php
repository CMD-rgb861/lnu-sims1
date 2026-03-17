<?php

namespace App\Http\Controllers;

use App\Models\EducBackground;
use App\Models\StudentAccount;
use App\Providers\StudentLogsProvider;
use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class EducBackgroundController extends Controller
{

    public function fetchEducationalBackground($id)
    {
        // Assuming you have an API route like: GET /api/students/{id}/education
        $educBackgrounds = EducBackground::with('school') // <-- MUST HAVE THIS
            ->where('student_account_id', $id)
            ->get();
        $academicLevels = DB::table('educ_background_levels')->orderBy('id', 'asc')->get();

        return response()->json([
            'records' => $educBackgrounds,
            'levels' => $academicLevels,
        ]);
    }

    
    // Fetch academic levels for initial profile update
    public function fetchAcademicLevels()
    { 
        $academicLevels = DB::table('educ_background_levels')->orderBy('id', 'asc')->get();
        return response()->json($academicLevels);
    }


    public function fetchSchools(Request $request)
    {
        $term = trim($request->get('term', ''));

        if ($term === '') {
            return response()->json([]);
        }

        $schools = DB::table('educ_background_schools')
            ->where(function($query) use ($term) {
                $query->where('name', 'LIKE', "%{$term}%")
                    ->orWhere('abbreviation', 'LIKE', "%{$term}%");
            })
            ->orderBy('name')
            ->limit(10)
            ->get(['id','name', 'abbreviation']);

        $formatted = $schools->map(function ($school) {
            return [
                'id' => $school->id,
                'name' => $school->abbreviation 
                    ? "{$school->name}" 
                    : $school->name
            ];
        });

        return response()->json($formatted);
    }

    // Create educational background
    public function createEducationalBackground(Request $request, $targetId = null)
    {
        $validator = Validator::make($request->all(), [
            'records'                  => 'required|array',
            'records.*.level_id'       => 'required',
            'records.*.school_id'      => 'required|string',
            'records.*.period_from'    => 'required|string',
            'records.*.period_to'      => 'required|string',
            'records.*.year_graduated' => 'required|string',
            'records.*.honors'         => 'nullable|string|max:255',
            'records.*.degree'         => 'nullable|string|max:255',
            'records.*.units_earned'   => 'nullable',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try {
            // Get student ID from URL parameter or request payload
            $id = $targetId ?? $request->input('student_id') ?? request('studentId');
            $records = $request->input('records', []);

            foreach ($records as $record) {
                
                // Map the object properties
                $levelId       = $record['level_id'];
                $schoolId      = $record['school_id'];
                $schoolName    = trim((string) ($record['school_id'] ?? ''));
                $editId        = $record['id'] ?? null;
                $periodFrom    = $record['period_from'] ?? null;
                $periodTo      = $record['period_to'] ?? null;
                $yearGraduated = $record['year_graduated'] ?? null;
                $honor         = $record['honors'] ?? null;
                $degree        = $record['degree'] ?? null;
                $unitEarned    = $record['units_earned'] ?? null;

                $delimiters = [' ', ',', '_', '-'];
                $parts = [$schoolName];

                foreach ($delimiters as $delimiter) {
                    $newParts = [];
                    foreach ($parts as $part) {
                        $newParts = array_merge($newParts, explode($delimiter, $part));
                    }
                    $parts = $newParts;
                }

                $parts = array_filter($parts);
                $abbreviation = strtoupper(implode('', array_map(fn($w) => $w[0] ?? '', $parts)));

                $schoolId = null;
                if (!empty($schoolName)) {
                    $schoolId = DB::table('educ_background_schools')
                        ->where('name', $schoolName)
                        ->value('id');

                    if (!$schoolId) {
                        $schoolId = DB::table('educ_background_schools')->insertGetId([
                            'name' => $schoolName,
                            'abbreviation' => $abbreviation,
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }
                }

                $educBackground = EducBackground::firstOrNew([
                    'student_account_id' => $id,
                    'level_id' => $levelId,
                    'id' => $editId,
                ]);

                $educBackground->school_id      = $schoolId;
                $educBackground->units_earned   = $unitEarned;
                $educBackground->period_from    = $periodFrom;
                $educBackground->period_to      = $periodTo;
                $educBackground->year_graduated = $yearGraduated;
                $educBackground->honors         = $honor;
                $educBackground->degree         = $degree;

                $educBackground->save();
            }

            DB::commit();

            //Log user activity
            StudentLogsProvider::log(
                'Created/Updated educational background records',
                3,
                'My Profile'
            );

            return response()->json([
                'message' => 'Student profile updated successfully!',
                'type' => 'success',
            ], 200);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Failed updating student profile! ' . $e->getMessage(),
                'type' => 'error', 
            ], 500); 
        }
    }

    // Delete educational background
    public function deleteEducationalBackground($id)
    {
        DB::beginTransaction();
        try {
            $educBackground = EducBackground::with(['student_account'])->findOrFail($id);
            $educBackground->delete();
            
            //Log user activity
            StudentLogsProvider::log(
                'Deleted educational background record',
                4,
                'My Profile'
            );

            DB::commit();

            return response()->json([
                'message' => 'Educational background record deleted successfully!',
                'type' => 'success',
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete educational bacgkround record. ' . $e->getMessage(),
                'type' => 'error',
            ], 500);
        }
    }

}