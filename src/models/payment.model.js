const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotel",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    rooms: { type: String },
    night: { type: String },
    checkinDate: { type: String },
    checkoutDate: { type: String },
    transactionId: { type: String },
    amount: { type: String },
    bookingDate: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("payment", paymentSchema);
