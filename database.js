// Database Interactions

// require mongoose within this script in addition to previous instantiation
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId; //not needed here, but may be needed in another model file

// schemas
var contactUsSchema = mongoose.Schema({
  name: String,
  email: String,
  company: String,
  comments: String,
  date: { type: Date, default: Date.now }
});

// support functions
contactUsSchema.methods.speak = function () {
  var sayThis = this.name
    ? "Thank you for your comments, " + this.name + "!"
    : "Please include your name with comments";
  console.log(sayThis); 
}

// model declarations
var contactUsResponse = mongoose.model('contactUsResponse', contactUsSchema);

// tests
var c = new contactUsResponse({ name: 'Michael J. Bondra', email: 'mike@qltd.com', company: 'Q LTD', comments: 'I like working on the new Q site' });
c.save();

// // NOTE: methods must be added to the schema before compiling it with mongoose.model()
// kittySchema.methods.speak = function () {
//   var greeting = this.name
//     ? "Meow name is " + this.name
//     : "I don't have a name"
//   console.log(greeting);
// }

// var Kitten = mongoose.model('Kitten', kittySchema)
// var silence = new Kitten({ name: 'Silence' })
// console.log(silence.name) // 'Silence'

// var fluffy = new Kitten({ name: 'fluffy', breed: 'none of your business.' });
// fluffy.speak() // "Meow name is fluffy"

// fluffy.save(function (err, fluffy) {
//   if (err) // TODO handle the error
//   fluffy.speak();
// });
