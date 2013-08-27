
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * Change log schema
 */

var ChangeLogSchema = new Schema({
  user: { 
    type : Schema.ObjectId, 
    ref : 'User' 
  },
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
    return { data: dataObj, user: data._meta.userId };
  }
}

mongoose.model('ChangeLog', ChangeLogSchema);
