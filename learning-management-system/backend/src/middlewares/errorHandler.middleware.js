const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : (err.statusCode || 500);
  const message = err.code === "LIMIT_FILE_SIZE" ? "Video is too large. The maximum size is 500 MB." : (err.message || "Something went wrong");
  res.status(statusCode).json({
    success: false,
    message,
  });
};
 
module.exports = errorHandler;
