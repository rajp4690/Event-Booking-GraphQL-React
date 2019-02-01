const Event = require('./../../models/event');
const User = require('./../../models/user');
const { populatedEvent } = require('./merge');

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
    createEvent: async (args, req) => {
        if(!req.isAuth) {
            throw new Error('Unauthenticated!');
        }
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: req.userId
        });
        try {
            const userData = await User.findById(req.userId);
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
    }
};