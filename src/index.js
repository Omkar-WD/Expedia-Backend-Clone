require('dotenv').config({ path: '../.env' });
// require("dotenv").config();
const cors = require('cors');

const express = require('express');
const app = express();
const connect = require('./config/db');

// Routes
const authController = require('./controllers/auth.controller');
const userController = require('./controllers/user.controller');
const favouriteController = require('./controllers/favourite.controller');
const hotelController = require('./controllers/hotel.controller');
const paymentController = require('./controllers/razorPay.controller');

app.use(express.json());
app.use(cors());

app.use('/auth', authController);
app.use('/hotel', hotelController);
app.use('/favourite', favouriteController);
app.use('/user', userController);
app.use('/payment', paymentController);

const PORT = process.env.PORT;
// Db Connection
app.listen(PORT, async () => {
  try {
    await connect();
    console.log(`listning on port ${PORT}`);
  } catch (error) {
    console.log(error.message);
  }
});
