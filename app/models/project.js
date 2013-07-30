/**
 * Module dependencies
 */

var message = require('../../config/messages.js')['project']
  , mongoose = require('mongoose')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , validate = require('../../lib/utils').check;


/**
 * Project schema
 */

var ProjectSchema = new Schema({
  client: {
    type: String,
    validate: [ validate.notNull, message.client.isNull ]
  },
  description: String,
  dateCreated: { type: Date, default: Date.now },
  dateModified: { type: Date, default: Date.now }
});

/**
 * Pre-validation hook; Sanitizers
 */

ProjectSchema.pre('validate', function(next) {
  this.client = sanitize(this.client).escape();
  this.description = sanitize(this.description).xss();
  next();
});

mongoose.model('Project', ProjectSchema);