<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ZakatCalculatorTest extends TestCase
{
    protected $zakatService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->zakatService = new \App\Services\ZakatService();
    }

    public function test_hitung_zakat_maal()
    {
        $this->assertEquals(25000, $this->zakatService->hitungZakatMaal(1000000));
        $this->assertEquals(0, $this->zakatService->hitungZakatMaal(0));
        $this->assertEquals(0, $this->zakatService->hitungZakatMaal(-100000));
    }

    public function test_hitung_zakat_fitrah()
    {
        $this->assertEquals(150000, $this->zakatService->hitungZakatFitrah(3, 50000));
        $this->assertEquals(0, $this->zakatService->hitungZakatFitrah(0, 50000));
        $this->assertEquals(0, $this->zakatService->hitungZakatFitrah(3, -50000));
    }

    public function test_cek_nishab()
    {
        $this->assertTrue($this->zakatService->cekNishab(85000000, 85000000));
        $this->assertFalse($this->zakatService->cekNishab(84999999, 85000000));
    }
}
