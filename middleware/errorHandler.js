export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`);
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR',
    },
  });
}
