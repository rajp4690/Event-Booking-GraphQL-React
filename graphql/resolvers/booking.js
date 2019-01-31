const Booking = require('./../../models/booking');
const Event = require('./../../models/event');
const { populatedEvent, populatedBooking } = require('./merge');

module.exports = {
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map((booking) => {
                return populatedBooking(booking);
            });
        } catch (err) {
            throw err;
        }
    },
    bookEvent: async (args) => {
        try {
            const event = await Event.findById(args.eventId);
            if(!event) {
                throw new Error('Event not found');
            }
            const booking = new Booking({
                event: event,
                user: '5c533db9a28f72fd3ce63ab4'
            });
            const result = await booking.save();
            return populatedBooking(result);
        } catch (err) {
            throw err;
        }
    },
    cancelBooking: async (args) => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            if (!booking) {
                throw new Error('Booking not found');
            }
            await Booking.findByIdAndDelete(args.bookingId);
            return populatedEvent(booking.event);
        } catch (err) {
            throw err;
        }
    }
};