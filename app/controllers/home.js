
/**
 * Module dependencies
 */

var mongoose = require('mongoose');

/**
 * Index
 */

exports.index = function(req, res){
  res.render('home', { title: 'Q Design & Communication Since 1981' });
};

/**
 * Index for admins
 */

exports.admin = function(req, res){
  res.render('home/admin', { title: 'Q Design & Communication Since 1981' });
};
