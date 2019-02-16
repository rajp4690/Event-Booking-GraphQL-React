const DataLoader = require('dataloader');

const Event = require('./../../models/event');
const User = require('./../../models/user');
const { dateToString } = require('./../../helpers/date');

const eventLoader = new DataLoader((eventIds) => {
    return events(eventIds);
});

const userLoader = new DataLoader((userIds) => {
    return User.find({_id: {$in: userIds}});
});

const events = async (eventIds) => {
    try {
        const eventList = await Event.find({_id: {$in: eventIds}});
        return eventList.map((event) => {
            return populatedEvent(event);
        });
    } catch (err) {
        throw err;
    }
};

const singleEvent = async (eventId) => {
    try {
        const event = await eventLoader.load(eventId.toString());
        return event;
    } catch (err) {
        throw err;
    }
}

const user = async (userId) => {
    try {
        const result = await userLoader.load(userId.toString());
        return { ...result._doc, createdEvents: () => eventLoader.loadMany(result.createdEvents), password: null};
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