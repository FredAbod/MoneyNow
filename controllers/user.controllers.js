const User = require("../models/user.model");
const { parse, stringify, toJSON, fromJSON } = require("flatted");

const nodemailer = require("nodemailer");
const fs = require("fs");
const { jwtSign } = require("../helper/jwt");
const otpGenerator = require("otp-generator");
const { Services } = require("../services/services");
const { passwordHash, passwordCompare } = require("../helper/hashing");
// const cron = require("node-cron");
// const saltRounds = 10;

exports.SignUp = async (req, res, next) => {
  const { email } = req.body;
  try {
    // validate
    if (!email) {
      return res.status(400).json({ message: "Please Input Your Email" });
    }
    const checkExistingUser = await User.findOne({ email });
    if (checkExistingUser) {
      return res.status(400).json({ message: "User already exists." }); // this condition needs to be stopped if error is thrown
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    // const salt = await bcrypt.genSalt(saltRounds);
    // const hash = await bcrypt.hash(otp, salt);
    const newUser = new User({
      email: email,
      otp,
    });
    const saveNewUser = await newUser.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: "boluwatifefred@gmail.com",
      to: email,
      subject: ` You have signed up succesfully On MoneyNow!!!`,
      html: `
      <p>You need to activate your account with the Otp below</p>
      <p>Here is your token ${newUser.otp}</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
      console.log("Email Sent to " + info.accepted);
    });

    return res.status(200).json({
      message: "You have signed up successfully, Please input your otp",
      saveNewUser,
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.otp = async (req, res, next) => {
  const { otp } = req.body;
  try {
    const checkExistingUser = await User.findOne({ otp });
    if (checkExistingUser) {
      checkExistingUser.activated = true;
      await checkExistingUser.save();
      return res.status(200).json({ message: "otp Match", checkExistingUser });
    } else {
      return res.status(400).json({ message: "no user with this otp" });
    }
  } catch (error) {
    return res.status(500).json({ error, message: error.message });
  }
};

exports.nameSignUp = async (req, res, next) => {
  try {
    const { firstName, lastName, referralId, phoneNumber } = req.body;
    const updateUser = await User.findByIdAndUpdate(
      req.query.id,
      {
        firstName,
        lastName,
        phoneNumber,
        referralId,
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json({ message: "user updated successfully", updateUser });
  } catch (error) {
    next(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.passwordSignUp = async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password doesn't match" });
    }
    const hashedPassword = await passwordHash(password);
    const updateUser = await User.findByIdAndUpdate(
      req.query.id,
      {
        password: hashedPassword,
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json({ message: "user updated successfully", updateUser });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.bvnSignUp = async (req, res, next) => {
  try {
    const { bvn } = req.body;
    const updateUser = await User.findByIdAndUpdate(
      req.query.id,
      {
        bvn,
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json({ message: "user updated successfully", updateUser });
  } catch (error) {
    next(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email && !password) {
      return res.status(400).json({ message: "email and password required" });
    }
    const user = await Services.findUserByEmail({ email });
    const isMatch = await passwordCompare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const payload = {
      id: user._id,
      email: user.email,
    };
    const token = jwtSign(payload);
    res.cookie("access_token", token, { httpOnly: true });
    const dataInfo = {
      status: "success",
      message: "User Logged in successful",
      user,
      access_token: token,
    };
    return res.status(200).json(dataInfo);
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const newUser = await User.findOne({ email: email });
  if (!newUser) {
    return res.status(400).json({ message: "user does not exist" });
  }
  console.log(newUser);
  let otp = Math.floor(1000 + Math.random() * 9000);
  newUser.otp = otp;
  await newUser.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_MAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: "boluwatifefred@gmail.com",
    to: email,
    subject: ` Here Is Your One-Time Password from MoneyNow `,
    html: `
    <h2>Do not share Otp with anyone</h2>
    <p>Here is your otp: ${otp}</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    console.log("Email Sent to " + info.accepted);
  });
  return res.status(200).json({
    message: "Otp sent",
  });
};

exports.resetPassword = async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password doesn't match" });
    }
    const hashedPassword = await passwordHash(password);
    const updatedUser = await User.findByIdAndUpdate(
      req.query.id,
      {
        password: hashedPassword,
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json({ message: "user updated successfully", updatedUser });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.gen_ref_ID = async (req, res, next) => {
  id = req.params.id;
  try {
    const checkExistingUser = await User.findById(id);
    if (!checkExistingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    referralId = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        referralId,
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json({ message: "referralId generated", updatedUser });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.resend_code = async (req, res, next) => {
  try {
    // const otp= Math.floor(1000 + Math.random() * 9000)
    const updateOtp = await User.findByIdAndUpdate(
      req.params.id,
      {
        otp: Math.floor(1000 + Math.random() * 9000),
      },
      {
        new: true,
      }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: "boluwatifefred@gmail.com",
      to: updateOtp.email,
      subject: ` You have signed up succesfully On MoneyNow!!!`,
      html: `
      <p>You need to activate your account with the Otp below</p>
      <p>Here is your token ${updateOtp.otp}</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
      console.log("Email Sent to " + info.accepted);
    });
    return res
      .status(200)
      .json({ message: "Otp is resent to your code", updateOtp });
  } catch (error) {
    next(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
// get user by id
exports.userName = async (req, res, next) => {
  try {
    id = req.query.id;
    const user = await User.findById(id);
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }
    const fullName = user.firstName + " " + user.lastName;
    res.status(200).json({ fullName });
  } catch (error) {
    next(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.userBalance = async (req, res) => {
  id = req.user.id
  try {
    const newUser = await User.findById(id);
    const balance = newUser.userBalance;
    return res.status(200).json({ balance });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
