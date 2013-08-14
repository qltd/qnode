
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
  position: {
    type: String,
    validate: [ validate.notNull, msg.position.isNull ]
  },
  body: String,
  firstName: {
    type: String,
    validate: [ validate.notNull, msg.name.first.isNull ]
  },
  lastName: {
    type: String,
    validate: [ validate.notNull, msg.name.last.isNull ]
  },
  middleName: String,
  email: {
    type: String,
    validate: [ validate.isEmail, msg.email.notEmail ]
  },
  twitterUser: String,
  dribbbleUser: String,
  gitHubUser: String, 
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
 * Pre-validation hook; Sanitizers
 */

CrewSchema.pre('validate', function(next) {
  this.body = sanitize(this.body).xss();
  this.position = sanitize(this.position).escape();
  this.firstName = sanitize(this.firstName).escape();
  this.lastName = sanitize(this.lastName).escape();
  this.middleName = sanitize(this.middleName).escape();
  this.email = sanitize(this.email).escape();
  this.twitterUser = sanitize(this.twitterUser).escape();
  this.dribbleUser = sanitize(this.dribbleUser).escape();
  this.gitHubUser = sanitize(this.gitHubUser).escape();
  
  next();
});

/**
 * Pre-save hook
 */

CrewSchema.pre('save', function(next) {
  this.title = this.firstName + ' ' + ( this.middleName ? this.middleName + ' ' : null ) + this.lastName;
  this.slug = toSlug(this.title);

  // log changes
  this.changeLog.push(ChangeLogSchema.methods.getData(this));
  next();
});

mongoose.model('Crew', CrewSchema);
