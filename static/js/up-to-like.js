$(function () {
    if ($('#social-btns-side').length) {

        $('#social-btns-side').hide();

        $(window).scroll(function () {
            if ((isScrolledIntoView($('#social-btns-bottom')) || isScrolledIntoView($('#mainMenu')))
                && $(window).width > 900) {

                $('#social-btns-side').fadeOut("slow");
            } else {
                $('#social-btns-side').fadeIn("slow");
            }

            if ($(window).scrollTop() > 100) {
                $('#sidebar').css({top: '0'});
            } else {
                $('#sidebar').css({top: '75px'});
            }

            let subscribePopupMargin = $(document).height() / 2;
            if ($(window).scrollTop() > subscribePopupMargin) {// && !localStorage.subscribeShown) {
                localStorage.subscribeShown = true;
                var subscribePopup = $('#subscribe-popup');
                subscribePopup.modal('show');
                subscribePopup.removeClass('hide')
            }
        });

        function isScrolledIntoView(elem) {
            var $elem = $(elem);
            var $window = $(window);

            var docViewTop = $window.scrollTop();
            var docViewBottom = docViewTop + $window.height();

            var elemTop = $elem.offset().top;
            var elemBottom = elemTop + $elem.height();

            return ((elemTop - 100 <= docViewBottom) && (elemBottom + 100 >= docViewTop));
        }
    }

    $('#mobile-subscribe-btn').click(function (e) {
        var $subscribe = $('#subscribe-modal');
        $subscribe.modal('show');
        $subscribe.removeClass('hide');
        e.preventDefault();
    });
    $('#mobile-share-btn').click(function (e) {
        var $share = $('#share-modal');
        $share.modal('show');
        $share.removeClass('hide');
        e.preventDefault();
    });
    $('#subscribe-modal .subscribe-link').click(function () {
        var modal = $('#subscribe-modal');
        modal.modal('hide');
        modal.addClass('hide');
    });
    $('#share-modal a, #share-modal a span').click(function () {
        var modal = $('#share-modal');
        modal.modal('hide');
        modal.addClass('hide');
    });
});