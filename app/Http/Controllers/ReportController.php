<?php

namespace App\Http\Controllers;

use App\Models\GeneratedReport;

class ReportController extends Controller
{
    public function verifyReport($reportId)
    {
        $report = GeneratedReport::find($reportId);

        return view('reports.verify_report', [
            'report' => $report
        ]);
    }

}