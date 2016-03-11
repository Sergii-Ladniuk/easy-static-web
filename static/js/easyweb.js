$(function () {
    console.log($(window).height());
    console.log($(document).height());
    if (($(window).height() + 100) < $(document).height()) {
        $('#top-link-block').removeClass('hidden').affix({
            offset: {top: 100}
        })
    }

    if (is_touch_device()) {
        $('.dropdown-toggle.disabled').each(function(index, item) {
            $(item).removeClass('disabled');
        })
    }

    $('#daysInTravel').text(Math.round( (Date.now() - (new Date(2014,09,16,0,0,0,0)).getTime()) / (1000*60*60*24)));
});

function is_touch_device() {
    return 'ontouchstart' in window        // works on most browsers
        || navigator.maxTouchPoints;       // works on IE10/11 and Surface
}