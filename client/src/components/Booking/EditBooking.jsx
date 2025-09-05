// Complete Edit Form with Dynamic Booking Type Detection

import { useEffect, useState } from "react";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useLanguage } from "../../contexts/LanguageContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// Main form render function
const EditBooking = ({ modal, closeModal, calculateNetProfit, setModal, onUpdateSuccess }) => {
    const [bookings, setBookings] = useState([]);
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);


    // Initialize state based on modal data and booking type
    const [data, setData] = useState(() => {
        const modalData = modal.data || {};

        // Determine booking type from various possible sources
        const bookingType = modalData.bookingType ||
            modalData.type ||
            modalData.reservable_type?.replace('App\\Models\\', '') ||
            'Hotel';

        return {
            // Customer fields - properly initialize customer object
            customer: {
                name: modalData.customer?.name || "",
                phone: modalData.customer?.phone || ""
            },

            // Reservation fields
            bookingType: bookingType,
            sell_price: modalData.sell_price || "",
            fees: modalData.fees || "",
            cost: modalData.cost || "",
            net_profit: modalData.net_profit || 0,
            status: modalData.status || "Hold",
            notes: modalData.notes || "",
            reminderDays: modalData.reminderDays || 3,

            // Supplier fields
            supplierName: modalData.supplier?.name || "",
            payment_status: modalData.supplier?.payment_status || "Unpaid",
            supplierPaymentDueDate: modalData.supplierPaymentDueDate || "",

            // Service-specific fields from reservable
            ...(modalData.reservable || {}),

            // Any additional fields from modal data
            ...modalData
        };
    });



    // Handle action function to be used with the Edit button
    const handleAction = (type, bookingData = null) => {
        setModal({
            isOpen: true,
            type,
            data: bookingData
        });
    };

    const handleChange = (field, value, netProfit = null) => {
        // Handle customer fields specially
        if (field === "name" || field === "phoneNumber") {
            setData(prev => ({
                ...prev,
                customer: {
                    ...prev.customer,
                    [field === "phoneNumber" ? "phone" : "name"]: value
                }
            }));
        } else if (field === "sell_price" || field === "cost" || field === "fees") {
            setData(prev => ({
                ...prev,
                [field]: value,
                ...(netProfit !== null && { net_profit: netProfit })
            }));
        } else {
            setData(prev => ({ ...prev, [field]: value }));
        }
    };

    // Handle Update Function for Editing Reservations
    const handleUpdate = async () => {
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                toast({ title: "Not Auth", variant: "destructive" });
                return;
            }

            // Validate required data
            if (!modal.data?.id) {
                toast({ title: "Booking ID is missing", variant: "destructive" });
                return;
            }

            if (!data.customer?.name?.trim()) {
                toast({ title: "Customer name is required", variant: "destructive" });
                return;
            }

            if (!data.bookingType) {
                toast({ title: "Booking type is required", variant: "destructive" });
                return;
            }

            // Prepare the data in the format expected by your backend
            const updateData = {
                // Customer data (flat structure as expected by backend)
                name: data.customer?.name || "",
                phoneNumber: data.customer?.phone || "",

                // Reservation data  
                type: data.bookingType,
                status: data.status,
                notes: data.notes,

                // Price details (nested as expected by backend)
                details: {
                    sell_price: parseFloat(data.sell_price) || 0,
                    cost: parseFloat(data.cost) || 0,
                    fees: parseFloat(data.fees) || 0
                },
                net_profit: parseFloat(data.net_profit) || 0,

                // Supplier data (flat structure)
                supplierName: data.supplier?.name || "",
                payment_status: data.supplier?.payment_status || "Unpaid",

                // Service-specific fields based on booking type (flat structure)
                ...getServiceSpecificFields()
            };

            console.log('Sending update data:', updateData); // للـ debugging

            const res = await fetch(`http://travel-server.test/api/reservations/${modal.data.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('Backend error:', errorData);
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }

            const result = await res.json();
            console.log('Update successful:', result);
            toast({ title: "Booking updated successfully" });

            // Refresh the bookings list
            await onUpdateSuccess();
            closeModal();

        } catch (err) {
            console.error('Update error:', err);
            toast({
                title: "Error updating booking",
                description: err.message || "Unknown error occurred",
                variant: "destructive"
            });
        }
    };

    useEffect(() => {
        handleUpdate();
    }, [modal.data.id]);
    const getServiceSpecificFields = () => {
        switch (data.bookingType) {
            case 'Hotel':
                return {
                    hotelName: data.hotelName || data.name,
                    BookingNumber: data.BookingNumber || data.booking_number,
                    check_in_date: data.check_in_date,
                    check_out_date: data.check_out_date,
                    NumberOfGeust: data.NumberOfGeust ? parseInt(data.NumberOfGeust, 10) : (data.number_of_guests ? parseInt(data.number_of_guests, 10) : 0),
                    NumberOfRoom: data.NumberOfRoom ? parseInt(data.NumberOfRoom, 10) : (data.number_of_rooms ? parseInt(data.number_of_rooms, 10) : 0),
                    roomType: data.roomType || data.room_type
                };
            case 'Flight':
                return {
                    flightnumber: data.flightnumber || data.flight_number,
                    departureDate: data.departureDate || data.departure_date,
                    arrivalDate: data.arrivalDate || data.arrival_date,
                    from: data.from || data.from_airport,
                    to: data.to || data.to_airport,
                    airline: data.airline,
                    passengerInfo: data.passengerInfo
                };
            case 'Cruise':
                return {
                    cruise: data.cruise || data.cruise_name,
                    ship: data.ship || data.ship_name,
                    cabin: data.cabin || data.cabin_type,
                    departureDate: data.departureDate || data.departure_date,
                    returnDate: data.returnDate || data.arrival_date,
                    departureport: data.departureport || data.departure_port,
                    returnPort: data.returnPort || data.arrival_port,
                    cruiseLine: data.cruiseLine || data.cruise_line
                };
            case 'Visa':
                return {
                    country: data.country,
                    visa: data.visa || data.visa_type,
                    applicationDate: data.applicationDate || data.application_date,
                    duration: data.duration,
                    applicationDetails: data.applicationDetails
                };
            case 'Appointment':
                return {
                    appointment: data.appointment || data.appointment_type,
                    applicationDate: data.applicationDate || data.appointment_date,
                    location: data.location
                };
            case 'Insurance':
                return {
                    insurance: data.insurance || data.insurance_type,
                    provider: data.provider,
                    startDate: data.startDate || data.start_date,
                    endDate: data.endDate || data.end_date,
                    insuredPersons: data.insuredPersons || data.insured_persons
                };
            case 'Tickets':
                return {
                    event: data.event || data.event_name,
                    eventDate: data.eventDate || data.event_date,
                    ticketCount: data.ticketCount || data.tickets_count,
                    seatcategory: data.seatcategory || data.seat_category,
                    quantity: data.quantity
                };
            case 'Transportation':
                return {
                    type: data.type || data.transport_type,
                    transportationDate: data.transportationDate,
                    pickupLocation: data.pickupLocation || data.pickup_location,
                    dropoffLocation: data.dropoffLocation || data.dropoff_location,
                    routeFrom: data.routeFrom,
                    routeTo: data.routeTo,
                    passengerCount: data.passengerCount || data.passenger_count
                };
            default:
                return {};
        }
    };

    // Dynamic Form Renderer Based on Booking Type
    const renderBookingFormEdit = () => {
        switch (data.bookingType) {
            case "Hotel":
                return (
                    <div className="space-y-2 border rounded-md shadow-md p-3">
                        <h2 className="text-lg font-semibold">{t("Hotel Information")}</h2>
                        <div>
                            <Label>{t("Hotel Name")}</Label>
                            <Input
                                value={data.hotelName || data.name || ""}
                                onChange={(e) => handleChange("hotelName", e.target.value)}
                            />
                        </div>

                        {/* Number of Guests && Number Of Rooms */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <Label>{t("Number Of Guests")}</Label>
                                <Input
                                    type="number"
                                    value={data.NumberOfGeust || data.number_of_guests || ""}
                                    onChange={(e) => handleChange("NumberOfGeust", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>{t("Number Of Rooms")}</Label>
                                <Input
                                    type="number"
                                    value={data.NumberOfRoom || data.number_of_rooms || ""}
                                    onChange={(e) => handleChange("NumberOfRoom", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Check In && Check Out */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <Label>{t("Check In")}</Label>
                                <Input
                                    type="date"
                                    value={data.check_in_date || ""}
                                    onChange={(e) => handleChange("check_in_date", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>{t("Check Out")}</Label>
                                <Input
                                    type="date"
                                    value={data.check_out_date || ""}
                                    onChange={(e) => handleChange("check_out_date", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Room Type */}
                        <div>
                            <Label>{t("Room Type")}</Label>
                            <Input
                                type="text"
                                value={data.roomType || data.room_type || ""}
                                onChange={(e) => handleChange("roomType", e.target.value)}
                            />
                        </div>

                        {/* Booking Number */}
                        <div>
                            <Label>{t("Booking Number")}</Label>
                            <Input
                                type="text"
                                value={data.BookingNumber || data.booking_number || ""}
                                onChange={(e) => handleChange("BookingNumber", e.target.value)}
                            />
                        </div>

                        {/* Supplier Name */}
                        <div>
                            <Label>{t("Supplier Name")}</Label>
                            <Input
                                type="text"
                                value={data.supplierName || ""}
                                onChange={(e) => handleChange("supplierName", e.target.value)}
                            />
                        </div>

                        {/* Supplier Status */}
                        <div>
                            <Label>{t("Supplier Status")}</Label>
                            <Select
                                value={data.payment_status || "Unpaid"}
                                onValueChange={(value) => handleChange("payment_status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Unpaid">Not Paid</SelectItem>
                                    <SelectItem value="Partial">Partial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case "Flight":
                return (
                    <div className="space-y-2 border rounded-md shadow-md p-3">
                        <h2 className="text-lg font-semibold">{t("Flight Information")}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <Label>{t("Flight Number")}</Label>
                                <Input
                                    value={data.flightnumber || data.flight_number || ""}
                                    type="text"
                                    onChange={(e) => handleChange("flightnumber", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>{t("Airline")}</Label>
                                <Input
                                    value={data.airline || ""}
                                    type="text"
                                    onChange={(e) => handleChange("airline", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Departure Date && Arrival Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <Label>{t("Departure Date")}</Label>
                                <Input
                                    type="date"
                                    value={data.departureDate || data.departure_date || ""}
                                    onChange={(e) => handleChange("departureDate", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>{t("Arrival Date")}</Label>
                                <Input
                                    type="date"
                                    value={data.arrivalDate || data.arrival_date || ""}
                                    onChange={(e) => handleChange("arrivalDate", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* From && To */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <Label>{t("From")}</Label>
                                <Input
                                    type="text"
                                    value={data.from || data.from_airport || ""}
                                    onChange={(e) => handleChange("from", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>{t("To")}</Label>
                                <Input
                                    type="text"
                                    value={data.to || data.to_airport || ""}
                                    onChange={(e) => handleChange("to", e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>{t("Passenger Information")}</Label>
                            <Input
                                value={data.passengerInfo || ""}
                                type="text"
                                onChange={(e) => handleChange("passengerInfo", e.target.value)}
                            />
                        </div>

                        {/* Supplier Name */}
                        <div>
                            <Label>{t("Supplier Name")}</Label>
                            <Input
                                type="text"
                                value={data.supplierName || ""}
                                onChange={(e) => handleChange("supplierName", e.target.value)}
                            />
                        </div>

                        {/* Supplier Status */}
                        <div>
                            <Label>{t("Supplier Status")}</Label>
                            <Select
                                value={data.payment_status || "Unpaid"}
                                onValueChange={(value) => handleChange("payment_status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Unpaid">Not Paid</SelectItem>
                                    <SelectItem value="Partial">Partial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case "Cruise":
                return (
                    <div className="space-y-2 border rounded-md shadow-md p-3">
                        <h2 className="text-lg font-semibold">{t("Cruise Information")}</h2>

                        {/* Cruise Name && Cruise Line */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <Label>{t("Cruise Name")}</Label>
                                <Input
                                    value={data.cruise || data.cruise_name || ""}
                                    type="text"
                                    onChange={(e) => handleChange("cruise", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>{t("Cruise Line")}</Label>
                                <Input
                                    value={data.cruiseLine || data.cruise_line || ""}
                                    type="text"
                                    onChange={(e) => handleChange("cruiseLine", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Ship && Cabin */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <Label>{t("Ship")}</Label>
                                <Input
                                    value={data.ship || data.ship_name || ""}
                                    type="text"
                                    onChange={(e) => handleChange("ship", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>{t("Cabin")}</Label>
                                <Input
                                    value={data.cabin || data.cabin_type || ""}
                                    type="text"
                                    onChange={(e) => handleChange("cabin", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Departure Date && Return Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <Label>{t("Departure Date")}</Label>
                                <Input
                                    type="date"
                                    value={data.departureDate || data.departure_date || ""}
                                    onChange={(e) => handleChange("departureDate", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>{t("Return Date")}</Label>
                                <Input
                                    type="date"
                                    value={data.returnDate || data.arrival_date || ""}
                                    onChange={(e) => handleChange("returnDate", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Departure Port && Return Port */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <Label>{t("Departure Port")}</Label>
                                <Input
                                    type="text"
                                    value={data.departureport || data.departure_port || ""}
                                    onChange={(e) => handleChange("departureport", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>{t("Return Port")}</Label>
                                <Input
                                    type="text"
                                    value={data.returnPort || data.arrival_port || ""}
                                    onChange={(e) => handleChange("returnPort", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Supplier Name */}
                        <div>
                            <Label>{t("Supplier Name")}</Label>
                            <Input
                                type="text"
                                value={data.supplierName || ""}
                                onChange={(e) => handleChange("supplierName", e.target.value)}
                            />
                        </div>

                        {/* Supplier Status */}
                        <div>
                            <Label>{t("Supplier Status")}</Label>
                            <Select
                                value={data.payment_status || "Unpaid"}
                                onValueChange={(value) => handleChange("payment_status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Unpaid">Not Paid</SelectItem>
                                    <SelectItem value="Partial">Partial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case "Visa":
                return (
                    <div className="space-y-2 border rounded-md shadow-md p-3">
                        <h2 className="text-lg font-semibold">{t("Visa Information")}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <Label>{t("Visa Type")}</Label>
                                <Input
                                    value={data.visa || data.visa_type || ""}
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

                        {/* Country && Application Date */}
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
                                    value={data.applicationDate || data.application_date || ""}
                                    onChange={(e) => handleChange("applicationDate", e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>{t("Application Details")}</Label>
                            <textarea
                                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                rows="3"
                                value={data.applicationDetails || ""}
                                onChange={(e) => handleChange("applicationDetails", e.target.value)}
                            />
                        </div>

                        {/* Visa Status */}
                        <div>
                            <Label>{t("Visa Status")}</Label>
                            <Select
                                value={data.visa_status || "Pending"}
                                onValueChange={(value) => handleChange("visa_status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case "Appointment":
                return (
                    <div className="space-y-2 border rounded-md shadow-md p-3">
                        <h2 className="text-lg font-semibold">{t("Appointment Information")}</h2>
                        <div>
                            <Label>{t("Appointment Type")}</Label>
                            <Input
                                value={data.appointment || data.appointment_type || ""}
                                type="text"
                                onChange={(e) => handleChange("appointment", e.target.value)}
                            />
                        </div>

                        {/* Application Date && Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t("Appointment Date")}</Label>
                                <Input
                                    type="datetime-local"
                                    value={data.applicationDate || data.appointment_date || ""}
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

                        {/* Appointment Status */}
                        <div>
                            <Label>{t("Appointment Status")}</Label>
                            <Select
                                value={data.appointment_status || "Pending"}
                                onValueChange={(value) => handleChange("appointment_status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case "Insurance":
                return (
                    <div className="space-y-2 border rounded-md shadow-md p-3">
                        <h2 className="text-lg font-semibold">{t("Insurance Information")}</h2>
                        <div>
                            <Label>{t("Insurance Type")}</Label>
                            <Input
                                value={data.insurance || data.insurance_type || ""}
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

                        {/* Start Date && End Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t("Start Date")}</Label>
                                <Input
                                    type="date"
                                    value={data.startDate || data.start_date || ""}
                                    onChange={(e) => handleChange("startDate", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>{t("End Date")}</Label>
                                <Input
                                    type="date"
                                    value={data.endDate || data.end_date || ""}
                                    onChange={(e) => handleChange("endDate", e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>{t("Insured Persons")}</Label>
                            <Input
                                type="text"
                                value={data.insuredPersons || data.insured_persons || ""}
                                onChange={(e) => handleChange("insuredPersons", e.target.value)}
                            />
                        </div>

                        {/* Insurance Status */}
                        <div>
                            <Label>{t("Insurance Status")}</Label>
                            <Select
                                value={data.insurance_status || "Active"}
                                onValueChange={(value) => handleChange("insurance_status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Expired">Expired</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case "Tickets":
                return (
                    <div className="space-y-2 border rounded-md shadow-md p-3">
                        <h2 className="text-lg font-semibold">{t("Entertainment Tickets Information")}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t("Event Name")}</Label>
                                <Input
                                    value={data.event || data.event_name || ""}
                                    type="text"
                                    onChange={(e) => handleChange("event", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>{t("Event Date")}</Label>
                                <Input
                                    type="date"
                                    value={data.eventDate || data.event_date || ""}
                                    onChange={(e) => handleChange("eventDate", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Seat Category && Quantity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t("Seat Category")}</Label>
                                <Input
                                    value={data.seatcategory || data.seat_category || ""}
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

                        {/* Ticket Count */}
                        <div>
                            <Label>{t("Ticket Count")}</Label>
                            <Input
                                type="number"
                                value={data.ticketCount || data.tickets_count || ""}
                                onChange={(e) => handleChange("ticketCount", e.target.value)}
                            />
                        </div>

                        {/* Supplier Name */}
                        <div>
                            <Label>{t("Supplier Name")}</Label>
                            <Input
                                type="text"
                                value={data.supplierName || ""}
                                onChange={(e) => handleChange("supplierName", e.target.value)}
                            />
                        </div>

                        {/* Ticket Status */}
                        <div>
                            <Label>{t("Ticket Status")}</Label>
                            <Select
                                value={data.ticket_status || "Pending"}
                                onValueChange={(value) => handleChange("ticket_status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case "Transportation":
                return (
                    <div className="space-y-2 border rounded-md shadow-md p-3">
                        <h2 className="text-lg font-semibold">{t("Transportation Information")}</h2>

                        {/* Transportation Type */}
                        <div>
                            <Label>{t("Transportation Type")}</Label>
                            <Select
                                value={data.type || data.transport_type || "Car"}
                                onValueChange={(value) => handleChange("type", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Car">Car</SelectItem>
                                    <SelectItem value="Bus">Bus</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t("Pickup Location")}</Label>
                                <Input
                                    value={data.pickupLocation || data.pickup_location || ""}
                                    type="text"
                                    onChange={(e) => handleChange("pickupLocation", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>{t("Dropoff Location")}</Label>
                                <Input
                                    type="text"
                                    value={data.dropoffLocation || data.dropoff_location || ""}
                                    onChange={(e) => handleChange("dropoffLocation", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Route From && Route To */}
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

                        {/* Transportation Date && Passenger Count */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    value={data.passengerCount || data.passenger_count || ""}
                                    onChange={(e) => handleChange("passengerCount", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Supplier Name */}
                        <div>
                            <Label>{t("Supplier Name")}</Label>
                            <Input
                                type="text"
                                value={data.supplierName || ""}
                                onChange={(e) => handleChange("supplierName", e.target.value)}
                            />
                        </div>

                        {/* Transportation Status */}
                        <div>
                            <Label>{t("Transportation Status")}</Label>
                            <Select
                                value={data.transport_status || "Pending"}
                                onValueChange={(value) => handleChange("transport_status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-8">
                        <p className="text-gray-500 italic">{t("selectBookingType")}</p>
                    </div>
                );
        }
    };

    return (
        <div className='flex items-center justify-center z-50 '>
            <div className="space-y-2 p-2 h-[600px] scrollbar-thin scrollbar-thumb-gray-400 max-h-[60vh] overflow-y-auto scrollbar-track-gray-200">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                        <Label>{t("customerName")}</Label>
                        <Input
                            value={data.customer?.name || ""}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>{t("phoneNumber")}</Label>
                        <Input
                            value={data.customer?.phone || ""}
                            onChange={(e) => handleChange("phoneNumber", e.target.value)}
                        />
                    </div>
                </div>

                {/* Booking Type Selector (for switching forms) */}
                <div>
                    <Label>{t("Booking Type")}</Label>
                    <Select
                        value={data.bookingType}
                        onValueChange={(value) => handleChange("bookingType", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Booking Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Hotel">Hotel</SelectItem>
                            <SelectItem value="Flight">Flight</SelectItem>
                            <SelectItem value="Cruise">Cruise</SelectItem>
                            <SelectItem value="Visa">Visa</SelectItem>
                            <SelectItem value="Appointment">Appointment</SelectItem>
                            <SelectItem value="Insurance">Insurance</SelectItem>
                            <SelectItem value="Tickets">Tickets</SelectItem>
                            <SelectItem value="Transportation">Transportation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Dynamic Forms Based on Booking Type */}
                <div className="space-y-6">
                    {renderBookingFormEdit()}
                </div>
                <hr className='border-gray-200 my-8' />

                {/* Price Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <Label>{t("Sell Price")}</Label>
                        <Input
                            type="number"
                            value={data.sell_price || ""}
                            onChange={(e) =>
                                handleChange(
                                    "sell_price",
                                    e.target.value,
                                    calculateNetProfit(
                                        e.target.value,
                                        data.fees,
                                        data.cost
                                    )
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label>{t("Payment Fees")}</Label>
                        <Input
                            type="number"
                            value={data.fees || ""}
                            onChange={(e) =>
                                handleChange(
                                    "fees",
                                    e.target.value,
                                    calculateNetProfit(
                                        data.sell_price,
                                        e.target.value,
                                        data.cost
                                    )
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label>{t("Cost")}</Label>
                        <Input
                            type="number"
                            value={data.cost || ""}
                            onChange={(e) =>
                                handleChange(
                                    "cost",
                                    e.target.value,
                                    calculateNetProfit(
                                        data.sell_price,
                                        data.fees,
                                        e.target.value
                                    )
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label>{t("Net Profit")}</Label>
                        <Input
                            type="number"
                            value={
                                calculateNetProfit(
                                    data.sell_price,
                                    data.fees,
                                    data.cost
                                ) || 0
                            }
                            readOnly
                        />
                    </div>
                </div>

                {/* Booking Status */}
                <div>
                    <Label>{t("Booking Status")}</Label>
                    <Select
                        value={data.status || "Hold"}
                        onValueChange={(value) => handleChange("status", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Issued">{t("bookingStatus.issued")}</SelectItem>
                            <SelectItem value="Hold">{t("bookingStatus.hold")}</SelectItem>
                            <SelectItem value="Cancelled">{t("bookingStatus.cancelled")}</SelectItem>
                        </SelectContent>
                    </Select>
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

                {/* Save/Update Button */}
                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={closeModal}>
                        {t("Cancel")}
                    </Button>
                    <Button onClick={handleUpdate}>
                        {t("Update Booking")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditBooking;