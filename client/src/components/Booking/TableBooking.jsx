import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import {
    Calendar, Plus, Search, Hotel, Plane, FileCheck, Ship, ShieldCheck, Car, Eye, Edit, Trash2, BarChart2, FileText, Bell,

} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '../../contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '../../contexts/AuthContext';

const TableBooking = ({ handleAction }) => {
    const { t } = useLanguage();
    const [filters, setFilters] = useState({ type: 'All', search: '' });
    const [modal, setModal] = useState({ isOpen: false, type: null, data: null });
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const { user } = useAuth();
    const bookingTypeDetails = {
        Hotel: { icon: Hotel, color: 'text-blue-500', dateField: 'checkIn' },
        Flight: { icon: Plane, color: 'text-purple-500', dateField: 'departureDate' },
        Visa: { icon: FileCheck, color: 'text-green-500', dateField: 'applicationDate' },
        Cruise: { icon: Ship, color: 'text-teal-500', dateField: 'sailDate' },
        Insurance: { icon: ShieldCheck, color: 'text-orange-500', dateField: 'startDate' },
        Transport: { icon: Car, color: 'text-yellow-500', dateField: 'pickupDate' },
    };

    const filteredBookings = useMemo(() => {
        return bookings.filter(b =>
            (filters.type === 'All' || b.reservable_type === filters.type) &&
            ((b.customer.name || "").toLowerCase().includes(filters.search.toLowerCase()))
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [bookings, filters]);
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token"); // أو من useAuth لو عندك
            const res = await fetch("http://travel-server.test/api/reservations", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const responseData = await res.json();
            const filteredData = responseData.filter(b => b.user_id === user.id);

            setBookings(filteredData);
        } catch (err) {
            console.error(err);
            toast({ title: "Failed to load reservations", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchBookings();
    }, [user.id]);
    return (
        <>
            <Helmet><title>{t('myreservations')} - SaaS Management System</title></Helmet>
            <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3"><Calendar className="h-8 w-8" /><span>{t('myreservations')}</span></h1>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3  items-center gap-4">
                            {/* Filter By Customer ==========================================================================  */}
                            <div className="relative flex-grow w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder={t('searchBookings')} value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="pl-10" /></div>
                            {/* Filter By bookingTypeDetails ==========================================================================  */}
                            <div>
                                <select className="w-full md:w-auto px-3 py-2 border border-input rounded-md bg-background" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
                                    {['All', ...Object.keys(bookingTypeDetails)].map(type => <option key={type} value={type}>{t(type.toLowerCase())}</option>)}
                                </select>
                            </div>
                            {/* Button Add New Reservation =======================================================================  */}
                            <div>
                                <Button onClick={() => handleAction('add')} className="w-full md:w-auto"><Plus className="h-4 w-4 mr-2" />{t('Add New Reservation')}</Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> */}

                {/* {
        filteredBookings.map(booking => {
          const TypeIcon = bookingTypeDetails[booking.type]?.icon || FileText;
          const dateField = bookingTypeDetails[booking.type]?.dateField;
          const eventDate = booking.details[dateField];
          const isUpcoming = eventDate && differenceInDays(parseISO(eventDate), new Date()) <= (booking.reminderDays || 3) && differenceInDays(parseISO(eventDate), new Date()) >= 0; */}

                {/* return ( */}

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Reservation')}</CardTitle>
                            <CardDescription>{t('Reservation History Desc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {/* {hasPermission('manage_all_leave_requests') && <TableHead>{t('employee')}</TableHead>} */}
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
                                    {/* {loading ? ( */}
                                    {/* <TableRow> */}
                                    {/* <TableCell colSpan={hasPermission('manage_all_leave_requests') ? 6 : 5} className="text-center"> */}
                                    {/* {t('loading')} */}
                                    {/* </TableCell> */}
                                    {/* </TableRow> */}
                                    {/* // ) : */}
                                    {filteredBookings.map(booking => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="">{booking.id}</TableCell>
                                            <TableCell className="capitalize">{booking.customer.name}</TableCell>
                                            <TableCell>{booking.customer.phone}</TableCell>
                                            <TableCell className="">{booking.status}</TableCell>
                                            <TableCell>{booking.reservable_type}</TableCell>
                                            <TableCell className="">{booking.sell_price}</TableCell>
                                            <TableCell className="">{booking.net_profit}</TableCell>
                                            <TableCell className="">{booking.notes}</TableCell>
                                            <TableCell className="flex gap-4">
                                                <Eye className="w-4 h-4 text-green-600" onClick={() => handleAction('view', booking)} />
                                                <Edit className="w-4 h-4 text-blue-600" onClick={() => handleAction('edit', booking)} />
                                                <Trash2 className="w-4 h-4 text-red-700" onClick={() => handleDelete(booking.id)} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>
                {/* ); */}
                {/* }) */}
                {/* } */}
            </div>
            {/* </div> */}

            <AnimatePresence>
                {modal.isOpen && <BookingModal modal={modal} onClose={closeModal} onSave={handleSave} onDelete={handleDelete} />}
            </AnimatePresence>
        </>
    );
}

export default TableBooking;