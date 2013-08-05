
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
  data: Object
});

/**
 * Methods 
 */

ChangeLogSchema.methods = {
  // convert mongo object into data for changelog
  getData: function (data) {
    var dataObj = {};
    if (data) {
      var dataKeys = Object.keys(data['_doc']);
      dataKeys.forEach(function (key) {
        if (key != '_id' && key != 'changeLog') {
          dataObj[key] = data['_doc'][key];
        }
      }); 
    }
    return dataObj;
  }
}

mongoose.model('ChangeLog', ChangeLogSchema);
