
const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    mealName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    expiryTime: {
      type: Date,
      required: true
    },
    donorName: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Available", "Claimed"],
      default: "Available"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
