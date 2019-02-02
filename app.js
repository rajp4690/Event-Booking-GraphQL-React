const express = require('express');
const bodyparser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphiqlSchema = require('./graphql/schema/index');
const graphiqlResolvers = require('./graphql/resolvers/index');
const authentication = require('./middleware/authentication');

const app = express();

app.use(bodyparser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(authentication);

app.use('/graphql', graphqlHttp({
    schema: graphiqlSchema,
    rootValue: graphiqlResolvers,
    graphiql: true
}));

app.get('/', (req, res, next) => {
    res.send('Hello there!');
});

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-im6qg.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`).then(() => {
    app.listen(8000);
}).catch (err => {
    console.log(err); 
});