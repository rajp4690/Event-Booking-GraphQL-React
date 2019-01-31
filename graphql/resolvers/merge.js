const Event = require('./../../models/event');
const User = require('./../../models/user');
const { dateToString } = require('./../../helpers/date');

const events = async (eventIds) => {
    try {
        const eventList = await Event.find({ _id: { $in: eventIds } });
        return eventList.map((event) => {
            return populatedEvent(event);
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
        date: dateToString(event.date)
    };
};

const populatedBooking = (booking) => {
    return {
        ...booking._doc,
        user: user.bind(this, booking.user),
        event: singleEvent.bind(this, booking.event),
        createdAt: dateToString(booking.createdAt),
        updatedAt: dateToString(booking.updatedAt)
    };
};

exports.populatedEvent = populatedEvent;
exports.populatedBooking = populatedBooking;