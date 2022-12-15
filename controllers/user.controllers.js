const User = require("../models/user.model");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { jwtSign } = require("../helper/jwt");

const { Services } = require("../services/services");
const { passwordHash, passwordCompare } = require("../helper/hashing");
const { ifError } = require("assert");

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
    const newUser = new User({
      email: email,
      otp: Math.floor(1000 + Math.random() * 9000),
    });
    const saveNewUser = await newUser.save();
    // const token = Math.floor(1000 + Math.random() * 9000);

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
    next(error);
  }
};

exports.nameSignUp = async (req, res, next) => {
  try {
    const id = req.query.id;
    const { firstName, lastName, referralId } = req.body;
    const updateUser = await User.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
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
    const id = req.query.id;
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password doesn't match" });
    }
    const hashedPassword = await passwordHash(password);
    const updateUser = await User.findByIdAndUpdate(
      id,
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
    const id = req.query.id;
    const { bvn } = req.body;
    const updateUser = await User.findByIdAndUpdate(
      id,
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
    if(!email && !password) {
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
      access_token: token,
    };
    return res.status(200).json(dataInfo);
  } catch (error) {
    next(error);
  }
};


exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  const user = User.findOne({ email });
  if (!user) {
    return res
      .status(400)
      .json({ error: error.message, message: "user does not exist" });
  }

  let otp = Math.floor(1000 + Math.random() * 9000)
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
  return user.updateOne({  otp: otp}, (err) => {
    if (err) {
      return res.status(400).json({ error: "reset password error" });
    } else {
      return res.status(200).json({ message: "Input your otp on the next screen" });
    }
  });
};

exports.resetPassword = async (req, res, next) => {
  const id = req.query.id;
  const {password, confirmPassword} = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password doesn't match" });
    }
    const hashedPassword = await passwordHash(password);
    const updatedUser = await User.findByIdAndUpdate(
      id,
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
}
