const Favourite = require('../models/favourite.model');
const express = require('express');
const router = express.Router();

//Get Fav List
router.get('', async (req, res) => {
  try {
    const favItems = await Favourite.find().populate('hotelId').lean().exec();

    return res.send(favItems);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

// Add to list
router.post('', async (req, res) => {
  try {
    const { userId, hotelId } = req.body;

    const user = await Favourite.findOne({ userId }).lean().exec();

    if (!user) {
      const fav = await Favourite.create(req.body);
      return res.status(201).send(fav);
    }

    let favItems = await Favourite.updateOne(
      { userId },
      { $push: { hotelId } }
    );

    return res.send(favItems);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

//update fav list
router.put('', async (req, res) => {
  try {
    const { userId, hotelId } = req.body;

    const user = await Favourite.findOne({ userId }).lean().exec();

    if (!user) {
      return res.status(201).send('Empty Favourite list');
    }

    let favItems = await Favourite.updateOne(
      { userId },
      { $pull: { hotelId } }
    );

    // if(favItems.hotelId <= 0){
    //   await Favourite.fin
    // }

    console.log('hotels', favItems._id, favItems.hotelId);
    return res.send(favItems);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

// user fav list
router.get('/userFavList', async (req, res) => {
  try {
    const { userId } = req.body;

    const favItems = await Favourite.findOne({ userId: req.body.userId })
      .populate('userId')
      .lean()
      .exec();
    console.log(favItems);

    return res.send(favItems);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

module.exports = router;
