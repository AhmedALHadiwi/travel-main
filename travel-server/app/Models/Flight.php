<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Flight extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'flight_number',
        'departure_date',
        'arrival_date',
        'from_airport',
        'to_airport',
        'airline',
        'status',
        'passangerInfo',
        'notes',
    ];
    public function reservations()
    {
        return $this->morphMany(Reservation::class, 'reservable');
    }

}
