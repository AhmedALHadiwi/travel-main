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
        Schema::create('transportations', function (Blueprint $table) {
            $table->id();
            $table->string('transport_type'); // e.g., Bus, Train, Car Rental
            // $table->string('provider'); // e.g., Company name
            $table->string('pickup_location'); // Departure location
            $table->string('dropoff_location'); // Arrival location
            $table->dateTime('transportationDate');
            $table->string('routeTo');   // ← هنا أضفت عمود route
            $table->string('routeFrom'); // ← هنا أضفت عمود routeFrom
            $table->decimal('passenger_count');
            $table->enum('status', ['Confimed', 'Pending', 'Cancelled'])->default('Pending');
            $table->text('notes')->nullable();
            $table->softDeletes(); // ← هنا أضفت عمود deleted_at للسوفت ديليت
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transportations');
    }
};
