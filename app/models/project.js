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

var ImageSchema = mongoose.model('Image').schema;

/**
 * Project schema
 */

var ProjectSchema = new Schema({
  client: {
    type: String,
    validate: [ validate.notNull, message.client.isNull ]
  },
  machine: String,
  description: String,
  image: [ ImageSchema ],
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

/**
 * Pre-save hook; Sanitizers
 */

ProjectSchema.pre('save', function(next) {
  this.machine = this.client.toLowerCase().replace(/ /g, '-');
  next();
});

/*mongoose.model('Image', ImageSchema);*/
mongoose.model('Project', ProjectSchema);
