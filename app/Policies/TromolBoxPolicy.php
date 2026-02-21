<?php

namespace App\Policies;

use App\Models\TromolBox;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TromolBoxPolicy
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
    public function view(User $user, TromolBox $tromolBox): bool
    {
        return in_array($user->role, ['super_admin', 'bendahara', 'petugas_zakat']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'bendahara']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TromolBox $tromolBox): bool
    {
        return in_array($user->role, ['super_admin', 'bendahara']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TromolBox $tromolBox): bool
    {
        return $user->role === 'super_admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, TromolBox $tromolBox): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, TromolBox $tromolBox): bool
    {
        return false;
    }
}
