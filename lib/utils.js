
var messages = require('../config/messages.js')['global'];

/**
 * Formats mongoose errors into proper array
 *
 * @param {Array} errors
 * @return {Array}
 * @api public
 */

exports.errors = function (err) {
  var keys = (typeof err.errors === 'object' ? Object.keys(err.errors) : null); 
  var errs = [];

  // if there are not keys on err.error, consider other options
  if (!keys) {

    // catch mongo unique validation errors that do not populate err.errors
    if (err.code === 11000 || err.code === 11001) {
      var regex = /index:.*\.(.*)\.\$(.*)_.*dup\skey:\s{\s:\s"(.*)"/;
      var errorProcess = err.err.match(regex);
      var dbCollection = errorProcess[1];
      var collectionField = errorProcess[2];
      var fieldValue = errorProcess[3]; 
      return [messages.notUnique(collectionField, fieldValue)];
    }

    // finally, resort to a default message
    console.log(err);
    return [messages.default];
  }

  keys.forEach(function (key) {
    errs.push(err.errors[key].type);
  })

  return errs;
}
