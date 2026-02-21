<?php

namespace App\Policies;

use App\Models\Donatur;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DonaturPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'bendahara', 'petugas_zakat']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Donatur $donatur): bool
    {
        return in_array($user->role, ['super_admin', 'bendahara', 'petugas_zakat']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'bendahara', 'petugas_zakat']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Donatur $donatur): bool
    {
        return in_array($user->role, ['super_admin', 'bendahara']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Donatur $donatur): bool
    {
        return $user->role === 'super_admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Donatur $donatur): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Donatur $donatur): bool
    {
        return false;
    }
}
