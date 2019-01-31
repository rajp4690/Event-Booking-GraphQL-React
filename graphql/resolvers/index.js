const bcrypt = require('bcryptjs');

const Event = require('./../../models/event');
const User = require('./../../models/user');

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

const user = async (userId) => {
    try {
        const result = await User.findById(userId);
        return { ...result._doc, createdEvents: events.bind(this, result.createdEvents), password: null};
    } catch (err) {
        throw err;
    }
};

module.exports = {
    events: async () => {
        try {
            const eventList = await Event.find();
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
            const result = await event.save();
            let userData = await User.findById('5c533db9a28f72fd3ce63ab4');
            if(!userData) {
                throw new Error('User not found');
            }
            userData.createdEvents.push(event);
            await userData.save();
            return { 
                ...result._doc, 
                creator: user.bind(this, result.creator),
                date: new Date(event.date).toISOString()
            };
        } catch (err) {
            throw err;
        }
    },
    createUser: async (args) => {
        try {
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            let user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            user = await user.save();
            return {...user._doc, password: null};
        } catch (err) {
            throw err;
        }
    }
};