function onload(f) {
    if (window.addEventListener)
        window.addEventListener("load", f, false);
    else if (window.attachEvent)
        window.attachEvent("onload", f);
    else window.onload = f;
}

$(function () {
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

        var isInViewport = function (el) {
            var elementTop = $(el).offset().top;
            var elementBottom = elementTop + $(el).outerHeight();
            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();
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

        $(".carousel").on("slide.bs.carousel", function (ev) {
            var lazy;
            var carouselItem = $(ev.relatedTarget);
            // var img = carouselItem.find("img")[0];
            lazy = carouselItem.find("img[data-src]");
            if (lazy && lazy.length && typeof lazy.data === 'function') {
                lazy.attr("src", lazy.data('src'));
                lazy.attr("srcset", lazy.data('srcset'));
                lazy.removeAttr("data-src");
                lazy.removeAttr("data-srcset");
            }
        });

        function updateImgSrc(image) {
            var src = image.dataset.src;
            var srcset = image.dataset.srcset;

            if (src) {
                image.src = src;
                if (srcset) {
                    image.srcset = srcset;
                }
                image.removeAttribute('data-src');
                image.removeAttribute('data-srcset');
            }
            image.classList.remove("xlg");
        }

        function isScrolledIntoView(elem) {
            var $elem = $(elem);
            var $window = $(window);

            var docViewTop = $window.scrollTop();
            var docViewBottom = docViewTop + $window.height();

            var elemTop = $elem.offset().top;
            var elemBottom = elemTop + $elem.height();

            return ((elemTop - 100 <= docViewBottom) && (elemBottom + 100 >= docViewTop));
        }

        lazyImages = function () {
            var lazyImages = [].slice.call(document.querySelectorAll("img.xlg, .lazy-iframe"));

            if ("IntersectionObserver" in window) {
                var lazyImageObserver = new IntersectionObserver(function (entries, observer) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            var lazyImage = entry.target;
                            updateImgSrc(lazyImage);
                            lazyImageObserver.unobserve(lazyImage);
                        }
                    });
                });

                lazyImages.forEach(function (lazyImage) {
                    lazyImageObserver.observe(lazyImage);
                });
            } else {
                $(window).scroll(function () {
                    lazyImages = lazyImages.filter(function (image) {
                        if (isScrolledIntoView(image)) {
                            updateImgSrc(image);
                            return false;
                        } else {
                            return true;
                        }
                    })
                });
            }
        };

        lazyImages();
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

// Google Custom Search

(function () {
    var cx = '004020697667873441664:vxgsjyf7anw';
    var gcse = document.createElement('script');
    gcse.type = 'text/javascript';
    gcse.async = true;
    gcse.src = 'https://cse.google.com/cse.js?cx=' + cx;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(gcse, s);
})();