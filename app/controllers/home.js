
/**
 * Module dependencies
 */

var mongoose = require('mongoose')
  , Contact = mongoose.model('Contact');

/**
 * Index
 */

exports.index = function(req, res){
  res.render('home', { title: 'Q Design & Communication Since 1981' });
};
