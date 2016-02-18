$(function() {
    console.log($(window).height());
    console.log($(document).height())
    if ( ($(window).height() + 100) < $(document).height() ) {
        $('#top-link-block').removeClass('hidden').affix({
            offset: {top:100}
        });
    }
    //$('.navbar').affix({offset: {top: 100} });
})
