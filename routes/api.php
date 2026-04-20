<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CollegeController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EducBackgroundController;
use App\Http\Controllers\EnrollmentDetailController;
use App\Http\Controllers\FamBackgroundController;
use App\Http\Controllers\NationalityController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PreEnrollmentController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\PSGCController;
use App\Http\Controllers\StudentAccountController;
use App\Http\Controllers\StudentGradeController;
use App\Http\Controllers\StudentScheduleController;
use App\Http\Controllers\UserAccountController;
use App\Http\Controllers\UserRoleController;
use App\Http\Controllers\StudentEvaluationController;

// Public routes (no auth needed)
Route::post('/', [AuthController::class, 'index']);
Route::post('/employee-login', [AuthController::class, 'employeeLogin']);
Route::post('/student-login', [AuthController::class, 'studentLogin']);

// Authentication routes
Route::prefix('/auth/')->name('auth.')->group(function() {
    Route::post('/verify', [AuthController::class, 'verifyAccount'])->name('verifyAccount');
});

// Protected routes (must be logged in)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // NOTIFICATIONS ROUTES //
    Route::prefix('/n/')->name('notifications.')->group(function() {
        Route::get('/data', [NotificationController::class, 'index'])->name('index');
        Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('markAllAsRead');
        Route::post('/mark-as-read/{id}', [NotificationController::class, 'markAsRead'])->name('markAsRead');
    });

    // NATIONALITY ROUTES //
    Route::get('/nationalities', [NationalityController::class, 'fetchNationalities']);

    // PSGC ROUTES //
    Route::prefix('/psgc/')->name('psgc.')->group(function() {
        Route::get('/regions', [PSGCController::class, 'fetchRegions'])->name('fetchRegions');
        Route::get('/provinces/{regionId}', [PSGCController::class, 'fetchProvinces'])->name('fetchProvinces');
        Route::get('/municipalities/{provinceId}', [PSGCController::class, 'fetchMunicipalities'])->name('fetchMunicipalities');
        Route::get('/barangays/{municipalityId}', [PSGCController::class, 'fetchBarangays'])->name('fetchBarangays');
    });

    // USER ROLES ROUTES //
    Route::prefix('/ur/')->name('user_role.')->group(function() {
        Route::get('/data', [UserRoleController::class, 'data'])->name('data');
    });

    // COLLEGES ROUTES //
    Route::prefix('/c/')->name('colleges.')->group(function() {
        Route::get('/data', [CollegeController::class, 'data'])->name('data');
    });

    //DEPARTMENTS ROUTES
    Route::prefix('/d/')->name('departments.')->group(function() {
        Route::get('/data', [DepartmentController::class, 'data'])->name('data');
    });

    // PROGRAMS ROUTES //
    Route::prefix('/p/')->name('programs.')->group(function() {
        Route::get('/data', [ProgramController::class, 'data'])->name('data');
        Route::get('/programs', [ProgramController::class, 'fetchPrograms'])->name('fetchPrograms');
        Route::get('/program-levels', [ProgramController::class, 'fetchProgramLevels'])->name('fetchProgramLevels');
    });

    // USER ROLES ROUTES //
    Route::prefix('/ur/')->name('user_role.')->group(function() {
        Route::get('/data', [UserRoleController::class, 'data'])->name('data');
    });

    // USER MANAGEMENT ROUTES //
    Route::prefix('/um/')->name('user_management.')->group(function() {
        Route::prefix('/employees/')->name('employees.')->group(function() {
             Route::get('/data', [UserAccountController::class, 'fetchEmployeeAccounts'])->name('fetchEmployeeAccounts');
        });
       
        // Route::put('/account/update', [UserAccountController::class, 'updateAccountDetails'])->name('updateAccountDetails');
        // Route::put('/security/update', [UserAccountController::class, 'updateAccountSecurity'])->name('updateAccountSecurity');
        // // Route::get('/{eb_id}/data', [EnvironmentBarangayController::class, 'fetchBarangayPersonnel'])->name('fetchBarangayPersonnel');
        // // Route::get('/{env_id}/fetch', [EnvironmentBarangayController::class, 'fetchEnvironmentBarangays'])->name('fetchEnvironmentBarangays');
        // // Route::post('/{eb_id}/add-personnel', [EnvironmentBarangayController::class, 'addBarangayPersonnel'])->name('addBarangayPersonnel');
        // // Route::put('/{eb_id}/update-personnel', [EnvironmentBarangayController::class, 'updateBarangayPersonnel'])->name('updateBarangayPersonnel');
        // // Route::delete('/{user}/delete-personnel', [EnvironmentBarangayController::class, 'deleteBarangayPersonnel'])->name('deleteBarangayPersonnel');
    });

    // //DASHBOARD ALERT ROUTES
    // Route::prefix('/da/')->name('dashboard_alerts.')->group(function() {
    //     Route::get('/data', [DashboardAlertsController::class, 'data'])->name('data');
    //     Route::get('/fetch', [DashboardAlertsController::class, 'fetchActiveAlerts'])->name('fetchActiveAlerts');
    //     Route::post('/add-alert', [DashboardAlertsController::class, 'addAlert'])->name('addAlert');
    //     Route::put('/{data}', [DashboardAlertsController::class, 'updateAlert'])->name('updatePage');
    //     Route::delete('/{page}', [DashboardAlertsController::class, 'deleteAlert'])->name('deleteAlert');
    // });

    // //USER SETTINGS
    // Route::prefix('/user-settings/')->name('user_settings.')->group(function() {
    //     Route::get('/account/data', [UserAccountController::class, 'fetchAccountDetails'])->name('fetchAccountDetails');
    //     Route::put('/account/update', [UserAccountController::class, 'updateAccountDetails'])->name('updateAccountDetails');
    //     Route::put('/security/update', [UserAccountController::class, 'updateAccountSecurity'])->name('updateAccountSecurity');
    //     // Route::get('/{eb_id}/data', [EnvironmentBarangayController::class, 'fetchBarangayPersonnel'])->name('fetchBarangayPersonnel');
    //     // Route::get('/{env_id}/fetch', [EnvironmentBarangayController::class, 'fetchEnvironmentBarangays'])->name('fetchEnvironmentBarangays');
    //     // Route::post('/{eb_id}/add-personnel', [EnvironmentBarangayController::class, 'addBarangayPersonnel'])->name('addBarangayPersonnel');
    //     // Route::put('/{eb_id}/update-personnel', [EnvironmentBarangayController::class, 'updateBarangayPersonnel'])->name('updateBarangayPersonnel');
    //     // Route::delete('/{user}/delete-personnel', [EnvironmentBarangayController::class, 'deleteBarangayPersonnel'])->name('deleteBarangayPersonnel');
    // });

    //* STUDENT ACCOUNT ROUTES *//

    // MY PROFILE ROUTES //
    Route::prefix('/mp/')->name('my_profile.')->group(function() {
        Route::get('/fetch/student-details/{id}', [StudentAccountController::class, 'fetchStudentAccountDetails'])->name('fetchStudentAccountDetails');
        Route::get('/fetch/educ-background/{id}', [EducBackgroundController::class, 'fetchEducationalBackground'])->name('fetchEducationalBackground');
        Route::get('/fetch/educ-background/levels', [EducBackgroundController::class, 'fetchAcademicLevels'])->name('fetchAcademicLevels');
        Route::get('/fetch/educ-schools/search', [EducBackgroundController::class, 'fetchSchools'])->name('fetchSchools');
        Route::get('/fetch/family-background/relations', [FamBackgroundController::class, 'fetchFamRelations'])->name('fetchFamRelations');
        Route::get('/fetch/family-background/{id}', [FamBackgroundController::class, 'fetchFamilyBackground'])->name('fetchFamilyBackground');
        Route::post('/upload-pictures', [StudentAccountController::class, 'uploadStudentPictures'])->name('uploadStudentPictures');
        Route::post('/create-profile', [StudentAccountController::class, 'createStudentProfile'])->name('createStudentProfile');
        Route::put('/update-personal-info', [StudentAccountController::class, 'updateStudentProfileInfo'])->name('updateStudentProfileInfo');
        Route::put('/update-educ-background/{id}', [EducBackgroundController::class, 'updateEducationalBackground'])->name('updateEducationalBackground');
        Route::put('/update-guardian/{id}', [FamBackgroundController::class, 'updateGuardian'])->name('updateGuardian');
        Route::delete('/delete-educ-background/{id}', [EducBackgroundController::class, 'deleteEducationalBackground'])->name('deleteEducationalBackground');
        Route::put('/update-fam-background/{id}', [FamBackgroundController::class, 'updateFamBackground'])->name('updateFamBackground');
        Route::delete('/delete-fam-background/{id}', [FamBackgroundController::class, 'deleteFamBackground'])->name('deleteFamBackground');
    });

    // PRE-ENROLLMENT ROUTES //
    Route::prefix('/pe/')->name('pre_enrollment.')->group(function() {
        // PRE-ENROLLMENT ROUTES FOR STUDENT ACCOUNT //
        Route::prefix('/s/')->name('student.')->group(function() {
            Route::get('/fetch/records/{id}', [EnrollmentDetailController::class, 'fetchPreEnrollmentDetails'])->name('fetchPreEnrollmentDetails');
            Route::get('/fetch/status-monitoring/{id}', [EnrollmentDetailController::class, 'fetchStatusMonitoring'])->name('fetchStatusMonitoring');
            Route::get('/fetch/advised-subjects/{id}', [EnrollmentDetailController::class, 'fetchAdvisedSubjects'])->name('fetchAdvisedSubjects');
            Route::get('/fetch/available-schedules', [StudentScheduleController::class, 'availableSchedules'])->name('availableSchedules');
            Route::get('/fetch/check-booking', [StudentScheduleController::class, 'checkBooking']);
            Route::post('/book-schedule', [StudentScheduleController::class, 'bookSchedule'])->name('bookSchedule');
            Route::post('/update-enrollment-details', [EnrollmentDetailController::class, 'createEnrollmentDetail'])->name('createEnrollmentDetail');
        }); 
    });

    // GRADE ROUTES //
    Route::prefix('/g/')->name('grades.')->group(function() {
        Route::get('/fetch/grades', [StudentGradeController::class, 'grades'])->name('grades');
        Route::get('/fetch/semesters', [StudentGradeController::class, 'getSemesters'])->name('getSemesters');
        Route::get('/fetch/programs', [StudentGradeController::class, 'getPrograms'])->name('getPrograms');
    });

    // ACCOUNT SETTINGS //
    Route::prefix('/as/')->name('account_settings.')->group(function() {
        // ACCOUNT SETTINGS ROUTES FOR STUDENT ACCOUNT //
        Route::prefix('/s/')->name('student.')->group(function() {
            Route::get('/data', [StudentAccountController::class, 'fetchAccountDetails'])->name('fetchAccountDetails');
            Route::put('/preferences/update', [StudentAccountController::class, 'updateAccountDetails'])->name('updateAccountDetails');
            Route::put('/security/update', [StudentAccountController::class, 'updateAccountSecurity'])->name('updateAccountSecurity');
        }); 

        // ACCOUNT SETTINGS ROUTES FOR EMPLOYEE ACCOUNT //
        Route::prefix('/e/')->name('student.')->group(function() {
            Route::get('/data', [UserAccountController::class, 'fetchAccountDetails'])->name('fetchAccountDetails');
            Route::put('/preferences/update', [UserAccountController::class, 'updateAccountDetails'])->name('updateAccountDetails');
            Route::put('/security/update', [UserAccountController::class, 'updateAccountSecurity'])->name('updateAccountSecurity');
        }); 

    });
    
    

    // STUDENTS EVALUATION ROUTES //
    Route::prefix('/eval/')->name('eval.')->group(function() {
        Route::get('/fetch/enrollments', [StudentEvaluationController::class, 'index'])->name('fetchEnrollments');
        Route::post('/evaluations', [StudentEvaluationController::class, 'store'])->name('submitEvaluation');
    });

    // Legacy/compat route used by frontend modal: keep POST /api/student/evaluations
    Route::post('/student/evaluations', [StudentEvaluationController::class, 'store'])->name('submitEvaluation.legacy');
});