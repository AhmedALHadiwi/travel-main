<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Insurance extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'insurance_type',
        'provider',
        'start_date',
        'end_date',
        'coverage_details',
        'insured_persons',
        'status',
        'notes',
    ];

    public function reservations()
    {
        return $this->morphMany(Reservation::class, 'reservable');
    }

}
