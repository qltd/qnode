

/**
 * Module dependencies
 */

var message = require('../../config/messages.js')
  , mongoose = require('mongoose')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , validate = require('../../lib/utils').check;

/**
 * Subdocument schemas
 */

var ChangeLogSchema = mongoose.model('ChangeLog').schema;

/**
 * Service schema
 */

var ServiceSchema = new Schema({
  title: {
    type: String,
    validate: [ validate.notNull, message.title.isNull ]
  },
  body: String,
  slug: String,
  position: Number,
  changeLog: [ ChangeLogSchema ]
});

/**
 * Named scopes
 */

ServiceSchema.namedScope('index', function() {
  return this.sort('title');
});
ServiceSchema.namedScope('positioned', function() {
  return this.sort('position');
});

/**
 * Pre-validation hook; Sanitizers
 */

ServiceSchema.pre('validate', function (next) {
  this.title = sanitize(this.title).xss();
  this.body = sanitize(this.body).xss();
  next();
});

/**
 * Pre-save hook; Sanitizers
 */

ServiceSchema.pre('save', function (next) {
  this.slug = toSlug(this.title);
  // log changes
  this.changeLog.push({ data: ChangeLogSchema.methods.getData(this) });
  next();
});

mongoose.model('Service', ServiceSchema);
