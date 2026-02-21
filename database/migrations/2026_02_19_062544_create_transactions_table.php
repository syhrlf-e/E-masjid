<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('type', ['in', 'out']);
            $table->enum('category', ['zakat_fitrah', 'zakat_maal', 'infaq', 'infaq_tromol', 'operasional', 'gaji', 'lainnya']);
            $table->bigInteger('amount'); // Using bigint for integer-based currency
            $table->enum('payment_method', ['tunai', 'transfer', 'qris'])->nullable();
            $table->text('notes')->nullable();
            
            // Relationships
            $table->foreignUuid('donatur_id')->nullable()->constrained('donaturs')->nullOnDelete();
            $table->foreignUuid('tromol_box_id')->nullable()->constrained('tromol_boxes')->nullOnDelete();
            $table->foreignUuid('created_by')->constrained('users');
            
            // Approval flow
            $table->timestamp('verified_at')->nullable();
            $table->foreignUuid('verified_by')->nullable()->constrained('users');
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
