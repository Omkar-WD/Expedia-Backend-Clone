const { validationResult } = require('express-validator');
const Hotel = require('../models/hotel.model');

const express = require('express');
const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const query = {};
    // console.log(req.query);

    if (req.query.searchCity) {
      query.city = { $regex: req.query.searchCity, $options: 'i' };
      console.log(query);

      let hotel = await Hotel.find(query).lean().exec();

      if (hotel.length == 0) {
        return res.status(400).send('Hotel not found with this name');
      }

      return res.send(hotel);
    }

    if (req.query.search) {
      query.hotelName = { $regex: req.query.search, $options: 'i' };
    }

    let hotel = await Hotel.find(query).lean().exec();

    if (hotel.length == 0) {
      return res.status(400).send('Hotel not found with this name');
    }

    return res.send(hotel);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const query = {};
    console.log(req.query);

    if (req.query.search) {
      query.city = { $regex: req.query.searchCity, $options: 'i' };
    }

    let hotel = await Hotel.find(query).lean().exec();

    if (hotel.length == 0) {
      return res.status(400).send('City not found with this name');
    }

    return res.send(hotel);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

router.post('', async (req, res) => {
  try {
    // error handling
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: errors.array()[0].msg,
      });
    }

    let newHotel = await Hotel.findOne({ hotelName: req.body.hotelName })
      .lean()
      .exec();

    if (newHotel) {
      return res
        .status(400)
        .send({ message: 'Hotel already existed with this name' });
    }

    newHotel = await Hotel.create(req.body);

    res.send(newHotel);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

router.get('', async (req, res) => {
  try {
    // error handling
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: errors.array()[0].msg,
      });
    }
    let filter = { $and: [{}] };
    let order;

    if (req.query.order) {
      order = req.query.order == 'asc' ? 1 : -1;
    }
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';

    const priceFilter =
      req.query.min && req.query.max
        ? { offerPrice: { $gte: req.query.min, $lte: req.query.max } }
        : {};

    console.log(priceFilter);
    let hotels = await Hotel.find(priceFilter)
      .sort([[sortBy, order]])
      .lean()
      .exec();

    return res.send(hotels);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

router.get('/:hotelId', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    return res.send(hotel);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

module.exports = router;
