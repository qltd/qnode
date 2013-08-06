
/**
 * Helpers
 */

exports.helpers = function(req, res, next) {

  // make flash messages available to views
  res.locals.information = req.flash('info');
  res.locals.successes = req.flash('success');
  res.locals.warnings = req.flash('warning');
  res.locals.errors = req.flash('error');

  // make session user available to views
  res.locals.user = req.user;

  // creates a named series of panel objects from a panel array
  // available to views as 'panel.Title.property' 
  res.locals.objectifyPanels = function(panels) {
    if (panels && panels.length) {
      var panelsObj = [];
      panels.forEach(function(panel) {
        panelsObj[panel.title] = panel;
      });
    }
    res.locals.panel = panelsObj;
    return panels;
  }

  // returns the date created of a mongo/mongoose object
  res.locals.dateCreated = function(mongoDoc) {
    return mongoDoc._id.getTimestamp();
  }

  // returns the date updated of a mongo/mongoose object
  res.locals.dateUpdated = function(mongoDoc) {
    return ( mongoDoc.changeLog[mongoDoc.changeLog.length - 1] ? mongoDoc.changeLog[mongoDoc.changeLog.length - 1]._id.getTimestamp() : mongoDoc._id.getTimestamp() );
  }

  // returns the username of the creator of a mongo/mongoose object
  res.locals.createdBy = function(mongoDoc) {
    return ( mongoDoc.changeLog[0] ? mongoDoc.changeLog[0].username : 'None' );
  }

  // returns the username of the last updater of a mongo/mongoose object
  res.locals.updatedBy = function(mongoDoc) {
    return ( mongoDoc.changeLog[mongoDoc.changeLog.length - 1] ? mongoDoc.changeLog[mongoDoc.changeLog.length - 1].username : 'None' );
  }

  toSlug = function(value) {
    return value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g,'');
  }

  next();
}
