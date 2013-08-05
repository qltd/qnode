/**
 * Module dependencies
 */

var message = require('../../config/messages.js')['panel']
  , mongoose = require('mongoose')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , validate = require('../../lib/utils').check;

/**
 * Subdocument schemas
 */

var ChangeLogSchema = mongoose.model('ChangeLog').schema;

/**
 * Panel schema
 */

var PanelSchema = new Schema({
  title: {
    type: String,
    validate: [ validate.notNull, message.title.isNull ]
  },
  body: String,
  parentView: { type: String, default: 'home' },
  changeLog: [ ChangeLogSchema ]
});

/**
 * Named scopes
 */

PanelSchema.namedScope('home', function() {
  return this.where('parentView', 'home');
});

/**
 * Pre-validation hook; Sanitizers
 */

PanelSchema.pre('validate', function(next) {
  this.title = sanitize(this.title).escape();
  this.body = sanitize(this.body).xss();
  next();
});

/**
 * Pre-save hook; Sanitizers
 */

PanelSchema.pre('save', function(next) {
  // log changes
  this.changeLog = { data: ChangeLogSchema.methods.getData(this) };
  next();
});

mongoose.model('Panel', PanelSchema);
