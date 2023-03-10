const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      minlength: 3,
    },
    lastName: {
      type: String,
      trim: true,
      minlength: 3,
    },
    referralId: {
      type: String,
      trim: true,
    },
    userBalance: {
      type: Number,
      required: true,
      default: 0.00
  },
    bvn: {
      type: String,
      trim: true,
      unique: true,
    },
    otp: {
      type: String,
    },
    password: {
      type: String,
      // required: [true, 'Please enter a password'],
      minlength: 3,
    },

    email: {
      type: String,
      unique: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    activated: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      trim: true,
      minlength: 3,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
    // versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
