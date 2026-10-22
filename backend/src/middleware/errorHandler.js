const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');
const { ZodError } = require('zod');

function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = error.status || error.statusCode || 500;
  let message = error.message || 'Something went wrong.';
  let details = error.details;
  if (error instanceof ZodError) {
    status = 422;
    message = 'Please check the submitted information.';
    details = error.flatten();
  } else if (error instanceof UniqueConstraintError) {
    status = 409;
    message = 'A record with one of these values already exists.';
    details = error.errors?.map((item) => ({ field: item.path, message: item.message }));
  } else if (error instanceof ValidationError) {
    status = 422;
    message = 'The submitted data is invalid.';
    details = error.errors?.map((item) => ({ field: item.path, message: item.message }));
  } else if (error instanceof ForeignKeyConstraintError) {
    status = 422;
    message = 'This record references data that does not exist.';
  }
  if (status >= 500) {
    console.error('[api:error]', error);
    message = process.env.NODE_ENV === 'production' ? 'Internal server error.' : message;
  }
  res.status(status).json({ success: false, message, ...(details ? { details } : {}), requestId: req.id });
}

module.exports = { notFound, errorHandler };
