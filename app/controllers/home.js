
/**
 * Module dependencies
 */

var mongoose = require('mongoose');

/**
 * Index
 */

exports.index = function(req, res){
  res.render('home', { 
    title: 'Q Design & Communication Since 1981', 
    onload: 'changevid()',
    info: req.flash('info'),
    success: req.flash('success'),
    warning: req.flash('warning')
  });
};

/**
 * Index for admins
 */

exports.admin = function(req, res){
  res.render('home/admin', { 
    title: 'Q Design & Communication Since 1981',
    onload: 'changevid()',
    info: req.flash('info'),
    success: req.flash('success'),
    warning: req.flash('warning'),
    error: req.flash('error')
  });
};
