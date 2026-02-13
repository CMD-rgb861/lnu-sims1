<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; font-size: 10pt; }
        .header { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid black; padding: 4px; text-align: center; }
        .text-left { text-align: left; }
        .footer-section { margin-top: 50px; width: 100%; }
        .signatory-box { width: 45%; display: inline-block; vertical-align: top; }
        .line { border-bottom: 1px solid black; width: 200px; margin-bottom: 5px; }
        p { padding-bottom: 0px; margin-bottom: 0px;}
        .subheaders { text-align: left; }
    </style>
</head>
<body>

    <div class="header">
        <table style="border: none; margin-bottom: 0;">
            <tr>
                <td style="border: none; width: 20px; vertical-align: right;">
                    @php
                        $assetLogo = public_path('assets/logos/dilg_logo.png'); 
                    @endphp
                    
                    @if(file_exists($assetLogo))
                        <img src="{{ $assetLogo }}" style="width: 80px; height: auto;">
                    @endif
                </td>
                <td style="border: none; width: 20px; vertical-align: right;">
                    @if($logo && file_exists($logo))
                        <img src="{{ $logo }}" style="width: 80px; height: auto;">
                    @endif
                </td>
                <td style="border: none; text-align: center; vertical-align: middle;">
                    <h3 style="margin: 0;">Katarungang Pambarangay Compliance Report</h3>
                    <p style="margin: 0;">For the <strong style="text-decoration: underline">{{ $quarter }} QUARTER OF {{ $year }}</strong></p>
                </td>
                <td style="border: none; width: 80px;"></td>
            </tr>
        </table>

        <div class="subheaders">
            <p style="text-align:'left'; text-transform: uppercase;">{{ $region }}</p>
            <p style="text-align:'left'; text-transform: uppercase;">PROVINCE: <span style="text-decoration: underline">{{ $province }}</span></strong></p>
            <p style="text-align:'left'; text-transform: uppercase;">MUNICIPALITY: <span style="text-decoration: underline;">{{ $municipality }}</span></strong></p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th rowspan="3">Barangays</th>
                <th colspan="14">Actions Taken by the Lupong Tagapamayapa (2)</th>
                <th rowspan="3">Estimated Government Savings (in PHP)* (3)</th>
                <th rowspan="3">Remarks</th>
            </tr>
            <tr>
                <th colspan="4">Nature of Disputes (2a)</th>
                <th colspan="4">Settled Cases (2b)</th>
                <th colspan="6">Unsettled Cases (2c)</th>
            </tr>
            <tr>
                <th>Criminal (2a.1)</th>
                <th>Civil (2a.2)</th>
                <th>Others (2a.3)</th>
                <th>Total (2a.4)</th>
                
                <th>Mediation (2b.1)</th>
                <th>Conciliation (2b.2)</th>
                <th>Arbitration (2b.3)</th>
                <th>Total (2b.4)</th>

                <th>Repudiated (2c.1)</th>
                <th>Withdrawn (2c.2)</th>
                <th>Pending (2c.3)</th>
                <th>Dismissed (2c.4)</th>
                <th>Certified (2c.5)</th>
                <th>Referred (2c.6)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $row)
            <tr>
                <td class="text-left">{{ $row['barangay_name'] }}</td>

                <td>{{ $row['nature']['criminal'] }}</td>
                <td>{{ $row['nature']['civil'] }}</td>
                <td>{{ $row['nature']['others'] }}</td>
                <td><strong>{{ $row['nature']['total'] }}</strong></td> 

                <td>{{ $row['settled']['mediation'] }}</td>
                <td>{{ $row['settled']['conciliation'] }}</td>
                <td>{{ $row['settled']['arbitration'] }}</td>
                <td><strong>{{ $row['settled']['total'] }}</strong></td>
                
                <td>{{ $row['unsettled']['repudiated'] }}</td>
                <td>{{ $row['unsettled']['withdrawn'] }}</td>
                <td>{{ $row['unsettled']['pending'] }}</td>
                <td>{{ $row['unsettled']['dismissed'] }}</td>
                <td>{{ $row['unsettled']['certified'] }}</td>
                <td>{{ $row['unsettled']['referred'] }}</td>

                <td class="text-left">{{ $row['savings'] }}</td>
                <td class="text-left">{{ $row['remarks'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
{{-- 
    <div class="footer-section">
        <div class="signatory-box">
            <p>Prepared by:</p><br>
            <div class="line"></div>
            <p>Barangay Secretary</p>
        </div>
        <div class="signatory-box" style="float: right;">
            <p>Noted by:</p><br>
            <div class="line"></div>
            <p>Punong Barangay</p>
        </div>
    </div> --}}

</body>
</html>