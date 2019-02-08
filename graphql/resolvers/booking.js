const Booking = require('./../../models/booking');
const Event = require('./../../models/event');
const { populatedEvent, populatedBooking } = require('./merge');

module.exports = {
    bookings: async (args, req) => {
        if(!req.isAuth) {
            throw new Error('Unauthenticated!');
        }
        try {
            const bookings = await Booking.find({user: req.userId});
            return bookings.map((booking) => {
                return populatedBooking(booking);
            });
        } catch (err) {
            throw err;
        }
    },
    bookEvent: async (args, req) => {
        if(!req.isAuth) {
            throw new Error('Unauthenticated!');
        }
        try {
            const event = await Event.findById(args.eventId);
            if(!event) {
                throw new Error('Event not found');
            }
            const booking = new Booking({
                event: event,
                user: req.userId
            });
            const result = await booking.save();
            return populatedBooking(result);
        } catch (err) {
            throw err;
        }
    },
    cancelBooking: async (args, req) => {
        if(!req.isAuth) {
            throw new Error('Unauthenticated!');
        }
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