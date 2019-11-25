const $         = require('./config');
const passport  = require('passport');
const router    = require('express').Router();
const User      = require('./data/user.model');
const { setupSession, sessionRequired,  sessionForbidden } = require('./session');
const { first } = require('cleaner-node').arrays;
const { CONFLICT, UNAUTHORIZED, BAD_REQUEST } = require('cleaner-node').constants.http.status.codes;
const { getText: getEmailText } = require('cleaner-node').email;
const { toToken } = require('cleaner-node').jwt;
const { trimToUndefined } = require('cleaner-node').strings;
const { initUid } = require('cleaner-node').uuids;

const providerNames = Object.keys($.providers)
  .filter(name => (name && ($.providers[name].strategy || {}).clientID));
if (providerNames.length === 0) {
  throw new Error('No providers configured!');
}

passport.serializeUser((profile, done) => {
  const query = {};
  query[profile.provider] = profile.identifier;
  User.findOne(query, (err, existing) => {
    if (err) { throw err; }
    return done(err, { profile, existing });
  });
});

const handleLinkOrLogin = async (req, res, next) => {
  const sessionUser = (req.session || {}).user;
  const existingUser = req.session.passport.user.existing;

  if (sessionUser && existingUser) {
    if (sessionUser.id === existingUser.id) {
      return res.status(200);
    }
    return res.status(CONFLICT).send({ message: 'You already have an account linked to this profile.' });
  }

  // New login
  if (existingUser) {
    const createdDate = new Date();
    const expiryDate = new Date(createdDate.getTime() + $.jwt.token.maxAge);
    const token = toToken(
      existingUser.id,
      undefined,
      initUid(),
      createdDate,
      expiryDate,
      $.jwt.token.secret
    );
    res.cookie($.jwt.cookie.name, token, { expires: expiryDate });
    return res.redirect('/profile');
  }

  const { name, picture, email, provider, identifier } = req.user;
  const details = { name, picture, email };

  // Link new profile
  if (sessionUser) {
    sessionUser[provider] = identifier;
    sessionUser.name  = sessionUser.name || name;
    sessionUser.picture = sessionUser.picture || picture;
    sessionUser.email = sessionUser.email || email;
    await sessionUser.save();
    req.user = sessionUser;
    return res.redirect('/profile');
}

  // New user & login
  details[provider] = identifier.trim();
  User.create(details, (err, user) => {
    if (err) { throw err; }
    const createdDate = new Date();
    const expiryDate = new Date(createdDate.getTime() + $.jwt.token.maxAge);
    const token = toToken(
      user.id,
      undefined,
      initUid(),
      createdDate,
      expiryDate,
      $.jwt.token.secret
    );
    res.cookie($.jwt.cookie.name, token, { expires: expiryDate });
    return res.redirect('/profile');
  })
}
const handleUnlink = async (req, res, next) => {
  const provider = $.providers[req.params.providerName];
  if (!provider){ 
    return res.status(BAD_REQUEST).json({ message: 'Invalid provier.'}); 
  }

  const sessionUser = (req.session || {}).user;
  sessionUser[req.params.providerName] = undefined;

  await sessionUser.save();
  req.user = sessionUser;
  return res.redirect('/profile');
}
const setupLink = (req, res, next) => {
  req.sessionInfo = {
    user : req.user
  };
  return next();
}

router.use(setupSession);
router.use((req, res, next) => {
  if (!req.session || !req.session.details) { 
    return next(); 
  }
  User.findById(req.session.details.userId, (err, user) => {
    if (err) { 
      throw err; 
    }
    if (!user) { 
      return res.status(UNAUTHORIZED).send({ message: 'Invalid credentials' }); 
    }
    req.session.user = user;
    return next();
  });
})

router.get('/login', sessionForbidden, (req, res) => { 
  if (req.user) { return res.render('profile', { user: req.session.user }); }
  res.render('login'); 
});
router.get('/logout', sessionRequired, (req, res) => {
  res.clearCookie($.jwt.cookie.name);
  res.redirect('/');
});
router.get('/profile', (req, res) => { 
  if (!req.session || !req.session.user) { return res.render('login'); }
  res.render('profile',  { user: req.session.user }); 
});

providerNames.forEach(name => {

  const strategyDetails = {...$.providers[name].strategy}
  strategyDetails.callbackURL = `/auth/${name}/cb`;

  const { Strategy } = require($.providers[name].package);
  
  passport.use(
    new Strategy(strategyDetails, (accessToken, refreshToken, profile, done) => {
      return done(null, {
        provider: name,
        identifier  : trimToUndefined(profile.id),
        name        : trimToUndefined(profile.displayName),
        picture     : (first(profile.photos) || {}).value,
        email       : getEmailText((first(profile.emails) || {}).value)
      })
    })
  );

  router.get(`/auth/${name}`,       sessionForbidden, passport.authenticate(name, $.providers[name].request));
  router.get(`/auth/${name}/link`,  setupLink,        passport.authenticate(name, $.providers[name].request));
  router.get(`/auth/${name}/cb`,                      passport.authenticate(name), handleLinkOrLogin);
});

router.get('/auth/:providerName/unlink', sessionRequired, handleUnlink);

router.get('/', (req, res) => { 
  res.render('home', { user: (req.session || {}).user }); 
});

module.exports = router;
