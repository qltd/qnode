
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * Image schema
 */

var ImageSchema = new Schema({
  name : String,
  title : String,
  position : Number
});

/*var ImageSchema = new Schema({
  alt: String,
  class: [ String ],
  height: Number,
  id: String,
  src: String,
  style: String,
  width: Number
});*/

mongoose.model('Image', ImageSchema);
