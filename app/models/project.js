/**
 * Module dependencies
 */

var message = require('../../config/messages')['project']
  , mongoose = require('mongoose')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , validate = require('../../lib/utils').check;


/**
 * Subdocument schemas
 */

var ChangeLogSchema = mongoose.model('ChangeLog').schema;
var ImageSchema = mongoose.model('Image').schema;

/**
 * Project schema
 */

var ProjectSchema = new Schema({
  client: {
    type: String,
    validate: [ validate.notNull, message.client.isNull ]
  },
  slug: String,
  description: String,
  image: [ ImageSchema ],
  changeLog: [ ChangeLogSchema ]
});

/*var ProjectSchema = new Schema({
  title: String,
  body: String,
  portfolioImages: [{
    sort: Number,
    image: ImageSchema
  }],
  slug: String,
  dateCreated: { type: Date, default: Date.now },
  dateModified: { type: Date, default: Date.now }
});*/

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
 * Pre-validation hook; Sanitizers
 */

ProjectSchema.pre('validate', function(next) {
  this.client = sanitize(this.client).escape();
  this.description = sanitize(this.description).xss();
  next();
});

/**
 * Pre-save hook; Sanitizers
 */

ProjectSchema.pre('save', function(next) {
  this.slug = toSlug(this.client);
  // log changes
  this.changeLog.push(ChangeLogSchema.methods.getData(this));
  next();
});

mongoose.model('Project', ProjectSchema);
