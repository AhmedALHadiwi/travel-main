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

    return (<>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex justify-between my-3 items-center">
                    <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">{t('Account Dashboard')}</h1>
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
                            {/* // requests.map(request => ( */}
                            <TableRow >
                                <TableCell className="">
                                    Id Data
                                </TableCell>
                                {/* =============================================================== */}
                                <TableCell className="capitalize">Customer Data</TableCell>
                                <TableCell>01111111</TableCell>
                                <TableCell className="">Hold</TableCell>
                                <TableCell>Hotel</TableCell>
                                <TableCell className="">111</TableCell>
                                <TableCell className="">111</TableCell>
                                <TableCell className="">111</TableCell>
                                <TableCell className="flex gap-4">
                                    <Button size="icon" variant="ghost" className="text-green-500 hover:text-green-600"
                                    // onClick={() => handleUpdateRequest(request.id, 'approved')}
                                    >
                                        <Check className="h-4 w-4" /></Button>
                                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600"
                                    //  onClick={() => handleUpdateRequest(request.id, 'rejected')}
                                    >
                                        <X className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                            {/* // ))} */}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>
    </>);
}

export default AccountDashboard;