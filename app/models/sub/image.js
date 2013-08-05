
/**
 * Module dependencies
 */

var message = require('../../../config/messages.js')
  , mongoose = require('mongoose')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , validate = require('../../../lib/utils').check;

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
  width: Number,
  _log: [ { username: String, date: { type: Date, default: Date.now } } ]
});*/

mongoose.model('Image', ImageSchema);
