
/**
 * Module dependencies
 */

var fs = require('fs')
  , gm = require('gm')
  , mongoose = require('mongoose')
  , Q = require('q')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , _ = require('underscore');

/**
 * Image schema
 */

var ImageSchema = new Schema({
  alt: String,
  body: String,
  class: [ String ],
  fileName: String,
  id: String,
  info: Object,
  position: Number,
  size: Number,
  src: String,
  srcRetina: String,
  style: String,
  sysPath: String,
  sysPathRetina: String,
  title: String,
  tmpPath: String,
  type: String
});

/**
 * Virtuals
 */

ImageSchema.virtual('name')
  .set(function (name) {
    var pathParts = name.match(/(.*)\.(.{3,4})$/);
    var _filename = ( pathParts && pathParts[1] ? toSlug(sanitize(pathParts[1]).escape()) : toSlug(sanitize(name).escape()) );
    var _extension = ( pathParts && pathParts[2] ? '.' + sanitize(pathParts[2].toLowerCase()).escape() : '' );
    this._name = _filename + _extension;
    this.fileName = this._name;
    this.sysPath = 'public/images/uploads/' + this._name;
    this.sysPathRetina = 'public/images/uploads/' + _filename + '@2x' + _extension;
    this.src = '/images/uploads/' + this._name;
    this.srcRetina = '/images/uploads/' + _filename + '@2x' + _extension;
  })
  .get(function () { 
    return this._name; 
  });

ImageSchema.virtual('path')
  .set(function (path) {
    this._path = path;
    this.tmpPath = this._path;
  })
  .get(function () { 
    return this._path; 
  });

/**
 * Methods 
 */

ImageSchema.methods = {
  addImageInfo: function (path) {
    var file = gm(path);
    return Q.ninvoke(file, 'identify');
  },

  /**
   * Adds images to a mongoose-modeled object, and moves files from temp to permanent storage
   * 
   * @param {Array} imageFieldArray - Parent object image field values
   * @param {Array} fileArray - File-field form values
   * @returns {Array} Return a populated image field array
   */
  create: function (imageFieldArray, fileArray) {
    var Image = ( imageFieldArray[0] ? imageFieldArray[0] : mongoose.model('Image').schema.methods );
    var images = [];

    /** iterate through file array */
    fileArray.forEach(function (file, key) {
      if (file.name && file.type && file.type.indexOf('image') > -1) { /** new file */

        /** extend Image object to contain file values, then add to images array */
        var img = _.extend(imageFieldArray[key], file);
        images.push(img);

        /** move tmp file to retina path */
        fs.rename(file.path, img.sysPathRetina, function (err) {
          if (err) return err;

          /** create half-sized, non-retina version */
          gm(img.sysPathRetina)
            .quality(100)
            .resize('50%')
            .write(img.sysPath, function (err) {
              if (err) return err;
            });
        });

      } else if (file.path) { /** no new file; remove temp file */

        /** remove tmp file */
        fs.unlink(file.path, function (err) {
          if (err) return err;
        });
      }
    });

    return images;
  },

  /**
   * Restores Mongo subdocument images from an array of mongoose-modeled Image objects
   *
   * @param {Object} parentModel - A mongoose model
   * @param {Array} updateQuery - The filtering query that will be used to determine which models to update
   * @param {String} fieldName - The name of image-containing field in the parent mongoose model
   * @param {Array} imageDocs - An array of mongoose-modeled Image objects
   * @returns {Promise} Returns a then-able Promise which updates images in a mongoose-modeled object
   */
  restore: function (parentModel, updateQuery, fieldName, imageDocs) {
    /** prepare restore, and return a promise */
    imageDocs = ( imageDocs ? imageDocs : [] );
    var updateData = {};
    updateData[fieldName] = imageDocs;
    return Q.ninvoke(parentModel, 'update', updateQuery, updateData);
  },

  /**
   * Updates images in a mongoose-modeled object, and moves files from temp to permanent storage
   * 
   * @param {Object} parentModel - A mongoose model
   * @param {Array} updateQuery - The filtering query that will be used to determine which models to update
   * @param {String} fieldName - The name of image-containing field in the parent mongoose model
   * @param {Array} dataArray - Text-field form values
   * @param {Array} fileArray - File-field form values
   * @returns {Promise} Returns a then-able Promise which updates images in a mongoose-modeled object
   */
  update: function (parentModel, updateQuery, fieldName, dataArray, fileArray) {
    var Image = mongoose.model('Image');
    var images = [];

    /** iterate through file array */
    fileArray.forEach(function (file, key) {
      if (file.name && file.type && file.type.indexOf('image') > -1) { /** new file */
    
        /** create new Image object for images array; omit old data, if it exists, when merging with file */
        var img = new Image(_.extend(file, _.omit(dataArray[key], 'name', 'type', 'size')));
        images.push(img);

        /** move tmp file to retina path */
        fs.rename(file.path, img.sysPathRetina, function (err) {
          if (err) return err;

          /** create half-sized, non-retina version */
          gm(img.sysPathRetina)
            .quality(100)
            .resize('50%')
            .write(img.sysPath, function (err) {
              if (err) return err;
            });
        });

      } else if (file.path) { /** no new file, remove tmp file */

        /** recreate existing (unreplaced) Image objects for images array; will reflect changes to data */
        if (dataArray[key].name) images.push(new Image(dataArray[key]));

        /** remove tmp file */
        fs.unlink(file.path, function (err) {
          if (err) return err;
        });
      }
    });

    /** add Promises for image metadata */
    var _images = [];
    images.forEach(function (img) {
      _images.push(Image.schema.methods.addImageInfo(img.sysPathRetina));
    });

    /** return a Promise that resolves the array of image metadata Promises and returns a Promise for an update to the parent MongoDoc */
    return Q.all(_images)
      .then(function (infoset) {
        infoset.forEach(function (info, key) {
          images[key].info = _.omit(info, 'Png:IHDR.color-type-orig', 'Png:IHDR.bit-depth-orig');
        });

        /** prepare update data, then return a Promise for that update */
        var updateData = {};
        updateData[fieldName] = images;
        return Q.ninvoke(parentModel, 'update', updateQuery, updateData); 
      })
      .fail(function (err) {
        return err;
      })

  }
}

mongoose.model('Image', ImageSchema);
