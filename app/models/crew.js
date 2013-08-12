
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
 * Crew schema
 */

var CrewSchema = new Schema({
  title: String,
  subTitle: String,
  body: String,
  slug: String,
  image: [ ImageSchema ],
  changeLog: [ ChangeLogSchema ]
});

/**
 * Virtuals
 */

CrewSchema.virtual('_meta')
  .set(function(metaData) {
    this.__meta = metaData;
  })
  .get(function() { 
    return this.__meta; 
  });

/**
 * Named scopes
 */

CrewSchema.namedScope('index', function() {
  return this.populate('changeLog.user').sort('title');
});

/**
 * Pre-save hook
 */

CrewSchema.pre('save', function(next) {
  this.slug = toSlug(this.title);

  // log changes
  this.changeLog.push(ChangeLogSchema.methods.getData(this));
  next();
});

mongoose.model('Crew', CrewSchema);
