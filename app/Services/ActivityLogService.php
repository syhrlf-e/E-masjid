<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ActivityLogService
{
    /**
     * Log an activity.
     *
     * @param  User  $actor
     * @param  string  $action
     * @param  Model  $target
     * @param  array  $oldValues
     * @param  array  $newValues
     * @return void
     */
    public function log(User $actor, string $action, Model $target, array $oldValues = [], array $newValues = []): void
    {
        ActivityLog::create([
            'user_id' => $actor->id,
            'action' => $action,
            'table_name' => $target->getTable(),
            'record_id' => $target->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'created_at' => now(),
        ]);
    }
}
