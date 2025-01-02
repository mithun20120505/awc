// middleware.js
module.exports = {
  ensureAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    } else {
      req.flash('error', 'Access denied. Admins only.');
      res.redirect('/users');
    }
  }
};
