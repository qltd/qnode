
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { layout: 'layout', title: 'Q Design & Communication Since 1981' });
};