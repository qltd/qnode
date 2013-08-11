
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

var message = require('../../config/messages.js')
  , sanitize = require('validator').sanitize
  , validate = require('../../lib/utils').check;

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
 * Virtuals
 */

ServiceSchema.virtual('_meta')
  .set(function(metaData) {
    this.__meta = metaData;
  })
  .get(function() { 
    return this.__meta; 
  });

/**
 * Named scopes
 */

ServiceSchema.namedScope('index', function() {
  return this.populate('changeLog.user').sort('title');
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
  this.changeLog.push(ChangeLogSchema.methods.getData(this));
  next();
});

mongoose.model('Service', ServiceSchema);
