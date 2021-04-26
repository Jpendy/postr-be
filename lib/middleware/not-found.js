module.exports = (req, res, next) => {
  const err = new Error('Not Found - Bad Endpoint');
  err.status = 404;
  next(err);
};
