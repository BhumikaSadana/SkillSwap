// Koi route match na ho toh
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Saare errors yahin aayenge (multer errors bhi)
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message);

  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err.message === 'Only jpg, png, pdf files allowed') {
    return res.status(400).json({ message: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }

  res.status(err.status || 500).json({ message: err.message || 'Server error' });
};

module.exports = { notFound, errorHandler };