<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CollegeController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EducBackgroundController;
use App\Http\Controllers\FamBackgroundController;
use App\Http\Controllers\NationalityController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\PSGCController;
use App\Http\Controllers\StudentAccountController;
use App\Http\Controllers\UserAccountController;
use App\Http\Controllers\UserRoleController;

// Public routes (no auth needed)
Route::post('/', [AuthController::class, 'index']);
Route::post('/employee-login', [AuthController::class, 'employeeLogin']);
Route::post('/student-login', [AuthController::class, 'studentLogin']);

// Protected routes (must be logged in)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    //NATIONALITY ROUTES
    Route::get('/nationalities', [NationalityController::class, 'fetchNationalities']);

    //PSGC ROUTES
    Route::prefix('/psgc/')->name('psgc.')->group(function() {
        Route::get('/regions', [PSGCController::class, 'fetchRegions'])->name('fetchRegions');
        Route::get('/provinces/{regionId}', [PSGCController::class, 'fetchProvinces'])->name('fetchProvinces');
        Route::get('/municipalities/{provinceId}', [PSGCController::class, 'fetchMunicipalities'])->name('fetchMunicipalities');
        Route::get('/barangays/{municipalityId}', [PSGCController::class, 'fetchBarangays'])->name('fetchBarangays');
    });

    //USER ROLES ROUTES
    Route::prefix('/ur/')->name('user_role.')->group(function() {
        Route::get('/data', [UserRoleController::class, 'data'])->name('data');
    });

    //COLLEGES ROUTES
    Route::prefix('/c/')->name('colleges.')->group(function() {
        Route::get('/data', [CollegeController::class, 'data'])->name('data');
    });

    //DEPARTMENTS ROUTES
    Route::prefix('/d/')->name('departments.')->group(function() {
        Route::get('/data', [DepartmentController::class, 'data'])->name('data');
    });

    //PROGRAMS ROUTES
    Route::prefix('/p/')->name('programs.')->group(function() {
        Route::get('/data', [ProgramController::class, 'data'])->name('data');
    });

    //USER ROLES ROUTES
    Route::prefix('/ur/')->name('user_role.')->group(function() {
        Route::get('/data', [UserRoleController::class, 'data'])->name('data');
    });

    //USER MANAGEMENT ROUTES
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

    //MY PROFILE ROUTES
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
        Route::delete('/delete-educ-background/{id}', [EducBackgroundController::class, 'deleteEducationalBackground'])->name('deleteEducationalBackground');
        Route::put('/update-fam-background/{id}', [FamBackgroundController::class, 'updateFamBackground'])->name('updateFamBackground');
        Route::delete('/delete-fam-background/{id}', [FamBackgroundController::class, 'deleteFamBackground'])->name('deleteFamBackground');
    });

    // CATCH ALL ROUTES
    
});