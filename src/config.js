const pkg = require('../package.json');

module.exports = {
  name        : pkg.name,
  description : pkg.description,
  port        : process.env.NODE_PORT || 3000,

  db: {
    uri : process.env.DB_URI || '',
    options: { 
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  jwt: {
    token : {
      expiry  : {
        duration  : 'hours',
        quantity  : 24,
      },
      maxAge  : 24 * 60 * 60 * 1000,
      secret  : 'abc123'
    },
    cookie : {
      name    : 'auth-cookie',
    }
  },

  providers: {
    google: {
      package: 'passport-google-oauth20',
      strategy: {
        clientID      : process.env.GOOGLE_APP_ID || '',
        clientSecret  : process.env.GOOGLE_SECRET || '',
      },
      request: {
        scope: [
          'profile', 'email'
        ]
      },
      exchange: undefined
    },
    facebook: {
      package: 'passport-facebook',
      strategy: {
        clientID      : process.env.FACEBOOK_APP_ID || '',
        clientSecret  : process.env.FACEBOOK_SECRET || '',
        profileFields : ['id', 'displayName', 'photos', 'email']
      },
      request: {
        scope: [
          'public_profile'
        ]
      },
      exchange: undefined
    }    
  }
}
