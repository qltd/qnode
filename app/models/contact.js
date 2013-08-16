
/**
 * Module dependencies
 */

var nodemailer = require('nodemailer')
  , mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , transport = nodemailer.createTransport('Sendmail')
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
  comments: {
    type: String,
    validate: [ validate.notNull, msg.comments.isNull ]
  },
  slug: String
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
 * Pre-save hook
 */

ContactSchema.pre('save', function (next) {
  this.slug = toSlug(this.name);
  next();
});

/**
 * Post-save hook
 */

ContactSchema.post('save', function (contact) {
  var mailOptions = {
      from: 'web@qltd.com',
      to: 'mike@qltd.com',
      subject: 'qltd.com: New Message for Q from ' + contact.name,
      text: 'From: ' + contact.name + ' (' + contact.email + ')\nCompany: ' + contact.company + '\nComments: ' + contact.comments
  }
  transport.sendMail(mailOptions);
});

mongoose.model('Contact', ContactSchema);
