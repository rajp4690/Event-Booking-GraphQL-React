const Event = require('./../../models/event');
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
    }
};