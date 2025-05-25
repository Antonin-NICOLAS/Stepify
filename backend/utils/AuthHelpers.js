const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const ms = require('ms');

const GenerateAuthCookie = (res, user, stayLoggedIn) => {
  const cookieDuration = stayLoggedIn ? ms(process.env.SESSION_DURATION_LONG) : ms(process.env.SESSION_DURATION_SHORT);
  const expiration = stayLoggedIn ? process.env.SESSION_DURATION_LONG : process.env.SESSION_DURATION_SHORT;

  const token = jwt.sign({
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
  }, process.env.JWT_SECRET, { 
    expiresIn: expiration,
    algorithm: 'HS256'
  });

  const options = {
    secure: process.env.NODE_ENV === "production" ? true : false,
    httpOnly: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? 'strict' : '',
    maxAge: cookieDuration,
    expires: new Date(Date.now() + cookieDuration),
    ...(process.env.NODE_ENV === "production" && { domain: 'step-ify.vercel.app' })
  };

  res.cookie('jwtauth', token, options);
  return token;
};

// Validation helpers
const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateUsername = (username) => {
    return /^[a-zA-Z0-9_]{3,30}$/.test(username);
};

const generateSessionFingerprint = (req) => {
    const components = [
        req.ip,
        req.headers['user-agent'],
        req.headers['accept-language'],
        req.headers['sec-ch-ua']
    ];
    return CryptoJS.SHA256(components.join('|')).toString();
};

module.exports = { GenerateAuthCookie, validateEmail, validateUsername, generateSessionFingerprint };