
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
  height: Number,
  id: String,
  position: String,
  size: Number,
  src: String,
  srcRetina: String,
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
    this.srcRetina = '/images/uploads/' + pathParts[1] + '@2x.' + pathParts[2];
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

/*    fileArray.forEach(function (file, key)) {

    }*/

    imageFieldArray.forEach(function (img, key) {
      if (fileArray[key] && fileArray[key].name) { /** handle new image */
        img = _.extend(img, fileArray[key]);
        Q.fcall(fs.rename, img.tmpPath, img.sysPathRetina)
          .then(function () {
            /** create half-sized, non-retina version */
            gm(img.sysPathRetina)
              .quality(100)
              .resize('50%')
              .write(img.sysPath, function (err) {
                if (err) throw err;
              });
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

    /** iterate through file-field form array objects */
    fileArray.forEach(function (file, key) {
      if (file.name) { /** new file */
    
        /** create new Image object for images array; omit old data, if it exists, when merging with file */
        images.push(new Image(_.extend(file, _.omit(dataArray[key], 'name', 'type', 'size'))));

        /** move tmp file to retina path */
        fs.rename(file.path, images[key].sysPathRetina, function (err) {
          if (err) throw err;

          /** create half-sized, non-retina version */
          gm(images[key].sysPathRetina)
            .quality(100)
            .resize('50%')
            .write(images[key].sysPath, function (err) {
              if (err) throw err;
            });
        });

      } else if (file.path) { /** no new file, remove tmp file */

        /** recreate existing (unreplaced) Image objects for images array; will reflect changes to data */
        if (dataArray[key].name) images.push(new Image(dataArray[key]));

        /** remove temp file */
        fs.unlink(file.path, function (err) {
          if (err) throw err;
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
