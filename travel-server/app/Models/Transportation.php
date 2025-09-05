<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transportation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transport_type',
        'departure_date',
        'arrival_date',
        'status',
        'pickup_location',
        'dropoff_location',
        'passenger_count',
        'routeTo',
        'routeFrom',
        'notes',
    ];

    public function reservations()
    {
        return $this->morphMany(Reservation::class, 'reservable');
    }

}
