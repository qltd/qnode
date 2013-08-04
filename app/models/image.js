
/**
 * Module dependencies
 */

var message = require('../../config/messages.js')
  , mongoose = require('mongoose')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , validate = require('../../lib/utils').check;

