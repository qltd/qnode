/*
 * GET home page.
 */

exports.show = function(req, res){
  res.render('index', { title: 'Q Design & Communication Since 1981' });
};
