
import React, { useState, useMemo, useEffect } from "react";
import { DollarSign, TrendingUp, RefreshCw, Target } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import * as Select from "@radix-ui/react-select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from './../contexts/LanguageContext';
import { useAuth } from './../contexts/AuthContext';
import { Hotel, Plane, FileCheck, Ship, ShieldCheck, Car } from "lucide-react";

const STATUS_STYLES = {
    Completed: "bg-green-100 text-green-700 border-green-300",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Cancelled: "bg-red-100 text-red-700 border-red-300",
    Hold: "bg-blue-100 text-blue-700 border-blue-300",
};

const currency = (n) => `$${Number(n || 0).toLocaleString()}`;

export default function EmployeeDashboard() {
    const { t } = useLanguage();
    const today = new Date();
    const [from, setFrom] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10));
    const [to, setTo] = useState(new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10));
    const [bookingType, setBookingType] = useState("All");
    const [status, setStatus] = useState("All");
    const [customer, setCustomer] = useState("");
    const [monthlyTarget, setMonthlyTarget] = useState(5000);
    const [editingTarget, setEditingTarget] = useState(false);
    const [targetInput, setTargetInput] = useState("");
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);

    // Fetch bookings from API
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            const res = await fetch("http://travel-server.test/api/reservations", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const responseData = await res.json();
            const filteredData = responseData.filter((b) => b.user_id === user.id);
            console.log("Fetched Bookings 1:", filteredData);
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

    // Filtered bookings
    const filtered = useMemo(() => {
        const f = new Date(from);
        const t = new Date(to);

        return bookings
            .filter((r) => {
                const d = new Date(r.created_at);
                const inRange = d >= f && d <= t;
                const matchType = bookingType === "All" || r.reservable_type === bookingType;
                const matchStatus = status === "All" || r.status === status;
                const matchCustomer = !customer || (r.customer?.name || "").toLowerCase().includes(customer.toLowerCase());
                return inRange && matchType && matchStatus && matchCustomer;
            })
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [from, to, bookingType, status, customer, bookings]);

    // KPIs
    const kpis = useMemo(() => {
        const totalSales = filtered.reduce((sum, r) => {
            if (r.status === "Issued" || r.status === "Hold") {
                return sum + Number(r.sell_price || 0);
            }
            return sum;
            }, 0);
        const refunded = filtered.reduce((sum, r) => {
            if (r.status === "Cancelled") {
                return sum + Number(r.sell_price || 0);
            }
            return sum + Number(r.refunded || 0);
            }, 0);// لو السيرفر بيرجع refunded
        const netProfit = filtered.reduce((sum, r) => {
            if (r.status === "Issued" || r.status === "Hold") {
                return sum + Number(r.net_profit || 0)
            }
            return sum;
            }, 0);

        return { totalSales, refunded, netProfit };
    }, [filtered]);

    const resetFilters = () => {
        setFrom(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10));
        setTo(new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10));
        setBookingType("All");
        setStatus("All");
        setCustomer("");
    };
    const bookingTypeDetails = {
        Hotel: { icon: Hotel, color: 'text-blue-500', dateField: 'checkIn' },
        Flight: { icon: Plane, color: 'text-purple-500', dateField: 'departureDate' },
        Visa: { icon: FileCheck, color: 'text-green-500', dateField: 'applicationDate' },
        Cruise: { icon: Ship, color: 'text-teal-500', dateField: 'sailDate' },
        Insurance: { icon: ShieldCheck, color: 'text-orange-500', dateField: 'startDate' },
        Transport: { icon: Car, color: 'text-yellow-500', dateField: 'pickupDate' },
    };
    return (
        <div className="min-h-screen p-2 md:p-3">
            <div className="max-w-7xl mx-auto space-y-4">

                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl  text-gradient md:text-3xl font-bold">{t("EmployeeDashboard")}</h1>
                        <p className="text-gray-600">Real-time performance & reservations overview</p>
                    </div>
                    <button onClick={resetFilters}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 border shadow-sm hover:bg-gray-800 transition"
                    >
                        <RefreshCw size={16} /> Reset Filters
                    </button>
                </header>

                {/* Filters Section ===================================================================================== */}
                <section className="rounded-xl border p-4 md:p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="lg:col-span-2">
                        <Label className="text-sm text-gray-600">From</Label>
                        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
                    </div>
                    <div className="lg:col-span-2">
                        <Label className="text-sm text-gray-600">To</Label>
                        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
                    </div>
                    {/* Filtration By Booking Type ====================================================== */}
                    <div>
                        <Label className="text-sm text-gray-600">Booking Type</Label>
                        <Select.Root value={bookingType} onValueChange={setBookingType}>
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
                                    {["All", ...Object.keys(bookingTypeDetails)].map((opt) => (
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
                    {/* Filtration BY Staues ===================================================  */}
                    <div>
                        <Label className="text-sm text-gray-600">Status</Label>
                        <Select.Root value={status} onValueChange={setStatus}>
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

                </section>

                {/* KPIs */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard icon={<DollarSign className="text-blue-600" />} label="Total Sales" value={currency(kpis.totalSales)} />
                    <KpiCard icon={<TrendingUp className="text-green-600" />} label="Net Profit" value={currency(kpis.netProfit)} />
                    <KpiCard icon={<DollarSign className="text-red-600" />} label="Refunded" value={currency(kpis.refunded)} />
                    <KpiCard icon={<Target className="text-purple-600" />} label="Monthly Target" value={currency(monthlyTarget)} onClick={() => setEditingTarget(true)} />
                </section>

                {/* Reservations Table */}
                <section className="rounded-xl border shadow-sm p-4 md:p-6 overflow-x-auto">
                    <h2 className="text-lg font-semibold mb-4">Reservations</h2>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-600 border-b">
                                <th className="pb-2">Date</th>
                                <th className="pb-2">Booking Type</th>
                                <th className="pb-2">Status</th>
                                <th className="pb-2">Customer</th>
                                <th className="pb-2">Sell Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                console.log("Filtered Bookings:", filtered)
                            }
                            {filtered.map((r) => (
                                <tr key={r.id} className="border-b last:border-none">
                                    <td className="py-2">{new Date(r.created_at).toLocaleDateString()}</td>
                                    <td className="py-2">{r.reservable_type}</td>
                                    <td className="py-2">
                                        <span className={`px-2 py-1 rounded-lg text-xs border ${STATUS_STYLES[r.status] || "bg-gray-100 text-gray-700 border-gray-300"}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="py-2">{r.customer?.name || "N/A"}</td>
                                    <td className="py-2">{currency(r.sell_price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>

            {/* Radix Dialog for Monthly Target */}
            <Dialog.Root open={editingTarget} onOpenChange={setEditingTarget}>
                <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-lg font-semibold">Update Monthly Target</Dialog.Title>
                    <input
                        type="number"
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        placeholder="Enter target..."
                        className="mt-4 w-full border rounded-lg px-3 py-2"
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setEditingTarget(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
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

