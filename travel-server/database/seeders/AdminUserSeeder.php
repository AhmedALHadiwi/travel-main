<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        // إنشاء Role admin لو مش موجود
        $role = Role::firstOrCreate(
            ['name' => 'admin'],
            [
                'description' => 'Administrator',
                'default_route' => '/dashboard'
            ]
        );

        // إنشاء Admin user لو مش موجود
        User::firstOrCreate(
            ['email' => 'admin@example.com'], // الشرط
            [
                'name' => 'Admin User',
                'first_name' => 'Admin',
                'last_name' => 'User',
                'user_name' => 'admin',
                'phone' => '01000000000',
                'address' => '123 Admin Street, Alexandria',
                'avatar_url' => null, // مفيش صورة حالياً
                'date_of_birth' => '1990-01-01',
                'bio' => 'System administrator with full privileges.',
                'status' => 'active',
                'email_verified_at' => now(),
                'password' => Hash::make('password123'), // كلمة المرور
                'role_id' => $role->id,
                'remember_token' => \Str::random(10),
                // 'salary' => 6000.00,
                // 'payment_method' => 'bank_transfer',
            ]
        );
    }
}
