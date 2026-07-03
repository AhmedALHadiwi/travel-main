<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Company;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;

class CompanyController extends Controller
{
    /**
     * Get company data with subscription
     */
    public function show($id): JsonResponse
    {
        try {
            $company = Company::with('subscription')->findOrFail($id);
            
            // Default settings structure
            $defaultSettings = [
                'siteName' => 'Company Portal',
                'logo' => null,
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
                    'server' => '',
                    'port' => '',
                    'email' => '',
                    'password' => '',
                ],
                'navigation' => $this->getDefaultNavigation(),
                'roles' => ['admin', 'employee', 'manager', 'accountant'],
            ];

            // Merge with stored settings
            $settings = array_merge($defaultSettings, $company->settings ?? []);
            
            // Clean and validate navigation items
            if (isset($settings['navigation'])) {
                $settings['navigation'] = array_filter($settings['navigation'], function($item) {
                    // Remove export items and validate required fields
                    return $item['id'] !== 'export' && 
                           !empty($item['id']) && 
                           !empty($item['type']) && 
                           isset($item['label']) &&
                           isset($item['icon']);
                });
                
                // Ensure all navigation items have required fields
                $settings['navigation'] = array_map(function($item) {
                    return [
                        'id' => $item['id'] ?? '',
                        'type' => $item['type'] ?? 'link',
                        'path' => $item['path'] ?? '#',
                        'label' => $item['label'] ?? '',
                        'icon' => $item['icon'] ?? 'Circle',
                        'order' => $item['order'] ?? 999,
                        'roles' => $item['roles'] ?? ['employee'],
                        'groupId' => $item['groupId'] ?? null,
                        'divider' => $item['divider'] ?? false,
                        'openInNewTab' => $item['openInNewTab'] ?? false,
                    ];
                }, $settings['navigation']);
                
                // Re-index array and sort by order
                $settings['navigation'] = array_values($settings['navigation']);
                usort($settings['navigation'], function($a, $b) {
                    return $a['order'] - $b['order'];
                });
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'company' => [
                        'id' => $company->id,
                        'name' => $company->name,
                        'subdomain' => $company->subdomain,
                        'settings' => $settings
                    ],
                    'subscription' => $company->subscription
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Company not found'
            ], 404);
        }
    }

    /**
     * Update company settings
     */
    public function updateSettings(Request $request, $id): JsonResponse
    {
        try {
            $company = Company::findOrFail($id);
            
            $currentSettings = $company->settings ?? [];
            $newSettings = array_merge($currentSettings, $request->all());
            
            $company->update(['settings' => $newSettings]);

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $company->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings'
            ], 500);
        }
    }

    /**
     * Update navigation
     */
    public function updateNavigation(Request $request, $id): JsonResponse
    {
        try {
            $company = Company::findOrFail($id);
            
            $currentSettings = $company->settings ?? [];
            $currentSettings['navigation'] = $request->input('navigation');
            
            $company->update(['settings' => $currentSettings]);

            return response()->json([
                'success' => true,
                'message' => 'Navigation updated successfully',
                'data' => $company->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update navigation'
            ], 500);
        }
    }

    /**
     * Save all settings (combined settings + navigation)
     */
    public function saveAllSettings(Request $request, $id): JsonResponse
    {
        try {
            $company = Company::findOrFail($id);
            
            $request->validate([
                'siteName' => 'sometimes|string|max:255',
                'logo' => 'sometimes|nullable|string',
                'favicon' => 'sometimes|nullable|string',
                'primaryColor' => 'sometimes|string|max:7',
                'secondaryColor' => 'sometimes|string|max:7',
                'shiftSettings' => 'sometimes|array',
                'general' => 'sometimes|array',
                'smtp' => 'sometimes|array',
                'navigation' => 'sometimes|array',
                'navigation.*.id' => 'required|string',
                'navigation.*.type' => 'required|string',
                'navigation.*.label' => 'required|string',
                'navigation.*.icon' => 'required|string',
                'navigation.*.order' => 'required|integer',
                'navigation.*.roles' => 'required|array',
                'roles' => 'sometimes|array'
            ]);
            
            $currentSettings = $company->settings ?? [];
            $newSettings = array_merge($currentSettings, $request->all());
            
            // Clean and validate navigation if provided
            if (isset($newSettings['navigation'])) {
                $newSettings['navigation'] = array_filter($newSettings['navigation'], function($item) {
                    return isset($item['id']) && 
                           isset($item['type']) && 
                           isset($item['label']) && 
                           isset($item['icon']) &&
                           !empty($item['id']) &&
                           !empty($item['label']) &&
                           !empty($item['icon']) &&
                           $item['id'] !== 'export';
                });
                
                // Ensure all required fields and sort by order
                $newSettings['navigation'] = array_map(function($item) {
                    return [
                        'id' => $item['id'],
                        'type' => $item['type'] ?? 'link',
                        'path' => $item['path'] ?? '#',
                        'label' => $item['label'],
                        'icon' => $item['icon'],
                        'order' => intval($item['order'] ?? 999),
                        'roles' => $item['roles'] ?? ['employee'],
                        'groupId' => $item['groupId'] ?? null,
                        'divider' => boolval($item['divider'] ?? false),
                        'openInNewTab' => boolval($item['openInNewTab'] ?? false),
                    ];
                }, $newSettings['navigation']);
                
                usort($newSettings['navigation'], function($a, $b) {
                    return $a['order'] - $b['order'];
                });
                
                $newSettings['navigation'] = array_values($newSettings['navigation']);
            }
            
            $company->update(['settings' => $newSettings]);

            return response()->json([
                'success' => true,
                'message' => 'All settings saved successfully',
                'data' => $company->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get company by subdomain
     */
    public function getBySubdomain($subdomain): JsonResponse
    {
        try {
            $company = Company::with('subscription')->where('subdomain', $subdomain)->firstOrFail();
            
            return $this->show($company->id);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Company not found'
            ], 404);
        }
    }

    /**
     * Default navigation items
     */
    private function getDefaultNavigation(): array
    {
        return [
            ['id' => 'dashboard', 'type' => 'link', 'path' => '/dashboard', 'label' => 'Dashboard', 'icon' => 'LayoutDashboard', 'order' => 1, 'roles' => ['admin', 'manager']],
            
            ['id' => 'attendance', 'type' => 'link', 'path' => '/attendance', 'label' => 'Shift Attendance', 'icon' => 'ClipboardCheck', 'order' => 2, 'roles' => ['employee', 'admin', 'manager']],

            ['id' => 'leave-requests', 'type' => 'link', 'path' => '/leave-requests', 'label' => 'Leave Requests', 'icon' => 'FileText', 'order' => 3, 'roles' => ['employee', 'admin', 'manager']],

            ['id' => 'my-reservations', 'type' => 'link', 'path' => '/my-reservations', 'label' => 'My Reservations', 'icon' => 'BookOpen', 'order' => 4, 'roles' => ['employee', 'admin', 'manager']],

            // EmployeeDashboard========================================================================
            // ['id' => 'employeeDashboard', 'type' => 'link', 'path' => '/employeeDashboard', 'label' => 'Employee Dashboard', 'icon' => 'LayoutDashboard', 'order' => 1, 'roles' => ['admin', 'manager','employee']],

            // AccountDashboard========================================================================
            ['id' => 'AccountDashboard', 'type' => 'link', 'path' => '/accountDashboard', 'label' => 'Account Dashboard', 'icon' => 'LayoutDashboard', 'order' => 1, 'roles' => ['accountant', 'admin', 'manager','employee']],

            ['id' => 'todo', 'type' => 'link', 'path' => '/todo', 'label' => 'To Do List', 'icon' => 'CheckSquare', 'order' => 5, 'roles' => ['employee', 'admin', 'manager']],

            ['id' => 'emails', 'type' => 'link', 'path' => '/emails', 'label' => 'Webmail', 'icon' => 'Mail', 'order' => 6, 'roles' => ['employee', 'admin', 'manager']],
            
            ['id' => 'divider-1', 'type' => 'group', 'label' => '', 'order' => 7, 'roles' => ['employee', 'admin', 'manager'], 'divider' => true],
            
            // External Links
            ['id' => 'group-external', 'type' => 'group', 'label' => 'External Links', 'order' => 8, 'roles' => ['employee', 'admin', 'manager']],
            ['id' => 'lavida-travel', 'type' => 'external', 'path' => 'https://lavidatravel.com', 'label' => 'Lavida Travel', 'icon' => 'Globe', 'order' => 9, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-external', 'openInNewTab' => true],
            ['id' => 'respond', 'type' => 'external', 'path' => 'https://respond.io', 'label' => 'Respond', 'icon' => 'MessageSquare', 'order' => 10, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-external', 'openInNewTab' => true],
            ['id' => 'calls', 'type' => 'external', 'path' => 'https://callsystem.example.com', 'label' => 'Calls', 'icon' => 'Phone', 'order' => 11, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-external', 'openInNewTab' => true],
            ['id' => 'mails', 'type' => 'external', 'path' => 'https://mail.example.com', 'label' => 'Mails', 'icon' => 'Mails', 'order' => 12, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-external', 'openInNewTab' => true],
            ['id' => 'sadad-pay', 'type' => 'external', 'path' => 'https://sadadpay.com', 'label' => 'Sadad Pay', 'icon' => 'CreditCard', 'order' => 13, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-external', 'openInNewTab' => true],
            
            // Bookings Section
            ['id' => 'group-bookings', 'type' => 'group', 'label' => 'Bookings Section', 'order' => 14, 'roles' => ['employee', 'admin', 'manager']],
            ['id' => 'flight-group', 'type' => 'link', 'path' => '#', 'label' => 'Flight', 'icon' => 'Plane', 'order' => 15, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-bookings'],
            ['id' => 'flight-bookings', 'type' => 'link', 'path' => '/flight/bookings', 'label' => 'Bookings', 'icon' => 'BookMarked', 'order' => 16, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'flight-group'],
            ['id' => 'flight-tickets', 'type' => 'link', 'path' => '/flight/tickets', 'label' => 'Tickets', 'icon' => 'Ticket', 'order' => 17, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'flight-group'],
            ['id' => 'hotels-group', 'type' => 'link', 'path' => '#', 'label' => 'Hotels', 'icon' => 'Hotel', 'order' => 18, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-bookings'],
            ['id' => 'hotel-bookings', 'type' => 'link', 'path' => '/hotels/bookings', 'label' => 'Bookings', 'icon' => 'BookMarked', 'order' => 19, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'hotels-group'],
            ['id' => 'hotel-checkin', 'type' => 'link', 'path' => '/hotels/checkin', 'label' => 'Check-in', 'icon' => 'ClipboardCheck', 'order' => 20, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'hotels-group'],
            ['id' => 'other-group', 'type' => 'link', 'path' => '#', 'label' => 'Other', 'icon' => 'MoreHorizontal', 'order' => 21, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'group-bookings'],
            ['id' => 'visa', 'type' => 'link', 'path' => '/visa', 'label' => 'Visa', 'icon' => 'FileCheck', 'order' => 22, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'other-group'],
            ['id' => 'insurance', 'type' => 'link', 'path' => '/insurance', 'label' => 'Insurance', 'icon' => 'ShieldCheck', 'order' => 23, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'other-group'],
            ['id' => 'transport', 'type' => 'link', 'path' => '/transport', 'label' => 'Transport', 'icon' => 'Car', 'order' => 24, 'roles' => ['employee', 'admin', 'manager'], 'groupId' => 'other-group'],
            
            ['id' => 'divider-2', 'type' => 'group', 'label' => '', 'order' => 25, 'roles' => ['admin', 'manager'], 'divider' => true],
            
            // Administration
            ['id' => 'group-admin', 'type' => 'group', 'label' => 'Administration', 'order' => 26, 'roles' => ['admin', 'manager']],
            ['id' => 'financial-accounts', 'type' => 'link', 'path' => '/financial-accounts', 'label' => 'Financial Accounts', 'icon' => 'TrendingUp', 'order' => 27, 'roles' => ['admin', 'accountant'], 'groupId' => 'group-admin'],
            ['id' => 'user-management', 'type' => 'link', 'path' => '/user-management', 'label' => 'User Management', 'icon' => 'Users', 'order' => 28, 'roles' => ['admin'], 'groupId' => 'group-admin'],
            ['id' => 'notifications', 'type' => 'link', 'path' => '/notifications', 'label' => 'Notifications', 'icon' => 'Bell', 'order' => 30, 'roles' => ['admin'], 'groupId' => 'group-admin'],
            ['id' => 'settings', 'type' => 'link', 'path' => '/settings', 'label' => 'Settings', 'icon' => 'Settings', 'order' => 32, 'roles' => ['admin'], 'groupId' => 'group-admin'],
            ['id' => 'profile', 'type' => 'link', 'path' => '/profile', 'label' => 'Profile', 'icon' => 'UserCircle', 'order' => 33, 'roles' => ['employee', 'admin', 'manager', 'accountant'], 'groupId' => 'group-admin'],
        ];
    }
}