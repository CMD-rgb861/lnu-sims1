<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\Municipality;
use App\Models\Province;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class PSGCController extends Controller
{
    // // Fetch all regions
    // public function fetchRegions()
    // {
    //     return response()->json(
    //         Cache::remember('regions_all', now()->addDays(7), function () {
    //             return Http::withHeaders([
    //                 'Accept' => 'application/json',
    //             ])->withOptions([
    //                 'verify' => false,
    //             ])->get('https://psgc.gitlab.io/api/regions/')
    //               ->json();
    //         })
    //     );
    // }

    // Fetch provinces for a given region
    public function fetchProvinces($regionId)
    {
        // return response()->json(
        //     Cache::remember("provinces_{$regionCode}", now()->addDays(7), function () use ($regionCode) {
        //         return Http::withHeaders([
        //             'Accept' => 'application/json',
        //         ])->withOptions([
        //             'verify' => false,
        //         ])->get("https://psgc.gitlab.io/api/regions/{$regionCode}/provinces")
        //           ->json();
        //     })
        // );

        $provinces = Province::where('region_id', $regionId)
                            ->where('name', 'NOT LIKE', '%NCR%')
                            ->get(['id', 'name']);
        return response()->json($provinces);
    }

    // Fetch cities/municipalities for a given province
    public function fetchMunicipalities($municipalityId)
    {
        // return response()->json(
        //     Cache::remember("cities_{$provinceCode}", now()->addDays(7), function () use ($provinceCode) {
        //         return Http::withHeaders([
        //             'Accept' => 'application/json',
        //         ])->withOptions([
        //             'verify' => false,
        //         ])->get("https://psgc.gitlab.io/api/provinces/{$provinceCode}/cities-municipalities")
        //           ->json();
        //     })
        // );

        $cities = Municipality::where('province_id', $municipalityId)->get(['id', 'name']);
        return response()->json($cities);
    }

    // // Fetch NCR cities directly
    // public function fetchNCRCities($code)
    // {
    //     // return response()->json(
    //     //     Cache::remember("ncr_cities_{$code}", now()->addDays(7), function () use ($code) {
    //     //         return Http::withHeaders([
    //     //             'Accept' => 'application/json',
    //     //         ])->withOptions([
    //     //             'verify' => false,
    //     //         ])->get("https://psgc.gitlab.io/api/regions/{$code}/cities-municipalities")
    //     //           ->json();
    //     //     })
    //     // );
    // }

    // Fetch barangays for a given city/municipality
    public function fetchBarangays($barangayId)
    {
        // return response()->json(
        //     Cache::remember("barangays_{$code}", now()->addDays(7), function () use ($code) {
        //         return Http::withHeaders([
        //             'Accept' => 'application/json',
        //         ])->withOptions([
        //             'verify' => false,
        //         ])->get("https://psgc.gitlab.io/api/cities-municipalities/{$code}/barangays")
        //           ->json();
        //     })
        // );

        $barangays = Barangay::where('municipality_id', $barangayId)->get(['id', 'name']);
        return response()->json($barangays);
    }

    // // Fetch a single barangay by code
    // public function fetchBarangay($code)
    // {
    //     return response()->json(
    //         Cache::remember("barangay_{$code}", now()->addDays(7), function () use ($code) {
    //             return Http::withHeaders([
    //                 'Accept' => 'application/json',
    //             ])->withOptions([
    //                 'verify' => false,
    //             ])->get("https://psgc.gitlab.io/api/barangays/{$code}")
    //               ->json();
    //         })
    //     );
    // }
}
