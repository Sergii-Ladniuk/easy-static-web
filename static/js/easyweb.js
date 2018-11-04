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
            if (!img.src) return;
            if (img.src.includes('-xlg.jpg')) {
                console.log(img.src, img.width, img.height, img.naturalWidth, img.naturalHeight, contentWidth, contentWidth * 0.6, $(img).css('display'));
                if (contentWidth > img.width || $(img).css('left') > 0) {
                    $(img).css({left: (contentWidth - img.width) / 2});
                }
                if (contentWidth * .6 > img.height || $(img).css('top') > 0) {
                    $(img).css({top: (contentWidth * .6 - img.height) / 2});
                }
            } else {
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
            }
        };

        var resizeVerticalImagesInCarousel = function () {
            var imgs = $('.carousel .item img');
            imgs.on('load resize afterShow', function (ev) {
                positionCarouselImg(ev.currentTarget);
                // setTimeout(function () {
                //     return positionCarouselImg(ev.currentTarget)
                // }, 1000);
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

        $(window).on('resize scroll', resizeVerticalImagesInCarousel);

        // var adjustIndicatorsPosition = function (img, carouselItem) {
        //     if (img) {
        //         var h = img.height / (img.width / contentWidth);
        //         var carousel = $(carouselItem.parent().parent());
        //         carousel.find('.carousel-indicators').css({bottom: (contentWidth * 0.666 - h) / 2 + 24})
        //     }
        // };

        $(".carousel").on("slide.bs.carousel", function (ev) {
            var lazy;
            var carouselItem = $(ev.relatedTarget);
            // var img = carouselItem.find("img")[0];
            lazy = carouselItem.find("img[data-src]");
            if (lazy && typeof lazy.data === 'function') {
                lazy.attr("src", lazy.data('src'));
                lazy.attr("srcset", lazy.data('srcset'));
                lazy.removeAttr("data-src");
                lazy.removeAttr("data-srcset");
                lazy.on('load resize', function (ev) {
                    positionCarouselImg(ev.currentTarget);
                    // adjustIndicatorsPosition(img, carouselItem);
                })
            }
            // adjustIndicatorsPosition(img, carouselItem);
        });

        lazyImages = function () {
            var lazyImages = [].slice.call(document.querySelectorAll("img.xlg"));

            if ("IntersectionObserver" in window) {
                let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            let lazyImage = entry.target;
                            lazyImage.src = lazyImage.dataset.xlgSrc;
                            lazyImage.srcset = lazyImage.dataset.xlgSrcset;
                            lazyImage.removeAttribute('data-xlg-src');
                            lazyImage.removeAttribute('data-xlg-srcset');
                            lazyImage.classList.remove("xlg");
                            lazyImageObserver.unobserve(lazyImage);
                            // positionCarouselImg(lazyImage)
                        }
                    });
                });

                lazyImages.forEach(function (lazyImage) {
                    lazyImageObserver.observe(lazyImage);
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