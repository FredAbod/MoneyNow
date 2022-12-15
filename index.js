require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require("./routes/user.routes")
const session = require('cookie-session')

const cookieParser = require('cookie-parser');
const port = process.env.PORT || 4500;
const app = express(); 
connectDB();
const loggerMiddleware = (req, res, next) => {
    console.log('New request to: ' + req.method + ' ' + req.path)
    next();
}

app.use(loggerMiddleware);
const oneDay = 1000*60*60* 24;
app.use(cookieParser())
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

app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  
  app.get('/greet', (req, res) => {
    res.send('Hello World!!!!!');
  });
  
  app.use('/api', userRoutes);
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