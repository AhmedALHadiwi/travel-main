<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Reservation;
class Supplier extends Model
{
    /** @use HasFactory<\Database\Factories\SupplierFactory> */
    use HasFactory,SoftDeletes;

    protected $fillable = [
        'name',
        'phone',
        'payment_status',
    ];
      public function reservations()
    {
        return $this->hasMany(Reservation::class, 'reservable');
    }

   

}
