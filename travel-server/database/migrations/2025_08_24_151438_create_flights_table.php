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
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->string('flight_number');
            $table->string('from_airport'); // Departure airport
            $table->string('to_airport'); // Arrival airport
            $table->dateTime('departure_date');
            $table->dateTime('arrival_date');
            $table->string('airline');
            $table->text('passangerInfo');
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
        Schema::dropIfExists('flights');
    }
};
