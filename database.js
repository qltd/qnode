// Database Interactions

// require mongoose within this script in addition to previous instantiation
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId; //not needed here, but may be needed in another model file

mongoose.connect('mongodb://localhost/qdb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('yay');
});

exports.db = db;
exports.mongoose = mongoose;


// schemas
exports.contactUsSchema = mongoose.Schema({
  name: String,
  email: String,
  company: String,
  comments: String,
  date: { type: Date, default: Date.now }
});


// support functions
/*contactUsSchema.methods.speak = function () {
  var sayThis = this.name
    ? "Thank you for your comments, " + this.name + "!"
    : "Please include your name with comments";
  console.log(sayThis); 
}
*/

