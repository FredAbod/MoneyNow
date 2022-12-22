require('dotenv').config();
const express = require('express');
const Transactions = require('../models/transactions')
const nodemailer = require("nodemailer");
const Group = require('../models/groups.models')
const mongoose = require('mongoose');
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
      const { groupName, amount, phonenumber, email, currency, summary } = req.body;
      const tx_ref = v4();
      if (!groupName && !amount && !summary) {
        return res.status(400).json({
          status: false,
          message:
            "Please provide the following details: groupName, amount, summary",
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
          redirect_url: "http://localhost:5500/deposit",
          // "https://webhook.site/fcc96dd0-e74b-424a-a124-603622e86302",
          
          customer: {
            email,
            phonenumber,
            groupName,
          },
          
          customizations: {
            title: "Bookie Savings",
            logo: "https://res.cloudinary.com/del59phog/image/upload/v1664666233/oh8ux3abpado9xpxdzxt.jpg",
          },
        },
      })
      .json();
      console.log(response);
      if (req.query.status === "successful") {
        const transactionDetails = await Transactions.find({
          ref: req.query.tx_ref,
        });
        const response = await flw.Transactions.verify({
          id: req.query.transaction_id,
        });
        if (
          response.data.status === "successful" &&
          response.data.amount === transactionDetails.amount &&
          response.data.currency === "NGN"
        ) {
          // Success! Confirm the customer's payment
        } else {
          // Inform the customer their payment was unsuccessful
          console.log(error);
          await session.abortTransaction();
        }
      }
      //   async () => {
      // console.log("web hook dey");
      // If you specified a secret hash, check for the signature
      const secretHash = process.env.FLW_SECRET_HASH;
      const signature = req.headers["verif-hash"];
      if (!signature || signature !== secretHash) {
        // This request isn't from Flutterwave; discard
        // res.status(401).end();
      }
      const payload = req.body;
      // It's a good idea to log all received events.
      console.log(payload);
  
      await session.commitTransaction();
      session.endSession();
  
      return res.status(201).json({
        status: true,
        message: "savings successful",
      });
    } catch (err) {
      console.log(err);
      // console.log(err);
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
      const { groupName, amount, summary,email } = req.body;
      const tx_ref = v4();
      if (!groupName && !amount && !summary) {
        return res.status(400).json({
          status: false,
          message:
            "Please provide the following details: groupName, amount, summary",
        });
      }
       
      const depositTransfer = await Promise.all([
      creditAccount({
        amount,
        username: groupName,
        purpose: "deposit",
        email,
        tx_ref,
        summary,
        trnxSummary: `TRFR To: ${groupName}. TRNX REF:${tx_ref} `,
        session,
      })
    ]);
      const failedTxns = depositTransfer.filter(
        (result) => result.status !== true
      );
      if (failedTxns.length) {
        const errors = failedTxns.map((a) => a.message);
        await session.abortTransaction();
        return res.status(400).json({
          status: false,
          message: errors,
        });
      }
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_MAIL,
            pass: process.env.PASSWORD
        }
    });
    const mailOptions = {
      from: "boluwatifefred@gmail.com",
      to: `${email}`,
      subject: "Your Payment Reciept",
     html: `<h1>hello ${groupName}</h1>
     <p>You've Just Saved  NGN${amount}</p>`,
      
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log(error);
    } else {
        res.status(200).json({message: "email Page"})
        console.log("Email Sent to " + info.accepted)
    }
    
  });
      await session.commitTransaction();
      session.endSession();
   
      res.redirect('/home')
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        status: false,
        message: `Unable to find perform deposit. Please try again. \n Error: ${err}`,
      });
    }
  };
  