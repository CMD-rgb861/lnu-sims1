<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRole extends Model
{

    protected $fillable = [
        'user_role_description',
        'user_role_level',
    ];

    public function user_account()
    {
        return $this->belongsToMany(
            UserAccount::class,
            'user_account_roles',
            'user_role_id',
            'user_account_id'
        );
    }

    public function user_account_role()
    {
        return $this->belongsTo(UserAccountRole::class);
    }
}
