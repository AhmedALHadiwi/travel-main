import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from '@/components/ui/use-toast';
import { format, endOfDay, isAfter, startOfMonth, endOfMonth, startOfDay, getDaysInMonth } from 'date-fns';
import ShiftControls from '@/components/attendance/ShiftControls';
import AttendanceCalendar from '@/components/attendance/AttendanceCalendar';
import ShiftDetailsModal from '@/components/attendance/ShiftDetailsModal';
import { useShift } from "@/contexts/ShiftContext";

const API_BASE = "http://travel-server.test/api";

const Attendance = () => {
  const { t, isRTL } = useLanguage();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const { company } = useCompany();

  const { shiftState, setShiftState } = useShift();

  const [shiftCount, setShiftCount] = useState(0);
  const [lastShiftDuration, setLastShiftDuration] = useState(0);
  const [timers, setTimers] = useState({ shift: 0, break: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState({ shifts: [], date: null });
  const [monthWorkHours, setMonthWorkHours] = useState(0);
  const [approvedLeavesCount, setApprovedLeavesCount] = useState(0);
  const [isShiftActionLoading, setIsShiftActionLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null);

  const settings = useMemo(() => company?.settings?.shiftSettings || {}, [company]);

  // Use useRef to avoid re-creating the function on every render
  const loadStateRef = useRef();

  const loadState = useCallback(async () => {
    if (!user) return;

    console.log('🔄 loadState called for user:', user.id);
    setIsShiftActionLoading(true);

    const token = sessionStorage.getItem('token');
    if (!token) {
      toast({ title: t('error'), description: t('noTokenFound'), variant: "destructive" });
      setIsShiftActionLoading(false);
      return;
    }

    try {
      console.log('📡 Fetching active shift...');
      const activeShiftUrl = `${API_BASE}/shifts/active?user_id=${user.id}`;
      console.log('🌐 Active shift URL:', activeShiftUrl);

      const res = await fetch(activeShiftUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/vnd.api+json",
          "Accept": "application/vnd.api+json",
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log('📡 Active shift response status:', res.status);
      const activeShift = await res.json();
      console.log('📡 Active shift data:', activeShift);

      if (activeShift && activeShift.id) {
        const activeBreak = activeShift.breaks?.find(b => b.end_time === null);
        const newState = {
          id: activeShift.id,
          status: activeBreak ? 'on_break' : 'active',
          startTime: new Date(activeShift.start_time),
          endTime: null,
          breakStartTime: activeBreak ? new Date(activeBreak.start_time) : null,
          totalBreakSeconds: activeShift.total_break_seconds || 0,
          activeBreakId: activeBreak ? activeBreak.id : null,
        };
        console.log('✅ Setting active shift state:', newState);
        setShiftState(newState);
      } else {
        const newState = {
          id: null,
          status: 'not_started',
          startTime: null,
          endTime: null,
          breakStartTime: null,
          totalBreakSeconds: 0,
          activeBreakId: null
        };
        console.log('❌ No active shift, setting default state:', newState);
        setShiftState(newState);
      }

      console.log('📡 Fetching shift count...');
      const countRes = await fetch(`${API_BASE}/shifts/count-today?user_id=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/vnd.api+json",
          "Accept": "application/vnd.api+json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const countData = await countRes.json();
      console.log('📊 Shift count data:', countData);
      const count = countData?.count || 0;
      setShiftCount(count);

    } catch (error) {
      console.error('❌ Error in loadState:', error);
      toast({ title: "Error loading shift", description: error.message, variant: "destructive" });
    }

    setIsShiftActionLoading(false);
  }, [user?.id, t]); // Only depend on user.id and t

  // Store the loadState function in ref so it doesn't change
  loadStateRef.current = loadState;

  // Load state only once when component mounts
  useEffect(() => {
    console.log('🎯 Component mounted, calling loadState');
    loadState();
  }, []); // Empty dependency array - only run on mount

  useEffect(() => {
    let shiftInterval, breakInterval;
    if (shiftState.status === 'active' && shiftState.startTime) {
      shiftInterval = setInterval(() => {
        const elapsed = (new Date() - new Date(shiftState.startTime)) / 1000;
        setTimers(t => ({ ...t, shift: elapsed - shiftState.totalBreakSeconds }));
      }, 1000);
    }
    if (shiftState.status === 'on_break' && shiftState.breakStartTime) {
      const elapsedSinceShiftStart = (new Date() - new Date(shiftState.startTime)) / 1000;
      breakInterval = setInterval(() => {
        const breakElapsed = (new Date() - new Date(shiftState.breakStartTime)) / 1000;
        setTimers(t => ({ shift: elapsedSinceShiftStart - shiftState.totalBreakSeconds - breakElapsed, break: breakElapsed }));
      }, 1000);
    }
    return () => { clearInterval(shiftInterval); clearInterval(breakInterval); };
  }, [shiftState]);

  const handleShiftAction = useCallback(async (action) => {
    if (!user || loadingAction) return;

    console.log('🎬 handleShiftAction called with:', action);
    setLoadingAction(action);

    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      let url = "";
      let method = "POST";
      let body = {
        user_id: user.id,
      };

      switch (action) {
        case 'start':
          url = `${API_BASE}/shifts/start`;
          break;
        case 'start_break':
          url = `${API_BASE}/breaks/start`;
          body.shift_id = shiftState.id;
          break;
        case 'end_break':
          url = `${API_BASE}/breaks/end/${shiftState.activeBreakId}`;
          method = "PUT";
          break;
        case 'end':
          url = `${API_BASE}/shifts/end/${shiftState.id}`;
          method = "PUT";
          break;
        default:
          return;
      }

      console.log('🌐 API Call:', { url, method, body });

      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('No token found in session storage');

      const fetchOptions = {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      };

      if (method === "POST") {
        fetchOptions.body = JSON.stringify(body);
      }

      const res = await fetch(url, fetchOptions);
      const data = await res.json();

      console.log('📡 API Response:', { status: res.status, data });

      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 422) {
          throw new Error(data.message || "Validation error");
        }
        throw new Error(data.message || "API error");
      }

      toast({
        title: t(action),
        description: data.message || `${action} completed successfully`
      });
    } catch (error) {
      console.error('❌ Error in handleShiftAction:', error);
      toast({
        title: `Failed to ${action} shift`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      try {
        console.log('🔄 Calling loadState after action completion...');
        // Use the ref to avoid dependency issues
        await loadStateRef.current();
      } catch (err) {
        console.error("loadState failed:", err);
      }
      setLoadingAction(null);
    }
  }, [shiftState, user, loadingAction, t]); // Removed loadState from dependencies

  const handleDayClick = useCallback(async (day) => {
    if (!user) return;

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No token found in session storage');
      }
      const dayStart = format(startOfDay(day), 'yyyy-MM-dd HH:mm:ss');
      const dayEnd = format(endOfDay(day), 'yyyy-MM-dd HH:mm:ss');
      console.log('dayStart', dayStart);
      console.log('dayEnd', dayEnd);
      console.log('user.id', user.id);

      const res = await fetch(`${API_BASE}/shifts/day/${user.id}`, {
        method: "POST", // Changed to POST
        headers: {
          "Content-Type": "application/json", // Changed to application/json
          "Accept": "application/vnd.api+json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ // Added body with data
          start: dayStart,
          end: dayEnd
        })
      });
      const data = await res.json();
      console.log('data', data);

      setSelectedDayData({ shifts: data, date: day });
      setIsModalOpen(true);
    } catch (error) {
      toast({ title: 'Error fetching shift data', description: error.message, variant: 'destructive' });
    }
  }, [user]);

  const fetchMonthData = useCallback(async (date) => {
    if (!user) return;
    try {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No token found in session storage');
      }

      const res = await fetch(`${API_BASE}/shifts/month/${monthStart.toISOString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/vnd.api+json",
          "Accept": "application/vnd.api+json",
          "Authorization": `Bearer ${token}`,
        }
      });

      const data = await res.json();
      const shifts = Array.isArray(data) ? data : data.data || [];

      const totalSeconds = shifts.reduce((acc, shift) => {
        const start = new Date(shift.start_time);
        const end = new Date(shift.end_time || new Date());
        const duration = (end - start) / 1000;
        return acc + (duration - (shift.total_break_seconds || 0));
      }, 0);

      setMonthWorkHours(totalSeconds / 3600);

      const leaveRes = await fetch(`${API_BASE}/leave-requests/count-approved?user_id=${user.id}&start=${format(monthStart, 'yyyy-MM-dd')}&end=${format(monthEnd, 'yyyy-MM-dd')}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/vnd.api+json",
          "Accept": "application/vnd.api+json",
          "Authorization": `Bearer ${token}`,
        }
      });
      const { count: leavesCount } = await leaveRes.json();
      setApprovedLeavesCount(leavesCount);
    } catch (error) {
      toast({ title: 'Error fetching month data', description: error.message, variant: 'destructive' });
    }
  }, [user]);

  const requiredHours = useMemo(() => {
    const daysInMonth = getDaysInMonth(new Date());
    const dailyHours = settings.defaultShiftHours || 8;
    return (dailyHours * daysInMonth) - (approvedLeavesCount * dailyHours);
  }, [approvedLeavesCount, settings.defaultShiftHours]);

  return (
    <>
      <Helmet><title>{t('attendance')} - SaaS Management System</title></Helmet>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3"><Clock className="h-8 w-8" /><span>{t('attendance')}</span></h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ShiftControls
            shiftState={shiftState}
            timers={timers}
            handleShiftAction={handleShiftAction}
            shiftCount={shiftCount}
            lastShiftDuration={lastShiftDuration}
            isLoading={isShiftActionLoading}
          />
          <AttendanceCalendar
            onDayClick={handleDayClick}
            isRTL={isRTL}
            fetchMonthData={fetchMonthData}
            monthWorkHours={monthWorkHours}
            approvedLeavesCount={approvedLeavesCount}
            requiredHours={requiredHours}
          />
        </div>

        {isModalOpen && (
          <ShiftDetailsModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            dayData={selectedDayData}
          />
        )}
      </div>
    </>
  );
};

export default Attendance;
