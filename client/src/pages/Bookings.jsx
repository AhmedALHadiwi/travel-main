import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import {
  Calendar, Plus, Search, Hotel, Plane, FileCheck, Ship, ShieldCheck, Car, Eye, Edit, Trash2, BarChart2, FileText, Bell
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
import { Textarea } from '@/components/ui/textarea';
import { useParams } from 'react-router-dom';
import EditBooking from '../components/Booking/EditBooking';
import StaticticBooking from '../components/Booking/StaticticBooking';
import { Check, X, Send } from 'lucide-react'; // إضافة Send

const bookingTypeDetails = {
  Hotel: { icon: Hotel, color: 'text-blue-500', dateField: 'checkIn' },
  Flight: { icon: Plane, color: 'text-purple-500', dateField: 'departureDate' },
  Visa: { icon: FileCheck, color: 'text-green-500', dateField: 'applicationDate' },
  Cruise: { icon: Ship, color: 'text-teal-500', dateField: 'sailDate' },
  Insurance: { icon: ShieldCheck, color: 'text-orange-500', dateField: 'startDate' },
  Transport: { icon: Car, color: 'text-yellow-500', dateField: 'pickupDate' },
};


const Bookings = () => {
  const { t } = useLanguage();
  const { user } = useAuth();


  const [bookings, setBookings] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });
  const [loading, setLoading] = useState(false);
  const today = new Date();
  const [from, setFrom] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10));
  const [status, setStatus] = useState("All");
  const [customer, setCustomer] = useState("");
  const [bookingType, setBookingType] = useState("All");
  // const [Send, setSend] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    from: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10),
    to: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10),
    type: "All",
    status: "All",
    customer: ""
  });
  const [sendingId, setSendingId] = useState(null);
  // إضافة handleSend function
  const handleSend = async (id) => {
    try {
      setSendingId(id);
      const token = sessionStorage.getItem("token");
      const res = await fetch(`http://travel-server.test/api/reservations/${id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error("Failed to send reservation");

      // تحديث الحجز في الـ state
      setBookings(bookings.map(booking =>
        booking.id === id
          ? { ...booking, sent: true }
          : booking
      ));

      toast({
        title: "Reservation Sent",
        description: "Reservation sent to account dashboard successfully"
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error sending reservation",
        variant: "destructive"
      });
    } finally {
      setSendingId(null);
    }
  };
  // Function Filtration 
  const filtered = useMemo(() => {
    const f = new Date(filters.from);
    const t = new Date(filters.to);

    return bookings
      .filter((r) => {
        const d = new Date(r.created_at);
        const inRange = d >= f && d <= t;
        const matchType = filters.type === "All" || r.reservable_type === filters.type;
        const matchStatus = filters.status === "All" || r.status === filters.status;
        const matchCustomer =
          !filters.search ||
          (r.customer?.name || "").toLowerCase().includes(filters.search.toLowerCase());

        return inRange && matchType && matchStatus && matchCustomer;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [bookings, filters]);

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
    }, 0);

    const netProfit = filtered.reduce((sum, r) => {
      if (r.status === "Issued" || r.status === "Hold") {
        return sum + Number(r.net_profit || 0);
      }
      return sum;
    }, 0);

    return { totalSales, refunded, netProfit };
  }, [filtered]);

  // Reset Filters
  const resetFilters = () => {
    setFilters({
      search: "",
      from: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10),
      to: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10),
      type: "All",
      status: "All",
      customer: ""
    });
  };



  const handleAction = (type, data = null) => setModal({ isOpen: true, type, data });
  const closeModal = () => setModal({ isOpen: false, type: null, data: null });

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
      console.log("Fetched Bookings:", filteredData);
      setBookings(filteredData);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to load reservations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  //==============================================
  const [errors, setErrors] = useState({});

  const handleSave = async (newBooking) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast({ title: "Not Auth", variant: "destructive" });
        return;
      }

      const res = await fetch("http://travel-server.test/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBooking),
      });

      if (res.status === 422) {
        const errorData = await res.json();
        setErrors(errorData.errors);
        return;
      }
      if (!res.ok) throw new Error("Failed to create reservation");
      // if (!res.ok) {
      //   const errorData = await res.json();
      //   console.error('Backend error:', errorData);
      //   throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      // }

      await res.json();

      toast({ title: "Booking added" });

      // هنا بقى نعمل Fetch للبيانات بعد الحفظ
      await fetchBookings();

      closeModal();
    } catch (err) {
      console.error(err);
      toast({ title: "Error creating booking", variant: "destructive" });
    }
  };
  // Handle Update Function for Editing Reservations


  useEffect(() => {
    fetchBookings();
  }, [user.id]);

  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast({ title: "No token available", variant: "destructive" });
        return;
      }

      const res = await fetch(`http://travel-server.test/api/reservations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete reservation");
      }

      setBookings(prev => prev.filter(b => b.id !== id));
      toast({ title: "Booking deleted" });
      closeModal();
    } catch (err) {
      console.error(err);
      toast({ title: "Error deleting booking", variant: "destructive" });
    }
  };


  return (
    <>
      <Helmet><title>{t('myreservations')} - SaaS Management System</title></Helmet>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3"><Calendar className="h-8 w-8" /><span>{t('myreservations')}</span></h1>
        </motion.div>

        {/* ***************StaticticBooking************************* */}
        <StaticticBooking bookings={bookings} bookingTypeDetails={bookingTypeDetails} filters={filters} setFilters={setFilters} kpis={kpis} resetFilters={resetFilters} handleAction={handleAction} />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card>
            {/* <CardHeader>
              <CardTitle>{t('Reservation')}</CardTitle>
              <CardDescription>{t('Reservation History Desc')}</CardDescription>
            </CardHeader> */}
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
                  {filtered.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell className="">{booking.id}</TableCell>
                      <TableCell className="capitalize">{booking.customer.name}</TableCell>
                      <TableCell>{booking.customer.phone}</TableCell>
                      <TableCell className="">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                         ${booking.status === 'Issued' ? 'bg-green-100 text-green-800'
                            : booking.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {booking.status || 'Hold'}
                        </span>

                      </TableCell>
                      <TableCell>{booking.reservable_type}</TableCell>
                      <TableCell className="">{booking.sell_price}</TableCell>
                      <TableCell className="">{booking.net_profit}</TableCell>
                      <TableCell className="">{booking.notes}</TableCell>
                      <TableCell className="flex gap-4">
                        <Eye className="w-4 h-4 text-green-600" onClick={() => handleAction('view', booking)} />
                        <Edit className="w-4 h-4 text-blue-600" onClick={() => handleAction('edit', booking)} />

                        <Trash2 className="w-4 h-4 text-red-700" onClick={() => handleDelete(booking.id)} />
                        {/* زرار Send - جديد */}
                        {!booking.sent && (
                          <Send
                            className={`w-4 h-4 cursor-pointer ${sendingId === booking.id
                              ? 'text-gray-400'
                              : 'text-purple-600 hover:text-purple-700'
                              }`}
                            onClick={() => !sendingId && handleSend(booking.id)}
                            title="Send to Account Dashboard"
                          />
                        )}
                        {sendingId === booking.id && (
                          <span className="text-xs text-gray-500">Sending...</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

      </div>
      {/* </div> */}

      <AnimatePresence>
        {modal.isOpen && <BookingModal modal={modal} onClose={closeModal} onSave={handleSave} onDelete={handleDelete}  // أضف هذا السطر
          fetchBookings={fetchBookings} errors={errors} setErrors={setErrors}
        />}
      </AnimatePresence>
    </>
  );
};

const BookingModal = ({ modal, onClose, onSave, onDelete, fetchBookings, errors, setErrors // إضافة هذا السطر
}) => {
  const { t } = useLanguage();
  const [data, setData] = useState(modal.data || {
    type: 'Hotel,Flight', details: {}, reminderDays: 3, sell_price: "",
    fees: "",
    cost: "",
    net_profit: 0,
  });
  const [loading, setLoading] = useState(false);
  const [singleBooking, setSingleBooking] = useState(null);
  const closeModal = () => setModal({ isOpen: false, type: null, data: null });

  const handleChange = (field, value, isDetail = false) => {
    if (isDetail) {
      setData(prev => ({ ...prev, details: { ...prev.details, [field]: value } }));
    } else {
      setData(prev => ({ ...prev, [field]: value }));
    }
    // to remove error to  again type in field
    setErrors(prev => ({ ...prev, details: { ...prev.details, [field]: undefined } }));

  };
  useEffect(() => {
    if (modal.isOpen) {
      setErrors({});
    }
  }, [modal.isOpen]);

  // Fetch Single Booking API
  const { id } = useParams();
  const fetchSingleBooking = async (bookingId) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const singlerRes = await fetch(`http://travel-server.test/api/reservations/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const singleResponseData = await singlerRes.json();
      console.log("Single Booking Data:", singleResponseData);

      // console.log("singleBooking.reservable_type :", singleBooking.reservable_type);

      setSingleBooking(singleResponseData);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to load reservation details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // استدعاء الداتا لما يكون النوع view
  useEffect(() => {
    if (modal.type === "view" && modal.data?.id) {
      fetchSingleBooking(modal.data.id);
    }
  }, [modal.type, modal.data]);
  // حساب صافي الربح تلقائيًا
  const calculateNetProfit = (sell, fees, cost) => {
    const s = parseFloat(sell) || 0;
    const f = parseFloat(fees) || 0;
    const c = parseFloat(cost) || 0;
    return s - f - c;
  };

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      net_profit: calculateNetProfit(prev.sell_price, prev.fees, prev.cost),
    }));
  }, [data.sell_price, data.fees, data.cost]);

  // Add From To  Booking Reservetion ==========================================================================
  const renderFormFields = () => {
    const bookingTypes = [
      "Hotel",
      "Flight",
      "Cruise",
      "Visa",
      "Appointment",
      "Insurance",
      "Tickets",
      "Transportation",
    ];


    return (
      <div className='flex items-center justify-center z-50 ' >
        <div className="space-y-2 p-2 h-[600px] scrollbar-thin scrollbar-thumb-gray-400 max-h-[60vh] overflow-y-auto scrollbar-track-gray-200">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Label>{t("customerName")}</Label>
              <Input
                value={data.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name[0]}</p>}

            </div>
            <div>
              <Label>{t("phoneNumber")}</Label>
              <Input
                value={data.phoneNumber || ""}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}

              />
              {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber[0]}</p>}
            </div>
          </div>

          {/* Booking Types */}
          <div className='mb-4'>
            <Label>{t("Booking Types")}</Label>
            <div className="flex md:flex-wrap flex-nowrap gap-2 mt-2 overflow-x-auto md:overflow-x-visible whitespace-nowrap no-scrollbar">
              {bookingTypes.map((type) => (
                <Button
                  key={type}
                  type="button"
                  onClick={() => handleChange("bookingType", type)}
                  className={`px-2 py-2 rounded-full shadow-sm border transition-all ${data.bookingType === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {type}
                </Button>

              ))}
              {errors.type && <p className="text-red-500 text-sm">{errors.type[0]}</p>}
            </div>
          </div>
          {/* Switch Cases To Forms Type Booking  */}
          <div className="space-y-6">
            {renderBookingForm()}
          </div>
          <hr className='border-gray-200 my-8' />
          {/* Price Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sell Price */}
            <div>
              <Label>Sell Price</Label>
              <Input
                type="number"
                value={data.sell_price}
                onChange={(e) => handleChange("sell_price", e.target.value)}
              />
              {errors["details.sell_price"] && <p className="text-red-500 text-sm">{errors["details.sell_price"][0]}</p>}


            </div>

            {/* Payment Fees */}
            <div>
              <Label>Payment Fees</Label>
              <Input
                type="number"
                value={data.fees}
                onChange={(e) => handleChange("fees", e.target.value)}
              />
              {errors["details.fees"] && <p className="text-red-500 text-sm">{errors["details.fees"][0]}</p>}
            </div>

            {/* Cost */}
            <div>
              <Label>Cost</Label>
              <Input
                type="number"
                value={data.cost}
                onChange={(e) => handleChange("cost", e.target.value)}
              />
              {errors["details.cost"] && <p className="text-red-500 text-sm">{errors["details.cost"][0]}</p>}
            </div>

            {/* Net Profit */}
            <div>
              <Label>Net Profit</Label>
              <Input type="number" value={data.net_profit} readOnly

              />
              {errors["details.net_profit"] && <p className="text-red-500 text-sm">{errors["details.net_profit"][0]}</p>}
            </div>
          </div>

          {/* Booking Status */}
          <div>
            <Label>{t("Booking Status")}</Label>
            <select
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              value={data.status || "hold"}
              onChange={(e) => handleChange("status", e.target.value)}

            >
              <option value="issued">issued</option>
              <option value="hold">hold</option>
              <option value="cancelled">cancelled</option>
            </select>
            {errors["details.status"] && <p className="text-red-500 text-sm">{errors["details.status"][0]}</p>}
          </div>

          {/* Notes */}
          <div>
            <Label>{t("notes")}</Label>
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              rows="3"
              value={data.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder={t("addNotes")}
            />
          </div>
        </div>
      </div>
    );
  };
  // Add Form  Type Booking===================================================================================== 
  const renderBookingForm = () => {
    switch (data.bookingType) {
      case "Hotel":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* hotelName */}
            <h2>{t("Hotel Information")}</h2>
            <div>

              <Label>{t("Hotel Name")}</Label>
              <Input
                value={data.hotelName || ""}
                onChange={(e) => handleChange("hotelName", e.target.value)}
              />
            </div>
            {/* NumberofGeust && NumberOfRoom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("Number Of Geust")}</Label>
                <Input
                  type="number"
                  value={data.number_of_guests}
                  onChange={(e) => handleChange("NumberOfGeust", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("Number Of Room")}</Label>
                <Input
                  type="number"
                  value={data.number_of_rooms}
                  onChange={(e) => handleChange("NumberOfRoom", e.target.value)}
                />
              </div>
            </div>
            {/* checkIn && checkOut  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("Check In")}</Label>
                <Input
                  type="date"
                  value={data.check_in_date}
                  onChange={(e) => handleChange("check_in_date", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Check Out")}</Label>
                <Input
                  type="date"
                  value={data.check_out_date}
                  onChange={(e) => handleChange("check_out_date", e.target.value)}
                />

              </div>

            </div>
            {/* RoomType && Gusts  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Room Type")}</Label>
                <Input
                  type="text"
                  value={data.room_type}
                  onChange={(e) => handleChange("roomType", e.target.value)}
                />
              </div>
              <div>
                {/* BookingNumber  */}
                <div>
                  <Label>{t("Booking Number")}</Label>
                  <Input
                    type="number"
                    value={data.booking_number}
                    onChange={(e) => handleChange("BookingNumber", e.target.value)}
                  />
                </div>
              </div>

            </div>

            {/* Supplier Name */}
            <div>

              <Label>{t("Supplier Name")}</Label>
              <Input
                type="text"
                value={data.supplier_name}
                onChange={(e) => handleChange("supplierName", e.target.value)}
              />
              {errors.supplierName && <p className="text-red-500 text-sm">{errors.supplierName[0]}</p>}

            </div>
            {/* Supplier Status && Supplier Payment Due Date   */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Supplier Status")}</Label>
                <Select
                  value={data.payment_status || ""}
                  onValueChange={value => handleChange("payment_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid" className="capitalize">
                      Paid
                    </SelectItem>
                    <SelectItem value="Not Paid" className="capitalize">
                      Not Paid
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("Supplier Payment Due Date")}</Label>
                <Input
                  type="date"
                  value={data.supplierPaymentDueDate || ""}
                  onChange={(e) => handleChange("supplierPaymentDueDate", e.target.value)}
                />

              </div>

            </div>
            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>
        );
      // Flight =================================================================================
      case "Flight":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* hotelName */}
            <h2>{t("Flight Information")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("Flight Number")}</Label>
                <Input
                  value={data.flightnumber || ""}
                  type="numder"
                  onChange={(e) => handleChange("flightnumber", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("Airline")}</Label>
                <Input
                  value={data.airline || ""}
                  type="numder"
                  onChange={(e) => handleChange("airline", e.target.value)}
                />
              </div>
            </div>

            {/* Departure Date && Arrival Date  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Departure Date")}</Label>
                <Input
                  type="date"
                  value={data.departureDate || ""}
                  onChange={(e) => handleChange("departureDate", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Arrival Date")}</Label>
                <Input
                  type="date"
                  value={data.arrivalDate || ""}
                  onChange={(e) => handleChange("arrivalDate", e.target.value)}
                />

              </div>

            </div>

            {/* NumberofGeust && NumberOfRoom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>

                <Label>{t("From")}</Label>
                <Input
                  type="text"
                  value={data.from || ""}
                  onChange={(e) => handleChange("from", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("To")}</Label>
                <Input
                  type="text"
                  value={data.to || ""}
                  onChange={(e) => handleChange("to", e.target.value)}
                />
              </div>
            </div>

            {/* Passenger Information */}
            <div>
              <Label>{t("Passenger Information")}</Label>
              <Input
                value={data.passangerInfo || ""}
                type="text"
                onChange={(e) => handleChange("passangerInfo", e.target.value)}
              />
            </div>

            {/* Supplier Name && Supplier Status  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Supplier Name")}</Label>
                <Input
                  type="text"
                  value={data.supplierName || ""}
                  onChange={(e) => handleChange("supplierName", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Supplier Status")}</Label>
                <Select value={data.payment_status || ""}
                  onValueChange={value => handleChange("payment_status", value)} >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Confimed" className="capitalize">
                      Confimed
                    </SelectItem>
                    <SelectItem value="Pending" className="capitalize">
                      Pending
                    </SelectItem>
                    <SelectItem value="Cancelled" className="capitalize">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>

          </div>
        );
      // Cruise=========================================================================
      case "Cruise":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Cruise Name */}
            <h2>{t("Cruise Information")}</h2>
            {/* Cruise Name && Cruise Line  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Cruise Name")}</Label>
                <Input
                  value={data.cruise || ""}
                  type="text"
                  onChange={(e) => handleChange("cruise", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("Cruise Line")}</Label>
                <Input
                  value={data.cruiseLine || ""}
                  type="text"
                  onChange={(e) => handleChange("cruiseLine", e.target.value)}
                />
              </div>
            </div>
            {/* ship && cabin,  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Ship")}</Label>
                <Input
                  value={data.ship || ""}
                  type="text"
                  onChange={(e) => handleChange("ship", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("Cabin")}</Label>
                <Input
                  value={data.cabin || ""}
                  type="text"
                  onChange={(e) => handleChange("cabin", e.target.value)}
                />
              </div>
            </div>

            {/* Departure Date && Rutern Date  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Departure Date")}</Label>
                <Input
                  type="date"
                  value={data.departureDate || ""}
                  onChange={(e) => handleChange("departureDate", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Arrival Date")}</Label>
                <Input
                  type="date"
                  value={data.returnDate || ""}
                  onChange={(e) => handleChange("returnDate", e.target.value)}
                />

              </div>

            </div>
            {/* NumberofGeust && NumberOfRoom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Departure Port")}</Label>
                <Input
                  type="text"
                  value={data.departureport || ""}
                  onChange={(e) => handleChange("departureport", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("Arrival Port")}</Label>
                <Input
                  type="text"
                  value={data.returnPort || ""}
                  onChange={(e) => handleChange("returnPort", e.target.value)}
                />
              </div>
            </div>

            {/* Supplier Name Supplier Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Supplier Name")}</Label>
                <Input
                  type="text"
                  value={data.supplierName || ""}
                  onChange={(e) => handleChange("supplierName", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Supplier Status")}</Label>
                <Select value={data.payment_status || ""}
                  onValueChange={value => handleChange("payment_status", value)} >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Confimed" className="capitalize">
                      Confimed
                    </SelectItem>
                    <SelectItem value="Pending" className="capitalize">
                      Pending
                    </SelectItem>
                    <SelectItem value="Cancelled" className="capitalize">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>
        );

      // Visa========================================================================
      case "Visa":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Visa Name */}
            <h2>{t("Visa Information")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>
                <Label>{t("Visa Name")}</Label>
                <Input
                  value={data.visa || ""}
                  type="text"
                  onChange={(e) => handleChange("visa", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Duration")}</Label>
                <Input
                  value={data.duration || ""}
                  type="number"
                  onChange={(e) => handleChange("duration", e.target.value)}
                />
              </div>
            </div>


            {/* applicationDate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Country")}</Label>
                <Input
                  type="text"
                  value={data.country || ""}
                  onChange={(e) => handleChange("country", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Application Date")}</Label>
                <Input
                  type="date"
                  value={data.applicationDate || ""}
                  onChange={(e) => handleChange("applicationDate", e.target.value)}
                />
              </div>
            </div>

            <div>

              <Label>{t("Application Details")}</Label>
              <Textarea

                type="text"
                value={data.applicationDetials || ""}
                onChange={(e) => handleChange("applicationDetials", e.target.value)}
              />
            </div>

            {/* Supplier Name Supplier Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Supplier Name")}</Label>
                <Input
                  type="text"
                  value={data.supplierName || ""}
                  onChange={(e) => handleChange("supplierName", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Supplier Status")}</Label>
                <Select value={data.payment_status || ""}
                  onValueChange={value => handleChange("payment_status", value)} >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending" className="capitalize">
                      Pending
                    </SelectItem>
                    <SelectItem value="Approved" className="capitalize">
                      Approved
                    </SelectItem>
                    <SelectItem value="Rejected" className="capitalize">
                      Rejected
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>
        );

      // Appointment ====================================================
      case "Appointment":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Appointment Name */}
            <h2>{t("Appointment Information")}</h2>
            <div>

              <Label>{t("Appointment Name")}</Label>
              <Input
                value={data.appointment || ""}
                type="text"
                onChange={(e) => handleChange("appointment", e.target.value)}
              />
            </div>


            {/* applicationDate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t("Application Date")}</Label>
                <Input
                  type="datetime-local"
                  value={data.applicationDate || ""}
                  onChange={(e) => handleChange("applicationDate", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("Location")}</Label>
                <Input
                  type="text"
                  value={data.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>
            </div>

            {/* Supplier Status && Supplier Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Supplier Name")}</Label>
                <Input
                  type="text"
                  value={data.supplierName || ""}
                  onChange={(e) => handleChange("supplierName", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Supplier Status")}</Label>
                <Select value={data.payment_status || ""}
                  onValueChange={value => handleChange("payment_status", value)} >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled" className="capitalize">
                      Scheduled
                    </SelectItem>
                    <SelectItem value="Completed" className="capitalize">
                      Completed
                    </SelectItem>
                    <SelectItem value="Cancelled" className="capitalize">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>
        );
      // Insurance======================================================================
      case "Insurance":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Insurance Name */}
            <h2>{t("Insurance Information")}</h2>

            <div>
              <Label>{t("Insurance Type")}</Label>
              <Input
                value={data.insurance || ""}
                type="text"
                onChange={(e) => handleChange("insurance", e.target.value)}
              />
            </div>

            <div>
              <Label>{t("Provider")}</Label>
              <Input
                type="text"
                value={data.provider || ""}
                onChange={(e) => handleChange("provider", e.target.value)}
              />
            </div>
            {/* start Date && EndDate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>{t("Start Date")}</Label>
                <Input
                  type="date"
                  value={data.startDate || ""}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("End Date")}</Label>
                <Input
                  type="date"
                  value={data.endDate || ""}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                />
              </div>
            </div>
            <div>

              <Label>{t("Insured Persons")}</Label>
              <Input
                type="text"
                value={data.insuredPersons || ""}
                onChange={(e) => handleChange("insuredPersons", e.target.value)}
              />
            </div>


            {/* Supplier Status && Supplier Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Supplier Name")}</Label>
                <Input
                  type="text"
                  value={data.supplierName || ""}
                  onChange={(e) => handleChange("supplierName", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Status")}</Label>
                <Select value={data.payment_status || ""}
                  onValueChange={value => handleChange("payment_status", value)} >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active" className="capitalize">
                      Active
                    </SelectItem>
                    <SelectItem value="Expired" className="capitalize">
                      Expired
                    </SelectItem>
                    <SelectItem value="Cancelled" className="capitalize">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div >

        );
      // Tickets======================================================================
      case "Ticket":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Tickets Name */}
            <h2>{t("Entertainment Tickets Information")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>{t("Event Name")}</Label>
                <Input
                  value={data.event || ""}
                  type="text"
                  onChange={(e) => handleChange("event", e.target.value)}
                />
              </div>

              <div>

                <Label>{t("Event Date")}</Label>
                <Input
                  type="date"
                  value={data.eventDate || ""}
                  onChange={(e) => handleChange("eventDate", e.target.value)}
                />
              </div>
            </div>
            {/* seat category, quantity. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>{t("Seat Category")}</Label>
                <Input
                  value={data.seatcategory || ""}
                  type="text"
                  onChange={(e) => handleChange("seatcategory", e.target.value)}
                />
              </div>

              <div>

                <Label>{t("Quantity")}</Label>
                <Input
                  type="number"
                  value={data.quantity || ""}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                />
              </div>
            </div>

            {/* Ticket Count   */}
            <div>

              <Label>{t("Ticket Count ")}</Label>
              <Input
                type="number"
                value={data.ticketCount || ""}
                onChange={(e) => handleChange("ticketCount", e.target.value)}
              />
            </div>

            {/* Supplier Status && Supplier Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Supplier Name")}</Label>
                <Input
                  type="text"
                  value={data.supplierName || ""}
                  onChange={(e) => handleChange("supplierName", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Status")}</Label>
                <Select value={data.payment_status || ""}
                  onValueChange={value => handleChange("payment_status", value)} >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Confirmed" className="capitalize">
                      Confirmed
                    </SelectItem>
                    <SelectItem value="Pending" className="capitalize">
                      Pending
                    </SelectItem>
                    <SelectItem value="Cancelled" className="capitalize">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>

        );
      case "Transportation":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Transportation Name */}
            <h2>{t("Transportation Information")}</h2>
            {/* Transportation Type */}
            <div>
              <Label>{t("Transportation Type")}</Label>
              <Select value={data.transport_type || ""}
                onValueChange={value => handleChange("transport_type", value)} >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Car">Car</SelectItem>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Train">Train</SelectItem>
                  <SelectItem value="Taxi">Taxi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t("Pickup Location")}</Label>
                <Input
                  value={data.pickupLocation || ""}
                  type="text"
                  onChange={(e) => handleChange("pickupLocation", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Dropoff Location")}</Label>
                <Input
                  type="text"
                  value={data.dropoffLocation || ""}
                  onChange={(e) => handleChange("dropoffLocation", e.target.value)}
                />
              </div>
            </div>
            {/* Route From && to   */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t("Route From")}</Label>
                <Input
                  type="text"
                  value={data.routeFrom || ""}
                  onChange={(e) => handleChange("routeFrom", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Route To")}</Label>
                <Input
                  type="text"
                  value={data.routeTo || ""}
                  onChange={(e) => handleChange("routeTo", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>{t("Transportation Date")}</Label>
              <Input
                type="datetime-local"
                value={data.transportationDate || ""}
                onChange={(e) => handleChange("transportationDate", e.target.value)}
              />
            </div>

            <div>
              <Label>{t("Passenger Count")}</Label>
              <Input
                type="number"
                value={data.passengerCount || ""}
                onChange={(e) => handleChange("passengerCount", e.target.value)}
              />
            </div>


            {/* Supplier Status && Supplier Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Supplier Name")}</Label>
                <Input
                  type="text"
                  value={data.supplierName || ""}
                  onChange={(e) => handleChange("supplierName", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Status")}</Label>
                <Select value={data.payment_status || ""}
                  onValueChange={value => handleChange("payment_status", value)} >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Confirmed" className="capitalize">
                      Confirmed
                    </SelectItem>
                    <SelectItem value="Pending" className="capitalize">
                      Pending
                    </SelectItem>
                    <SelectItem value="Cancelled" className="capitalize">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>

        );

      default:
        return (
          <p className="text-gray-500 italic">{t("selectBookingType")}</p>
        );
    }
  };

  //----------------------------------------------------------------------------------------------------------------------
  // View Render the booking details based on the selected booking type=============================================
  const renderDetailsTypeBooking = () => {
    // Extract the model name from the full class path
    const getBookingType = (reservableType) => {
      if (!reservableType) return '';
      return reservableType.split('\\').pop(); // Gets "Hotel" from "App\\Models\\Hotel"
    };

    const bookingType = getBookingType(singleBooking?.reservable_type);

    switch (bookingType) {
      case "Hotel":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            <h2 className="text-2xl text-center font-bold text-gradient">{t("Hotel Information")}</h2>

            {/* Hotel Name */}
            <div>
              <Label className="font-medium">{t("Hotel Name")}: {singleBooking.reservable?.name || 'N/A'}</Label>
            </div>

            {/* Number of Guests && Number Of Rooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Number Of Guests")}: {singleBooking.reservable?.number_of_guests || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Number Of Rooms")}: {singleBooking.reservable?.number_of_rooms || 'N/A'}</Label>
              </div>
            </div>

            {/* Room Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Room Type")}: {singleBooking.reservable?.room_type || 'N/A'}</Label>
              </div>
              {/* Booking Number */}
              <div>
                <Label className="font-medium">{t("Booking Number")}: {singleBooking.reservable?.booking_number || 'N/A'}</Label>
              </div>
            </div>

            {/* Check In && Check Out */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Check In")}: {singleBooking.reservable?.check_in_date || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Check Out")}: {singleBooking.reservable?.check_out_date || 'N/A'}</Label>
              </div>
            </div>
            {/*Supplier name && payment_status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Supplier Name")}: {singleBooking.supplier?.name || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Status")}: {singleBooking.supplier?.payment_status || 'N/A'}</Label>
              </div>
            </div>

          </div>
        );

      case "Flight":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            <h2 className="text-2xl text-center font-bold text-gradient">{t("Flight Information")}</h2>

            {/* Flight Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Flight Number")}: {singleBooking.reservable?.flight_number || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Airline")}: {singleBooking.reservable?.airline || 'N/A'}</Label>
              </div>
            </div>
            {/* Departure Date && Arrival Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Departure Date")}: {singleBooking.reservable?.departure_date || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Arrival Date")}: {singleBooking.reservable?.arrival_date || 'N/A'}</Label>
              </div>
            </div>

            {/* From && To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("From")}: {singleBooking.reservable?.from_airport || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("To")}: {singleBooking.reservable?.to_airport || 'N/A'}</Label>
              </div>
            </div>
            {/* passangerInfo */}
            <div>
              <Label className="font-medium">{t("Passanger Info")}: {singleBooking.reservable?.passangerInfo || 'N/A'}</Label>
            </div>
            {/*Supplier name && Payment Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Supplier Name")}: {singleBooking.supplier?.name || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Status")}: {singleBooking.supplier?.payment_status || 'N/A'}</Label>
              </div>
            </div>
          </div>
        );

      case "Cruise":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            <h2 className="text-2xl text-center font-bold text-gradient">{t("Cruise Information")}</h2>

            {/* Cruise Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Cruise Name")}: {singleBooking.reservable?.cruise_name || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Cruise Line")}: {singleBooking.reservable?.cruise_line || 'N/A'}</Label>
              </div>
            </div>
            {/* Cruise Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Ship Name")}: {singleBooking.reservable?.ship_name || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Cabin Type")}: {singleBooking.reservable?.cabin_type || 'N/A'}</Label>
              </div>
            </div>

            {/* Departure Date && Return Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Departure Date")}: {singleBooking.reservable?.departure_date || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Arrival Date")}: {singleBooking.reservable?.arrival_date || 'N/A'}</Label>
              </div>
            </div>

            {/* Departure Port && Return Port */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Departure Port")}: {singleBooking.reservable?.departure_port || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Arrival Port")}: {singleBooking.reservable?.arrival_port || 'N/A'}</Label>
              </div>
            </div>

            {/*Supplier name && payment_status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Supplier Name")}: {singleBooking.supplier?.name || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Status")}: {singleBooking.supplier?.payment_status || 'N/A'}</Label>
              </div>
            </div>
          </div>
        );

      case "Visa":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            <h2 className="text-2xl text-center font-bold text-gradient">{t("Visa Information")}</h2>

            {/* Visa Type/Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Visa Type")}: {singleBooking.reservable?.visa_type || singleBooking.reservable?.name || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Country")}: {singleBooking.reservable?.country || singleBooking.reservable?.country || 'N/A'}</Label>
              </div>
            </div>

            {/* Application Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Application Date")}: {singleBooking.reservable?.application_date || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Duration")}: {singleBooking.reservable?.duration || 'N/A'}</Label>
              </div>
            </div>
            {/* applicationDetials */}
            <div>
              <Label className="font-medium">{t("Application Detials")}: {singleBooking.reservable?.applicationDetials || 'N/A'}</Label>
            </div>

            {/*Supplier name && payment_status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Supplier Name")}: {singleBooking.supplier?.name || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Status")}: {singleBooking.supplier?.payment_status || 'N/A'}</Label>
              </div>
            </div>
          </div>
        );

      case "Appointment":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            <h2 className="text-2xl text-center font-bold text-gradient">{t("Appointment Information")}</h2>

            {/* Appointment Name */}
            <div>
              <Label className="font-medium">{t("Appointment Type")}: {singleBooking.reservable?.appointment_type || 'N/A'}</Label>
            </div>

            {/* Application Date && Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">{t("Appointment Date")}: {singleBooking.reservable?.appointment_date || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Location")}: {singleBooking.reservable?.location || 'N/A'}</Label>
              </div>
            </div>

            {/*Supplier name && payment_status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Supplier Name")}: {singleBooking.supplier?.name || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Status")}: {singleBooking.supplier?.payment_status || 'N/A'}</Label>
              </div>
            </div>
          </div>
        );

      case "Insurance":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            <h2 className="text-2xl text-center font-bold text-gradient">{t("Insurance Information")}</h2>

            {/* Insurance Name */}
            <div>
              <Label className="font-medium">{t("Insurance Type")}: {singleBooking.reservable?.insurance_type || 'N/A'}</Label>
            </div>

            {/* Provider */}
            <div>
              <Label className="font-medium">{t("Provider")}: {singleBooking.reservable?.provider || 'N/A'}</Label>
            </div>
            {/* Provider */}
            <div>
              <Label className="font-medium">{t("Insured Persons")}: {singleBooking.reservable?.insured_persons || 'N/A'}</Label>
            </div>

            {/* Start Date && End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">{t("Start Date")}: {singleBooking.reservable?.start_date || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("End Date")}: {singleBooking.reservable?.end_date || 'N/A'}</Label>
              </div>
            </div>

            {/*Supplier name && payment_status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Supplier Name")}: {singleBooking.supplier?.name || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Status")}: {singleBooking.supplier?.payment_status || 'N/A'}</Label>
              </div>
            </div>
          </div>
        );

      case "Ticket":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            <h2 className="text-2xl text-center font-bold text-gradient">{t("Entertainment Tickets Information")}</h2>

            {/* Event Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">{t("Event Name")}: {singleBooking.reservable?.event_name || singleBooking.reservable?.name || 'N/A'}</Label>
              </div>

              {/* Event Date */}
              <div>
                <Label className="font-medium">{t("Event Date")}: {singleBooking.reservable?.event_date || 'N/A'}</Label>
              </div>
            </div>

            {/* Ticket Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">{t("Ticket Count")}: {singleBooking.reservable?.tickets_count || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Seat Category")}: {singleBooking.reservable?.seat_category || 'N/A'}</Label>
              </div>
            </div>
            {/* Quantity */}
            <div>
              <Label className="font-medium">{t("Quantity")}: {singleBooking.reservable?.quantity || 'N/A'}</Label>
            </div>

            {/*Supplier name && payment_status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Supplier Name")}: {singleBooking.supplier?.name || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Status")}: {singleBooking.supplier?.payment_status || 'N/A'}</Label>
              </div>
            </div>
          </div>
        );

      case "Transportation":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            <h2 className="text-2xl text-center font-bold text-gradient">{t("Transportation Information")}</h2>

            {/* Transportation Type */}
            <div>
              <Label className="font-medium">{t("Transportation Type")}: {singleBooking.reservable?.transport_type || 'N/A'}</Label>
            </div>

            {/* Pickup Location && Dropoff Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">{t("Pickup Location")}: {singleBooking.reservable?.pickup_location || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Dropoff Location")}: {singleBooking.reservable?.dropoff_location || 'N/A'}</Label>
              </div>
            </div>
            {/* Pickup Location && Dropoff Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">{t("Route From")}: {singleBooking.reservable?.routeFrom || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Route To")}: {singleBooking.reservable?.routeTo || 'N/A'}</Label>
              </div>
            </div>

            {/* Transportation Date && Passenger Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">{t("Transportation Date")}: {singleBooking.reservable?.transportationDate || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Passenger Count")}: {singleBooking.reservable?.passenger_count || 'N/A'}</Label>
              </div>
            </div>

            {/*Supplier name && payment_status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label className="font-medium">{t("Supplier Name")}: {singleBooking.supplier?.name || 'N/A'}</Label>
              </div>
              <div>
                <Label className="font-medium">{t("Status")}: {singleBooking.supplier?.payment_status || 'N/A'}</Label>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500 italic">{t("No booking details available")}</p>
            <p className="text-sm text-gray-400">Booking Type: {bookingType || 'Unknown'}</p>
          </div>
        );
    }
  };
  // View Single Booking Details===================================================================================
  if (modal.type === 'view') {

    return (
      <>
        <Dialog open={modal.isOpen} onOpenChange={onClose}>
          <DialogContent className="w-[800px] max-w-[90%] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
            <DialogHeader>
              {/* Details Main Reservation */}
              <div className='text-center text-3xl font-bold text-gradient'>
                {t("Details Reservation")}
              </div>
              {/* <DialogTitle>{t("View Reservation Details")}</DialogTitle> */}
            </DialogHeader>

            {loading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : singleBooking ? (
              <>
                <div>
                  <Label>{t("Customer Name")}: {singleBooking.customer.name || 'N/A'}</Label>
                </div>
                <div>
                  <Label>{t("Customer Phone")}: {singleBooking.customer.phone || 'N/A'}</Label>
                </div>

                {/* Cost && Sell Price && fees */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <Label className="font-medium">{t("Cost")}: {singleBooking.cost || 'N/A'}</Label>
                  </div>
                  <div>
                    <Label className="font-medium">{t("Fees")}: {singleBooking.fees || 'N/A'}</Label>
                  </div>
                  <div>
                    <Label className="font-medium">{t("Sell Price")}: {singleBooking.sell_price || 'N/A'}</Label>
                  </div>
                </div>

                {/* Status Reservation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                  <div>
                    <Label className="font-medium">{t("Booking Status")}: {singleBooking.status || 'N/A'}</Label>
                  </div>
                  {
                    singleBooking.status === 'Cancelled' && (<div>
                      <Label className="font-medium">{t("Reason Cancelled")}: {singleBooking.reason_cancelled || 'N/A'}</Label>
                    </div>)
                  }
                </div>
                {/* Notes */}
                <div>
                  <Label className="font-medium">{t("Notes")}: {singleBooking.notes || 'N/A'}</Label>
                </div>

                {/* Details Type Of Booking Seven */}
                {/* Switch Cases To Forms Type Booking */}
                <hr className='border-gray-200' />
                <div className="space-y-6">
                  {renderDetailsTypeBooking()}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p>{t("No booking data available")}</p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  //----------------------------------------------------------------------------------------------------------------------
  // Delete ==============================================================================================
  if (modal.type === 'delete') {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('confirmDelete')}</DialogTitle></DialogHeader>
          <DialogDescription>{t('deleteDescription')}</DialogDescription>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
            <Button variant="destructive" onClick={() => onDelete(data.id)}>{t('delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  // ...existing code...
  if (modal.type === 'edit') {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="w-[800px] max-w-[90%] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{t('edit') + ' ' + t('booking')}</DialogTitle>
          </DialogHeader>
          <EditBooking
            modal={modal}
            closeModal={onClose}
            calculateNetProfit={calculateNetProfit}
            onUpdateSuccess={fetchBookings}
          // مرر أي props إضافية يحتاجها EditBooking
          />
          <DialogFooter>
            {/* <Button variant="outline" onClick={onClose}>{t('cancel')}</Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  // ...existing code...
  return (<>
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[800px] max-w-[90%] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {modal.type === 'add' ? t('addBooking') : t('edit') + ' ' + t('booking')}
          </DialogTitle>
        </DialogHeader>

        {modal.type === 'add' ? renderFormFields() : <EditBooking modal={modal} closeModal={closeModal} calculateNetProfit={calculateNetProfit} handleChange={handleChange} onUpdateSuccess={onSave} // إضافة هذا السطر
          data={data}// أضف هذا السطر
          setLoading={setLoading}
        />}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={() => {
            // Map bookingType to type for backend compatibility
            // Move booking-specific fields into details
            const {
              bookingType,
              sell_price,
              fees,
              cost,
              net_profit,
              ...rest
            } = data;

            const submitData = {
              ...rest,
              type: bookingType,
              details: {
                sell_price,
                fees,
                cost,
                net_profit,
                // Add other booking-specific fields here if needed
              }
            };

            onSave(submitData);
          }}>
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {/* Load  Vieew  */}

  </>
  );
};

export default Bookings;