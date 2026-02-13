<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\EducBackground;
use App\Models\EnrollmentDetail;
use App\Models\FamBackground;
use App\Models\Municipality;
use App\Models\Province;
use App\Models\Region;
use App\Models\SchoolYear;
use App\Models\StudentAccount;
use App\Models\StudentProfile;
use Illuminate\Http\Request;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function employeeIndex()
    {
        $activeSchoolYear = SchoolYear::where('is_active', 1)->first();
        $activeSchoolYearId = $activeSchoolYear->id;

        $now = Carbon::now('Asia/Manila'); 
        $hour = $now->format('H'); 

        if ($hour >= 0 && $hour < 12) {
            $greeting = 'Good morning';
            $bgImage = 'images/dashboard_morning.jpg';
        } elseif ($hour >= 12 && $hour < 18) {
            $greeting = 'Good afternoon';
            $bgImage = 'images/dashboard_morning.jpg';
        } else {
            $greeting = 'Good evening';
            $bgImage = 'images/dashboard_evening.png';
        }

        // Format: e.g. "Wednesday, August 20, 2025"
        $currentDate = $now->format('F j, Y');

        return view('pages.employees.dashboard.dashboard_layout', compact('activeSchoolYear', 'greeting', 'bgImage', 'currentDate'));
    }

    public function studentIndex()
    {
        // 1. Authentication Check
        if (!Auth::guard('student')->check()) {
            return redirect()->route('login');
        }

        $studentAccount = Auth::guard('student')->user();
        $studentId = $studentAccount->id;

        // 2. Global Data (Cached for 24 hours)
        // This removes 4 heavy queries from every single page load
        $nationalities = Cache::remember('global_nationalities', 86400, fn() => DB::table('nationalities')->orderBy('nationality', 'asc')->get());
        $academicLevels = Cache::remember('global_academic_levels', 86400, fn() => DB::table('educ_background_levels')->orderBy('id', 'asc')->get());
        $famRelations = Cache::remember('global_fam_relations', 86400, fn() => DB::table('fam_background_relations')->orderBy('id', 'asc')->get());
        $regions = Cache::remember('global_regions', 86400, fn() => Region::all());

        // 3. Active School Year (Cached for 1 hour)
        $activeSchoolYear = Cache::remember('active_school_year', 3600, fn() => SchoolYear::where('is_active', 1)->first());
        $activeSchoolYearId = $activeSchoolYear?->id;

        // 4. Time and Greeting Logic
        $now = Carbon::now('Asia/Manila');
        $hour = $now->format('H');
        $currentDate = $now->format('F j, Y');

        if ($hour < 12) {
            $greeting = 'Good morning';
            $bgImage = 'images/dashboard_morning.jpg';
        } elseif ($hour < 18) {
            $greeting = 'Good afternoon';
            $bgImage = 'images/dashboard_morning.jpg';
        } else {
            $greeting = 'Good evening';
            $bgImage = 'images/dashboard_evening.png';
        }

        // 5. Student Specific Data (Eager Loaded to prevent N+1)
        $studentProfile = StudentProfile::where('student_account_id', $studentId)->first();
        $educBackgrounds = EducBackground::where('student_account_id', $studentId)->get();
        $famBackgrounds = FamBackground::where('student_account_id', $studentId)->get();

        // 6. Dependent Address Data (Dynamic Caching)
        $provinces = $studentProfile?->address_region_id 
            ? Cache::remember("provinces_reg_{$studentProfile->address_region_id}", 86400, fn() => Province::where('region_id', $studentProfile->address_region_id)->get())
            : collect();

        $municipalities = $studentProfile?->address_province_id
            ? Cache::remember("mun_prov_{$studentProfile->address_province_id}", 86400, fn() => Municipality::where('province_id', $studentProfile->address_province_id)->get())
            : collect();

        $barangays = $studentProfile?->address_municipality_id
            ? Cache::remember("brgy_mun_{$studentProfile->address_municipality_id}", 86400, fn() => Barangay::where('municipality_id', $studentProfile->address_municipality_id)->get())
            : collect();

        // 7. Enrollment & Unit Calculations (Cached for 10 minutes)
        // This is the most "expensive" part of your original code
        $stats = Cache::remember("student_dashboard_stats_{$studentId}", 600, function() use ($studentId, $activeSchoolYearId) {
            $currentEnrollment = EnrollmentDetail::with(['schedule_slot.schedule', 'curriculum.courses'])
                ->where('school_year_id', $activeSchoolYearId)
                ->where('student_account_id', $studentId)
                ->first();

            $firstSlot = $currentEnrollment?->schedule_slot?->first();
            
            // Calculate Past Units with a raw query to save memory
            $totalPastUnits = DB::table('enrollment_details as ed')
                ->join('curriculum_courses as cc', 'ed.curriculum_id', '=', 'cc.curriculum_id')
                ->join('courses as c', 'cc.course_id', '=', 'c.id')
                ->where('ed.student_account_id', $studentId)
                ->where('ed.school_year_id', '!=', $activeSchoolYearId)
                ->sum('c.units');

            return [
                'currentEnrollment' => $currentEnrollment,
                'enrollmentSchedule' => $firstSlot?->schedule?->schedule_date?->format('F j, Y') ?? 'TBA',
                'enrollmentScheduleTime' => $firstSlot?->formatted_schedule_time ?? 'TBA',
                'totalSubjects' => $currentEnrollment?->curriculum?->courses?->count() ?? 0,
                'totalUnits' => $currentEnrollment?->curriculum?->courses?->sum('units') ?? 0,
                'totalPastSemesters' => EnrollmentDetail::where('student_account_id', $studentId)
                                        ->where('school_year_id', '!=', $activeSchoolYearId)->count(),
                'totalPastUnits' => $totalPastUnits
            ];
        });

        // Extract stats for compacting
        extract($stats);

        return view('pages.students.dashboard.dashboard_layout', compact(
            'greeting', 'currentDate', 'academicLevels', 'famRelations',
            'nationalities', 'studentAccount', 'studentProfile', 'educBackgrounds', 
            'famBackgrounds', 'regions', 'provinces', 'municipalities',
            'barangays', 'bgImage', 'activeSchoolYear', 'currentEnrollment', 
            'enrollmentSchedule', 'enrollmentScheduleTime', 'totalSubjects', 
            'totalUnits', 'totalPastSemesters', 'totalPastUnits'
        ));
    }
}
