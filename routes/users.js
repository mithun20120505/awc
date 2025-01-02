const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const GramPanchayat = require('../models/GramPanchayat');
const { ensureAuthenticated, ensureAdmin, forwardAuthenticated } = require('../config/auth');
const logger = require('../log/logger');
// Login Page
router.get('/', (req, res) =>
{
    try {
        const gramPanchayats = GramPanchayat.find(); // Fetch all GPs
        res.render('login', { gramPanchayats });
    } catch (error) {
        console.error("Error fetching GPs:", error);
        res.redirect('/error');
    }
//res.render('login')
});

// Register Page
router.get('/register', async (req, res) =>
{
  try {
      res.render('register');
  } catch (error) {
      console.error("Error fetching GPs:", error);
      res.redirect('/error');
  }
});

// Register Handle
router.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    let errors = [];
      console.log("hi")
    // Check required fields
    if (!username || !email || !password || !confirmPassword) {
      console.log(username);console.log(email);console.log(password);console.log(confirmPassword);
        errors.push({ msg: 'Please fill in all fields' });
    }
      console.log("hi1")
    let user = User.findOne({ username });
    // if (user) {
    //     console.log("hi2-")
    //     req.flash('error', 'User already exists for this GP.');
    //     return res.redirect('/register');
    // }
    // Check passwords match
    if (password !== confirmPassword) {
      console.log("hi2")
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check pass length
    if (password.length < 6) {
      console.log("hi3")
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
      console.log("hi4")
        res.render('register', {
            errors,
            username,
            email,
            password,
            confirmPassword
        });
    } else {
        // Validation passed

        User.findOne({$and:[ { email: email },{username : username}]}).then(user => {
            if (user) {
              console.log("hi6")
                errors.push({ msg: 'Email is already registered' });
                res.render('register', {
                    errors,
                    username,
                    email,
                    password,
                    confirmPassword
                });
            } else {
              var role = "user";
                let newUser = new User({
                    username,
                    email,
                    password,
                    role
                });
                console.log(newUser)
                // Hash Password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hashedPassword) => {
                        if (err) throw err;
                        console.log("hash : "+hashedPassword);
                        // newUser.password = hash;
                        newUser = new User({ username, password: hashedPassword, email, role });
                        newUser
                            .save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can log in');
                                res.redirect('/users');
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
  // req.session.destroy((err) => {
  //   if (err) {
  //     return res.redirect('/dashboard'); // Error handling if needed
  //   }
  //   res.clearCookie('connect.sid'); // Clear session cookie
  //   res.redirect('/users'); // Redirect to login page
  // });
    // req.flash('success_msg', 'You are logged out');
    // res.redirect('/users');
    req.logout((err) => {
    if (err) {
      return next(err); // Handle error properly
    }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users'); // Redirect to login page after logout
  });
});

module.exports = router;
