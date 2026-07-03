import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import {
    LayoutDashboard, Briefcase, Clock, Download, FileText, Calendar as CalendarIcon, UserCheck, Wifi, WifiOff, Coffee, Check,
    X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from '@/components/ui/use-toast';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';
import { useShift } from "@/contexts/ShiftContext";

const Dashboard = () => {
    const { t } = useLanguage();
    const { token } = useAuth;
    const { supabase } = useSupabase();
    const [allUsers, setAllUsers] = useState([]);
    const [employeeStatus, setEmployeeStatus] = useState([]);
    // const [isLoading, setIsLoading] = useState(true);
    const [loading, setLoading] = useState({ leaves: true, shifts: true, status: true, users: true });
    // LeaveRequests ---------------------------------------------------------
    const [leaveRequests, setRequests] = useState([]);
    const [filteredLeaveRequests, setFilteredLeaveRequests] = useState([]);
    const [leaveFilter, setLeaveFilter] = useState('this_month');
    const [leaveUserFilter, setLeaveUserFilter] = useState('all');
    const [leaveDateRange, setLeaveDateRange] = useState({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
    // Shifts ---------------------------------------------------------
    const [shiftUserFilter, setShiftUserFilter] = useState('all');
    const [shiftsReport, setShiftsReport] = useState([]);
    const [shiftFilter, setShiftFilter] = useState('today');
    const [shiftDateRange, setShiftDateRange] = useState({ from: startOfDay(new Date()), to: endOfDay(new Date()) });
    const [filteredShifts, setFilterShifts] = useState([]);
    const { shiftState } = useShift();
    const API_BASE = 'http://travel-server.test/api';
    const statusLabels = {
        not_started: "Offline",
        active: "Online",
        on_break: "On Break",
        ended: "Ended",
    };

    const statusColors = {
        not_started: "text-gray-500",
        active: "text-green-600",
        on_break: "text-yellow-600",
        ended: "text-red-600",
    };
    const statusMap = {
        approved: { text: t('approved'), color: 'text-green-500' },
        pending: { text: t('pending'), color: 'text-yellow-500' },
        rejected: { text: t('rejected'), color: 'text-red-500' },
        online: { text: t('online'), color: 'text-green-500', icon: <Wifi className="h-4 w-4" /> },
        on_break: { text: t('onBreak'), color: 'text-yellow-500', icon: <Coffee className="h-4 w-4" /> },
        offline: { text: t('offline'), color: 'text-gray-500', icon: <WifiOff className="h-4 w-4" /> },
    };
    const filterLeaveRequests = () => {
        let filtered = [...leaveRequests];

        // 🟢 فلترة حسب اليوزر
        if (leaveUserFilter !== "all") {
            filtered = filtered.filter((req) => req.user_id === leaveUserFilter);
        }

        // 🟢 فلترة حسب التاريخ
        const now = new Date();
        let dateRange = { from: null, to: null };

        switch (leaveFilter) {
            case "today":
                dateRange = { from: startOfDay(now), to: endOfDay(now) };
                break;
            case "this_week":
                dateRange = { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
                break;
            case "this_month":
                dateRange = { from: startOfMonth(now), to: endOfMonth(now) };
                break;
            case "custom":
                if (leaveDateRange.from && leaveDateRange.to) {
                    dateRange = { from: leaveDateRange.from, to: leaveDateRange.to };
                }
                break;
            default:
                break;
        }

        // لو في Range فلترة حسبه
        if (dateRange.from && dateRange.to) {
            filtered = filtered.filter((req) => {
                const leaveDate = new Date(req.leave_date); // لازم تتأكد إن عندك الحقل ده
                return isWithinInterval(leaveDate, { start: dateRange.from, end: dateRange.to });
            });
        }

        setFilteredLeaveRequests(filtered);
    };
    const filterShifts = () => {
        let filtered = [...shiftsReport];

        // 🟢 فلترة حسب اليوزر
        if (shiftUserFilter !== "all") {
            filtered = filtered.filter((req) => req.user_id === shiftUserFilter);
        }

        // 🟢 فلترة حسب التاريخ
        const now = new Date();
        let dateRange = { from: null, to: null };

        switch (filteredShifts) {
            case "today":
                dateRange = { from: startOfDay(now), to: endOfDay(now) };
                break;
            case "this_week":
                dateRange = { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
                break;
            case "this_month":
                dateRange = { from: startOfMonth(now), to: endOfMonth(now) };
                break;
            case "custom":
                if (shiftDateRange.from && shiftDateRange.to) {
                    dateRange = { from: shiftDateRange.from, to: shiftDateRange.to };
                }
                break;
            default:
                break;
        }

        // لو في Range فلترة حسبه
        if (dateRange.from && dateRange.to) {
            filtered = filtered.filter((req) => {
                const leaveDate = new Date(req.leave_date); // لازم تتأكد إن عندك الحقل ده
                return isWithinInterval(leaveDate, { start: dateRange.from, end: dateRange.to });
            });
        }

        setFilterShifts(filtered);
    };
    // Function To Filtiration Data IN dASHbOARD 
    const getDateRange = (filter, customRange) => {
        const now = new Date();
        switch (filter) {
            case 'today': return { from: startOfDay(now), to: endOfDay(now) };
            case 'this_week': return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
            case 'this_month': return { from: startOfMonth(now), to: endOfMonth(now) };
            case 'custom': return customRange;
            default: return { from: startOfDay(now), to: endOfDay(now) };
        }
    };
    // Function Fetch AllUsers
    const fetchAllUsers = useCallback(async () => {
        setLoading(prev => ({ ...prev, users: true }));
        try {
            const res = await fetch(`${API_BASE}/users`, { headers: { Accept: 'application/json' } });
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            console.log('Users data:', data); // شوف شكل الداتا بالظبط
            setAllUsers(Array.isArray(data) ? data : (data.data || [])); // لو الداتا بتلف الداتا جوه object مثلاً
        } catch (error) {
            toast({ title: 'Error fetching users', description: error.message, variant: 'destructive' });
            setAllUsers([]);
        } finally {
            setLoading(prev => ({ ...prev, users: false }));
        }
    }, []);


    const fetchEmployeeStatus = useCallback(async () => {
        if (!supabase) return;
        setLoading(prev => ({ ...prev, status: true }));
        try {
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const { data: users, error: usersError } = await supabase
                .from('user_profiles')
                .select('id, username, avatar_url, shifts(start_time, end_time, breaks(start_time, end_time))')
                .eq('status', 'active');
            if (usersError) throw usersError;

            const statuses = users.map(user => {
                const todayShifts = user.shifts ? user.shifts.filter(s => format(new Date(s.start_time), 'yyyy-MM-dd') === todayStr) : [];
                const activeShift = todayShifts.find(s => !s.end_time);
                if (activeShift) {
                    const onBreak = activeShift.breaks ? activeShift.breaks.some(b => !b.end_time) : false;
                    return { ...user, current_status: onBreak ? 'on_break' : 'online' };
                }
                return { ...user, current_status: 'offline' };
            }).sort((a, b) => {
                const order = { online: 1, on_break: 2, offline: 3 };
                return order[a.current_status] - order[b.current_status];
            });
            setEmployeeStatus(statuses);
        } catch (error) {
            toast({ title: t('errorLoadingData'), description: error.message, variant: "destructive" });
        } finally {
            setLoading(prev => ({ ...prev, status: false }));
        }
    }, [supabase, t]);

    // Function Fetch Leave Requests
    const fetchLeaveRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/leave-requests/`);
            if (!res.ok) throw new Error('Failed to fetch leave requests');
            const data = await res.json();
            const transformed = data.map(req => ({
                ...req,
                leave_date: req.leave_date ? new Date(req.leave_date) : null
            }));
            setRequests(transformed);
        } catch (error) {
            toast({ title: t('errorFetchingLeaveRequests'), description: error.message, variant: "destructive" });
        }
        setLoading(false);
    }, [t]);

    // Function Fetch Shifts Report
    const fetchShiftsReport = useCallback(async () => {
        setLoading(prev => ({ ...prev, shifts: true }));
        const { from, to } = getDateRange(shiftFilter, shiftDateRange);
        if (!from || !to) {
            setLoading(prev => ({ ...prev, shifts: false }));
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No token found in session storage');
            }

            // Build query parameters
            const params = new URLSearchParams({
                start_date: from.toISOString().split('T')[0], // Format: YYYY-MM-DD
                end_date: to.toISOString().split('T')[0],
                order_by: 'start_time',
                order_direction: 'desc'
            });

            // Add user filter if not 'all'
            if (shiftUserFilter !== 'all') {
                params.append('user_id', shiftUserFilter);
            }
            console.log('params', params);
            const response = await fetch(`${API_BASE}/shifts/report?${params}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/vnd.api+json",
                    "Accept": "application/vnd.api+json",
                    "Authorization": `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setShiftsReport(data);
            console.log('Shifts report data:', data);

        } catch (error) {
            console.error('Error fetching shifts report:', error);
            toast({
                title: t('errorFetchingShiftReport'),
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(prev => ({ ...prev, shifts: false }));
        }
    }, [shiftFilter, shiftDateRange, shiftUserFilter, t]);

    useEffect(() => {
        fetchAllUsers();
        fetchEmployeeStatus();
    }, [fetchAllUsers, fetchEmployeeStatus]);
    useEffect(() => {
        filterLeaveRequests();
    }, [leaveRequests, leaveUserFilter, leaveFilter, leaveDateRange]);
    useEffect(() => {
        filterShifts();
    }, [shiftsReport, shiftUserFilter, filteredShifts, shiftDateRange]);


    useEffect(() => { fetchLeaveRequests(); }, [fetchLeaveRequests]);
    useEffect(() => { fetchShiftsReport(); }, [fetchShiftsReport]);


    const handleExport = (formatType, data, columns, title) => {
        const exportData = data.map(row => {
            let newRow = {};
            columns.forEach(c => {
                newRow[c.header] = c.accessor(row);
            });
            return newRow;
        });

        if (formatType === 'pdf') {
            const doc = new jsPDF();
            doc.text(title, 14, 15);
            doc.autoTable({
                head: [columns.map(c => c.header)],
                body: exportData.map(row => Object.values(row)),
            });
            doc.save(`${title}.pdf`);
        } else if (formatType === 'excel') {
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
            XLSX.writeFile(workbook, `${title}.xlsx`);
        }
    };

    const formatNetTime = (shift) => {
        if (!shift.end_time) return t('active');
        const netSeconds = ((new Date(shift.end_time) - new Date(shift.start_time)) / 1000) - (shift.total_break_seconds || 0);
        if (isNaN(netSeconds) || netSeconds < 0) return `00:00:00`;
        const h = String(Math.floor(netSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((netSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(Math.floor(netSeconds % 60)).padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'dd/MM/yyyy, HH:mm');
    };

    const leaveColumns = [
        {
            header: t('employee'), accessor: row => row.user_profiles?.user_name || 'N/A', render: row => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={`http://travel-server.test/uploads/users/${row?.user.avatar_url}`} />
                        <AvatarFallback>{row.user?.user_name?.charAt(0)}</AvatarFallback></Avatar>
                    {row?.user.user_name}
                </div>
            )
        },
        { header: t('leaveType'), accessor: row => t(row.leave_type) },
        { header: t('leaveDate'), accessor: row => formatDate(row.leave_date) },
        { header: t('reason'), accessor: row => row.notes || '-' },
        {
            header: t('status'), accessor: row => statusMap[row.status]?.text || row.status, render: row => (
                <span className={statusMap[row.status]?.color}>{statusMap[row.status]?.text}</span>
            )
        },
    ];

    const shiftColumns = [
        {
            header: t('employee'),
            accessor: row => row.user?.user_name || 'N/A',
            render: row => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={`http://travel-server.test/uploads/users/${row?.avatar_url}`} />
                        <AvatarFallback>{row?.user_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {row?.user_name}
                </div>
            )
        },
        { header: t('shiftStart'), accessor: row => formatDateTime(row.start_time) },
        { header: t('shiftEnd'), accessor: row => row.end_time ? formatDateTime(row.end_time) : t('active') },
        { header: t('netTime'), accessor: row => formatNetTime(row) },
    ];


    return (
        <>
            <Helmet><title>{t('dashboard')} - {t('companyName')}</title></Helmet>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
                <h1 className="text-3xl font-bold text-gradient flex items-center gap-3"><LayoutDashboard /> {t('dashboard')}</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="glass-effect lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCheck />{t('employeesStatus')}</CardTitle>
                        </CardHeader>
                        <CardContent className="max-h-[450px] overflow-y-auto">
                            <ul className="space-y-3">
                                {loading.status ? <li className="text-center">{t('loading')}...</li> : allUsers.map(emp => (
                                    <li key={emp.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            {/* Photo of Employee  */}
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={`http://travel-server.test/uploads/users/${emp.avatar_url}`} />
                                                <AvatarFallback>{emp.user_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {/* User NAME    */}
                                            <span className="font-medium">{emp.user_name}</span>
                                        </div>
                                        {/* <div className={`flex items-center gap-2 text-sm font-semibold ${statusMap[emp.current_status]?.color}`}>
                                            {statusMap[emp.current_status]?.icon}
                                            <span>{statusMap[emp.current_status]?.text}</span>
                                        </div> */}
                                        {/* <span className={`capitalize text-xs px-2 py-1 rounded-full flex items-center gap-1 ${emp.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                            {emp.status === 'active' ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}{emp.status}
                                        </span> */}
                                        <span className={`font-semibold ${statusColors[shiftState.status]}`}>

                                            {statusLabels[shiftState.status]}


                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    {/* Section leaveRequests */}
                    <Card className="glass-effect lg:col-span-2">
                        <CardHeader>
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <CardTitle className="flex items-center gap-2"><Briefcase />{t('leaveRequests')}</CardTitle>
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* DropDown List of Users  */}
                                    <Select value={leaveUserFilter} onValueChange={setLeaveUserFilter}>
                                        <SelectTrigger className="w-auto min-w-[150px]">
                                            <SelectValue placeholder={t('filterByEmployee')} /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('allEmployees')}</SelectItem>
                                            {allUsers.map(user => <SelectItem key={user.id} value={user.id}>{user.user_name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>

                                    {/* DropDown List of DateRange  */}
                                    <Select value={leaveFilter} onValueChange={setLeaveFilter}>
                                        <SelectTrigger className="w-auto min-w-[120px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="today">{t('today')}</SelectItem>
                                            <SelectItem value="this_week">{t('thisWeek')}</SelectItem>
                                            <SelectItem value="this_month">{t('thisMonth')}</SelectItem>
                                            <SelectItem value="custom">{t('custom')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {leaveFilter === 'custom' && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {leaveDateRange.from ? (leaveDateRange.to ? `${format(leaveDateRange.from, "dd/MM/yy")} - ${format(leaveDateRange.to, "dd/MM/yy")}` : format(leaveDateRange.from, "dd/MM/yy")) : <span>{t('pickADate')}</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="range" selected={leaveDateRange} onSelect={setLeaveDateRange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="max-h-[450px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>{leaveColumns.map(col => <TableHead key={col.header}>{col.header}</TableHead>)}</TableRow></TableHeader>
                                <TableBody>
                                    {loading.leaves ? (
                                        <TableRow>
                                            <TableCell colSpan={leaveColumns.length} className="text-center">
                                                {t('loading')}...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredLeaveRequests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={leaveColumns.length} className="text-center">
                                                {t('noData')}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredLeaveRequests.map((req) => (
                                            <TableRow key={req.id}>
                                                {leaveColumns.map((col) => (
                                                    <TableCell key={col.header}>
                                                        {col.render ? col.render(req) : col.accessor(req)}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>

                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Section shiftReport  */}
                <Card className="glass-effect">
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div className="flex-grow">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock />
                                    {t('shiftReport')}
                                </CardTitle>
                            </div>

                            {/* ===== Filters Section ===== */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Filter by Employee */}
                                <Select value={shiftUserFilter} onValueChange={setShiftUserFilter}>
                                    <SelectTrigger className="w-auto min-w-[150px]">
                                        <SelectValue placeholder={t('filterByEmployee')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('allEmployees')}</SelectItem>
                                        {allUsers.map(user => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.user_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Filter by Date */}
                                <Select value={shiftFilter} onValueChange={setShiftFilter}>
                                    <SelectTrigger className="w-auto min-w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="today">{t('today')}</SelectItem>
                                        <SelectItem value="this_week">{t('thisWeek')}</SelectItem>
                                        <SelectItem value="this_month">{t('thisMonth')}</SelectItem>
                                        <SelectItem value="custom">{t('custom')}</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Custom Date Range */}
                                {shiftFilter === 'custom' && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-[240px] justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {shiftDateRange.from ? (
                                                    shiftDateRange.to ? (
                                                        `${format(shiftDateRange.from, "dd/MM/yy")} - ${format(
                                                            shiftDateRange.to,
                                                            "dd/MM/yy"
                                                        )}`
                                                    ) : (
                                                        format(shiftDateRange.from, "dd/MM/yy")
                                                    )
                                                ) : (
                                                    <span>{t('pickADate')}</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="range"
                                                selected={shiftDateRange}
                                                onSelect={setShiftDateRange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}

                                {/* Export Buttons */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handleExport('pdf', filteredShifts, shiftColumns, 'Shifts Report')
                                    }
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    {t('pdf')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handleExport('excel', filteredShifts, shiftColumns, 'Shifts Report')
                                    }
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    {t('excel')}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    {/* ===== Table Section ===== */}
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {shiftColumns.map(col => (
                                        <TableHead key={col.header}>{col.header}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading.shifts ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={shiftColumns.length}
                                            className="text-center"
                                        >
                                            {t('loading')}...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredShifts.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={shiftColumns.length}
                                            className="text-center"
                                        >
                                            {t('noDataFound')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredShifts.map(shift => (
                                        <TableRow key={shift.id}>
                                            {shiftColumns.map(col => (
                                                <TableCell key={col.header}>
                                                    {col.render ? col.render(shift) : col.accessor(shift)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </motion.div>
        </>
    );
};

export default Dashboard;