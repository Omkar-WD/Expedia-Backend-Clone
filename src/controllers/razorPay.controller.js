const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const shortid = require('shortid');
const crypto = require('crypto');
const Payment = require('../models/payment.model');

const razorpay = new Razorpay({
  key_id: 'rzp_test_LrUd2sYQ0QeGXG',
  key_secret: 'Mx1ejcaSeROoMp3l0wgHBiMt',
});

router.get('', async (req, res) => {
  try {
    const allPayment = await Payment.find()
      .populate('userId')
      .populate('hotelId')
      .lean()
      .exec();
    return res.send(allPayment);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// users payment
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userPayment = await Payment.find({ userId })
      .populate('userId')
      .populate('hotelId')
      .lean()
      .exec();

    res.send(userPayment);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

router.post('/pay', async (req, res) => {
  const { payment_capture, amount, currency } = req.body;

  console.log('getdata', req.body);

  let amt = typeof amount == 'string' ? amount.split(',').join('') : amount;
  console.log('req', amt);

  const options = {
    amount: amt * 100,
    currency,
    receipt: shortid.generate(),
    payment_capture,
  };
  try {
    const response = await razorpay.orders.create(options);
    res.send({
      id: response.id,
      currency: response.currency,
      amount: response.amount.toString(),
    });
  } catch (error) {
    console.log(error);
  }
});

router.post('/success', async (req, res) => {
  try {
    const { Orderdata, hotelData, userData, stayData, amount } = req.body;

    const { user } = userData;

    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = Orderdata;

    const shasum = crypto.createHmac('sha256', 'Mx1ejcaSeROoMp3l0wgHBiMt');
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpaySignature)
      return res.status(400).json({ msg: 'Transaction not legit!' });

    const d1 = stayData.checkin.split('-')[2];
    const d2 = stayData.checkout.split('-')[2];

    // let allData = {
    //   hotelId: hotelData._id,
    //   userId: user._id,
    //   rooms: stayData.room,
    //   night: d2 - d1 + 1,
    //   checkinDate: stayData.checkin,
    //   checkoutDate: stayData.checkout,
    //   transactionId: razorpayOrderId,
    //   amount: amount.slice(0, amount.length - 2),
    //   bookingDate: new Date().toISOString().slice(0, 10),
    // };

    const payment = await Payment.create({
      hotelId: hotelData._id,
      userId: user._id,
      rooms: stayData.room,
      night: d2 - d1 + 1,
      checkinDate: stayData.checkin,
      checkoutDate: stayData.checkout,
      transactionId: razorpayOrderId,
      amount: amount.slice(0, amount.length - 2),
      bookingDate: new Date().toISOString().slice(0, 10),
    });

    // console.log(payment);
    res.send('Payment Successfull');
  } catch (error) {
    console.log('payment error', error);
  }
});

module.exports = router;
