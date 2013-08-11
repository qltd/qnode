
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

var msg = require('../../config/messages')
  , sanitize = require('validator').sanitize
  , validate = require('../../lib/utils').check;

/**
 * Panel schema
 */

var PanelSchema = new Schema({
  title: {
    type: String,
    validate: [ validate.notNull, msg.title.isNull ]
  },
  body: String,
  slug: String,
  parentView: { type: String, default: 'home' },
  changeLog: [ ChangeLogSchema ]
});

/**
 * Virtuals
 */

PanelSchema.virtual('_meta')
  .set(function(metaData) {
    this.__meta = metaData;
  })
  .get(function() { 
    return this.__meta; 
  });

/**
 * Named scopes
 */

PanelSchema.namedScope('home', function() {
  return this.where('parentView', 'home');
});

PanelSchema.namedScope('index', function() {
  return this.populate('changeLog.user').sort('title');
});

/**
 * Pre-validation hook; Sanitizers
 */

PanelSchema.pre('validate', function (next) {
  this.title = sanitize(this.title).escape();
  this.body = sanitize(this.body).xss();
  next();
});

/**
 * Pre-save hook; Sanitizers
 */

PanelSchema.pre('save', function (next) {
  this.slug = toSlug(this.title);

  // log changes
  this.changeLog.push(ChangeLogSchema.methods.getData(this));
  next();
});

mongoose.model('Panel', PanelSchema);
