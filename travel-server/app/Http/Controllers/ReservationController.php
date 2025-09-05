<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Cruise;
use App\Models\Customer;
use App\Models\Flight;
use App\Models\Hotel;
use App\Models\Insurance;
use App\Models\Reservation;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\UpdateReservationRequest;
use App\Models\Ticket;
use App\Models\Transportation;
use App\Models\Visa;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reservations = Reservation::with('customer', 'reservable')->get()->each(function ($reservation) {
            $reservation->reservable_type = str_replace('App\\Models\\', '', $reservation->reservable_type);
        });
        return response()->json($reservations, 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // return $request;
        $request->validate([
            'name' => 'required|string|max:255',
            'phoneNumber' => 'required|string|max:20',
            'type' => 'required|string|max:50|in:Flight,Hotel,Cruise,Transportation,Visa,Insurance,Tickets,Appointment',
        ]);
        $customer = Customer::Create(
            [
                'name' => $request->name,
                'phone' => $request->phoneNumber,
            ]
        );
        $type = $request->type;
        switch ($type) {
            case 'Flight':
                $request->validate([
                    'flightnumber' => 'required|string|max:50',
                    'departureDate' => 'required|date',
                    'arrivalDate' => 'required|date',
                    'from' => 'required|string|max:50',
                    'to' => 'required|string|max:50',
                    'airline' => 'required|string|max:50',
                    'status' => 'string|max:50|in:Confimed,Pending,Cancelled',
                    'notes' => 'required|string',
                    'passangerInfo' => 'required|string',
                ]);
                $flight = new \App\Models\Flight();
                $flight->flight_number = $request->flightnumber;
                $flight->departure_date = $request->departureDate;
                $flight->arrival_date = $request->arrivalDate;
                $flight->from_airport = $request->from;
                $flight->to_airport = $request->to;
                $flight->airline = $request->airline;
                // $flight->status = $request->status;
                $flight->status = 'Pending';
                $flight->notes = $request->notes;
                $flight->passangerInfo = $request->passangerInfo;
                $flight->save();
                $reservable = $flight;
                break;
            case 'Hotel':
                $request->validate([
                    'hotelName' => 'required|string|max:255',
                    'BookingNumber' => 'required|string|max:50',
                    'check_in_date' => 'required|date',
                    'check_out_date' => 'required|date|after:check_in_date',
                    'NumberOfGeust' => 'required|integer|min:1',
                    'NumberOfRoom' => 'required|integer|min:1',
                    'roomType' => 'required|string|max:50',
                    // 'status' => 'string|in:Confirmed,Pending,Cancelled',
                    'notes' => 'nullable|string',
                ]);
                $hotel = new \App\Models\Hotel();
                $hotel->name = $request->hotelName;
                $hotel->booking_number = $request->BookingNumber;
                $hotel->check_in_date = $request->check_in_date;
                $hotel->check_out_date = $request->check_out_date;
                $hotel->number_of_guests = $request->NumberOfGeust;
                $hotel->number_of_rooms = $request->NumberOfRoom;
                $hotel->room_type = $request->roomType;
                // $hotel->status = $request->status ?? 'Pending';
                $hotel->notes = $request->notes;
                $hotel->save();
                $reservable = $hotel;
                break;
            case 'Cruise':
                $request->validate([
                    'cruise' => 'required|string|max:255',
                    'ship' => 'required|string|max:255',
                    'cabin' => 'required|string|max:50',
                    'departureDate' => 'required|date',
                    'returnDate' => 'required|date',
                    'departureport' => 'required|string|max:255',
                    'returnPort' => 'required|string|max:255',
                    'cruiseLine' => 'required|string|max:255',
                    'status' => 'string|max:50|in:Confirmed,Pending,Cancelled',
                    'notes' => 'nullable|string',
                ]);
                $cruise = new \App\Models\Cruise();
                $cruise->cruise_name = $request->cruise;
                $cruise->ship_name = $request->ship;
                $cruise->cabin_type = $request->cabin;
                $cruise->departure_date = $request->departureDate;
                $cruise->arrival_date = $request->returnDate;
                $cruise->departure_port = $request->departureport;
                $cruise->arrival_port = $request->returnPort;
                $cruise->cruise_line = $request->cruiseLine;
                $cruise->status = $request->status ?? 'Pending';
                $cruise->notes = $request->notes;
                $cruise->save();
                $reservable = $cruise;
                break;
            case 'Transportation':
                $request->validate([
                    'type' => 'required|string|max:50',
                    'transportationDate' => 'required|date',
                    'pickupLocation' => 'required|string|max:255',
                    'dropoffLocation' => 'required|string|max:255',
                    'routeTo' => 'required|string|max:255',   // ← هنا أضفت التحقق من routeTo
                    'routeFrom' => 'required|string|max:255', // ← هنا أضفت التحقق من routeFrom
                    'passengerCount' => 'required|integer|min:1',
                    'status' => 'string|max:50|in:Confirmed,Pending,Cancelled',
                    'notes' => 'nullable|string',
                ]);

                $transport = new \App\Models\Transportation();
                $transport->transport_type = $request->type;
                $transport->transportationDate = $request->transportationDate;
                $transport->pickup_location = $request->pickupLocation;
                $transport->dropoff_location = $request->dropoffLocation;
                $transport->routeTo = $request->routeTo;       // ← هنا أضفت routeTo
                $transport->routeFrom = $request->routeFrom; // ← هنا أضفت routeFrom
                $transport->passenger_count = $request->passengerCount;
                $transport->status = $request->status ?? 'Pending';
                $transport->notes = $request->notes;
                $transport->save();
                $reservable = $transport;
                break;
            case 'Visa':
                $request->validate([
                    'country' => 'required|string|max:255',
                    'visa' => 'required|string|max:50',
                    'applicationDate' => 'required|date',
                    'applicationDetials' => 'required|string',
                    'duration' => 'required|integer|min:1',
                    'status' => 'sometimes|string|max:50|in:Approved,Pending,Rejected',
                    'notes' => 'required|string',
                ]);

                $visa = new \App\Models\Visa();
                $visa->country = $request->country;
                $visa->visa_type = $request->visa;
                $visa->application_date = $request->applicationDate;
                $visa->duration = $request->duration;
                $visa->status = $request->status ?? 'Pending';
                $visa->notes = $request->notes;
                $visa->applicationDetials = $request->applicationDetials;
                $visa->save();
                $reservable = $visa;
                break;
            case 'Insurance':
                $request->validate([
                    'insurance' => 'required|string|max:50',
                    'provider' => 'required|string|max:255',
                    'startDate' => 'required|date',
                    'endDate' => 'required|date|after_or_equal:start_date',
                    'insuredPersons' => 'required|string',
                    'status' => 'string|max:50|in:Active,Expired,Cancelled',
                    'notes' => 'nullable|string'
                ]);
                $insurance = new \App\Models\Insurance();
                $insurance->insurance_type = $request->insurance;
                $insurance->provider = $request->provider;
                $insurance->start_date = $request->startDate;
                $insurance->end_date = $request->endDate;
                $insurance->insured_persons = $request->insuredPersons;
                $insurance->status = $request->status ?? 'Active';
                $insurance->notes = $request->notes;
                $insurance->save();
                $reservable = $insurance;
                break;
            case 'Tickets':
                $request->validate([
                    'event' => 'required|string|max:255',
                    'eventDate' => 'required|date',
                    'status' => 'string|max:50|in:Confirmed,Pending,Cancelled',
                    'ticketCount' => 'required|integer|min:1',
                    'seatcategory' => 'required|string|max:50',
                    'notes' => 'nullable|string',
                    'quantity' => 'required|integer|min:1',
                ]);
                $tickets = new \App\Models\Ticket();
                $tickets->event_name = $request->event;
                $tickets->event_date = $request->eventDate;
                // $tickets->status = $request->status;
                $tickets->status = 'Pending';
                $tickets->tickets_count = $request->ticketCount;
                $tickets->quantity = $request->quantity;
                $tickets->seat_category = $request->seatcategory;
                $tickets->notes = $request->notes;
                $tickets->save();
                $reservable = $tickets;
                break;
            case 'Appointment':
                $request->validate([
                    'appointment' => 'required|string|max:50',
                    'applicationDate' => 'required|date',
                    'status' => 'string|max:50|in:Completed,Scheduled,Cancelled',
                    'location' => 'required|string|max:255',
                    'notes' => 'nullable|string',
                ]);
                $appointment = new \App\Models\Appointment();
                $appointment->appointment_type = $request->appointment;
                $appointment->appointment_date = $request->applicationDate;
                $appointment->status = $request->status ?? 'Scheduled';
                $appointment->location = $request->location;
                $appointment->notes = $request->notes;
                $appointment->save();
                $reservable = $appointment;
                break;
            default:
                return response()->json(['error' => 'Invalid type'], 400);
        }

        if (in_array($type, ['Flight', 'Hotel', 'Cruise', 'Tickets', 'Transportation'])) {
            $request->validate([
                'supplierName' => 'required|string|max:255',
                'payment_status' => 'sometimes|string|in:Paid,Unpaid,Partial',
            ]);
            $supplier = new \App\Models\Supplier();
            $supplier->name = $request->supplierName;
            $supplier->phone = $request->SupplierPhoneNumber ?? '012000000012';
            $supplier->payment_status = $request->payment_status ?? 'Unpaid';
            $supplier->save();
        }

        $request->validate([
            // 'reservable_type' => 'required|string|max:50',
            'status' => 'string|in:Hold,Issued,Cancelled',
            'notes' => 'nullable|string',
            'details.sell_price' => 'required|numeric',
            'details.cost' => 'required|numeric',
            'details.fees' => 'nullable|numeric',
            'net_profit' => 'nullable|numeric',
        ]);
        $reservation = new Reservation();
        $reservation->user_id = auth()->id(); // Assuming you have authentication set up
        $reservation->customer_id = $customer->id;
        $reservation->supplier_id = $supplier->id ?? null;
        $reservation->reservable_id = $reservable->id;
        $reservation->reservable_type = get_class($reservable);
        // $reservation->status = $request->status;
        $reservation->status = 'Hold';
        $reservation->sell_price = $request->details['sell_price'];
        $reservation->cost = $request->details['cost'];
        $reservation->fees = $request->details['fees'] ?? 0;
        $reservation->net_profit = $request->net_profit ?? ($reservation->sell_price - $reservation->cost - $reservation->fees);
        $reservation->notes = $request->notes;
        $reservation->save();

        $reservation = $reservation->with('customer', 'reservable')->where('id', $reservation->id)->first();
        if ($reservation) {
            return response()->json(['message' => 'Reservation created successfully', 'reservation' => $reservation], 201);
        } else {
            return response()->json(['error' => 'Failed to create reservation'], 500);
        }

    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $reservation = Reservation::findOrFail($id);

        $reservation->with('customer', 'reservable');
        if (!$reservation) {
            return response()->json(['message' => 'Reservation not found'], 404);
        }
        return response()->json($reservation, 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Reservation $reservation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);

        // Update customer (same as store)
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phoneNumber' => 'sometimes|string|max:20',
            'type' => 'sometimes|string|max:50|in:Flight,Hotel,Cruise,Transportation,Visa,Insurance,Tickets,Appointment',

        ]);
        $reservation->customer->update([
            'name' => $request->name ?? $reservation->customer->name,
            'phone' => $request->phoneNumber ?? $reservation->customer->phone,
        ]);

        // Determine type from request or existing

        $reservable_type = str_replace('App\\Models\\', '', $reservation->reservable_type);
        $reservable_id = $reservation->reservable->id;
        $type = $request->type ?? $reservable_type;
        // return $type;
        switch ($type) {
            case 'Flight':
                $request->validate([
                    'flightnumber' => 'sometimes|string|max:50',
                    'departureDate' => 'sometimes|date',
                    'arrivalDate' => 'sometimes|date',
                    'from' => 'sometimes|string|max:50',
                    'to' => 'sometimes|string|max:50',
                    'airline' => 'sometimes|string|max:50',
                    'notes' => 'sometimes|string',
                    'passangerInfo' => 'sometimes|string',
                ]);

                $flight = Flight::find($reservable_id);
                $flight->flight_number = $request->flightnumber ?? $flight->flight_number;
                $flight->departure_date = $request->departureDate ?? $flight->departure_date;
                $flight->arrival_date = $request->arrivalDate ?? $flight->arrival_date;
                $flight->from_airport = $request->from ?? $flight->from_airport;
                $flight->to_airport = $request->to ?? $flight->to_airport;
                $flight->airline = $request->airline ?? $flight->airline;
                $flight->notes = $request->notes ?? $flight->notes;
                $flight->passangerInfo = $request->passangerInfo ?? $flight->passangerInfo;
                $flight->save();
                break;

            case 'Hotel':
                $request->validate([
                    'hotelName' => 'sometimes|string|max:255',
                    'BookingNumber' => 'sometimes|string|max:50',
                    'check_in_date' => 'sometimes|date',
                    'check_out_date' => 'sometimes|date|after:check_in_date',
                    'NumberOfGeust' => 'sometimes|integer|min:1',
                    'NumberOfRoom' => 'sometimes|integer|min:1',
                    'roomType' => 'sometimes|string|max:50',
                    'notes' => 'nullable|string',
                ]);
                $hotel = Hotel::find($reservable_id);
                $hotel->name = $request->hotelName ?? $hotel->name;
                $hotel->booking_number = $request->BookingNumber ?? $hotel->booking_number;
                $hotel->check_in_date = $request->check_in_date ?? $hotel->check_in_date;
                $hotel->check_out_date = $request->check_out_date ?? $hotel->check_out_date;
                $hotel->number_of_guests = $request->NumberOfGeust ?? $hotel->number_of_guests;
                $hotel->number_of_rooms = $request->NumberOfRoom ?? $hotel->number_of_rooms;
                $hotel->room_type = $request->roomType ?? $hotel->room_type;
                $hotel->notes = $request->notes ?? $hotel->notes;
                $hotel->save();
                break;

            case 'Cruise':
                $request->validate([
                    'cruise' => 'sometimes|string|max:255',
                    'ship' => 'sometimes|string|max:255',
                    'cabin' => 'sometimes|string|max:50',
                    'departureDate' => 'sometimes|date',
                    'returnDate' => 'sometimes|date',
                    'departureport' => 'sometimes|string|max:255',
                    'returnPort' => 'sometimes|string|max:255',
                    'cruiseLine' => 'sometimes|string|max:255',
                    'notes' => 'nullable|string',
                ]);
                $cruise = Cruise::find($reservable_id);
                $cruise->cruise_name = $request->cruise ?? $cruise->cruise_name;
                $cruise->ship_name = $request->ship ?? $cruise->ship_name;
                $cruise->cabin_type = $request->cabin ?? $cruise->cabin_type;
                $cruise->departure_date = $request->departureDate ?? $cruise->departure_date;
                $cruise->arrival_date = $request->returnDate ?? $cruise->arrival_date;
                $cruise->departure_port = $request->departureport ?? $cruise->departure_port;
                $cruise->arrival_port = $request->returnPort ?? $cruise->arrival_port;
                $cruise->cruise_line = $request->cruiseLine ?? $cruise->cruise_line;
                $cruise->notes = $request->notes ?? $cruise->notes;
                $cruise->save();
                break;

            case 'Transportation':
                $request->validate([
                    'type' => 'sometimes|string|max:50',
                    'transportationDate' => 'sometimes|date',
                    'pickupLocation' => 'sometimes|string|max:255',
                    'dropoffLocation' => 'sometimes|string|max:255',
                    'routeTo' => 'sometimes|string|max:255',
                    'routeFrom' => 'sometimes|string|max:255',
                    'passengerCount' => 'sometimes|integer|min:1',
                    'notes' => 'nullable|string',

                ]);
                $transport = Transportation::find($reservable_id);
                $transport->transport_type = $request->type ?? $transport->transport_type;
                $transport->transportationDate = $request->transportationDate ?? $transport->transportationDate;
                $transport->pickup_location = $request->pickupLocation ?? $transport->pickup_location;
                $transport->dropoff_location = $request->dropoffLocation ?? $transport->dropoff_location;
                $transport->routeTo = $request->routeTo ?? $transport->routeTo;
                $transport->routeFrom = $request->routeFrom ?? $transport->routeFrom;
                $transport->passenger_count = $request->passengerCount ?? $transport->passenger_count;
                $transport->notes = $request->notes ?? $transport->notes;
                $transport->save();
                break;

            case 'Visa':
                $request->validate([
                    'country' => 'sometimes|string|max:255',
                    'visa' => 'sometimes|string|max:50',
                    'applicationDate' => 'sometimes|date',
                    'duration' => 'sometimes|integer|min:1',
                    'notes' => 'sometimes|string',
                    'applicationDetials' => 'sometimes|string',
                ]);
                $visa = Visa::find($reservable_id);
                $visa->country = $request->country ?? $visa->country;
                $visa->visa_type = $request->visa ?? $visa->visa_type;
                $visa->application_date = $request->applicationDate ?? $visa->application_date;
                $visa->duration = $request->duration ?? $visa->duration;
                $visa->notes = $request->notes ?? $visa->notes;
                $visa->notes = $request->applicationDetials ?? $visa->applicationDetials;
                $visa->save();
                break;

            case 'Insurance':
                $request->validate([
                    'insurance' => 'sometimes|string|max:50',
                    'provider' => 'sometimes|string|max:255',
                    'startDate' => 'sometimes|date',
                    'endDate' => 'sometimes|date|after_or_equal:startDate',
                    'insuredPersons' => 'sometimes|string',
                    'notes' => 'nullable|string',
                ]);
                $insurance = Insurance::find($reservable_id);
                $insurance->insurance_type = $request->insurance ?? $insurance->insurance_type;
                $insurance->provider = $request->provider ?? $insurance->provider;
                $insurance->start_date = $request->startDate ?? $insurance->start_date;
                $insurance->end_date = $request->endDate ?? $insurance->end_date;
                $insurance->insured_persons = $request->insuredPersons ?? $insurance->insured_persons;
                $insurance->notes = $request->notes ?? $insurance->notes;
                $insurance->save();
                break;

            case 'Ticket':
                $request->validate([
                    'event' => 'sometimes|string|max:255',
                    'eventDate' => 'sometimes|date',
                    'status' => 'string|max:50|in:Confirmed,Pending,Cancelled',
                    'ticketCount' => 'sometimes|integer|min:1',
                    'quantity' => 'sometimes|integer|min:1',
                    'seatcategory' => 'sometimes|string|max:50',
                    'notes' => 'nullable|string',
                ]);
                $ticket = Ticket::find($reservable_id);
                $ticket->event_name = $request->event ?? $ticket->event_name;
                $ticket->event_date = $request->eventDate ?? $ticket->event_date;
                $ticket->tickets_count = $request->ticketCount ?? $ticket->tickets_count;
                $ticket->quantity = $request->quantity ?? $ticket->quantity;
                $ticket->seat_category = $request->seatcategory ?? $ticket->seat_category;
                $ticket->notes = $request->notes ?? $ticket->notes;
                $ticket->save();
                break;

            case 'Appointment':
                $request->validate([
                    'appointment' => 'sometimes|string|max:50',
                    'applicationDate' => 'sometimes|date',
                    'location' => 'sometimes|string|max:255',
                    'notes' => 'nullable|string',
                ]);
                $appointment = Appointment::find($reservable_id);
                $appointment->appointment_type = $request->appointment ?? $appointment->appointment_type;
                $appointment->appointment_date = $request->applicationDate ?? $appointment->appointment_date;
                $appointment->location = $request->location ?? $appointment->location;
                $appointment->notes = $request->notes ?? $appointment->notes;
                $appointment->save();
                break;

            default:
                return response()->json(['error' => 'Invalid type'], 400);
        }

        // Supplier update
        if (in_array($type, ['Flight', 'Hotel', 'Cruise', 'Ticket', 'Transportation'])) {
            $request->validate([
                'supplierName' => 'sometimes|string|max:255',
                'phoneNumber' => 'sometimes|string|max:20',
                'payment_status' => 'sometimes|string|in:Paid,Unpaid,Partial',
            ]);
            $supplier = \App\Models\Supplier::find($reservation->supplier_id)->first();
            if ($supplier) {
                $supplier->name = $request->supplierName ?? $supplier->name;
                $supplier->phone = $request->phoneNumber ?? $supplier->phone;
                $supplier->payment_status = $request->payment_status ?? $supplier->payment_status;
                $supplier->save();
            }
        }

        // Update reservation values
        $request->validate([
            'details.sell_price' => 'sometimes|numeric',
            'details.cost' => 'sometimes|numeric',
            'details.fees' => 'nullable|numeric',
            'status' => 'string|in:Hold,Issued,Cancelled',
            'net_profit' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);
        $reservation->update([
            'sell_price' => $request->details['sell_price'] ?? $reservation->sell_price,
            'cost' => $request->details['cost'] ?? $reservation->cost,
            'fees' => $request->details['fees'] ?? $reservation->fees,
            'net_profit' => $request->net_profit ?? (
                ($request->details['sell_price'] ?? $reservation->sell_price) -
                ($request->details['cost'] ?? $reservation->cost) -
                ($request->details['fees'] ?? $reservation->fees)
            ),
            'status' => $request->status ?? $reservation->status,
            'notes' => $request->notes ?? $reservation->notes,
        ]);

        $updatedReservation = Reservation::with('customer', 'reservable')->find($reservation->id);
        return response()->json(['message' => 'Reservation updated successfully', 'reservation' => $updatedReservation], 200);
    }


    public function update_status(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);
        // return $request;
        $request->validate([
            'status' => 'string|in:Hold,Issued,Cancelled',
        ]);
        $reservation->update([
            'status' => $request->status ?? $reservation->status,
        ]);

        if ($reservation->status === $request->status) {
            return response()->json(['message' => 'Reservation updated successfully', 'reservation' => $reservation], 200);
        } else {
            return response()->json(['error' => 'Failed to update reservation'], 500);
        }

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $reservation = Reservation::findOrFail($id);

        $reservation->load('customer', 'reservable');

        // Delete the related reservable if it exists
        if ($reservation->reservable) {
            $reservation->reservable->delete();
        }

        // Delete the associated customer if needed (ensure this is intended, as a customer may have multiple reservations)
        if ($reservation->customer) {
            $reservation->customer->delete();
        }

        $deleted = $reservation->delete();
        if (!$deleted) {
            return response()->json(['error' => 'Failed to delete reservation'], 500);
        }
        return response()->json(['message' => 'Reservation soft deleted successfully'], 200);
    }
}
