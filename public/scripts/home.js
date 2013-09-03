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
  $.scrollTo( this.hash, 800, { offset:-120, axis: 'y' });
  return false;
});

/** 
 * Check to see whether images have loaded; when they have, hide the loading screen
 *
 * @param images - Image or images that are being loaded
 */
var imageLoadCheck = function (images) {
  var imageCount = $(images).length;
  var currentCount = 0;
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
  if (isMobileBrowser()){
    $(this).toggleClass('open');
  }
});

// Toggles Mobile Nav
$('.nav-toggle').on('click', function(){
  $('.main-nav').slideToggle();
});

$('.main-nav a').on('click', function(){
  if (isMobileBrowser()){
    $('.main-nav').slideToggle();
  }  
});

// Toggles Services 
$('.services-list li').on('click', function(){
  if (isMobileBrowser()){
    $(this).children('.service-details').slideToggle();
    $(this).toggleClass('expanded');
  }
});


// Checks for Mobile Broswers
function isMobileBrowser() {
  var a = navigator.userAgent||navigator.vendor||window.opera;

  return (/android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || 
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)));
}
