<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController; 
use App\Http\Controllers\PSGCController;
use App\Http\Controllers\UserAccountController;

// Public routes (no auth needed)
Route::post('/', [AuthController::class, 'index']);
Route::post('/employee-login', [AuthController::class, 'employeeLogin']);
Route::post('/student-login', [AuthController::class, 'studentLogin']);

// Protected routes (must be logged in)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    //PSGC ROUTES
    Route::prefix('/psgc/')->name('psgc.')->group(function() {
        Route::get('/regions', [PSGCController::class, 'fetchRegions'])->name('regions');
        Route::get('/provinces/{regionId}', [PSGCController::class, 'fetchProvinces'])->name('provinces');
        Route::get('/municipalities/{provinceId}', [PSGCController::class, 'fetchMunicipalities'])->name('municipalities');
        Route::get('/barangays/{municipalityId}', [PSGCController::class, 'fetchBarangays'])->name('barangays');
    });

    //USER SETTINGS
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

    
});