const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    images: [{ type: String }],
    location: { type: String },
    exploreArea: [
      {
        logo: { type: String },
        locationName: { type: String },
        distance: { type: Number },
      },
    ],
    hotelName: { type: String },
    city: { type: String },
    shortDescription: { type: String },
    description: { type: String },
    refund: { type: String },
    rating: { type: Number },
    paymentMode: { type: String },
    review: { type: String },
    reviewCount: { type: Number },
    roomsLeft: { type: Number },
    offerPrice: { type: Number },
    originalPrice: { type: Number },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model('hotel', hotelSchema);
