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

    var carousel = function () {

        var contentWidth = $('article').width();

        var positionCarouselImg = function (img) {
            var width = img.naturalWidth;
            var height = img.naturalHeight;
            var ratioH = height / (contentWidth * 0.66);
            var ratioW = width / contentWidth;
            if (ratioH > 1) {
                width /= ratioH;
            }
            if (ratioW > 1) {
                height /= ratioW;
            }
            console.log('position ' + contentWidth + ' ' + width + ' ' + $(img).prop('src'));
            if (width > 0 && width < contentWidth * 0.9) {
                $(img).css({left: (contentWidth - width) / 2});
            }
            if (height > 0 && height < contentWidth * 0.66) {
                $(img).css({top: (contentWidth * 0.66 - height) / 2});
            }
        };

        var resizeVerticalImagesInCarousel = function () {
            var imgs = $('.carousel .item img');
            imgs.on('load', function (ev) {
                positionCarouselImg(ev.currentTarget);
                setTimeout(function () {
                    return positionCarouselImg(ev.currentTarget)
                }, 1000);
            });
        };
        resizeVerticalImagesInCarousel();

        // setTimeout(resizeVerticalImagesInCarousel, 1000);
        // setTimeout(resizeVerticalImagesInCarousel, 3000);
        // setTimeout(resizeVerticalImagesInCarousel, 5000);

        var isInViewport = function (el) {
            var elementTop = $(el).offset().top;
            var elementBottom = elementTop + $(el).outerHeight();
            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();
            var height = $(el).height;
            return elementBottom <= viewportBottom && elementTop >= viewportTop;
        };

        var cyclingCarousels = {};
        $(window).on('resize scroll', function () {
            var carousels = $('.carousel');
            for (var i = 0; i < carousels.length; i++) {
                var carousel = carousels[i];
                if (isInViewport(carousel)) {
                    if (!cyclingCarousels[$(carousel).prop('id')]) {
                        $(carousel).carousel('cycle');
                        cyclingCarousels[$(carousel).prop('id')] = true;
                    }
                } else {
                    $(carousel).carousel('pause');
                    cyclingCarousels[$(carousel).prop('id')] = false;
                }
            }
        });

        $(window).on('resize', resizeVerticalImagesInCarousel);

        $(".carousel").on("slide.bs.carousel", function (ev) {
            var lazy;
            lazy = $(ev.relatedTarget).find("img[data-src]");
            lazy.attr("src", lazy.data('src'));
            lazy.attr("srcset", lazy.data('srcset'));
            lazy.removeAttr("data-src");
            lazy.removeAttr("data-srcset");
            lazy.on('load', function (ev) {
                positionCarouselImg(ev.currentTarget);
            })
        });
    };

    carousel();

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/ru_RU/sdk.js#xfbml=1&version=v2.5";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
});

function is_touch_device() {
    return 'ontouchstart' in window        // works on most browsers
        || navigator.maxTouchPoints;       // works on IE10/11 and Surface
}