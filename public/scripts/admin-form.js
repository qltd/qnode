/**
 * Administrative form JavaScript for the Q LTD website
 */

/**
 * Listens for remove-parent click events on a specific element or class of elements
 * @param element - The ID or class of an element or set of elements
 */
var removeParentOnClick = function (element) {
  $(element).on('click', function () {
    $(this).parent().remove();
  });
}

/** Remove project image row on remove-sign click */
removeParentOnClick('#project-image > .row .icon-remove-sign');

/**
 * Set the value of inputs with class 'position' to the position its parent occupies in the passed array 
 * @param element - The class elements to have their positions set
 */
var updatePositions = function (element) {
  $(element).each(function (key, value) {
    $(this).children('input.position').val(key);
  });
}

/** Update project image row positions */
updatePositions('#project-image > .row');

/** Make project images sortable */
$('#project-image').sortable({
  update: function (e, ui) {
    updatePositions('#project-image > .row');
  }
});

/** Underscore.js compatible ejs template for image rows */
var imageRowTemplate = '\
  <div id="row-<%- key %>" class="row clearfix">\
    <i class="icon-move icon-2x"></i>\
    <input class="image" type="file" name="images[<%- key %>]">\
    <input class="image-title" type="text" name="images[<%- key %>][title]" placeholder="Image Title"><input class="position" type="hidden" name="images[<%- key %>][position]" value="<%- key %>" placeholder="Position"><i class="icon-remove-sign icon-2x"></i>\
  </div>';

/** Add new image row on click event */
$('#add-image').on('click', function() {
  var key = $('#project-image > .row').length;
  var imageRowHtml = _.template(imageRowTemplate, { key: key });
  $('#project-image').append(imageRowHtml);
  removeParentOnClick('#row-' + key + ' .icon-remove-sign');
});

/** Open loading screen on admin form submissions */
$('input[type=submit]').on('click', function () {
  $('#loading-screen').addClass('open');
})

/**
 * Delete a crew member
 * @rdarling
 * **/
$('.delete-crew').click(function(){
    var slug = $(this).attr('data-crew-slug');
    app.delete('/crew/'+slug+'/destroy', function (req, res) {
          res.send('DELETE request to crew controller');
    });
});
