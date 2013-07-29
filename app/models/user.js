/**
 * Module dependencies
 */

var crypto = require('crypto')
  , message = require('../../config/messages.js')['user']
  , mongoose = require('mongoose')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , validate = require('../../lib/utils').check;

/**
 * Contact schema
 */

var UserSchema = new Schema({
  username: { 
    type: String, 
    validate: [ validate.notNull, message.username.isNull ], 
    index: { unique: true }
  },
  email: { 
    type: String, 
    validate: [
      { validator: validate.isEmail, msg: message.email.notEmail },
      { validator: validate.notNull, msg: message.email.isNull }
    ]
  },
  hash: String,
  salt: String,
  role: { type: String, default: 'user' },
  dateCreated: { type: Date, default: Date.now },
  dateModified: { type: Date, default: Date.now }
});

/**
 * Virtuals
 */

UserSchema.virtual('password')
  .set(function(password) {
    this._password = sanitize(password).escape();
    this.salt = this.makeSalt();
    this.hash = this.encrypt(this._password, this.salt);
  })
  .get(function() { return this._password; });

/**
 * Pre-validation hook; Sanitizers
 */

UserSchema.pre('validate', function(next) {
  this.username = sanitize(this.username).escape();
  this.email = sanitize(this.email).escape();
  next();
});

/**
 * Validations
 */

UserSchema.path('hash').validate(function(v){
  if (!validate.notNull(this._password)) {
    this.invalidate('password', message.password.isNull);
  }
}, null);

/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
  if (!this.isNew) return next();

  // force all users into the role 'user' until we can authenticate account creators that can assign higher roles
  this.role = 'user';
  next();
});

/**
 * Methods 
 */

UserSchema.methods = {
  authenticate: function(plainText,salt) {
    return this.hash === this.encrypt(sanitize(plainText).escape(),salt);
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
