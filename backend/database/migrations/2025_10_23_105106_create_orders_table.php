<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // FK explícita hacia users.id
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');

            $table->decimal('total_price', 12, 2);
            $table->string('status')->default('pending'); // pending, paid, shipped, cancelled...
            $table->text('shipping_address')->nullable();
            $table->text('billing_address')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            // eliminar FK antes de soltar la tabla
            $table->dropForeign(['user_id']);
        });

        Schema::dropIfExists('orders');
    }
};