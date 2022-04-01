const expressJwt = require('express-jwt');

exports.isSignedIn = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['sha1', 'RS256', 'HS256'],
  userProperty: 'auth',
});

exports.isAuthenticated = (req, res, next) => {
  // console.log('user', req.params);
  // console.log('auth', req.auth);
  let checker =
    req.params && req.auth && req.params.userId == req.auth.user._id;

  if (!checker) {
    return res.status(403).json({
      error: 'Access Denied',
    });
  }
  next();
};
