$(function () {
    if ($('#social-btns-side').length) {

        $('#social-btns-side').hide();

        $(window).scroll(function () {
            if (isScrolledIntoView($('#social-btns-bottom')) || isScrolledIntoView($('#mainMenu'))) {
                $('#social-btns-side').fadeOut("slow");
            } else {
                $('#social-btns-side').fadeIn("slow");
            }
        });


        function isScrolledIntoView(elem) {
            var $elem = $(elem);
            var $window = $(window);

            var docViewTop = $window.scrollTop();
            var docViewBottom = docViewTop + $window.height();

            var elemTop = $elem.offset().top;
            var elemBottom = elemTop + $elem.height();

            return ((elemTop-100 <= docViewBottom) && (elemBottom+100 >= docViewTop));
        }
    }
});