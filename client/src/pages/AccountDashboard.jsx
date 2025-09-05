import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import {
    Calendar, Plus, Search, Hotel, Plane, FileCheck, Ship, ShieldCheck, Car, Eye, Edit, Trash2, BarChart2, FileText, Bell,
    Check,
    X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { format, differenceInDays, parseISO, add } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AccountDashboard = () => {
    const { t } = useLanguage();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch bookings function
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            const res = await fetch("http://travel-server.test/api/reservations", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const responseData = await res.json();
            setBookings(responseData);
        } catch (err) {
            console.error(err);
            toast({ title: "Failed to load reservations", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // Update reservation status function
    const updateReservationStatus = async (id, status) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await fetch(`http://travel-server.test/api/reservations/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'type': 'application/json'
                },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                // Refresh bookings after successful update
                await fetchBookings();
                toast({ 
                    title: `Reservation ${status}`, 
                    description: `Reservation has been ${status} successfully` 
                });
            } else {
                throw new Error('Failed to update reservation');
            }
        } catch (err) {
            console.error(err);
            toast({ 
                title: "Failed to update reservation", 
                variant: "destructive" 
            });
        }
    };

    // Handle approve/reject actions
    const handleUpdateRequest = (id, action) => {
        const status = action === 'Issued' ? 'Issued' : 'Cancelled';
        updateReservationStatus(id, status);
    };

    // Fetch bookings on component mount
    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="flex justify-between my-3 items-center">
                        <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
                            {t('Account Dashboard')}
                        </h1>
                        <Button onClick={fetchBookings} disabled={loading}>
                            {loading ? 'Loading...' : 'Refresh'}
                        </Button>
                    </div>
                </motion.div>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('Account Dashboard Title')}</CardTitle>
                        <CardDescription>{t('Reservation History Desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('ID')}</TableHead>
                                    <TableHead>{t('Customer Name')}</TableHead>
                                    <TableHead>{t('Phone Number')}</TableHead>
                                    <TableHead>{t('status')}</TableHead>
                                    <TableHead>{t('Booking Type')}</TableHead>
                                    <TableHead>{t('Sell')}</TableHead>
                                    <TableHead>{t('Profite')}</TableHead>
                                    <TableHead>{t('Note')}</TableHead>
                                    <TableHead className="">{t('actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center">
                                            {t('loading')}
                                        </TableCell>
                                    </TableRow>
                                ) : bookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center">
                                            No reservations found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="">
                                                {booking.id}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {booking.customer.name || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {booking.customer.phone || 'N/A'}
                                            </TableCell>
                                            <TableCell className="">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    booking.status === 'Issued' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : booking.status === 'Cancelled'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {booking.status || 'Pending'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {booking.reservable_type || 'N/A'}
                                            </TableCell>
                                            <TableCell className="">
                                                {booking.sell_price || 'N/A'}
                                            </TableCell>
                                            <TableCell className="">
                                                {booking.net_profit || 'N/A'}
                                            </TableCell>
                                            <TableCell className="">
                                                {booking.notes || 'N/A'}
                                            </TableCell>
                                            <TableCell className="flex gap-2">
                                                {booking.status !== 'Issued' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="text-green-500 hover:text-green-600"
                                                        onClick={() => handleUpdateRequest(booking.id, 'Issued')}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {booking.status !== 'Cancelled' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="text-red-500 hover:text-red-600"
                                                        onClick={() => handleUpdateRequest(booking.id, 'Cancelled')}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
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

export default AccountDashboard;