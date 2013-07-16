/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * Contact schema
 */

var ContactSchema = new Schema({
  name: String,
  email: String,
  company: String,
  comments: String,
  date: { type: Date, default: Date.now }
});

/**
 * Validations
 */

/**
 * Model declaration
 */ 

mongoose.model('Contact', ContactSchema);
