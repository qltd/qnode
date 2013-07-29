/**
 * Module dependencies
 */

var crypto = require('crypto')
  , message = require('../../config/messages.js')['user']
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema

var sanitize = require('../../lib/utils').sanitizors
  , validate = require('../../lib/utils').check;

/**
 * Contact schema
 */

var UserSchema = new Schema({
  username: { 
    type: String, 
    validate: [validate.notNull, message.username.isNull], 
    index: { unique: true } 
  },
  email: { 
    type: String, 
    validate: [
      { 
        validator: validate.isEmail, 
        msg: message.email.notValid 
      },
      {
        validator: validate.notNull,
        msg: message.email.isNull 
      }
    ]
  },
  hash: String,
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
    this.hash = this.encrypt(password, this.salt);
  })
  .get(function() { return this._password; });

/**
 * Validations
 */

UserSchema.path('hash').validate(function(v){
  if (!validate.notNull(this._password)) {
    this.invalidate('password', message.password.isNull);
  }
}, null);

UserSchema.pre('save', function(next) {
  if (!this.isNew) return next();
  next();
});

/**
 * Methods 
 */

UserSchema.methods = {
  authenticate: function(plainText,salt) {
    return this.hash === this.encrypt(plainText,salt);
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
