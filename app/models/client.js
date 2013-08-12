
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
  slug: String,
  image: [ ImageSchema ],
  changeLog: [ ChangeLogSchema ]
});

/**
 * Pre-validation hook; Sanitizers
 */

ClientSchema.pre('validate', function (next) {
  this.title = sanitize(this.title).escape();
  next();
});

/**
 * Pre-save hook
 */

ClientSchema.pre('save', function (next) {
  this.slug = toSlug(this.title);

  // log changes
  this.changeLog.push(ChangeLogSchema.methods.getData(this));
  next();
});

mongoose.model('Client', ClientSchema);
