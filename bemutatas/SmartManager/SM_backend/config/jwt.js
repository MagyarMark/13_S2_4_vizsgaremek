require('dotenv').config({ path: './.env' });

module.exports = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-key',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-key',
  
  accessTokenExpiration: '45m',
  refreshTokenExpiration: '7d',
};
