<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\Subscription;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultNavigation = [
            ['id' => 'dashboard', 'type' => 'link', 'path' => '/dashboard', 'label' => 'Dashboard', 'icon' => 'LayoutDashboard', 'order' => 1, 'roles' => ['admin', 'manager']],

             ['id' => 'attendance', 'type' => 'link', 'path' => '/attendance', 'label' => 'Shift Attendance', 'icon' => 'ClipboardCheck', 'order' => 2, 'roles' => ['employee', 'admin', 'manager']],

             ['id' => 'leave-requests', 'type' => 'link', 'path' => '/leave-requests', 'label' => 'Leave Requests', 'icon' => 'FileText', 'order' => 3, 'roles' => ['employee', 'admin', 'manager']],

             // reservations========================================================================
            ['id' => 'my-reservations', 'type' => 'link', 'path' => '/my-reservations', 'label' => 'My Reservations', 'icon' => 'BookOpen', 'order' => 4, 'roles' => ['employee', 'admin', 'manager']],
            // EmployeeDashboard========================================================================
            // ['id' => 'employee', 'type' => 'link', 'path' => '/employeeDashboard', 'label' => 'Employee Dashboard', 'icon' => 'LayoutDashboard', 'order' => 1, 'roles' => ['admin', 'manager','employee']],
            // AccountDashboard========================================================================
            ['id' => 'account', 'type' => 'link', 'path' => '/accountDashboard', 'label' => 'Account Dashboard', 'icon' => 'LayoutDashboard', 'order' => 1, 'roles' => ['accountant', 'admin', 'manager','employee']],

        
         
            ['id' => 'todo', 'type' => 'link', 'path' => '/todo', 'label' => 'To Do List', 'icon' => 'CheckSquare', 'order' => 5, 'roles' => ['employee', 'admin', 'manager']],
            ['id' => 'emails', 'type' => 'link', 'path' => '/emails', 'label' => 'Webmail', 'icon' => 'Mail', 'order' => 6, 'roles' => ['employee', 'admin', 'manager']],
            
            // ✅ FIXED: Divider with proper structure
            ['id' => 'divider-1', 'type' => 'divider', 'label' => '', 'order' => 7, 'roles' => ['employee', 'admin', 'manager'], 'divider' => true],
            
            // ========================= External Links Group
            ['id' => 'group-external', 'type' => 'group', 'label' => 'External Links', 'icon' => 'ExternalLink', 'order' => 8, 'roles' => ['employee', 'admin', 'manager']],
            ['id' => 'lavida-travel', 'type' => 'external', 'path' => 'https://lavidatravel.com', 'label' => 'Lavida Travel', 'icon' => 'Globe', 'order' => 9, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-external', 'openInNewTab' => true],
            ['id' => 'respond', 'type' => 'external', 'path' => 'https://respond.io', 'label' => 'Respond', 'icon' => 'MessageSquare', 'order' => 10, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-external', 'openInNewTab' => true],
            ['id' => 'calls', 'type' => 'external', 'path' => 'https://callsystem.example.com', 'label' => 'Calls', 'icon' => 'Phone', 'order' => 11, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-external', 'openInNewTab' => true],
            ['id' => 'mails', 'type' => 'external', 'path' => 'https://mail.example.com', 'label' => 'Mails', 'icon' => 'Mail', 'order' => 12, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-external', 'openInNewTab' => true],
            ['id' => 'sadad-pay', 'type' => 'external', 'path' => 'https://sadadpay.com', 'label' => 'Sadad Pay', 'icon' => 'CreditCard', 'order' => 13, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-external', 'openInNewTab' => true],
            
            // ========================= Bookings Section Group
            ['id' => 'group-bookings', 'type' => 'group', 'label' => 'Bookings Section', 'icon' => 'Calendar', 'order' => 14, 'roles' => ['employee', 'admin', 'manager']],
            
            // Flight Sub-group
            ['id' => 'flight-group', 'type' => 'group', 'label' => 'Flight', 'icon' => 'Plane', 'order' => 15, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-bookings'],
            ['id' => 'flight-bookings', 'type' => 'link', 'path' => '/flight/bookings', 'label' => 'Bookings', 'icon' => 'BookMarked', 'order' => 16, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'flight-group'],
            ['id' => 'flight-tickets', 'type' => 'link', 'path' => '/flight/tickets', 'label' => 'Tickets', 'icon' => 'Ticket', 'order' => 17, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'flight-group'],
            
            // Hotels Sub-group
            ['id' => 'hotels-group', 'type' => 'group', 'label' => 'Hotels', 'icon' => 'Hotel', 'order' => 18, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-bookings'],
            ['id' => 'hotel-bookings', 'type' => 'link', 'path' => '/hotels/bookings', 'label' => 'Bookings', 'icon' => 'BookMarked', 'order' => 19, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'hotels-group'],
            ['id' => 'hotel-checkin', 'type' => 'link', 'path' => '/hotels/checkin', 'label' => 'Check-in', 'icon' => 'ClipboardCheck', 'order' => 20, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'hotels-group'],
            
            // Other Sub-group
            ['id' => 'other-group', 'type' => 'group', 'label' => 'Other', 'icon' => 'MoreHorizontal', 'order' => 21, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-bookings'],
            ['id' => 'visa', 'type' => 'link', 'path' => '/visa', 'label' => 'Visa', 'icon' => 'FileCheck', 'order' => 22, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'other-group'],
            ['id' => 'insurance', 'type' => 'link', 'path' => '/insurance', 'label' => 'Insurance', 'icon' => 'ShieldCheck', 'order' => 23, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'other-group'],
            ['id' => 'transport', 'type' => 'link', 'path' => '/transport', 'label' => 'Transport', 'icon' => 'Car', 'order' => 24, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'other-group'],
            
            // ✅ FIXED: Another divider
            ['id' => 'divider-2', 'type' => 'divider', 'label' => '', 'order' => 25, 'roles' => ['admin', 'manager'], 'divider' => true],
            
            // ========================= Administration Group
            ['id' => 'group-admin', 'type' => 'group', 'label' => 'Administration', 'icon' => 'Settings', 'order' => 26, 'roles' => ['admin', 'manager']],
            ['id' => 'financial-accounts', 'type' => 'link', 'path' => '/financial-accounts', 'label' => 'Financial Accounts', 'icon' => 'TrendingUp', 'order' => 27, 'roles' => ['admin', 'accountant'], 'groupId' => 'group-admin'],
            ['id' => 'user-management', 'type' => 'link', 'path' => '/user-management', 'label' => 'User Management', 'icon' => 'Users', 'order' => 28, 'roles' => ['admin'], 'groupId' => 'group-admin'],
            ['id' => 'notifications', 'type' => 'link', 'path' => '/notifications', 'label' => 'Notifications', 'icon' => 'Bell', 'order' => 30, 'roles' => ['admin'], 'groupId' => 'group-admin'],
            ['id' => 'settings', 'type' => 'link', 'path' => '/settings', 'label' => 'Settings', 'icon' => 'Settings', 'order' => 32, 'roles' => ['admin'], 'groupId' => 'group-admin'],
            ['id' => 'profile', 'type' => 'link', 'path' => '/profile', 'label' => 'Profile', 'icon' => 'UserCircle', 'order' => 33, 'roles' => ['employee', 'admin', 'manager', 'accountant'], 'groupId' => 'group-admin'],
        ];

        $defaultSettings = [
            'siteName' => 'Shiftiy',
            // IF Need Change the logo, change the logo Photo in the public in laravel folder and in the database as well
            'logo' => "logo2.jpg",
            'favicon' => null,
            'primaryColor' => '#3b82f6',
            'secondaryColor' => '#1e40af',
            'shiftSettings' => [
                'defaultShiftHours' => 8,
                'defaultBreakMinutes' => 60,
                'autoEndShift' => true,
                'shiftsPerDay' => 1,
            ],
            'general' => [
                'timezone' => 'UTC+02:00',
                'currency' => 'EGP',
            ],
            'smtp' => [
                'defaultProvider' => 'Hostinger Mail',
                'server' => 'smtp.hostinger.com',
                'port' => '500',
                'email' => 'admin@example.com',
                'password' => '123456',
            ],
            'navigation' => $defaultNavigation,
            'roles' => ['admin', 'employee', 'manager', 'accountant'],
        ];

        // Create demo company
        $company = Company::create([
            'name' => 'Lavida Travel Company',
            'subdomain' => 'demo',
            'settings' => $defaultSettings
        ]);

        // Create subscription for the company
        Subscription::create([
            'company_id' => $company->id,
            'plan' => 'premium',
            'status' => 'active',
            'expires_at' => now()->addDays(30),
            'features' => [
                'max_employees' => 50,
                'max_bookings' => 1000,
                'respond_integration' => true,
                'advanced_reports' => true
            ]
        ]);

        // Create another test company
        $company2 = Company::create([
            'name' => 'Test Company',
            'subdomain' => 'test',
            'settings' => $defaultSettings
        ]);

        Subscription::create([
            'company_id' => $company2->id,
            'plan' => 'basic',
            'status' => 'active',
            'expires_at' => now()->addDays(15),
            'features' => [
                'max_employees' => 10,
                'max_bookings' => 100,
                'respond_integration' => false,
                'advanced_reports' => false
            ]
        ]);
    }
}