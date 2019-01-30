const { buildSchema } = require('graphql');
const express = require('express');
const bodyparser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyparser.json());

const events = async (eventIds) => {
    try {
        let eventList = await Event.find({ _id: { $in: eventIds } });
        return eventList.map((event) => {
            return { ...event._doc, creator: user.bind(this, event.creator)};
        });
    } catch (err) {
        throw err;
    }
};

const user = async (userId) => {
    try {
        let result = await User.findById(userId);
        return { ...result._doc, createdEvents: events.bind(this, result.createdEvents), password: null};
    } catch (err) {
        throw err;
    }
};

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type User {
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: async () => {
            try {
                let eventList = await Event.find();
                return eventList.map((event) => {
                    return {...event._doc, creator: user.bind(this, event.creator)};
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
                creator: '5c51ff46fb495fc548c36666'
            });
            try {
                const result = await event.save();
                let userData = await User.findById('5c51ff46fb495fc548c36666');
                if(!userData) {
                    throw new Error('User not found');
                }
                userData.createdEvents.push(event);
                await userData.save();
                return { ...result._doc, creator: user.bind(this, result.creator)};
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
    },
    graphiql: true
}));

app.get('/', (req, res, next) => {
    res.send('Hello there!');
});

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-im6qg.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`).then(() => {
    app.listen(3000);
}).catch (err => {
    console.log(err); 
});