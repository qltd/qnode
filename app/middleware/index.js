
/**
 * Helpers
 */

exports.helpers = function(req, res, next) {

  // make flash messages available to views
  res.locals.information = req.flash('info');
  res.locals.successes = req.flash('success');
  res.locals.warnings = req.flash('warning');
  res.locals.errors = req.flash('error');

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

  next();
}
