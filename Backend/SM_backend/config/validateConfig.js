function assertConfig() {
  const jwtMissing = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'].filter((k) => !process.env[k]);
  if (jwtMissing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${jwtMissing.join(', ')}. Set them in .env (see .env.example).`
    );
  }

  if (process.env.NODE_ENV === 'production') {
    const dbMissing = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].filter((k) => !process.env[k]);
    if (dbMissing.length > 0) {
      throw new Error(`Missing required database environment variables in production: ${dbMissing.join(', ')}`);
    }
  }
}

module.exports = { assertConfig };
