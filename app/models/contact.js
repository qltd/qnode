
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * Schema dependencies; subdocuments
 */

var ChangeLogSchema = mongoose.model('ChangeLog').schema;

/**
 * Other dependencies
 */

var msg = require('../../config/messages')
  , sanitize = require('validator').sanitize
  , validate = require('../../lib/utils').check;

/**
 * Contact schema
 */

var ContactSchema = new Schema({
  name: {
    type: String,
    validate: [ validate.notNull, msg.name.isNull ]
  },
  email: {
    type: String,
    validate: [
      { validator: validate.isEmail, msg: msg.email.notEmail },
      { validator: validate.notNull, msg: msg.email.isNull }
    ]
  },
  company: String,
  comments: String
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
