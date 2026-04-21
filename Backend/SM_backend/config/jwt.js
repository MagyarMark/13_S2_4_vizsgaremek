require('dotenv').config({ path: './.env' });

module.exports = {
  // ez az access token aláírási kulcsa
  accessTokenSecret: process.env.JWT_ACCESS_SECRET,
  // ez a refresh token aláírási kulcsa
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  
  // access token érvényesség ideje
  accessTokenExpiration: '45m',
  // refresh token érvényesség ideje
  refreshTokenExpiration: '7d',
};
