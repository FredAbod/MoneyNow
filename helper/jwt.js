const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const { JWT_SECRET } = process.env;

const jwtSign = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d',
  });
};


const jwtVerify = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return false;
  }
};

module.exports = { jwtSign, jwtVerify };
