<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Customer;
use App\Models\Supplier;
class Reservation extends Model
{
    /** @use HasFactory<\Database\Factories\ReservationFactory> */
    use HasFactory ,SoftDeletes;

    protected $fillable = [
        'customer_id',
        'reservable_id',
        'reservable_type',
        'status',
        'notes',
        'reason_cancelled',
        'sell_price',
        'cost',
        'fees',
        'net_profit',
    ];

    public function reservable()
    {
        return $this->morphTo();
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
