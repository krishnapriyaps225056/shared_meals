
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Welcome route
app.get("/", (req, res) => {
  res.send("Welcome to ShareMeal API!");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ShareMeal server is running!"
  });
});

// Donation schema
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

const Donation = mongoose.model("Donation", donationSchema);

// CREATE: Add a donation
app.post("/api/donations", async (req, res) => {
  try {
    const donation = await Donation.create(req.body);
    res.status(201).json(donation);
  } catch (error) {
    res.status(400).json({
      message: "Could not create donation",
      error: error.message
    });
  }
});

// READ: Get all donations
app.get("/api/donations", async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({
      message: "Could not fetch donations",
      error: error.message
    });
  }
});

// READ: Get one donation by ID
app.get("/api/donations/:id", async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found"
      });
    }

    res.json(donation);
  } catch (error) {
    res.status(400).json({
      message: "Could not fetch donation",
      error: error.message
    });
  }
});

// UPDATE: Edit donation details
app.put("/api/donations/:id", async (req, res) => {
  try {
    const { mealName, quantity, location, expiryTime, donorName } = req.body;

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { mealName, quantity, location, expiryTime, donorName },
      { new: true, runValidators: true }
    );

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found"
      });
    }

    res.json({
      message: "Donation updated successfully",
      donation
    });
  } catch (error) {
    res.status(400).json({
      message: "Could not update donation",
      error: error.message
    });
  }
});

// UPDATE: Claim a donation
app.patch("/api/donations/:id/claim", async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: "Claimed" },
      { new: true, runValidators: true }
    );

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found"
      });
    }

    res.json(donation);
  } catch (error) {
    res.status(400).json({
      message: "Could not claim donation",
      error: error.message
    });
  }
});

// DELETE: Remove a donation
app.delete("/api/donations/:id", async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found"
      });
    }

    res.json({
      message: "Donation deleted successfully",
      donation
    });
  } catch (error) {
    res.status(400).json({
      message: "Could not delete donation",
      error: error.message
    });
  }
});

// Start server after MongoDB connects
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`ShareMeal server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();

