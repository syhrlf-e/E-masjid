<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Exception;

class TransactionService
{
    protected $activityLogService;

    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    /**
     * Store a new transaction.
     *
     * @param  array  $validated
     * @param  User  $actor
     * @return Transaction
     * @throws Exception
     */
    public function store(array $validated, User $actor): Transaction
    {
        return DB::transaction(function () use ($validated, $actor) {
            $transaction = Transaction::create([
                'type' => $validated['type'],
                'category' => $validated['category'],
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'donatur_id' => $validated['donatur_id'] ?? null,
                'tromol_box_id' => $validated['tromol_box_id'] ?? null,
                'created_by' => $actor->id,
            ]);

            $this->activityLogService->log($actor, 'create', $transaction, [], $transaction->toArray());

            return $transaction;
        });
    }

    /**
     * Verify a transaction.
     *
     * @param  Transaction  $transaction
     * @param  User  $actor
     * @return Transaction
     */
    public function verify(Transaction $transaction, User $actor): Transaction
    {
        $oldValues = $transaction->toArray();

        $transaction->update([
            'verified_at' => now(),
            'verified_by' => $actor->id,
        ]);

        $this->activityLogService->log($actor, 'verify', $transaction, $oldValues, $transaction->toArray());

        return $transaction;
    }

    /**
     * Soft delete a transaction.
     *
     * @param  Transaction  $transaction
     * @param  User  $actor
     * @param  string  $reason
     * @return void
     */
    public function softDelete(Transaction $transaction, User $actor, string $reason): void
    {
        $oldValues = $transaction->toArray();

        $transaction->delete();

        // Log the deletion with the reason in new_values
        $this->activityLogService->log($actor, 'delete', $transaction, $oldValues, ['reason' => $reason]);
    }
}
