<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_name',
        'event_date',
        'status',
        'tickets_count',
        'quantity',
        'seat_category',
        'notes',
    ];
    public function reservations()
    {
        return $this->morphMany(Reservation::class, 'reservable');
    }

}
