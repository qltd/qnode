/**
 * Module dependencies
 */

var message = require('../../config/messages.js')['panel']
  , mongoose = require('mongoose')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , validate = require('../../lib/utils').check;


/**
 * Panel schema
 */

var PanelSchema = new Schema({
  title: {
    type: String,
    validate: [ validate.notNull, message.title.isNull ]
  },
  body: String,
  dateCreated: { type: Date, default: Date.now },
  dateModified: { type: Date, default: Date.now }
});

/**
 * Pre-validation hook; Sanitizers
 */

PanelSchema.pre('validate', function(next) {
  this.title = sanitize(this.title).escape();
  this.body = sanitize(this.body).xss();
  next();
});

mongoose.model('Panel', PanelSchema);
