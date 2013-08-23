
/**
 * Module dependencies
 */

var fs = require('fs')
  , mongoose = require('mongoose')
  , Q = require('q')
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
    this._name = name;
    this.fileName = this._name;
    this.sysPath = './public/images/uploads/' + this._name;
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
  addImages: function (imageFieldArray, fileArray) {
    imageFieldArray.forEach(function (img, key) {
      if (fileArray[key] && fileArray[key].name) { /** handle new image */
        img = _.extend(img, fileArray[key]);
        Q.fcall(fs.rename, img.tmpPath, img.sysPath)
          .then(function () {
            return true;
          })
          .fail(function (err) {
            return res.render('500');
          });
      } else if (fileArray[key] && fileArray[key].path) { /** no image, remove tmp file and data */
        Q.fcall(fs.unlink, fileArray[key].path)
          .then(function () {
            return true;
          })
          .fail(function (err) {
            return res.render('500');
          });
        img.remove();
      } else { /** no image, no tmp file, remove data */
        img.remove();
      }
    })
    return imageFieldArray;
  },
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
        Q.fcall(fs.rename, images[key].tmpPath, images[key].sysPath)
          .then(function () {
            return true;
          })
          .fail(function (err) {
            console.log(err);
            return res.render('500');
          });
      } else if (img.path) { /** no image, remove tmp file */
        Q.fcall(fs.unlink, img.path)
          .then(function () {
            return true;
          })
          .fail(function (err) {
            console.log(err);
            return res.render('500');
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
