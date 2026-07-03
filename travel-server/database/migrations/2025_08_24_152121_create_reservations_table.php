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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->onDelete('cascade');
            // بدل type + type_id → نستخدم polymorphic relation
            $table->morphs('reservable'); // ده هيعمل reservable_id + reservable_type
            // $table->enum('type',['Flight','Hotel','Cruise','Transportation','Visa','Insurance','Tickets','Appointment']);
            // $table->foreignId('type_id')->constrained('customers')->onDelete('cascade');
            $table->enum('status',['Hold','Issued','Cancelled'])->default('Hold');
            $table->decimal('sell_price');
            $table->decimal('cost');
            $table->decimal('fees');
            $table->decimal('net_profit');
            $table->text('notes')->nullable();
            $table->text('reason_cancelled')->nullable();
            $table->boolean('sent')->default(false);
            $table->timestamps();
            $table->softDeletes(); // ← هنا أضفت عمود deleted_at للسوفت ديليت
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
