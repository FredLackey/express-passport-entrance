const $         = require('./config');
const cookies   = require('cookie-parser');
const express   = require('express');
const passport  = require('passport');
const path      = require('path');
const mongoose  = require('mongoose');
const routes    = require('./routes');

const app = express();

app.use(cookies());

app.use(passport.initialize());

app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(routes);

mongoose.connect($.db.uri, $.db.options, (err) => {
  if (err) { throw err; }

  app.listen($.port, (err) => {
    if (err) { throw err; }

    console.info(`${$.description} v${$.version}`);
    console.info(`PORT: ${$.port}`);
  });
});
