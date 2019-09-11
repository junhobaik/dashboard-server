import session from 'express-session';
import mongoose from './mongoose';

require('dotenv').config();

const MongoStore = require('connect-mongo')(session);

module.exports = session({
  secret: process.env.SESSION_SECRET,
  key: 'sid',
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 31 }, // 31일
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  proxy: true,
  resave: true,
  saveUninitialized: false
});
