<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // استدعاء Seeder الخاص بالـ Admin
        $this->call(AdminUserSeeder::class);
        $this->call(CompanySeeder::class);

        // لو عايز تعمل يوزر تجريبي (اختياري)
        // User::factory()->create([
        //     'name' => 'y',
        //     'email' => 'y@gmail.com',
        // ]);
    }
}
