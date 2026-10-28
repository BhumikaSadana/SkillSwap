const clean = (value) => {
  if (typeof value === 'string') return value.replace(/[<>]/g, '').trim();
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    Object.keys(value).forEach((k) => (value[k] = clean(value[k])));
  }
  return value;
};

const sanitize = (req, res, next) => {
  if (req.body) req.body = clean(req.body);
  next();
};

module.exports = sanitize;