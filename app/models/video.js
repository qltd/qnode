
/**
 * Module dependencies
 */

var fs = require('fs')
  , mongoose = require('mongoose')
  , msg = require('../../config/messages')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , validate = require('../../lib/utils').check;

/**
 * Schema dependencies; subdocuments
 */

var ChangeLogSchema = mongoose.model('ChangeLog').schema;

/**
 * Video schema
 */

var VideoSchema = new Schema({
  body: String,
  mp4FileName: String,
  mp4Meta: Object,
  mp4Src: String,
  mp4SysPath: String,
  mp4TmpPath: String,
  oggFileName: String,
  oggMeta: Object,
  oggSrc: String,
  oggSysPath: String,
  oggTmpPath: String,
  slug: String,
  title: {
    type: String,
    validate: [ validate.notNull, msg.title.isNull ]
  },
  changeLog: [ ChangeLogSchema ]
});

/**
 * Named scopes
 */

VideoSchema.namedScope('index', function() {
  return this.populate('changeLog.user').sort('title');
});

VideoSchema.namedScope('notNull', function () {
  return this.where('mp4Src').ne(null).where('oggSrc').ne(null);
})

/**
 * Virtuals
 */

VideoSchema.virtual('_meta')
  .set(function(metaData) {
    this.__meta = metaData;
  })
  .get(function() { 
    return this.__meta; 
  });

VideoSchema.virtual('mp4')
  .set(function(mp4) {
    /** remove tmp file when no actual file is present */
    if (!mp4.name && mp4.path) return fs.unlink(mp4.path);

    /** if no file is present, and there is not a tmp file return nothing */
    else if (!mp4.name) return;

    /** set paths */
    this._mp4 = mp4;
    this.mp4FileName = this._mp4.name;
    this.mp4Src =  '/videos/uploads/' + this.mp4FileName;
    this.mp4SysPath = 'public/videos/uploads/' + this.mp4FileName;
    this.mp4TmpPath = this._mp4.path;

    /** move file from tmp to video uploads folder */
    fs.rename(this.mp4TmpPath, this.mp4SysPath, function (err) {
      if (err) return err;
    });
  })
  .get(function() { 
    return this._mp4; 
  });

VideoSchema.virtual('ogg')
  .set(function(ogg) {
    /** remove tmp file when no actual file is present */
    if (!ogg.name && ogg.path) return fs.unlink(ogg.path);

    /** if no file is present, and there is not a tmp file return nothing */
    else if (!ogg.name) return;

    /** set paths */
    this._ogg = ogg;
    this.oggFileName = this._ogg.name;
    this.oggSrc =  '/videos/uploads/' + this.oggFileName;
    this.oggSysPath = 'public/videos/uploads/' + this.oggFileName;
    this.oggTmpPath = this._ogg.path;

    /** move file from tmp to video uploads folder */
    fs.rename(this.oggTmpPath, this.oggSysPath, function (err) {
      if (err) return err;
    });
  })
  .get(function() { 
    return this._ogg; 
  });

/**
 * Pre-validation hook; Sanitizers
 */

VideoSchema.pre('validate', function (next) {
  this.title = sanitize(this.title).xss();
  next();
});

/**
 * Pre-save hook
 */

VideoSchema.pre('save', function(next) {
  this.slug = toSlug(this.title);

  // log changes
  this.changeLog.push(ChangeLogSchema.methods.getData(this));
  next();
});


mongoose.model('Video', VideoSchema);
