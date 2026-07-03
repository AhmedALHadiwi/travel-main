import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CompanyContext = createContext();

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};

// API configuration
const API_BASE_URL = 'http://travel-server.test/api';

// API helper functions
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/vnd.api+json',
            'Accept': 'application/vnd.api+json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
};

export const CompanyProvider = ({ children }) => {
    const [company, setCompany] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get company ID from localStorage or other source
    const getCompanyId = () => {
        return localStorage.getItem('companyId') || '1'; // Default to 1 for demo
    };

    // ✅ FIXED: Clean and validate navigation items - preserve dividers and groups
    const cleanNavigationItems = (items) => {
        if (!Array.isArray(items)) return [];

        return items
            .filter(item => {
                if (!item || !item.id) return false;

                // Don't filter out export items - let the UI handle this
                if (item.id === 'export') return false;

                // Allow all valid navigation items including dividers and groups
                return item.type && item.hasOwnProperty('label');
            })
            .map(item => ({
                id: item.id || '',
                type: item.type || 'link',
                path: item.path || '#',
                label: item.label || '', // ✅ Allow empty labels for dividers
                icon: item.icon || (item.type === 'group' && !item.divider ? 'Folder' : 'Circle'),
                order: typeof item.order === 'number' ? item.order : 999,
                roles: Array.isArray(item.roles) ? item.roles : ['employee'],
                groupId: item.groupId || null,
                divider: Boolean(item.divider),
                openInNewTab: Boolean(item.openInNewTab),
            }))
            .sort((a, b) => a.order - b.order);
    };

    // Load company data from API
    const loadCompanyData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const companyId = getCompanyId();

            if (!companyId) {
                throw new Error('No company ID found');
            }

            const response = await apiRequest(`/company/${companyId}`);

            if (response.success) {
                // Clean navigation before setting state
                const cleanedCompany = {
                    ...response.data.company,
                    settings: {
                        ...response.data.company.settings,
                        navigation: cleanNavigationItems(response.data.company.settings.navigation)
                    }
                };

                setCompany(cleanedCompany);
                setSubscription(response.data.subscription);
            } else {
                throw new Error(response.message || 'Failed to load company data');
            }
        } catch (error) {
            console.error('Failed to load company data:', error);
            setError(error.message);

            // Fallback to mock data in case of API failure (development mode)
            if (process.env.NODE_ENV === 'development') {
                const mockData = createMockData();
                setCompany({
                    ...mockData.company,
                    settings: {
                        ...mockData.company.settings,
                        navigation: cleanNavigationItems(mockData.company.settings.navigation)
                    }
                });
                setSubscription(mockData.subscription);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ FIXED: Create mock data with proper dividers
    const createMockData = () => {
        const defaultNavigation = [
            { id: 'dashboard', type: 'link', path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', order: 1, roles: ['admin', 'manager'] },
            { id: 'attendance', type: 'link', path: '/attendance', label: 'Shift Attendance', icon: 'ClipboardCheck', order: 2, roles: ['employee', 'admin', 'manager'] },
            { id: 'leave-requests', type: 'link', path: '/leave-requests', label: 'Leave Requests', icon: 'FileText', order: 3, roles: ['employee', 'admin', 'manager'] },
            { id: 'my-reservations', type: 'link', path: '/my-reservations', label: 'My Reservations', icon: 'BookOpen', order: 4, roles: ['employee', 'admin', 'manager'] },
            { id: 'todo', type: 'link', path: '/todo', label: 'To Do List', icon: 'CheckSquare', order: 5, roles: ['employee', 'admin', 'manager'] },
            { id: 'emails', type: 'link', path: '/emails', label: 'Webmail', icon: 'Mail', order: 6, roles: ['employee', 'admin', 'manager'] },

            // ✅ FIXED: Divider with proper structure
            { id: 'divider-1', type: 'divider', label: '', order: 7, roles: ['employee', 'admin', 'manager'] },

            // ========================= External Links
            { id: 'group-external', type: 'group', label: 'External Links', icon: 'ExternalLink', order: 8, roles: ['employee', 'admin', 'manager'] },
            { id: 'lavida-travel', type: 'external', path: 'https://lavidatravel.com', label: 'Lavida Travel', icon: 'Globe', order: 9, roles: ['employee', 'admin', 'manager'], groupId: 'group-external', openInNewTab: true },
            { id: 'respond', type: 'external', path: 'https://respond.io', label: 'Respond', icon: 'MessageSquare', order: 10, roles: ['employee', 'admin', 'manager'], groupId: 'group-external', openInNewTab: true },
            { id: 'calls', type: 'external', path: 'https://callsystem.example.com', label: 'Calls', icon: 'Phone', order: 11, roles: ['employee', 'admin', 'manager'], groupId: 'group-external', openInNewTab: true },
            { id: 'mails', type: 'external', path: 'https://mail.example.com', label: 'Mails', icon: 'Mail', order: 12, roles: ['employee', 'admin', 'manager'], groupId: 'group-external', openInNewTab: true },
            { id: 'sadad-pay', type: 'external', path: 'https://sadadpay.com', label: 'Sadad Pay', icon: 'CreditCard', order: 13, roles: ['employee', 'admin', 'manager'], groupId: 'group-external', openInNewTab: true },

            // ========================= Bookings Section 
            { id: 'group-bookings', type: 'group', label: 'Bookings Section', icon: 'Calendar', order: 14, roles: ['employee', 'admin', 'manager'] },
            { id: 'flight-group', type: 'link', path: '#', label: 'Flight', icon: 'Plane', order: 15, roles: ['employee', 'admin', 'manager'], groupId: 'group-bookings' },
            { id: 'flight-bookings', type: 'link', path: '/flight/bookings', label: 'Bookings', icon: 'BookMarked', order: 16, roles: ['employee', 'admin', 'manager'], groupId: 'flight-group' },
            { id: 'flight-tickets', type: 'link', path: '/flight/tickets', label: 'Tickets', icon: 'Ticket', order: 17, roles: ['employee', 'admin', 'manager'], groupId: 'flight-group' },
            { id: 'hotels-group', type: 'link', path: '#', label: 'Hotels', icon: 'Hotel', order: 18, roles: ['employee', 'admin', 'manager'], groupId: 'group-bookings' },
            { id: 'hotel-bookings', type: 'link', path: '/hotels/bookings', label: 'Bookings', icon: 'BookMarked', order: 19, roles: ['employee', 'admin', 'manager'], groupId: 'hotels-group' },
            { id: 'hotel-checkin', type: 'link', path: '/hotels/checkin', label: 'Check-in', icon: 'ClipboardCheck', order: 20, roles: ['employee', 'admin', 'manager'], groupId: 'hotels-group' },
            { id: 'other-group', type: 'link', path: '#', label: 'Other', icon: 'MoreHorizontal', order: 21, roles: ['employee', 'admin', 'manager'], groupId: 'group-bookings' },
            { id: 'visa', type: 'link', path: '/visa', label: 'Visa', icon: 'FileCheck', order: 22, roles: ['employee', 'admin', 'manager'], groupId: 'other-group' },
            { id: 'insurance', type: 'link', path: '/insurance', label: 'Insurance', icon: 'ShieldCheck', order: 23, roles: ['employee', 'admin', 'manager'], groupId: 'other-group' },
            { id: 'transport', type: 'link', path: '/transport', label: 'Transport', icon: 'Car', order: 24, roles: ['employee', 'admin', 'manager'], groupId: 'other-group' },

            // ✅ FIXED: Another divider
            { id: 'divider-2', type: 'divider', label: '', order: 25, roles: ['admin', 'manager'] },

            // ========================= Administration
            { id: 'group-admin', type: 'group', label: 'Administration', icon: 'Settings', order: 26, roles: ['admin', 'manager'] },
            { id: 'financial-accounts', type: 'link', path: '/financial-accounts', label: 'Financial Accounts', icon: 'TrendingUp', order: 27, roles: ['admin', 'accountant'], groupId: 'group-admin' },
            { id: 'user-management', type: 'link', path: '/user-management', label: 'User Management', icon: 'Users', order: 28, roles: ['admin'], groupId: 'group-admin' },
            { id: 'notifications', type: 'link', path: '/notifications', label: 'Notifications', icon: 'Bell', order: 30, roles: ['admin'], groupId: 'group-admin' },
            { id: 'settings', type: 'link', path: '/settings', label: 'Settings', icon: 'Settings', order: 32, roles: ['admin'], groupId: 'group-admin' },
            { id: 'profile', type: 'link', path: '/profile', label: 'Profile', icon: 'UserCircle', order: 33, roles: ['employee', 'admin', 'manager', 'accountant'], groupId: 'group-admin' },
        ];

        return {
            company: {
                id: 1,
                name: 'Demo Company',
                subdomain: 'demo',
                settings: {
                    siteName: 'Company Portal',
                    logo: null,
                    favicon: null,
                    primaryColor: '#3b82f6',
                    secondaryColor: '#1e40af',
                    shiftSettings: {
                        defaultShiftHours: 8,
                        defaultBreakMinutes: 60,
                        autoEndShift: true,
                        shiftsPerDay: 1,
                    },
                    general: {
                        timezone: 'UTC+02:00',
                        currency: 'EGP',
                    },
                    smtp: {
                        server: '',
                        port: '',
                        email: '',
                        password: '',
                    },
                    navigation: defaultNavigation.filter(item => item.id !== 'export'), // Don't clean here yet
                    roles: ['admin', 'employee', 'manager', 'accountant'],
                }
            },
            subscription: {
                id: 1,
                company_id: 1,
                plan: 'premium',
                status: 'active',
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                features: {
                    max_employees: 50,
                    max_bookings: 1000,
                    respond_integration: true,
                    advanced_reports: true
                }
            }
        };
    };

    // Load data on mount
    useEffect(() => {
        loadCompanyData();
    }, [loadCompanyData]);

    // Update company settings
    // Update company settings
    const updateCompanySettings = useCallback(async (newShiftSettings) => {
        try {
            const companyId = getCompanyId();

            const response = await apiRequest(`/company/${companyId}/settings`, {
                method: 'PATCH',
                body: JSON.stringify({
                    shiftSettings: newShiftSettings, // ✅ ركّز هنا
                }),
            });

            if (response.success) {
                setCompany(prev => ({
                    ...prev,
                    settings: {
                        ...prev.settings,
                        shiftSettings: response.data.shiftSettings, // ✅ تحديث من الباك
                    },
                }));
                return { success: true };
            } else {
                throw new Error(response.message || 'Failed to update settings');
            }
        } catch (error) {
            console.error('Failed to update company settings:', error);

            // Fallback to local state update in development
            if (process.env.NODE_ENV === 'development') {
                setCompany(prev => ({
                    ...prev,
                    settings: {
                        ...prev.settings,
                        shiftSettings: {
                            ...prev.settings.shiftSettings,
                            ...newShiftSettings, // ✅ merge في الديف
                        },
                    },
                }));
                return { success: true };
            }

            return { success: false, error: error.message };
        }
    }, []);


    // Update navigation
    const updateNavigation = useCallback(async (newNav) => {
        try {
            const companyId = getCompanyId();
            const cleanedNav = cleanNavigationItems(newNav);

            const response = await apiRequest(`/company/${companyId}/navigation`, {
                method: 'PATCH',
                body: JSON.stringify({ navigation: cleanedNav }),
            });

            if (response.success) {
                const updatedCompany = {
                    ...response.data,
                    settings: {
                        ...response.data.settings,
                        navigation: cleanNavigationItems(response.data.settings.navigation)
                    }
                };
                setCompany(updatedCompany);
                return { success: true };
            } else {
                throw new Error(response.message || 'Failed to update navigation');
            }
        } catch (error) {
            console.error('Failed to update navigation:', error);

            // Fallback to local state update in development
            if (process.env.NODE_ENV === 'development') {
                setCompany(prev => ({
                    ...prev,
                    settings: {
                        ...prev.settings,
                        navigation: cleanNavigationItems(newNav)
                    }
                }));
                return { success: true };
            }

            return { success: false, error: error.message };
        }
    }, []);

    // Check if feature is available
    const isFeatureAvailable = useCallback((feature) => {
        if (!subscription) return false;
        return subscription.features && subscription.features[feature] === true;
    }, [subscription]);

    // Check if subscription is active
    const isSubscriptionActive = useCallback(() => {
        if (!subscription) return false;
        return subscription.status === 'active' && new Date(subscription.expires_at) > new Date();
    }, [subscription]);

    // Get days until expiry
    const getDaysUntilExpiry = useCallback(() => {
        if (!subscription) return 0;
        const now = new Date();
        const expiry = new Date(subscription.expires_at);
        const diffTime = expiry - now;
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }, [subscription]);

    // Refresh data
    const refreshCompanyData = useCallback(() => {
        return loadCompanyData();
    }, [loadCompanyData]);

    // Save all settings (settings + navigation) in one request
    const saveAllSettings = useCallback(async (settings, navigation) => {
        try {
            const companyId = getCompanyId();
            const cleanedNav = cleanNavigationItems(navigation);

            const payload = {
                ...settings,
                navigation: cleanedNav
            };

            const response = await apiRequest(`/company/${companyId}/save-all-settings`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (response.success) {
                const updatedCompany = {
                    ...response.data,
                    settings: {
                        ...response.data.settings,
                        navigation: cleanNavigationItems(response.data.settings.navigation)
                    }
                };
                setCompany(updatedCompany);
                return { success: true };
            } else {
                throw new Error(response.message || 'Failed to save all settings');
            }
        } catch (error) {
            console.error('Failed to save all settings:', error);

            // Fallback to local state update in development
            if (process.env.NODE_ENV === 'development') {
                const cleanedNav = cleanNavigationItems(navigation);
                setCompany(prev => ({
                    ...prev,
                    settings: {
                        ...prev.settings,
                        ...settings,
                        navigation: cleanedNav
                    }
                }));
                return { success: true };
            }

            return { success: false, error: error.message };
        }
    }, []);

    const value = {
        company,
        subscription,
        loading,
        error,
        updateCompanySettings,
        updateNavigation,
        saveAllSettings,
        isFeatureAvailable,
        isSubscriptionActive,
        getDaysUntilExpiry,
        refreshCompanyData,
    };

    if (loading) {
        return (
            <CompanyContext.Provider value={value}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading company data...</p>
                    </div>
                </div>
            </CompanyContext.Provider>
        );
    }

    if (error && !company) {
        return (
            <CompanyContext.Provider value={value}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-600 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Company Data</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={refreshCompanyData}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </CompanyContext.Provider>
        );
    }

    return (
        <CompanyContext.Provider value={value}>
            {children}
        </CompanyContext.Provider>
    );
};