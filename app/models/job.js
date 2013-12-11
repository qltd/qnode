
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
 * Job schema
 */

var JobSchema = new Schema({
  title: {
    type: String,
    validate: [ validate.notNull, msg.title.isNull ]
  },
  body: String,
  slug: String,
  changeLog: [ ChangeLogSchema ]
});

/**
 * Virtuals
 */

JobSchema.virtual('_meta')
  .set(function(metaData) {
    this.__meta = metaData;
  })
  .get(function() { 
    return this.__meta; 
  });

/**
 * Named scopes
 */

JobSchema.namedScope('index', function() {
  return this.populate('changeLog.user').sort('title');
});

/**
 * Pre-validation hook; Sanitizers
 */

JobSchema.pre('validate', function (next) {
  this.title = sanitize(this.title).xss();
  this.body = sanitize(this.body).xss();
  next();
});

/**
 * Pre-save hook; Sanitizers
 */

JobSchema.pre('save', function (next) {
  this.slug = toSlug(this.title);

  // log changes
  this.changeLog.push(ChangeLogSchema.methods.getData(this));
  next();
});

mongoose.model('Job', JobSchema);
