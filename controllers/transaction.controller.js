require("dotenv").config();
const express = require("express");
const Transactions = require("../models/transactions");
const nodemailer = require("nodemailer");
const Group = require("../models/groups.models");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const app = express();
const { v4 } = require("uuid");
const { creditAccount, debitAccount } = require("../utils/myTransaction");
const Flutterwave = require("flutterwave-node-v3");

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

exports.save = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { firstName, amount, phonenumber, email, currency, summary } =
      req.body;
    const tx_ref = v4();
    if (!firstName && !amount && !summary) {
      return res.status(400).json({
        status: false,
        message:
          "Please provide the following details: firstName, amount, summary",
      });
    }

    const got = require("got");
    const response = await got
      .post("https://api.flutterwave.com/v3/payments", {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
        json: {
          tx_ref,
          amount: amount,
          currency: currency,
          redirect_url: "https://moneynow.onrender.com/home",
          //  "https://webhook.site/b74df5b5-7abb-47f4-8843-f5f07b4babcd",
          // "http://localhost:5500/deposit",

          customer: {
            email,
            phonenumber,
            firstName,
          },

          customizations: {
            title: "Bookie Savings",
            logo: "https://res.cloudinary.com/del59phog/image/upload/v1664666233/oh8ux3abpado9xpxdzxt.jpg",
          },
        },
      })
      .json();
    console.log(response);
    const newTransaction = new Transactions({
      firstName: firstName,
      amount: amount,
      currency: currency,
      summary: summary,
      email: email,
      tx_ref: tx_ref,
      trnxType: "CR",
      purpose: "savings",
      userId: req.user.id,
      transactionStatus: "Pending",
    });
    const saveNewTransaction = await newTransaction.save();

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: "savings successful",
      response,
      saveNewTransaction,
      // payload,
    });
  } catch (err) {
    console.log(err);
    // console.log(err);
    // console.log(err.code);
    // console.log(err.response.body);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: false,
      message: `Unable to find perform deposit. Please try again. \n Error: ${err}`,
    });
  }
};

exports.deposit = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { firstName, groupName, amount, summary, email } = req.body;
    const tx_ref = v4();
    if (!firstName && !amount && !summary) {
      return res.status(400).json({
        status: false,
        message:
          "Please provide the following details: firstName, amount, summary",
      });
    }

    const depositTransfer = await Promise.all([
      creditAccount({
        amount,
        firstName,
        groupName,
        purpose: "deposit",
        email,
        tx_ref,
        summary,
        trnxSummary: `TRFR To: ${firstName}. TRNX REF:${tx_ref} `,
        session,
      }),
    ]);
    const failedTxns = depositTransfer.filter(
      (result) => result.status !== true
    );
    console.log(failedTxns);
    if (failedTxns.length) {
      const errors = failedTxns.map((a) => a.message);
      await session.abortTransaction();
      return res.status(400).json({
        status: false,
        message: errors,
      });
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: "boluwatifefred@gmail.com",
      to: `${email}`,
      subject: "Your Payment Reciept",
      html: `<h1>hello ${firstName}</h1>
     <p>You've Just Saved  NGN${amount}</p>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        res.status(200).json({ message: "email Page" });
        console.log("Email Sent to " + info.accepted);
      }
    });
    await session.commitTransaction();
    session.endSession();

    res.redirect("/home");
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: false,
      message: `Unable to find perform deposit. Please try again. \n Error: ${err}`,
    });
  }
};

exports.withdraw = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      first_name,
      amount,
      account_number,
      narration,
      mobile_number,
      currency,
      email,
    } = req.body;
    const tx_ref = v4();

    const details = {
      account_name: "011",
      account_number: account_number,
      amount: amount,
      bank_name: bank_name,
      narration: narration,
      currency: currency,
      reference: tx_ref,
      callback_url: "https://www.flutterwave.com/ng/",
      //  "http://localhost:5000/deposit",
      // "https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d",
      debit_currency: "NGN",
      meta: [
        {
          first_name: first_name,
          email: email,
          beneficiary_country: "NG",
          mobile_number: mobile_number,
          sender: "Bookie",
          merchant_name: "Spotify",
        },
      ],
    };
    flw.Transfer.initiate(details).then(console.log).catch(console.log);
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: true,
      message: "withdraw successful",
    });
  } catch (err) {
    console.log(err);
    // console.log(err);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: false,
      message: `Unable to find perform withdrawal. Please try again. \n Error: ${err}`,
    });
  }
};

exports.userTransactions = async (req, res) => {
  id = req.user.id;
  try {
    const userId = id;
    const userTransactions = await Transactions.find({ userId });
    return res
      .status(200)
      .json({ allTransactions: userTransactions.length, userTransactions });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
