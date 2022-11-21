const mongoose = require('mongoose')
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', err => {
  console.log('Uncaught exception 💥 - Shutting down...');
  console.log(err.name, err.message);

  process.exit(1)
})

const app = require('./app');

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

// mongoose.connect(process.env.DATABASE_LOCAL, {
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(con => { console.log('DB connection successful!') })


const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Listening on port ${PORT}`);
});

process.on('unhandledRejection', err => {
  console.log('Unhandled rejection 💥 - Shutting down...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1)
  })
})
