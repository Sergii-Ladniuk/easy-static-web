function onload(f) {
    if (window.addEventListener)
        window.addEventListener("load", f, false);
    else if (window.attachEvent)
        window.attachEvent("onload", f);
    else window.onload = f;
}

$(function () {
    console.log($(window).height());
    console.log($(document).height());
    if (($(window).height() + 100) < $(document).height()) {
        $('#top-link-block').removeClass('hidden').affix({
            offset: {top: 100}
        })
    }

    if (is_touch_device()) {
        $('.dropdown-toggle.disabled').each(function (index, item) {
            $(item).removeClass('disabled');
        })
    } else {
        $('.ya-share2__item_service_whatsapp').hide();
        onload(function () {
            $('.ya-share2__item_service_whatsapp').hide();
        })
    }

    $('#daysInTravel').text(Math.round((Date.now() - (new Date(2014, 09, 16, 0, 0, 0, 0)).getTime()) / (1000 * 60 * 60 * 24)));

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/ru_RU/sdk.js#xfbml=1&version=v2.5";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    var subscribeBarClosed = false;

    $(window).scroll(function () {
        if (!subscribeBarClosed) {
            if ($(window).scrollTop() > $(window).height()) {
                $('#subscribe-bar').fadeIn("slow");
            } else {
                $('#subscribe-bar').fadeOut("slow");
            }
        }
    });

    $('#close-subscribe-bar').click(function (event) {
        event.stopPropagation();
        document.cookie="username=John Doe";
        subscribeBarClosed = true;
        $('#subscribe-bar').fadeOut("slow");
    })
});

function is_touch_device() {
    return 'ontouchstart' in window        // works on most browsers
        || navigator.maxTouchPoints;       // works on IE10/11 and Surface
}