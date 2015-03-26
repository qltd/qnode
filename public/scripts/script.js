/**
 * General JavaScript for the Q LTD website
 */

var _gaq=[['_setAccount','UA-1915631-1'],['_trackPageview']];
(function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
g.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
s.parentNode.insertBefore(g,s)}(document,'script'));

/** Minimize adminstrative toolbar on click event */
$('#close-toolbar').on('click', function(){
  $('.admin-bar').toggleClass('mini');
});

/** Add table sorter to admin item index views */
$('.edit-content').tablesorter();

/** Find height of messages dev before we set it to 0 */
var msgHeight = $('.messages').height();

/** Animate the messages div */
$('.messages')
  .css('height', 0)
  .show()
  .animate({ height: msgHeight }, 'easy')
  .delay(5000)
  .animate({ height: 0 }, 'easy', function () {
    $(this).hide();
  });

/** 
 * Animate Q logo on loading screen
 * We can accomplish this with only css, but cross-browser compatibility is an issue 
 */
YUI().use('transition', function (Y){
  Y.one('#spinning-q').transition({
    transform: 'rotate(' + 300000 + 'deg)',
    duration: 1000,
    easing: 'linear'
  }, function(){
    this.setStyle('webkitTransform', 'rotateY(0deg)');
  });               
});

/**
 * Delete Crew members
 * @rdarling
 *
 * */

$('.remove-crew').click(function(){
    var slug = $(this).attr('data-crew-slug');
    $('.remove-crew-wrap-'+slug).slideToggle();
});

$('.remove-crew-action').click(function(){
    var slug = $(this).attr('data-crew-slug');
    $.ajax({
        type: 'DELETE', 
        url: '/crew/'+slug+'/delete',
        success: function(){
            window.location='/crew' 
        }
    });
});

$('.cancel-remove-crew').click(function(){
    var slug = $(this).attr('data-crew-slug');
    $('.remove-crew-wrap-'+slug).slideUp();
});

/**
 * Delete User members
 *
 * */

$('.remove-user').click(function(){
    var username = $(this).attr('data-username');
    $('.remove-user-wrap').slideToggle();
});

$('.remove-user-action').click(function(){
    var username = $(this).attr('data-username');
    $.ajax({
        type: 'DELETE', 
        url: '/users/'+username+'/delete',
        success: function(){
            window.location='/users' 
        }
    });
});

$('.cancel-remove-user').click(function(){
    var username = $(this).attr('data-username');
    $('.remove-user-wrap').slideUp();
});
