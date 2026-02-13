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
        p { padding-bottom: 5px;}
    </style>
</head>
<body>

    <div class="header">
        <table style="border: none; margin-bottom: 0;">
            <tr>
                <td style="border: none; width: 20px; vertical-align: center;">
                    @php
                        $assetLogo = public_path('assets/logos/dilg_logo.png'); 
                    @endphp
                    
                    @if(file_exists($assetLogo))
                        <img src="{{ $assetLogo }}" style="width: 80px; height: auto;">
                    @endif
                </td>
                <td style="border: none; width: 20px; vertical-align: center;">
                    @if($logo && file_exists($logo))
                        <img src="{{ $logo }}" style="width: 80px; height: auto;">
                    @endif
                </td>
                <td style="border: none; text-align: center; vertical-align: middle;">
                    <p style="margin: 0;">Republic of the Philippines</p>
                    <p style="margin: 0;"><strong>Province of {{ $province }}</strong></p>
                    <p style="margin: 0;"><strong>Municipality of {{ $municipality }}</strong></p>
                    <p style="margin: 0;">Barangay <span style="text-decoration: underline">{{ $barangay }}</span></p>
                </td>
                <td style="border: none; width: 180px;"></td>
            </tr>
        </table>
        <h3 style="margin: 5px;">Katarungang Pambarangay Compliance Report</h3>
        <p style="margin: 0;">For the <strong style="text-decoration: underline">{{ $quarter }} QUARTER OF {{ $year }}</strong></p>
    </div>

    <table>
        <thead>
            <tr>
                <th rowspan="3">NAME</th>
                <th colspan="13">Actions Taken by the Lupong Tagapamayapa (2)</th>
            </tr>
            <tr>
                <th colspan="3">Nature of Disputes (2a)</th>
                <th rowspan="2">Total (2a.4)</th>
                <th colspan="3">Settled Cases (2b)</th>
                <th rowspan="2">Total (2b.4)</th>
                <th colspan="6">Unsettled Cases (2c)</th>
            </tr>
            <tr>
                <th>Criminal (2a.1)</th>
                <th>Civil (2a.2)</th>
                <th>Others (2a.3)</th>
                <th>Mediation (2b.1)</th>
                <th>Conciliation (2b.2)</th>
                <th>Arbitration (2b.3)</th>
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
                <td class="text-center">{{ $row['name'] }}</td>
                <td>{{ $row['nature']['criminal'] }}</td>
                <td>{{ $row['nature']['civil'] }}</td>
                <td>{{ $row['nature']['others'] }}</td>
                <td><strong></strong></td> 
                <td>{{ $row['settled']['mediation'] }}</td>
                <td>{{ $row['settled']['conciliation'] }}</td>
                <td>{{ $row['settled']['arbitration'] }}</td>
                <td><strong></strong></td>
                
                <td>{{ $row['unsettled']['repudiated'] }}</td>
                <td>{{ $row['unsettled']['withdrawn'] }}</td>
                <td>{{ $row['unsettled']['pending'] }}</td>
                <td>{{ $row['unsettled']['dismissed'] }}</td>
                <td>{{ $row['unsettled']['certified'] }}</td>
                <td>{{ $row['unsettled']['referred'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

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
    </div>

</body>
</html>