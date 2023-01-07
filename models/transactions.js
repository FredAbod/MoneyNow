const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    trnxType: {
      type: String,
      required: true,
      enum: ["CR", "DR"],
    },
    purpose: {
      type: String,
      enum: ["deposit", "transfer", "reversal", "withdrawal", "savings"],
      required: true,
    },
    amount: {
      type: mongoose.Decimal128,
      required: true,
      default: 0.0,
    },
    firstName: {
      type: String,
      ref: "User",
    },
    userId: {
      type: String,
  },
    balanceBefore: {
      type: mongoose.Decimal128,
      // required: true,
    },
    balanceAfter: {
      type: mongoose.Decimal128,
      // required: true,
    },
    email: { type: String, required: true },
    tx_ref: { type: String, required: true},
    currency: { type: String },
    transactionStatus: { type: String },
    summary: { type: String },
    trnxSummary: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Transactions",
  transactionSchema
);
