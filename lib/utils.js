
var message = require('../config/messages.js');

/**
 * Create and export an error-prototyped Validator object that does 
 * not throw app-ending errors when validations fail; this works well 
 * for implemenations in Mongoose Schema Object validations.
 */

var Validator = require('validator').Validator
  , validate = new Validator();

validate.error = function () { return false; }

exports.check = {
  is: function (value, pattern, modifiers) {
    return validate.check(value).is(pattern, modifiers);
  },
  not: function (value, pattern, modifiers) {
    return validate.check(value).not(pattern, modifiers);
  },
  isEmail: function (value) {
    return validate.check(value).isEmail();
  },
  isUrl: function (value) {
    return validate.check(value).isUrl();
  },
  isIP: function (value) {
    return validate.check(value).isIP();
  },
  isIPv4: function (value) {
    return validate.check(value).isIPv4();
  },
  isIPv6: function (value) {
    return validate.check(value).isIPv6();
  },
  isAlpha: function (value) {
    return validate.check(value).isAlpha();
  },
  isAlphanumeric: function (value) {
    return validate.check(value).isAlphanumeric();
  },
  isNumeric: function (value) {
    return validate.check(value).isNumeric();
  },
  isHexadecimal: function (value) {
    return validate.check(value).isHexadecimal();
  },
  isHexColor: function (value) {
    return validate.check(value).isHexColor();
  },
  isInt: function (value) {
    return validate.check(value).isInt();
  },
  isLowercase: function (value) {
    return validate.check(value).isLowercase();
  }, 
  isUppercase: function (value) {
    return validate.check(value).isUppercase();
  },
  isDecimal: function (value) {
    return validate.check(value).isDecimal();
  },
  isFloat: function (value) {
    return validate.check(value).isFloat();
  },
  notNull: function (value) {
    return validate.check(value).notNull();
  }, 
  isNull: function (value) {
    return validate.check(value).isNull();
  }, 
  notEmpty: function (value) {
    return validate.check(value).notEmpty();
  },
  equals: function (value, equals) {
    return validate.check(value).equals(equals);
  },
  contains: function (value, str) {
    return validate.check(value).contains(str);
  },
  notContains: function (value, str) {
    return validate.check(value).notContains(str);
  },
  regex: function (value, pattern, modifiers) {
    return validate.check(value).regex(pattern, modifiers);
  },
  notRegex: function (value, pattern, modifiers) {
    return validate.check(value).notRegex(pattern, modifiers);
  },
  len: function (value, min, max) {
    return validate.check(value).len(min, max);
  },
  isUUID: function (value, version) {
    return validate.check(value).isUUID(version);
  },
  isUUIDv3: function (value) {
    return validate.check(value).isUUIDv3();
  },
  isUUIDv4: function (value) {
    return validate.check(value).isUUIDv4();
  },
  isDate: function (value) {
    return validate.check(value).isDate();
  },
  isAfter: function (value) {
    return validate.check(value).isAfter(date);
  },
  isBefore: function (value) {
    return validate.check(value).isBefore(date);
  },
  isIn: function (value, options) {
    return validate.check(value).isIn(options);
  },
  notIn: function (value, options) {
    return validate.check(value).notIn(options);
  },
  max: function (value, max) {
    return validate.check(value).max(max);
  },
  min: function (value, min) {
    return validate.check(value).min(min);
  },
  isCreditCard: function (value) {
    return validate.check(value).isCreditCard();
  }
}

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
      return [message.notUnique(collectionField, fieldValue)];
    }

    if (err.message) {
      return [err.message];
    }

    // finally, resort to a default message
    return [message.default];
  }

  keys.forEach(function (key) {
    errs.push(err.errors[key].type);
  })

  return errs;
}
