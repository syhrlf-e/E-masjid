<?php

namespace App\Policies;

use App\Models\Agenda;
use App\Models\User;

class AgendaPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'bendahara', 'petugas_zakat', 'viewer']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Hanya diset super_admin / bendahara untuk MVP
        return in_array($user->role, ['super_admin', 'bendahara']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Agenda $agenda): bool
    {
        return in_array($user->role, ['super_admin', 'bendahara']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Agenda $agenda): bool
    {
        return in_array($user->role, ['super_admin', 'bendahara']);
    }
}
