
/*
 * POST contact us form.
 */

var qdb = require('../database');

exports.contactUsForm = function(req, res) {
	contactUsResponse = qdb.mongoose.model('contactUsResponse', qdb.contactUsSchema)
	var c = new contactUsResponse(req.body);
	c.save();
	res.send(req.body);
};
