<?php

namespace Tests\Feature\Tromol;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TromolQrTest extends TestCase
{
    use \Illuminate\Foundation\Testing\RefreshDatabase;

    public function test_signed_url_valid_can_be_accessed()
    {
        $user = \App\Models\User::factory()->create(['role' => 'petugas_zakat']); // Assuming authenticated
        $tromol = \App\Models\TromolBox::factory()->create(['status' => 'active']);

        $url = \Illuminate\Support\Facades\URL::signedRoute('tromol.input', ['tromolBox' => $tromol->id]);

        $response = $this->actingAs($user)->get($url);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Tromol/Input'));
    }

    public function test_unsigned_url_rejected()
    {
        $user = \App\Models\User::factory()->create(['role' => 'petugas_zakat']);
        $tromol = \App\Models\TromolBox::factory()->create(['status' => 'active']);

        $url = route('tromol.input', ['tromolBox' => $tromol->id]); // Not signed

        $response = $this->actingAs($user)->get($url);

        $response->assertStatus(403);
    }

    public function test_inactive_tromol_rejected()
    {
        $user = \App\Models\User::factory()->create(['role' => 'petugas_zakat']);
        $tromol = \App\Models\TromolBox::factory()->create(['status' => 'inactive']);

        $url = \Illuminate\Support\Facades\URL::signedRoute('tromol.input', ['tromolBox' => $tromol->id]);

        $response = $this->actingAs($user)->get($url);

        $response->assertStatus(403);
    }
}
