
/**
 * Module dependencies
 */

var fs = require('fs')
  , im = require('imagemagick')
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
  height: Number,
  id: String,
  position: String,
  size: Number,
  src: String,
  style: String,
  sysPath: String,
  sysPathRetina: String,
  title: String,
  tmpPath: String,
  type: String,
  width: Number
});

/**
 * Virtuals
 */

ImageSchema.virtual('name')
  .set(function (name) {
    var pathParts = name.match(/(.*)\.(.{3,4})$/);
    pathParts[1] = toSlug(sanitize(pathParts[1]).escape());
    pathParts[2] = sanitize(pathParts[2].toLowerCase()).escape();
    this._name = pathParts[1] + '.' + pathParts[2];
    this.fileName = this._name;
    this.sysPath = 'public/images/uploads/' + this._name;
    this.sysPathRetina = 'public/images/uploads/' + pathParts[1] + '@2x.' + pathParts[2];
    this.src = '/images/uploads/' + this._name;
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
  /**
   * Adds images to a mongoose-modeled object, and moves files from temp to permanent storage
   * 
   * @param {Array} imageFieldArray - Parent object image field values
   * @param {Array} fileArray - File-field form values
   * @returns {Array} Return a populated image field array
   */
  addImages: function (imageFieldArray, fileArray) {
    imageFieldArray.forEach(function (img, key) {
      if (fileArray[key] && fileArray[key].name) { /** handle new image */
        img = _.extend(img, fileArray[key]);
        Q.fcall(fs.rename, img.tmpPath, img.sysPathRetina)
          .then(function () {
            console.log('just before imagemagick');
            return Q.fcall(im.resize, {
              srcPath: img.sysPathRetina,
              dstPath: img.sysPath,
              quality: 1,
              width:   '50%'
            }); /** create half-sized, non-retina version */
          })
          .then(function (stdout, stderr) {
            console.log('just after imagemagick');
            console.log(stdout);
            console.log(stderr);
            return true;
          })
          .fail(function (err) {
            throw err;
          });
      } else if (fileArray[key] && fileArray[key].path) { /** no image, remove tmp file and data */
        Q.fcall(fs.unlink, fileArray[key].path)
          .then(function () {
            return true;
          })
          .fail(function (err) {
            throw err;
          });
        img.remove();
      } else { /** no image, no tmp file, remove data */
        img.remove();
      }
    })
    return imageFieldArray;
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
  updateImages: function (parentModel, updateQuery, fieldName, dataArray, fileArray) {
    var Image = mongoose.model('Image');
    var images = [];

    /** construct fresh array of images from available data */
    dataArray.forEach(function (img, key) {
      if (fileArray[key].name && img.name) { /** new file, old data */
        images.push(new Image(_.extend(fileArray[key], _.omit(img, 'name', 'type', 'size'))));
      } else if (fileArray[key].name && !img.name) { /** new file, new data */
        images.push(new Image(_.extend(fileArray[key], img)));
      } else if (img.name) { /** old file, potentially new data */
        images.push(new Image(img));
      }
    });

    /** handle file data */
    fileArray.forEach(function (img, key) {
      if (img.name) { /** new image */
        Q.fcall(fs.rename, images[key].tmpPath, images[key].sysPathRetina)
          .then(function () {
            console.log('just before imagemagick');
            return Q.fcall(im.resize, {
              srcPath: images[key].sysPathRetina,
              dstPath: images[key].sysPath,
              quality: 1,
              width:   '50%'
            }); /** create half-sized, non-retina version */
          })
          .then(function (stdout, stderr) {
            console.log('just after imagemagick');
            console.log(stdout);
            console.log(stderr);
            return true;
          })
          .fail(function (err) {
            throw err;
          });
      } else if (img.path) { /** no image, remove tmp file */
        Q.fcall(fs.unlink, img.path)
          .then(function () {
            return true;
          })
          .fail(function (err) {
            throw err;
          });
      }
    });

    /** prepare update, and return a promise */
    var updateData = {};
    updateData[fieldName] = images;
    return Q.ninvoke(parentModel, 'update', updateQuery, updateData);
  }
}

mongoose.model('Image', ImageSchema);
