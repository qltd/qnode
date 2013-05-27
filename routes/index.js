
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Q Design & Communication Since 1981' });
};