const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
      unique: true,
    },
    bvn: {
      type: String,
      trim: true,
      unique: true,
      maxlength: 11,
      minlength:11,
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
      required: [true, "Please enter an email"],
      unique: true,
      trim: true,
      minlength: 3,
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
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
