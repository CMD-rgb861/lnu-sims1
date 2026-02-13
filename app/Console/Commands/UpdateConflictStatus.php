<?php

namespace App\Console\Commands;

use App\Models\EnvironmentBarangay;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateConflictStatus extends Command
{
    protected $signature = 'conflict:update-status';

    protected $description = 'Updates the conflict status of all barangays based on unresolved blotter counts';

    public function handle()
    {
        $this->info('Starting conflict status update...');

        EnvironmentBarangay::query()
            ->withCount(['blotters as unresolved_count' => function ($query) {
                $query->where('status', 1); 
            }])
            ->chunk(100, function ($barangays) {
                
                foreach ($barangays as $barangay) {
                    $count = $barangay->unresolved_count;
                    
                    $newStatus = match (true) {
                        $count === 0    => 1, 
                        $count <= 5     => 2, 
                        $count <= 15    => 3, 
                        $count <= 30    => 4, 
                        default         => 5, 
                    };

                    if ($barangay->conflict_status !== $newStatus) {
                        $barangay->update(['conflict_status' => $newStatus]);
                        
                        // Optional: Log specific changes for debugging
                        // $this->line("Updated {$barangay->id}: Count $count -> Status $newStatus");
                    }
                }
            });

        $this->info('Conflict status update completed successfully.');
    }
}