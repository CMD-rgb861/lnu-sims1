<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentProgram extends Model
{
    use HasFactory;

    // Explicit table name because migration used singular 'student_program'
    protected $table = 'student_program';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'student_account_id',
        'id_number',
        'program_id',
        'curriculum_id',
        'year_from',
        'year_to',
    ];

    /**
     * Casts for attribute types.
     *
     * @var array<string,string>
     */
    protected $casts = [
        'year_from' => 'integer',
        'year_to' => 'integer',
    ];

    /* ----------------------- Relations ----------------------- */

    public function studentAccount()
    {
        return $this->belongsTo(StudentAccount::class, 'student_account_id');
    }

    public function program()
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    public function curriculum()
    {
        return $this->belongsTo(Curriculum::class, 'curriculum_id');
    }
}
