/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * Contact schema
 */

var UserSchema = new Schema({
  name: String,
  email: String,
  role: String,
  date: { type: Date, default: Date.now }
});

/**
 * Validations
 */

/**
 * Model declaration
 */ 

mongoose.model('User', UserSchema);
