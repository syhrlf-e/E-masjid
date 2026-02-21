<?php

namespace Tests\Unit;

use Tests\TestCase;

class TransactionAmountValidationTest extends TestCase
{
    public function test_amount_validation()
    {
        $rules = (new \App\Http\Requests\StoreTransactionRequest())->rules();

        // Valid case: provide all required fields
        $validator = \Illuminate\Support\Facades\Validator::make([
            'amount' => 100000,
            'type' => 'in',
            'category' => 'infaq',
        ], $rules);
        $this->assertTrue($validator->passes());

        // Invalid: non-numeric
        $validator = \Illuminate\Support\Facades\Validator::make(['amount' => 'abc', 'type' => 'in', 'category' => 'infaq'], $rules);
        $this->assertFalse($validator->passes());

        // Invalid: zero
        $validator = \Illuminate\Support\Facades\Validator::make(['amount' => 0, 'type' => 'in', 'category' => 'infaq'], $rules);
        $this->assertFalse($validator->passes());

        // Invalid: negative
        $validator = \Illuminate\Support\Facades\Validator::make(['amount' => -5000, 'type' => 'in', 'category' => 'infaq'], $rules);
        $this->assertFalse($validator->passes());

        // Invalid: exceeds max
        $validator = \Illuminate\Support\Facades\Validator::make(['amount' => 1000000001, 'type' => 'in', 'category' => 'infaq'], $rules);
        $this->assertFalse($validator->passes());
    }
}
