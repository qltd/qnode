
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

var ChangeLogSchema = mongoose.model('ChangeLog').schema
  , ImageSchema = mongoose.model('Image').schema;

/**
 * Project schema
 */

var ProjectSchema = new Schema({
  title: {
    type: String,
    validate: [ validate.notNull, msg.title.isNull ]
  },
  body: String,
  services: String,
  slug: String,
  changeLog: [ ChangeLogSchema ],
  coverImage: [ ImageSchema ],
  images: [ ImageSchema ]
});

/**
 * Virtuals
 */

ProjectSchema.virtual('_meta')
  .set(function(metaData) {
    this.__meta = metaData;
  })
  .get(function() { 
    return this.__meta; 
  });

/**
 * Named scopes
 */

ProjectSchema.namedScope('index', function() {
  return this.populate('changeLog.user').sort('title');
});

/**
 * Pre-validation hook; Sanitizers
 */

ProjectSchema.pre('validate', function(next) {
  this.title = sanitize(this.title).escape();
  this.body = sanitize(this.body).xss();
  this.services = sanitize(this.services).escape();
  next();
});

/**
 * Pre-save hook; Sanitizers
 */

ProjectSchema.pre('save', function(next) {
  this.slug = toSlug(this.title);
  // log changes
  this.changeLog.push(ChangeLogSchema.methods.getData(this));
  next();
});

mongoose.model('Project', ProjectSchema);
