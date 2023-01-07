require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user.routes");
const groupRouter = require("./routes/group.routes");
const transactionRouter = require("./routes/transactions.routes");
const session = require("cookie-session");
const http = require("http");
const path = require("path");
const Transactions = require("./models/transactions");
const User = require("./models/user.model");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 4500;
const app = express();
connectDB();
const loggerMiddleware = (req, res, next) => {
  console.log("New request to: " + req.method + " " + req.path);
  next();
};
const Flutterwave = require("flutterwave-node-v3");

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);
app.use(loggerMiddleware);
const oneDay = 1000 * 60 * 60 * 24;
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "views")));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/greet", (req, res) => {
  res.send("Hello World!!!!!");
});

app.use("/api", userRoutes);
app.use("/group", groupRouter);
app.use("/transaction", transactionRouter);
// app.get("/home", (req, res) => {
//   res.sendFile(path.join(__dirname, "views/home.html"));
// });
app.get("/home", async (req, res) => {
  if (req.query.status === "successful") {
    const transactionDetails = await Transactions.find({
      tx_ref: req.query.tx_ref,
    });
    const response = await flw.Transaction.verify({
      id: req.query.transaction_id,
    });
    if (
      response.data.status === "successful" &&
      response.data.currency === "NGN"
      ) {
        // Success! Confirm the customer's payment
   
    // const newUser = await User.findOne({firstName: transactionDetails.firstName})
    // if(!newUser){
    //   return res.status(400).json({ message: "user does not exist"
    // });
    // }
    //  newUser.userBalance = {$inc: {userBalance: transactionDetails.amount}}
    //  await newUser.save();
      res.sendFile(path.join(__dirname, "views/home.html"));
      console.log("payment successful");
      // console.log(newUser);
    } else {
      // Inform the customer their payment was unsuccessful
      console.log("Payment unsuccessful", "Not enough money on card");
    }
  }
});
app.get("/deposit", (req, res) => {
  res.sendFile(path.join(__dirname, "views/deposit.html"));
});

// 404 error
app.use((req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});
// global error
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
