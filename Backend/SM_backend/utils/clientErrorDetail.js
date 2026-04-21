function clientErrorDetail(error) {
  if (process.env.NODE_ENV === 'production') {
    return undefined;
  }
  return error && error.message ? error.message : undefined;
}

module.exports = { clientErrorDetail };
