<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class NationalityController extends Controller
{

    // Fetch all nationalities for dropdown
    public function fetchNationalities()
    {
        $data = DB::table('nationalities')->orderBy('nationality', 'asc')->get();
        return response()->json($data);
    }
}
