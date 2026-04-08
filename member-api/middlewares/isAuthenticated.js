const { auth } = require('express-oauth2-jwt-bearer');

const check = (req, res, next) => {
  // build the auth middleware lazily — runs on first request, not at startup
  // by this point dotenv has already loaded so process.env values are available
  return auth({
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    audience:       process.env.AUTH0_AUDIENCE,
  })(req, res, next);
};

module.exports = { check };