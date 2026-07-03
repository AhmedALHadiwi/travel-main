<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Relations\HasMany;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
// Using SoftDelete
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Role;
use App\Models\Leave_request;
use App\Models\Shift;
use App\Models\EmailAccount;
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    use SoftDeletes;

    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'address',
        'role_id',
        'bio',
        'avatar_url',
        // 'salary',
        // 'payment_method',
    ];


    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    // =============================================================================
    // function to soft delete user and its leave requests
    // user el atmas7 ytmas7 m3a leaverequest bta3o 3lashan msh hyb2a ly m3na user=null msh sa7
    protected static function booted()
    {
        static::deleting(function ($user) {
            if (!$user->isForceDeleting()) {
                // Soft delete leave requests
                $user->leaveRequests()->delete();
                // Soft delete Shifts
                $user->shifts()->delete();
                // Soft delete Email_accounts
                $user->emailAccounts()->delete();
            }
        });
    }
    // =============================================================================

    // Role Relationships
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    // =============================================================================
    // LeaveRequest Relationship
    public function leaveRequests()
    {
        return $this->hasMany(Leave_request::class, 'user_id');
    }

    // =============================================================================
    // Shift Relationships
    public function shifts(): HasMany
    {
        return $this->hasMany(Shift::class);
    }

    // =============================================================================
    // ToDo Relation
    public function todos(): HasMany
    {
        return $this->hasMany(Todo::class);
    }
    // =============================================================================
    // Email Accounts Relation
    public function emailAccounts(): HasMany
    {
        return $this->hasMany(EmailAccount::class);
    }
    // =============================================================================
    //  public function userProfile()
    // // {
    // //     return $this->hasOne(UserProfile::class, 'id', 'id');
    // // }





    // public function emailAccounts(): HasMany
    // {
    //     return $this->hasMany(EmailAccount::class);
    // }


    // public function notifications(): HasMany
    // {
    //     return $this->hasMany(Notification::class);
    // }


}
