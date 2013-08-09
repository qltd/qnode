
/**
 * Module dependencies
 */

var message = require('../../../config/messages.js')
  , mongoose = require('mongoose')
  , Q = require('q')
  , sanitize = require('validator').sanitize
  , Schema = mongoose.Schema
  , validate = require('../../../lib/utils').check;

/**
 * Change log schema
 */

var ChangeLogSchema = new Schema({
  user: { type : Schema.ObjectId, ref : 'User' },
  username: { type: String, default: 'anonymous' }, 
  data: Object
});

/**
 * Methods 
 */

ChangeLogSchema.methods = {
  // convert mongo/mongoose object into data for changeLog
  getData: function (data) {
    var dataObj = {};
    if (data) {
      var dataKeys = Object.keys(data['_doc']);
      dataKeys.forEach(function (key) {
        if (key != '_id' && key != 'changeLog') {
          if (key == '__v') data['_doc'][key]++;
          dataObj[key] = data['_doc'][key];
        }
        if (!dataObj['__v']) dataObj['__v'] = 0;
      }); 
    }
    return dataObj;
  }
}

/**
 * Post-init hook
 */

ChangeLogSchema.post('init', function (changeLog, next, done) {});

mongoose.model('ChangeLog', ChangeLogSchema);
