const [loading, setLoading] = useState(false);
const [singleBooking, setSingleBooking] = useState(null);
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
                    <h2 className="text-xl font-semibold">{t("Hotel Information")}</h2>

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
                    <div>
                        <Label className="font-medium">{t("Room Type")}: {singleBooking.reservable?.room_type || 'N/A'}</Label>
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

                    {/* Booking Number */}
                    <div>
                        <Label className="font-medium">{t("Booking Number")}: {singleBooking.reservable?.booking_number || 'N/A'}</Label>
                    </div>

                    {/* Status */}
                    <div>
                        <Label className="font-medium">{t("Status")}: {singleBooking.status || 'N/A'}</Label>
                    </div>

                    {/* Cost && Sell Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <Label className="font-medium">{t("Cost")}: {singleBooking.cost || 'N/A'}</Label>
                        </div>
                        <div>
                            <Label className="font-medium">{t("Sell Price")}: {singleBooking.sell_price || 'N/A'}</Label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label className="font-medium">{t("Notes")}: {singleBooking.notes || singleBooking.reservable?.notes || 'N/A'}</Label>
                    </div>
                </div>
            );

        case "Flight":
            return (
                <div className="space-y-2 border rounded-md shadow-md p-3">
                    <h2 className="text-xl font-semibold">{t("Flight Information")}</h2>

                    {/* Flight Number */}
                    <div>
                        <Label className="font-medium">{t("Flight Number")}: {singleBooking.reservable?.flight_number || 'N/A'}</Label>
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
                            <Label className="font-medium">{t("From")}: {singleBooking.reservable?.from || 'N/A'}</Label>
                        </div>
                        <div>
                            <Label className="font-medium">{t("To")}: {singleBooking.reservable?.to || 'N/A'}</Label>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <Label className="font-medium">{t("Status")}: {singleBooking.status || 'N/A'}</Label>
                    </div>

                    {/* Cost && Sell Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <Label className="font-medium">{t("Cost")}: {singleBooking.cost || 'N/A'}</Label>
                        </div>
                        <div>
                            <Label className="font-medium">{t("Sell Price")}: {singleBooking.sell_price || 'N/A'}</Label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label className="font-medium">{t("Notes")}: {singleBooking.notes || 'N/A'}</Label>
                    </div>
                </div>
            );

        case "Cruise":
            return (
                <div className="space-y-2 border rounded-md shadow-md p-3">
                    <h2 className="text-xl font-semibold">{t("Cruise Information")}</h2>

                    {/* Cruise Name */}
                    <div>
                        <Label className="font-medium">{t("Cruise Name")}: {singleBooking.reservable?.name || 'N/A'}</Label>
                    </div>

                    {/* Departure Date && Return Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <Label className="font-medium">{t("Departure Date")}: {singleBooking.reservable?.departure_date || 'N/A'}</Label>
                        </div>
                        <div>
                            <Label className="font-medium">{t("Return Date")}: {singleBooking.reservable?.return_date || 'N/A'}</Label>
                        </div>
                    </div>

                    {/* Departure Port && Return Port */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <Label className="font-medium">{t("Departure Port")}: {singleBooking.reservable?.departure_port || 'N/A'}</Label>
                        </div>
                        <div>
                            <Label className="font-medium">{t("Return Port")}: {singleBooking.reservable?.return_port || 'N/A'}</Label>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <Label className="font-medium">{t("Status")}: {singleBooking.status || 'N/A'}</Label>
                    </div>

                    {/* Cost && Sell Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <Label className="font-medium">{t("Cost")}: {singleBooking.cost || 'N/A'}</Label>
                        </div>
                        <div>
                            <Label className="font-medium">{t("Sell Price")}: {singleBooking.sell_price || 'N/A'}</Label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label className="font-medium">{t("Notes")}: {singleBooking.notes || 'N/A'}</Label>
                    </div>
                </div>
            );

        case "Visa":
            return (
                <div className="space-y-2 border rounded-md shadow-md p-3">
                    <h2 className="text-xl font-semibold">{t("Visa Information")}</h2>

                    {/* Visa Type/Name */}
                    <div>
                        <Label className="font-medium">{t("Visa Type")}: {singleBooking.reservable?.visa_type || singleBooking.reservable?.name || 'N/A'}</Label>
                    </div>

                    {/* Application Date */}
                    <div>
                        <Label className="font-medium">{t("Application Date")}: {singleBooking.reservable?.application_date || 'N/A'}</Label>
                    </div>

                    {/* Status */}
                    <div>
                        <Label className="font-medium">{t("Status")}: {singleBooking.status || 'N/A'}</Label>
                    </div>

                    {/* Cost && Sell Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <Label className="font-medium">{t("Cost")}: {singleBooking.cost || 'N/A'}</Label>
                        </div>
                        <div>
                            <Label className="font-medium">{t("Sell Price")}: {singleBooking.sell_price || 'N/A'}</Label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label className="font-medium">{t("Notes")}: {singleBooking.notes || 'N/A'}</Label>
                    </div>
                </div>
            );

        case "Appointment":
            return (
                <div className="space-y-2 border rounded-md shadow-md p-3">
                    <h2 className="text-xl font-semibold">{t("Appointment Information")}</h2>

                    {/* Appointment Name */}
                    <div>
                        <Label className="font-medium">{t("Appointment Name")}: {singleBooking.reservable?.name || 'N/A'}</Label>
                    </div>

                    {/* Application Date && Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="font-medium">{t("Application Date")}: {singleBooking.reservable?.application_date || 'N/A'}</Label>
                        </div>
                        <div>
                            <Label className="font-medium">{t("Location")}: {singleBooking.reservable?.location || 'N/A'}</Label>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <Label className="font-medium">{t("Status")}: {singleBooking.status || 'N/A'}</Label>
                    </div>

                    {/* Cost && Sell Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <Label className="font-medium">{t("Cost")}: {singleBooking.cost || 'N/A'}</Label>
                        </div>
                        <div>
                            <Label className="font-medium">{t("Sell Price")}: {singleBooking.sell_price || 'N/A'}</Label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label className="font-medium">{t("Notes")}: {singleBooking.notes || 'N/A'}</Label>
                    </div>
                </div>
            );

        case "Insurance":
            return (
                <div className="space-y-2 border rounded-md shadow-md p-3">
                    <h2 className="text-xl font-semibold">{t("Insurance Information")}</h2>

                    {/* Insurance Name */}
                    <div>
                        <Label className="font-medium">{t("Insurance Name")}: {singleBooking.reservable?.name || 'N/A'}</Label>
                    </div>

                    {/* Provider */}
                    <div>
                        <Label className="font-medium">{t("Provider")}: {singleBooking.reservable?.provider || 'N/A'}</Label>
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

                    {/* Status */}
                    <div>
                        <Label className="font-medium">{t("Status")}: {singleBooking.status || 'N/A'}</Label>
                    </div>

                    {/* Cost && Sell Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <Label className="font-medium">{t("Cost")}: {singleBooking.cost || 'N/A'}</Label>
                        </div>
                        <div>
                            <Label className="font-medium">{t("Sell Price")}: {singleBooking.sell_price || 'N/A'}</Label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label className="font-medium">{t("Notes")}: {singleBooking.notes || 'N/A'}</Label>
                    </div>
                </div>
            );

        case "Tickets":
            return (
                <div className="space-y-2 border rounded-md shadow-md p-3">
                    <h2 className="text-xl font-semibold">{t("Entertainment Tickets Information")}</h2>

                    {/* Event Name */}
                    <div>
                        <Label className="font-medium">{t("Event Name")}: {singleBooking.reservable?.event_name || singleBooking.reservable?.name || 'N/A'}</Label>
                    </div>

                    {/* Event Date */}
                    <div>
                        <Label className="font-medium">{t("Event Date")}: {singleBooking.reservable?.event_date || 'N/A'}</Label>
                    </div>

                    {/* Ticket Count */}
                    <div>
                        <Label className="font-medium">{t("Ticket Count")}: {singleBooking.reservable?.ticket_count || 'N/A'}</Label>
                    </div>

                    {/* Status */}
                    <div>
                        <Label className="font-medium">{t("Status")}: {singleBooking.status || 'N/A'}</Label>
                    </div>

                    {/* Cost && Sell Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <Label className="font-medium">{t("Cost")}: {singleBooking.cost || 'N/A'}</Label>
                        </div>
                        <div>
                            <Label className="font-medium">{t("Sell Price")}: {singleBooking.sell_price || 'N/A'}</Label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label className="font-medium">{t("Notes")}: {singleBooking.notes || 'N/A'}</Label>
                    </div>
                </div>
            );

        case "Transportation":
            return (
                <div className="space-y-2 border rounded-md shadow-md p-3">
                    <h2 className="text-xl font-semibold">{t("Transportation Information")}</h2>

                    {/* Transportation Type */}
                    <div>
                        <Label className="font-medium">{t("Transportation Type")}: {singleBooking.reservable?.transportation_type || 'N/A'}</Label>
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

                    {/* Transportation Date && Passenger Count */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="font-medium">{t("Transportation Date")}: {singleBooking.reservable?.transportation_date || 'N/A'}</Label>
                        </div>
                        <div>
                            <Label className="font-medium">{t("Passenger Count")}: {singleBooking.reservable?.passenger_count || 'N/A'}</Label>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <Label className="font-medium">{t("Status")}: {singleBooking.status || 'N/A'}</Label>
                    </div>

                    {/* Cost && Sell Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <Label className="font-medium">{t("Cost")}: {singleBooking.cost || 'N/A'}</Label>
                        </div>
                        <div>
                            <Label className="font-medium">{t("Sell Price")}: {singleBooking.sell_price || 'N/A'}</Label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label className="font-medium">{t("Notes")}: {singleBooking.notes || 'N/A'}</Label>
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

if (modal.type === 'view') {

    return (
        <>
            <Dialog open={modal.isOpen} onOpenChange={onClose}>
                <DialogContent className="w-[800px] max-w-[90%] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>{t("View Reservation Details")}</DialogTitle>
                    </DialogHeader>

                    {/* Details Main Reservation */}
                    <div className='text-center text-3xl font-bold text-gradient'>
                        {t("Details Reservation")}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : singleBooking ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>{t("Customer Name")}: {singleBooking.customer.name || 'N/A'}</Label>
                                </div>
                                <div>
                                    <Label>{t("Customer Phone")}: {singleBooking.customer.phone || 'N/A'}</Label>
                                </div>
                                <div>
                                    <Label>{t("Booking ID")}: {singleBooking.id}</Label>
                                </div>
                                <div>
                                    <Label>{t("Status")}: {singleBooking.status}</Label>
                                </div>
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
export default ViewSingleBokkingView;