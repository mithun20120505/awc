const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require("path");
const app = express();
const dotEnv = require("dotenv");
const LocalStrategy = require('passport-local').Strategy;
const { ensureAuthenticated, forwardAuthenticated } = require('./config/auth');
const logger = require('./log/logger');
// app.use((req, res, next) => {
//   res.locals.user = req.user || null;
//   next();
// });

// Models

const User = require('./models/User');
const Survey = require('./models/AwcData');
// Passport configuration
require('./config/passport')(passport);
app.use("/uploads", express.static("uploads"));
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 360000 } //{ secure: false }
}));
app.use((req, res, next) => {
  if (req.session) {
    req.session._garbage = Date();
    req.session.touch(); // resets maxAge
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.json());
// // Routes
// app.use('/auth', require('./routes/auth'));
// app.use('/admin', require('./routes/admin'));

// Global variables for flash messages
app.use((req, res, next) => {
    res.locals.success_msg = req.session.message; //req.flash('success_msg');
    res.locals.error_msg = req.session.error; //req.flash('error_msg');
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    delete req.session.message;
    delete req.session.error;
    next();
});
// app.use((req, res, next) => {
//   console.log(`Accessing: ${req.path}`);
//   console.log(`Authenticated: ${req.isAuthenticated()}`);
//   const publicRoutes = ['/users','/users/login', '/users/register', '/users/logout'];
//
//   if (publicRoutes.includes(req.path) ) {
//   //  console.log('Proceeding to the next middleware');
//     return next();
//   }
//   // Check if the user is authenticated
//   if (req.isAuthenticated()) {
//     //console.log('User authenticated');
//     return next();  // User is authenticated, continue
//   }
//   // If not authenticated and trying to access a protected route, redirect to login
//   //console.log('Redirecting to login page');
//   req.flash('error_msg', 'Please log in to access this resource');
//   return res.redirect('/users');
// });
// 404 page for unidentified routes
// app.use((req, res, next) => {
//   res.status(404);
//   req.flash('error_msg', 'Page not found. Please log in to access the website.');
//   res.redirect('/login');
// });
app.set('view engine', 'ejs');

// Connect to MongoDB
dotEnv.config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const locationsRouter = require('./routes/locations');
app.use('/locations', locationsRouter);


app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

// const upload = multer({ dest: 'uploads/' });

app.listen(3000, () => {
  logger.info('Server started on port 3000');
  console.log('Server started on port 3000');
});
