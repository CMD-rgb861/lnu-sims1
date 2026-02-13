<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserType extends Model
{

    protected $fillable = [
        'user_type_description',
        'user_type_level',
    ];

    public function user_account()
    {
        return $this->belongsTo(UserAccount::class);
    }
}
