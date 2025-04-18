const jwt = require('jsonwebtoken');

const GenerateAuthCookie = (res, user, stayLoggedIn) => {
  const cookieDuration = stayLoggedIn ? 7 * 24 * 60 * 60 * 1000 : 2 * 24 * 60 * 60 * 1000;
  const expiration = stayLoggedIn ? '7d' : '2d';

  const token = jwt.sign({
    id: user._id,
    nom: user.lastName,
    prenom: user.firstName,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
  }, process.env.JWT_SECRET, { expiresIn: expiration });

  const options = {
    secure: process.env.NODE_ENV === "production" ? true : false,
    httpOnly: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
    maxAge: cookieDuration,
    expires: new Date(Date.now() + cookieDuration),
    ...(process.env.NODE_ENV === "production" && { domain: 'step-ify.vercel.app' })
  };

  res.cookie('jwtauth', token, options);
  return token;
};

module.exports = { GenerateAuthCookie };