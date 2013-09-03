/**
 * Homepage JavaScript for the Q LTD website
 */

/** Configure stellar to be 'off' for iOS */
if(!navigator.userAgent.match(/(iPhone|iPod|iPad)/i)) {
  $.stellar({
    hideDistantElements: true,
    responsive: true
  });
}

/**
 * Replaces divx-replaced video elements with html5 video elements 
 *
 * @param {Object} element - HTML element containing video data
 * @param {String} id - ID of HTML element containing video data
 */
var replaceVideo = function (element, id) {
  if ($(element + '#' + id).length > 0) {
    $(element + '#' + id).replaceWith('<video id="' + id + '"></video>');
    $('#' + id).attr('class', 'replaced');

    /** set boolean attributes; convention #2 in code examples: http://www.w3.org/TR/html5/infrastructure.html#boolean-attribute */
    $('#' + id).attr('preload', 'preload');
    $('#' + id).attr('autoplay', 'autoplay');
    $('#' + id).attr('loop', 'loop');
    $('#' + id).attr('muted', 'muted')

    $('#' + id).attr('src', 'images/power.mp4');
    $('#' + id).attr('type', 'video/mp4');
  }
}

$(window).load(function () {
  /** Replace divx-replaced videos with original html5 tag */
  replaceVideo('embed', 'vid');
})

/**
 * Global variant of the isRetina function found in retina.js
 *
 * @returns {Boolean} Returns true or false regarding weather a user's display is high-density
 */
isRetina = function () {
  var root = window;
  var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
                    (min--moz-device-pixel-ratio: 1.5),\
                    (-o-min-device-pixel-ratio: 3/2),\
                    (min-resolution: 1.5dppx)";
  if (root.devicePixelRatio > 1) return true;
  if (root.matchMedia && root.matchMedia(mediaQuery).matches) return true;
  return false;
};

/** Add x2 classes to image containing elements that require them when high-res is detected */
if (isRetina()) {
  $('.q').addClass('x2');
  $('.location').addClass('x2');
}

$("a[href^='#']").click(function(){//$.scrollTo works EXACTLY the same way, but scrolls the whole screen
  $.scrollTo( this.hash, 800, { offset:-150, axis: 'y' });
  return false;
});

var imageLoadCheck = function (images) {
  var imageCount = $(images).length;
  var currentCount = 1;
  $(images).one('load', function() {
    currentCount++;
    if (currentCount == imageCount) $('#loading-screen').removeClass('open');
  }).each(function() {
    if(this.complete) $(this).load();
  });
}

/** template for portion of project portfolio that will be populated by as-needed with json */
var projectTemplate = '\
  <% _.each(project.images, function (image) { %> \
    <img src="<%= ( isRetina() && image.srcRetina ? image.srcRetina : image.src ) %>" alt="<%- image.title %>" width="<%= ( isRetina() && image.srcRetina && image.meta && image.meta.size && image.meta.size.width ? Math.round(image.meta.size.width / 2) : null ) %>" > \
  <% }); %>';

$('.trigger').on('click', function(){
  var target = $(this).attr('data-target');

  /** if project is present... */
  if ($('#project-' + target).length != 0) {
    $('#loading-screen').addClass('open');
    $('.portfolio').addClass('open');

    /** if images are not present.. */
    if ($('#project-' + target + ' .project-images > img').length == 0) {
      $.ajax({ url: '/projects/' + target + '/json' })
        .done(function(project) {
          var projectHtml = _.template(projectTemplate, { project: project });
          $('#project-' + target + ' .project-images').append(projectHtml);
          $('#project-' + target).addClass('active');
          imageLoadCheck('#project-' + target + ' img');

        });

    /** if images are present.. */
    } else {
      $('#project-' + target).addClass('active');
      imageLoadCheck('#project-' + target + ' img');
    }
  } 

  

  /** Hide overflow; aka, remove scrollbars from body */
  $('body').css('overflow', 'hidden');
});

/** close portfolio on-click event */
$('.close').on('click', function(){
  closePort();
});

// Closes portfolio drawer on esc key press
$(document).keyup(function(e) {
  if (e.keyCode == 27) {
    closePort();
  }
});

// Removes classes and allows body to scroll again
var closePort = function() {
  $('body').css('overflow', 'visible');
  $('.portfolio').removeClass('open');
  $('.project').removeClass('active');      

}

//  Toggles crew member on mobile
$('.crew-member').on('click', function(){
  $(this).toggleClass('open');
});

// Toggles Mobile Nav
$('.nav-toggle').on('click', function(){
  $('.main-nav').slideToggle();
});

$('.main-nav a').on('click', function(){
  $('.main-nav').slideToggle();
});

// Toggles Services 
$('.services-list li').on('click', function(){
  $(this).children('.service-details').slideToggle();
  $(this).toggleClass('expanded');
});
