const $ = require('./config');

const { UNAUTHORIZED, FORBIDDEN } = require('cleaner-node').constants.http.status.codes;
const { isValid: isValidString, trimToUndefined } = require('cleaner-node').strings;
const { isValid: isValidObject } = require('cleaner-node').objects;
const { isValid: isValidDate } = require('cleaner-node').dates;
const { decode, toDetails } = require('cleaner-node').jwt;

module.exports.setupSession = (req, res, next) => {
  if (req.session) { throw new Error('Session already set!'); }
  const info = {};
  try {
    info.token    = trimToUndefined(req.cookies[$.jwt.cookie.name]);
    info.payload  = info.token ? decode(info.token, $.jwt.token.secret) : undefined;
    info.details  = info.payload ? toDetails(info.payload) : undefined;
  } catch (ex) {
    console.error(ex);
    return res.status(UNAUTHORIZED).send({ message: 'Problem decoding session.' });
  }
  let err = '';
  const now = new Date();
  if (isValidString(info.token)) {
    if (!isValidObject(info.payload)) { err = 'Invalid session.'; }
    else if (!isValidObject(info.details)) { err = 'Invalid session details.'; }
    else if (!isValidDate(info.details.created)) { err = 'Invalid created date.'; }
    else if (!isValidDate(info.details.expiry)) { err = 'Invalid expiry dates.'; }
    else if (info.details.created > now) { err = 'Session not ready.'; }
    else if (info.details.expiry <= now) { err = 'Session expired.'; }
  }
  if (isValidString(err)) {
    return res.status(UNAUTHORIZED).send({ message: err });
  }
  req.session = {...info};
  return next();
};

module.exports.sessionRequired = (req, res, next) => {
  if (req.session && req.session.details) { return next(); }
  res.status(UNAUTHORIZED).send({ message: 'Not required while logged out.' });
}
module.exports.sessionForbidden = (req, res, next) => {
  if (!req.session || !req.session.details) { return next(); }
  res.status(FORBIDDEN).send({ message: 'Not required while logged in.' });
}
