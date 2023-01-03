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
    balanceBefore: {
      type: mongoose.Decimal128,
      required: true,
    },
    balanceAfter: {
      type: mongoose.Decimal128,
      required: true,
    },
    email: { type: String, required: true },
    tx_ref: { type: String, required: true},
    currency: { type: String },
    // reference: { type: String, required: true },
    balanceBefore: {
      type: mongoose.Decimal128,
      required: true,
    },
    balanceAfter: {
      type: mongoose.Decimal128,
      required: true,
    },
    summary: { type: String, required: true },
    trnxSummary: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Transactions",
  transactionSchema
);
