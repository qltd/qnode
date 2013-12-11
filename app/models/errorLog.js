
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * Error log schema
 */

var ErrorLogSchema = new Schema({
  method: String,
  referer: String,
  stack: String,
  status: Number,
  url: String,
  user: { 
    type : Schema.ObjectId, 
    ref : 'User' 
  }
});

/**
 * Named scopes
 */

ErrorLogSchema.namedScope('index', function () {
  return this.populate('user').sort('-_id');
});

mongoose.model('ErrorLog', ErrorLogSchema);
