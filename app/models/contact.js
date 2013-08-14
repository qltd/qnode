
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , validate = require('../../lib/utils').check;

/**
 * Schema dependencies; subdocuments
 */

var ChangeLogSchema = mongoose.model('ChangeLog').schema;

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

mongoose.model('Contact', ContactSchema);
