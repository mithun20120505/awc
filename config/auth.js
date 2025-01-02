module.exports = {
    ensureAuthenticated: function (req, res, next) {
          // if (req.session.user) {
          //   return next(); // User is authenticated, proceed to the requested page
          // }
          // res.redirect('/users');
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view this resource');
        res.redirect('/users');
    },

    ensureAdmin: function (req, res, next) {
        if (req.isAuthenticated() && req.user.role === 'admin') {
            return next();
        }
        req.flash('error_msg', 'You do not have permission to view this page');
        res.redirect('/dashboard');
    },

    forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/dashboard'); // Redirect logged-in users away from login/register
    }

};
