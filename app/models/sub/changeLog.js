
/**
 * Module dependencies
 */

var message = require('../../../config/messages.js')
  , mongoose = require('mongoose')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , validate = require('../../../lib/utils').check;

/**
 * Change log schema
 */

var ChangeLogSchema = new Schema({
  username: { type: String, default: 'anonymous' }, 
  data: Schema.Types.Mixed
});

mongoose.model('ChangeLog', ChangeLogSchema);
