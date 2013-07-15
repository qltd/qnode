
/*
 * POST contact us form.
 */

var qdb = require('../database');

exports.contactUsForm = function(req, res) {
	var contactUsResponse = qdb.mongoose.model('contactUsResponse', qdb.contactUsSchema);
	var c = new contactUsResponse(req.body);
	c.save();
	res.send(req.body);
};

exports.contactUsIndex = function(req, res) {
  var contactUsResponses = qdb.mongoose.model('contactUsResponse', qdb.contactUsSchema);
  var D = contactUsResponses.find({}, 'name email company comments', function (err, cur) {
    if (err) return handleError(err);
    res.render('admin', { cur: cur });
  });
}
