const express = require('express');
const bodyparser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyparser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`

        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return ['All-night coding', 'Play rocket league', 'Cooking'];
        },
        createEvent: (args) => {
            const eventName = args.name;
            return eventName;
        }
    },
    graphiql: true
}));

app.get('/', (req, res, next) => {
    res.send('Hello there!');
});

app.listen(3000);