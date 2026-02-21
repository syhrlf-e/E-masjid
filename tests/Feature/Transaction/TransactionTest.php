<?php

namespace Tests\Feature\Transaction;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use \Illuminate\Foundation\Testing\RefreshDatabase;

    public function test_bendahara_can_create_valid_transaction()
    {
        $user = \App\Models\User::factory()->create([
            'role' => 'bendahara',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->post(route('kas.store'), [
            'type' => 'in',
            'category' => 'infaq',
            'amount' => 100000,
            'payment_method' => 'tunai',
            'notes' => 'Test Transaction',
        ]);

        $response->assertRedirect(route('kas.index'));
        $this->assertDatabaseHas('transactions', [
            'amount' => 100000,
            'category' => 'infaq',
            'created_by' => $user->id,
        ]);
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'create',
            'user_id' => $user->id,
            'table_name' => 'transactions',
        ]);
    }

    public function test_transaction_amount_zero_rejected()
    {
        $user = \App\Models\User::factory()->create([
            'role' => 'bendahara',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)
            ->from(route('kas.index'))
            ->post(route('kas.store'), [
                'type' => 'in',
                'category' => 'infaq',
                'amount' => 0,
            ]);
        
        // If validation fails, it should redirect back (302)
        $response->assertStatus(302);
        $response->assertSessionHasErrors('amount');
    }

    public function test_petugas_cannot_create_out_transaction()
    {
        $user = \App\Models\User::factory()->create([
            'role' => 'petugas_zakat',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)
            ->from(route('kas.index'))
            ->post(route('kas.store'), [
                'type' => 'out',
                'category' => 'operasional',
                'amount' => 50000,
            ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors('type');
    }
}
