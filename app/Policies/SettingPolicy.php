<?php

namespace App\Policies;

use App\Models\Setting;
use App\Models\User;

class SettingPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'bendahara']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'bendahara']);
    }
}
