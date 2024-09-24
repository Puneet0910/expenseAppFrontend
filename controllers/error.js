exports.error404 = (req, res, next) => {
  res.status(404).send("<h1>404 555 Not Found</h1>");
};
