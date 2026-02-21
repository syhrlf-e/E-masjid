<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TromolBox>
 */
class TromolBoxFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Kotak Infaq ' . $this->faker->word,
            'qr_code' => $this->faker->uuid,
            'location' => $this->faker->address,
            'status' => 'active',
        ];
    }
}
