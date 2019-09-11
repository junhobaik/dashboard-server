/* eslint-disable no-unused-vars */
import express from 'express';
import cookie from 'cookie-parser';
import bodyParser from 'body-parser';
import passport from 'passport';
import cors from 'cors';
import morgan from 'morgan';
import { ApolloServer } from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import { userModel, feedModel } from './models';

import passportInit from './lib/passport';
import session from './lib/session';

import api from './routes/api';
import auth from './routes/auth';

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(session);
app.use(cookie());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', api);
app.use('/auth', auth);

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  playground: {
    settings: {
      'request.credentials': 'include'
    }
  },
  context: ({ req }) => {
    const user = req.user || null;

    return { userModel, feedModel, user };
  }
});

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () => console.log(`🚀 Server ready at ${server.graphqlPath}`));
