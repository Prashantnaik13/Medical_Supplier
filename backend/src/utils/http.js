class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'HttpError';
  }
}

const fail = (status, message, details) => new HttpError(status, message, details);

module.exports = { HttpError, fail };
