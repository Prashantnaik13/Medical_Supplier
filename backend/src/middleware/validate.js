const { fail } = require('../utils/http');

function validate(schema, key = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[key]);
    if (!result.success) return next(fail(422, 'Please check the submitted information.', result.error.flatten()));
    req[key] = result.data;
    next();
  };
}

module.exports = { validate };
