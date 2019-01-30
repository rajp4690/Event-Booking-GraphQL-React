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

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
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
                return await Event.find();
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
                let user = await User.findById('5c51ff46fb495fc548c36666');
                if(!user) {
                    throw new Error('User not found');
                }
                user.createdEvents.push(event);
                await user.save();
                return result;
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