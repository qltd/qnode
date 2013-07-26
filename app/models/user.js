/**
 * Module dependencies
 */

var crypto = require('crypto')
  , message = require('../../config/messages.js')['user']
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * Contact schema
 */

var UserSchema = new Schema({
  username: { 
    type: String, 
    default: '',
    validate: [validatePresenceOf, message.username.notPresent], 
    index: { unique: true } 
  },
  email: String,
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

UserSchema.path('hash').validate(function(v){
  if (!this._password) {
    this.invalidate('password', 'enter it, yo!');
  }
}, null);

/**
 * Validations
 */

function validatePresenceOf(value) {
  return value && value.length;
}

// consider moving all validators here -- not doing so causes some validators to not be triggered in the presence of other validation errors
UserSchema.pre('save', function(next) {
  if (!this.isNew) return next();

/*  try {
    check('email', 'please enter a valid email').isEmail();
  } catch(e) {
    next(new Error(e));
  }*/
  
  next();
/*  if (!validatePresenceOf(this.password))
    next(new Error(message.password.notPresent));
  else
    next();*/
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
