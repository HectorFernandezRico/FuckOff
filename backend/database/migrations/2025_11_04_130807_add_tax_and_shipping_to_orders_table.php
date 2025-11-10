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
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('subtotal', 12, 2)->after('total_price')->default(0);
            $table->decimal('tax', 12, 2)->after('subtotal')->default(0); // IVA 21%
            $table->decimal('shipping_cost', 12, 2)->after('tax')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'tax', 'shipping_cost']);
        });
    }
};
