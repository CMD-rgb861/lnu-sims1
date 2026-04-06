<?php


namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable; 
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @mixin \Illuminate\Database\Eloquent\Model
 */

class UserAccount extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'id_number',
        'first_name',
        'middle_name',
        'last_name',
        'email_address',
        'password',
        'temp_password',
        'user_type_id',
        'profile_verified',
        'last_login',
        'is_logged_in'
    ];

    protected $hidden = [
        'password',
        'temp_password',
        'otp'
    ];

    protected $casts = [
        'profile_verified' => 'boolean',
        'is_logged_in' => 'boolean',
        'last_login' => 'datetime'
    ];

    protected $appends = [
        'display_name'
    ];

    public function getDisplayNameAttribute()
    {
        if($this->middle_name){
            return "{$this->first_name} {$this->middle_name} {$this->last_name}";
        }else{
            return "{$this->first_name} {$this->last_name}";
        }
    }

    public function user_type()
    {
        return $this->belongsTo(UserType::class);
    }

    public function roles()
    {
        return $this->belongsToMany(UserRole::class, 'user_account_roles', 'user_account_id', 'user_role_id')
            ->wherePivot('is_active', 1);
    }

    public function user_account_role()
    {
        return $this->hasMany(UserAccountRole::class);
    }

    // public function enrolling_teacher_programs(): BelongsToMany
    // {
    //     $enrollingTeacherRoleId = 6; 

    //     return $this->belongsToMany(
    //             Program::class,          // The final model we want to access
    //             'user_account_roles',    // The name of the intermediate (pivot) table
    //             'user_account_id',       // The foreign key on the pivot table for this model
    //             'program_id'             // The foreign key on the pivot table for the related model
    //         )
    //         ->wherePivot('user_role_id', $enrollingTeacherRoleId);
    // }

    public function notification()
    {
        return $this->hasMany(Notification::class);
    }

}
