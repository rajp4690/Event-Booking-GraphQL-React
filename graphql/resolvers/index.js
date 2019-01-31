const bcrypt = require('bcryptjs');

const Event = require('./../../models/event');
const User = require('./../../models/user');
const Booking = require('./../../models/booking');

const events = async (eventIds) => {
    try {
        const eventList = await Event.find({ _id: { $in: eventIds } });
        return eventList.map((event) => {
            return { 
                ...event._doc, 
                creator: user.bind(this, event.creator),
                date: new Date(event.date).toISOString()
            };
        });
    } catch (err) {
        throw err;
    }
};

const singleEvent = async (eventId) => {
    try {
        const event = await Event.findById(eventId);
        return populatedEvent(event);
    } catch (err) {
        throw err;
    }
}

const user = async (userId) => {
    try {
        const result = await User.findById(userId);
        return { ...result._doc, createdEvents: events.bind(this, result.createdEvents), password: null};
    } catch (err) {
        throw err;
    }
};

const populatedEvent = (event) => {
    return {
        ...event._doc, 
        creator: user.bind(this, event.creator),
        date: new Date(event.date).toISOString()
    };
};

module.exports = {
    events: async () => {
        try {
            const eventList = await Event.find();
            return eventList.map((event) => {
                return populatedEvent(event);
            });
        } catch (err) {
            throw err;
        }
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map((booking) => {
                return {
                    ...booking._doc,
                    user: user.bind(this, booking.user),
                    event: singleEvent.bind(this, booking.event),
                    createdAt: new Date(booking.createdAt).toISOString(),
                    updatedAt: new Date(booking.updatedAt).toISOString()
                };
            });
        } catch (err) {
            throw err;
        }
    },
    createEvent: async (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5c533db9a28f72fd3ce63ab4'
        });
        try {
            const userData = await User.findById('5c533db9a28f72fd3ce63ab4');
            if(!userData) {
                throw new Error('User not found');
            }
            const result = await event.save();
            userData.createdEvents.push(event);
            await userData.save();
            return populatedEvent(result);
        } catch (err) {
            throw err;
        }
    },
    createUser: async (args) => {
        try {
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await user.save();
            return {...result._doc, password: null};
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
            return {
                ...booking._doc,
                user: user.bind(this, booking.user),
                event: singleEvent.bind(this, booking.event),
                createdAt: new Date(result.createdAt).toISOString(),
                updatedAt: new Date(result.updatedAt).toISOString()
            };
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