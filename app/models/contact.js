/**
 * Module dependencies
 */

var message = require('../../config/messages.js')['contact']
  , mongoose = require('mongoose')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , validate = require('../../lib/utils').check;

/**
 * Contact schema
 */

var ContactSchema = new Schema({
  name: {
    type: String,
    validate: [validate.notNull, message.name.isNull]
  },
  email: {
    type: String,
    validate: [
      {validator: validate.isEmail, msg: message.email.notEmail},
      {validator: validate.notNull, msg: message.email.isNull}
    ]
  },
  company: String,
  comments: String,
  dateCreated: { type: Date, default: Date.now }
});

/**
 * Pre-validation hook; Sanitizers
 */

ContactSchema.pre('validate', function(next) {
  this.name = sanitize(this.name).escape();
  this.email = sanitize(this.email).escape();
  this.company = sanitize(this.company).escape();
  this.comments = sanitize(this.comments).escape();
  next();
});

/**
 * Validations
 */

/**
 * Model declaration
 */ 

mongoose.model('Contact', ContactSchema);
