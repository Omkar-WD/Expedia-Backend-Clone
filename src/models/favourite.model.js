const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema(
  {
    hotelId: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'hotel', required: true },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model('favourite', favouriteSchema);
