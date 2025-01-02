// const LocalStrategy = require('passport-local').Strategy;
// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
//
// module.exports = function (passport) {
//   passport.use(
//     new LocalStrategy(async (username, password, done) => {
//       const user = await User.findOne({ username });
//       if (!user) {
//         return done(null, false, { message: 'No user found' });
//       }
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         return done(null, false, { message: 'Incorrect password' });
//       }
//       return done(null, user);
//     })
//   );
//
//   passport.serializeUser((user, done) => done(null, user.id));
//   passport.deserializeUser((id, done) => {
//     User.findById(id, (err, user) => done(err, user));
//   });
// };
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logger = require('../log/logger');

module.exports = function(passport) {
    passport.use(new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
        // Match user
        User.findOne({ username: username })
            .then(user => {
                if (!user) {
                  console.log(user);
                    return done(null, false, { message: 'Username not registered' });
                }
                // Match password
                console.log(user);
                console.log(password);console.log(user.password);
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err){ throw err;}
                    console.log(isMatch);
                    if (isMatch) {
                      logger.info("user is logged in : ", username)
                        return done(null, user);
                    } else {
                      console.log("incorrect");
                      logger.info("user is not logged in due to incorrect password : ", username)
                        return done(null, false, { message: 'Incorrect password' });
                    }
                });
            })
            .catch(err => console.log(err));
    }));

    passport.serializeUser((user, done) => {
      console.log("user at serializeUser :"+ user);
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
      try {
          const user = User.findById(id);
          console.log("user at deserializeUser :"+ user);
              done(null, user);
      } catch (err) {
        console.log("error at deserializeUser :"+ err);
          done(err, null);
      }
      //   User.findById(id, (err, user) => {
      //   done(err, user);
      // });
    });
};
