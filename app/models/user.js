/**
 * Module dependencies
 */

var crypto = require('crypto')
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * Contact schema
 */

var UserSchema = new Schema({
  username: { 
    type: String, 
    validate: [validatePresenceOf, 'Username is a required field!'], 
    index: { unique: true } 
  },
  email: String,
  hashed_password: String,
  salt: String,
  role: String,
  date: { type: Date, default: Date.now }
});

/**
 * Virtuals
 */

UserSchema.virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encrypt(password, this.salt);
  })
  .get(function() { return this._password; });

/**
 * Validations
 */

function validatePresenceOf(value) {
  return value && value.length;
}

/**
 * Methods 
 */

UserSchema.methods = {
  authenticate: function(plainText,salt) {
    return this.hashed_password === this.encrypt(plainText,salt);
  },
  encrypt: function(plainText,salt) {
    var hash = crypto.createHmac("sha512", salt)
      .update(plainText)
      .digest("base64");
    return hash;
  },
  makeSalt: function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  }
}

mongoose.model('User', UserSchema);
