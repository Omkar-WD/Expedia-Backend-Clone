const User = require("../models/user.model");

const express = require("express");
const router = express.Router();

router.patch("/update", async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findByIdAndUpdate(
      req.body.userId,
      req.body.userData,
      {
        new: true,
      }
    )
      .lean()
      .exec();
    console.log(user);
    return res.send(user);
  } catch (error) {
    return res.status({ error: error.message });
  }
});

module.exports = router;
