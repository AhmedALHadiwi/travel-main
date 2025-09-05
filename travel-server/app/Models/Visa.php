<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Visa extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'country',
        'visa_type',
        'application_date',
        'duration',
        'status',
        'applicationDetials',
        'notes',
    ];

    public function reservations()
    {
        return $this->morphMany(Reservation::class, 'reservable');
    }

}
