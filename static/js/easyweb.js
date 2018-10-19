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

    let carousel = function () {

        let positionCarouselImg = (img, contentWidth) => {
            if (!contentWidth) {
                contentWidth = $('article').width();
            }
            if (img.width > 0 && img.width < contentWidth) {
                $(img).css({left: (contentWidth - img.width) / 2});
            }
            if (img.height > 0 && img.height < contentWidth * 0.66) {
                $(img).css({top: (contentWidth * 0.66 - img.height) / 2});
            }
        };

        let resizeVerticalImagesInCarousel = () => {
            let imgs = $('.carousel .item img');
            let contentWidth = $('article').width();
            imgs.on('load', (ev) => {
                positionCarouselImg(ev.currentTarget, contentWidth);
            });
            // for (let i = 0; i < imgs.length; i++) {
            //     let img = imgs[i];
            //     positionCarouselImg(img, contentWidth);
            // }
        };
        resizeVerticalImagesInCarousel();

        // setTimeout(resizeVerticalImagesInCarousel, 1000);
        // setTimeout(resizeVerticalImagesInCarousel, 3000);
        // setTimeout(resizeVerticalImagesInCarousel, 5000);

        let isInViewport = function (el) {
            let elementTop = $(el).offset().top;
            let elementBottom = elementTop + $(el).outerHeight();
            let viewportTop = $(window).scrollTop();
            let viewportBottom = viewportTop + $(window).height();
            let height = $(el).height;
            return elementBottom <= viewportBottom && elementTop >= viewportTop;
        };

        let cyclingCarousels = {}
        $(window).on('resize scroll', function () {
            let carousels = $('.carousel');
            for (let i = 0; i < carousels.length; i++) {
                let carousel = carousels[i];
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
            let lazy;
            lazy = $(ev.relatedTarget).find("img[data-src]");
            lazy.attr("src", lazy.data('src'));
            lazy.attr("srcset", lazy.data('srcset'));
            lazy.removeAttr("data-src");
            lazy.removeAttr("data-srcset");
            lazy.on('load', (ev) => {
                positionCarouselImg(ev.currentTarget);
            })
        });
    };

    carousel();

    (function (d, s, id) {
        let js, fjs = d.getElementsByTagName(s)[0];
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