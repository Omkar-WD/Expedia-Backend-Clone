const User = require("../models/user.model");

const express = require("express");
const router = express.Router();

router.patch("/update", async (req, res) => {
  try {
    console.log(req.auth);
    const user = await User.findByIdAndUpdate(req.body.userId, req.body, {
      new: true,
    })
      .lean()
      .exec();

    return res.send(user);
  } catch (error) {
    return res.status({ error: error.message });
  }
});

module.exports = router;
