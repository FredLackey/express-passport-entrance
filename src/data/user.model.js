const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;

const userSchema = new Schema({

  name      : String,
  picture   : String,
  email     : String,

  google    : String,
  facebook  : String,

  hash      : String,
  salt      : String
});

const User = mongoose.model('user', userSchema);

module.exports = User;
