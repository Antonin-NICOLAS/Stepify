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

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

const findLocation = async (user, ipAddress) => {
  let location = 'Localisation inconnue';
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city,zip,lat,lon&lang=${user.languagePreference}`);
    const geoData = await geoRes.json();
    if (geoData.status === 'success') {
      location = `${geoData.city} (${geoData.zip}), ${geoData.regionName}, ${geoData.country}, longitude: ${geoData.lon} , latitude: ${geoData.lat}`;
    }
    return location;
  } catch (error) {
    console.warn('Erreur lors de la géolocalisation IP:', error);
    return location;
  }
}

module.exports = { GenerateAuthCookie, generateVerificationCode, validateEmail, validateUsername, generateSessionFingerprint, findLocation };