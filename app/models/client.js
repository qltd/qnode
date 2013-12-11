
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
 * Client Schema
 */

var ClientSchema = new Schema({
  title: {
    type: String,
    validate: [ validate.notNull, msg.title.isNull ]
  },
  url: {
    type: String,
    validate: [ validate.isUrl, msg.url.notUrl ]
  },
  position: {
    type: Number,
    validate: [ validate.isNumeric, msg.position.notNumeric ]
  },
  slug: String,
  image: [ ImageSchema ],
  changeLog: [ ChangeLogSchema ]
});

/**
 * Virtuals
 */

ClientSchema.virtual('_meta')
  .set(function(metaData) {
    this.__meta = metaData;
  })
  .get(function() { 
    return this.__meta; 
  });

/**
 * Named scopes
 */

ClientSchema.namedScope('index', function() {
  return this.populate('changeLog.user').sort('title');
});

/**
 * Pre-validation hook; Sanitizers
 */

ClientSchema.pre('validate', function(next) {
  this.title = sanitize(this.title).escape();
  this.url = sanitize(this.url).xss();
  this.position = sanitize(this.position).toInt();
  next();
});

/**
 * Pre-save hook
 */

ClientSchema.pre('save', function(next) {
  this.slug = toSlug(this.title);

  // log changes
  this.changeLog.push(ChangeLogSchema.methods.getData(this));
  next();
});

mongoose.model('Client', ClientSchema);
