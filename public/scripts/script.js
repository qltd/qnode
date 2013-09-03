/**
 * General JavaScript for the Q LTD website
 */

var _gaq=[['_setAccount','UA-XXXXX-X'],['_trackPageview']];
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
  .animate({ height: msgHeight }, 'easy')
  .delay(5000)
  .animate({ height: 0 }, 'easy', function () {
    $(this).hide();
  });
