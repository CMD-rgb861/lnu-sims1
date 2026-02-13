<?php

namespace App\Http\Controllers;

use App\Models\EducBackground;
use App\Models\StudentAccount;
use App\Providers\UserLogsProvider;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class EducBackgroundController extends Controller
{

    // Reusable function for student profile information
    private function getEducBackgroundData($id)
    {
        $studentAccount = StudentAccount::findOrFail($id);
        $educBackgrounds = EducBackground::where('student_account_id', $id)->get();

        $academicLevels = DB::table('educ_background_levels')->orderBy('id', 'asc')->get();

        return compact(
            'educBackgrounds',
            'academicLevels',
        );
    }

    // Show educ background details in student account
    public function educBackgroundIndex()
    {
        $id = Auth::id();
        $data = $this->getEducBackgroundData($id);

        return view('pages.students.my_profile.educational_background_layout', $data);
    }

    // Fetch schools for autosuggestion
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
            ->get(['name', 'abbreviation']);

        // You can format the output however you want:
        $formatted = $schools->map(function ($school) {
            return [
                'label' => $school->name . 
                        ($school->abbreviation ? " ({$school->abbreviation})" : ''),
                'value' => $school->name
            ];
        });

        if ($schools->isEmpty()) {
            return response()->json(['debug' => "No matches found for '{$term}'"]);
        }

        return response()->json($formatted);
    }

    // Create educational background
    public function createEducationalBackground(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'level_id'         => 'required|array',
            'level_id.*'       => 'required|integer',

            'school_id'        => 'required|array',
            'school_id.*'      => 'required|string',

            'period_from'      => 'required|array',
            'period_from.*'    => 'required|string',

            'period_to'        => 'required|array',
            'period_to.*'      => 'required|string',

            'year_graduated'   => 'required|array',
            'year_graduated.*' => 'required|string',

            'honors'           => 'nullable|array',
            'honors.*'         => 'nullable|string|max:255',

            'degree'           => 'nullable|array',
            'degree.*'         => 'nullable|string|max:255',

            'units_earned'     => 'nullable|array',
            'units_earned.*'   => 'nullable',
        ]);
        
        if ($validator->fails()) 
        {
            if ($request->ajax()) 
            {
                return response()->json([
                    'errors' => $validator->errors(),
                ], 422);
            }
        }

        DB::beginTransaction();

        try {
            $id = request('studentId');

            if(!$id){
                $id = $request->input('student_id');
            }

            $student = StudentAccount::findOrFail($id);
            $studentName = $student->first_name .' '. $student->last_name;

            $editIds = $request->input('edit_id');
            $levels = $request->input('level_id');
            $schoolNames = $request->input('school_id', []);
            $periodFroms = $request->input('period_from', []); 
            $periodTos = $request->input('period_to', []); 
            $yearGraduateds = $request->input('year_graduated', []); 
            $honors = $request->input('honors', []); 
            $degrees = $request->input('degree', []); 
            $unitsEarneds = $request->input('units_earned', []); 

            foreach ($levels as $i => $levelId) {
                $schoolName = $schoolNames[$i] ?? '';
                if (is_array($schoolName)) {
                    $schoolName = implode(' ', $schoolName); 
                }
                $schoolName = trim((string) $schoolName);

                $editId = $editIds[$i] ?? null;
                $periodFrom = $periodFroms[$i] ?? null;
                $periodTo = $periodTos[$i] ?? null;
                $yearGraduated = $yearGraduateds[$i] ?? null;
                $honor = $honors[$i] ?? null;
                $degree = $degrees[$i] ?? null;
                $unitEarned = $unitsEarneds[$i] ?? null;

                $delimiters = [' ', ',', '_', '-'];
                $parts = [$schoolName];

                foreach ($delimiters as $delimiter) {
                    $newParts = [];
                    foreach ($parts as $part) {
                        $newParts = array_merge($newParts, explode($delimiter, $part));
                    }
                    $parts = $newParts;
                }

                // Remove empties
                $parts = array_filter($parts);

                // Take first letter of each word
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

            // Log user activity
            UserLogsProvider::log('created educational background for: ' . $studentName);

            if ($request->ajax()) {
                return response()->json([
                    'message' => 'Student profile update successfully!',
                    'type' => 'success',
                ], 200);
            } else {
                // If it's a normal form submission
                return redirect()->back()->with('toast', [
                    'text' => 'Student profile update successfully!',
                    'type' => 'success',
                ]);
            }

        } catch (\Exception $e) {
            DB::rollback();
            if ($request->ajax()) {
                return response()->json([
                    'message' => 'Failed updating student profile!' . $e->getMessage(),
                    'type' => 'success',
                ], 200);
            } else {
                return redirect()->back()->with('toast', [
                    'text' => 'Failed updating student profile!' . $e->getMessage(),
                    'type' => 'success',
                ]);
            }
        }
         
    }

    // Delete educational background
    public function deleteEducationalBackground($id)
    {
        DB::beginTransaction();
        try {
            $educBackground = EducBackground::with(['student_account'])->findOrFail($id);
            $educBackground->delete();
            
            // Log user activity
            UserLogsProvider::log('deleted educational background record for acount: ' . $educBackground->student_account->first_name . ' ' . $educBackground->student_account->last_name);

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