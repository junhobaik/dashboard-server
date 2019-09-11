import mongoose from 'mongoose';

require('dotenv').config();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

mongoose.connection.on('connected', () => {
  console.log('💡 Mongoose conected');
});

mongoose.connection.on('error', err => {
  console.log('❌ Mongoose error', err);
});

module.exports = mongoose;
