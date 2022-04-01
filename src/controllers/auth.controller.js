const express = require("express");
const router = express.Router();
const { validationResult, Result, check } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const newToken = (user) => {
  return jwt.sign({ user }, `${process.env.JWT_SECRET}`);
};

var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: `${process.env.USER}`,
    pass: `${process.env.pass}`,
  },
});

//User Registration

router.post(
  "",
  [
    check("firstName", "Firstname should be atleast 3 characters").isLength({
      min: 3,
    }),
    check("lastName", "Lastname should be atleast 3 characters").isLength({
      min: 3,
    }),
    check("email", "Email is required").isEmail(),
  ],
  async (req, res) => {
    try {
      // error handling
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: errors.array()[0].msg,
        });
      }

      let user = await User.findOne({ email: req.body.email }).lean().exec();

      if (user) {
        return res.status(400).send({ message: "Email already exist" });
      }

      user = await User.create(req.body);

      const { _id, firstName, lastName, email } = user;

      const mailOptions = {
        from: `Team Expedia ${process.env.USER}`,
        to: `${email}`,
        subject: "New Account Created Successfully",
        text: `${firstName} Your Account Created Successfully!`,
      };

      const sendMailToAdmins = {
        from: `Team Expedia <${process.env.USER}>`,
        to: `${process.env.USER}`,
        subject: `${firstName} has registered with us`,
        text: `Please welcome ${firstName}`,
      };

      //For register user
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log(`Email sent to: ${email}`);
        }
      });

      transporter.sendMail(sendMailToAdmins, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log(`Email sent to: ${process.env.USER}`);
        }
      });

      res.send({ user: { _id, firstName, lastName, email } });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }
);

// User Login
router.post(
  "/login",
  [check("email", "Email is required").isEmail()],
  async (req, res) => {
    try {
      // error handling
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: errors.array()[0].msg,
        });
      }
      const user = await User.findOne({ email: req.body.email });

      // If user is not found then return error
      if (!user)
        return res
          .status(400)
          .send({ message: "Please try another email or password" });

      // if user is found then we will match the passwords
      const match = user.checkPassword(req.body.password);

      if (!match)
        return res
          .status(400)
          .send({ message: "Please try another email or password" });

      const token = newToken(user);
      const { _id, firstName, lastName, email } = user;

      res.send({ user: { _id, firstName, lastName, email }, token });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error.message);
    }
  }
);

// Forgot Password
router.put(
  "/forgot-password",
  [check("email", "Email is required").isEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: errors.array()[0].msg,
        });
      }

      const { email } = req.body;

      // find the user
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({
          message: "User not found !",
        });
      }

      // if user found in DB --> create token
      const token = jwt.sign({ _id: user._id }, `${process.env.JWT_SECRET}`, {
        expiresIn: "15m",
      });

      let currentDate = new Date();

      const data = {
        from: process.env.USER,
        to: email,
        subject: "Password Reset Link",
        html: `
                <p>Hey we have received request for reset your account password on ${currentDate}</p> 
                <h1>Please use the following Link to reset your account password . Link will be get deactivated after 15 minute</h1>
                <p>${process.env.CLIENT_URL}/resetpassword/${token}</p>
                <hr />
                <p>This email may containe sensetive information</p>`,
      };

      // update resetlink feild in userModel and then send the reset link
      User.updateOne({ resetLink: token }, (err, success) => {
        if (err) {
          return res.status(400).json({
            message: "Reset Link Error",
          });
        } else {
          transporter.sendMail(data, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log(`Reset Link sent to: ${email}`);
            }
          });
        }
      });
      return res.send(`Reset Link sent to: ${email}`);
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }
);

//Reset Password
router.put(
  "/reset-password",
  [
    check("newPassword")
      .isLength({ min: 8, max: 20 })
      .withMessage("Required min 8 characters")
      .custom((value) => {
        let pattern = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

        if (pattern.test(value)) {
          return true;
        }
      })
      .withMessage(
        "min 8 characters which contain at least one numeric digit and a special character"
      ),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: errors.array()[0].msg,
        });
      }

      const { newPassword, resetLink } = req.body;

      User.findOne({ resetLink }, (err, user) => {
        if (err || !user) {
          return res.status(400).json({
            message: "User not found with the token",
          });
        }

        user.password = newPassword;
        user.resetLink = "";
        user.save((err, result) => {
          if (err) {
            return res.status(400).json({
              error: err,
            });
          }

          return res.json({
            message: "Your password has been changed",
          });
        });
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }
);

//Get User By Email
router.get("/user", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select(
      "-password"
    );

    if (!user) {
      return res.status(400).send({ message: "User Not Found" });
    }

    return res.send(user);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

module.exports = router;
