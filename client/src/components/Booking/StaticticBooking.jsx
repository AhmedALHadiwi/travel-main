
import React, { useState, useMemo, useEffect } from "react";
import { DollarSign, TrendingUp, RefreshCw, Target } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import * as Select from "@radix-ui/react-select";
import { ChevronDown, ChevronUp } from "lucide-react";
// import { useAuth } from './../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// import { Hotel, Plane, FileCheck, Ship, ShieldCheck, Car } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import {
    Calendar, Plus, Search, Hotel, Plane, FileCheck, Ship, ShieldCheck, Car, Eye, Edit, Trash2, BarChart2, FileText, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const currency = (n) => `$${Number(n || 0).toLocaleString()}`;

export default function StaticticBooking({ bookings, bookingTypeDetails, filters, setFilters, kpis, resetFilters, handleAction }) {
    const { t } = useLanguage();

    const [monthlyTarget, setMonthlyTarget] = useState(5000);
    const [editingTarget, setEditingTarget] = useState(false);
    const [targetInput, setTargetInput] = useState("");

    return (
        <div className="p-2 md:p-3">
            <div className="max-w-7xl mx-auto space-y-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            {/* Filter By Customer ==========================================================================  */}
                            <div className="relative flex-grow w-full mt-5">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={'Search By Customer'}
                                    value={filters.search}
                                    onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                    className="pl-10"
                                />

                            </div>
                            {/* Filtration By Booking Type ====================================================== */}
                            <div>
                                <Label className="text-sm text-gray-600">Booking Type</Label>
                                <Select.Root
                                    value={filters.type}
                                    onValueChange={(value) => setFilters(f => ({ ...f, type: value }))}
                                >
                                    {/* Trigger */}
                                    <Select.Trigger className="flex justify-between items-center w-full rounded-lg border border-gray-300 px-3 py-2 bg-black text-gray-700 text-sm shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <Select.Value placeholder="Select Booking Type" />
                                        <Select.Icon>
                                            <ChevronDown className="w-4 h-4 text-gray-500" />
                                        </Select.Icon>
                                    </Select.Trigger>

                                    {/* Dropdown Content */}
                                    <Select.Content className="bg-black rounded-lg shadow-lg border border-gray-200 mt-1">
                                        <Select.ScrollUpButton className="flex items-center justify-center py-1 text-gray-600">
                                            <ChevronUp className="w-4 h-4" />
                                        </Select.ScrollUpButton>

                                        <Select.Viewport className="p-1">
                                            {["All", ...Object.keys(bookingTypeDetails)].map((type) => (
                                                <Select.Item
                                                    key={type}
                                                    value={type}
                                                    className="cursor-pointer px-3 py-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-100 focus:outline-none"
                                                >
                                                    <Select.ItemText>{t(type.toLowerCase())}</Select.ItemText>
                                                </Select.Item>
                                            ))}
                                        </Select.Viewport>

                                        <Select.ScrollDownButton className="flex items-center justify-center py-1 text-gray-600">
                                            <ChevronDown className="w-4 h-4" />
                                        </Select.ScrollDownButton>
                                    </Select.Content>
                                </Select.Root>
                            </div>
                            {/* Filtration BY Staues ===================================================  */}
                            <div>
                                <Label className="text-sm text-gray-600">Status</Label>
                                <Select.Root
                                    value={filters.status}
                                    onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}
                                >
                                    <Select.Trigger className="flex justify-between items-center w-full rounded-lg border border-gray-300 px-3 py-2 bg-black text-gray-700 text-sm shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <Select.Value placeholder="Select Status" />
                                        <Select.Icon>
                                            <ChevronDown className="w-4 h-4 text-gray-500" />
                                        </Select.Icon>
                                    </Select.Trigger>
                                    <Select.Content className="bg-black rounded-lg shadow-lg border border-gray-200 mt-1">
                                        <Select.ScrollUpButton className="flex items-center justify-center py-1 text-gray-600">
                                            <ChevronUp className="w-4 h-4" />
                                        </Select.ScrollUpButton>
                                        <Select.Viewport className="p-1">
                                            {["All", "Hold", "Issued", "Cancelled"].map((opt) => (
                                                <Select.Item
                                                    key={opt}
                                                    value={opt}
                                                    className="cursor-pointer px-3 py-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-100 focus:outline-none"
                                                >
                                                    <Select.ItemText>{opt}</Select.ItemText>
                                                </Select.Item>
                                            ))}
                                        </Select.Viewport>
                                        <Select.ScrollDownButton className="flex items-center justify-center py-1 text-gray-600">
                                            <ChevronDown className="w-4 h-4" />
                                        </Select.ScrollDownButton>
                                    </Select.Content>
                                </Select.Root>
                            </div>
                            {/* Button Add New Reservation =======================================================================  */}
                            <div className="mt-5">
                                <Button onClick={() => handleAction('add')} className="w-full md:w-auto"><Plus className="h-4 w-4 mr-2" />{t('Add New Reservation')}</Button>
                            </div>

                        </CardContent>
                    </Card>
                </motion.div>
                {/* Filters Section ===================================================================================== */}
                <section className="rounded-xl border p-4 md:p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* By Date  */}
                    <div className="lg:col-span-2">
                        <Label className="text-sm text-gray-600">From</Label>
                        <Input
                            type="date"
                            value={filters.from}
                            onChange={(e) => setFilters(f => ({ ...f, from: e.target.value }))}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <Label className="text-sm text-gray-600">To</Label>
                        <Input
                            type="date"
                            value={filters.to}
                            onChange={(e) => setFilters(f => ({ ...f, to: e.target.value }))}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>
                    <div className="mt-6">
                        <button onClick={resetFilters}
                            className="flex items-center gap-2 rounded-lg px-4 py-2 border shadow-sm hover:bg-gray-800 transition"
                        >
                            <RefreshCw size={16} /> Reset Filters
                        </button>

                    </div>

                </section>
                {/* KPIs */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard icon={<DollarSign className="text-blue-600" />} label="Total Sales" value={currency(kpis.totalSales)} />
                    <KpiCard icon={<TrendingUp className="text-green-600" />} label="Net Profit" value={currency(kpis.netProfit)} />
                    <KpiCard icon={<DollarSign className="text-red-600" />} label="Refunded" value={currency(kpis.refunded)} />
                    <KpiCard icon={<Target className="text-purple-600" />} label="Monthly Target" value={currency(monthlyTarget)} onClick={() => setEditingTarget(true)} />
                </section>
            </div>

            {/* Radix Dialog for Monthly Target */}
            <Dialog.Root open={editingTarget} onOpenChange={setEditingTarget}>
                <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-900 p-6 shadow-xl">
                    <Dialog.Title className="text-lg font-semibold">Update Monthly Target</Dialog.Title>
                    <Input
                        type="number"
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        placeholder="Enter target..."
                        className="mt-4 w-full border rounded-lg px-3 py-2"
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setEditingTarget(false)} className="px-4 py-2 rounded-lg  hover:bg-gray-700">
                            Cancel
                        </button>
                        <button
                            onClick={() => { setMonthlyTarget(Number(targetInput)); setEditingTarget(false); }}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Root>
        </div>
    );
}

function KpiCard({ icon, label, value, onClick }) {
    return (
        <motion.div
            onClick={onClick}
            className="flex cursor-pointer items-center gap-4 rounded-xl border p-4 shadow hover:shadow-md transition"
            whileHover={{ scale: 1.02 }}
        >
            <div className="p-3 rounded-full bg-gray-100">{icon}</div>
            <div>
                <p className="text-gray-600 text-sm">{label}</p>
                <p className="text-xl font-semibold">{value}</p>
            </div>
        </motion.div>
    );
}

