$(function () {
    if ($('#uptolike_holder_side').length) {
// Uptolike-side
        $('#uptolike_holder_side').hide();
        $('#uptolike_holder_side').append('<div data-background-alpha="0.0" data-buttons-color="#ff9300" data-counter-background-color="#ffffff" data-share-counter-size="11" data-top-button="false" data-share-counter-type="separate" data-share-style="1" data-mode="share" data-follow-vk="marinatravelblog" data-like-text-enable="false" data-follow-rss="marinatravelblog.com/feed/" data-follow-tw="marinatravelblg" data-hover-effect="scale" data-mobile-view="true" data-icon-color="#ffffff" data-orientation="fixed-left" data-text-color="#000000" data-share-shape="round-rectangle" data-sn-ids="fb.vk.tw.gp." data-follow-lj="marinatravelblg" data-share-size="30" data-background-color="#ededed" data-preview-mobile="false" data-mobile-sn-ids="fb.vk.tw.wh.gp." data-pid="1280335" data-counter-background-alpha="1.0" data-follow-title="Присоединяйся в соцсетях!" data-follow-gp=" Marinatravelblog" data-following-enable="true" data-exclude-show-more="true" data-follow-yt="UCyNA6UJhApZkrLbJF4gXOmw" data-selection-enable="false" data-follow-fb="marinatravelblog" class="uptolike-buttons" ></div>');

// Uptolike-bottom
        $('#uptolike_holder_bottom').append('<div data-background-alpha="0.0" data-buttons-color="#ff9300" data-counter-background-color="#ffffff" data-share-counter-size="11" data-top-button="false" data-share-counter-type="separate" data-share-style="1" data-mode="share" data-follow-vk="marinatravelblog" data-like-text-enable="false" data-follow-rss="marinatravelblog.com/feed/" data-follow-tw="marinatravelblg" data-hover-effect="scale" data-mobile-view="true" data-icon-color="#ffffff" data-orientation="horizontal" data-text-color="#000000" data-share-shape="round-rectangle" data-sn-ids="fb.vk.tw.gp." data-follow-lj="marinatravelblg" data-share-size="40" data-background-color="#ededed" data-preview-mobile="false" data-mobile-sn-ids="fb.vk.tw.wh.gp." data-pid="1280335" data-counter-background-alpha="1.0" data-follow-title="Присоединяйся в соцсетях!" data-follow-gp=" Marinatravelblog" data-following-enable="true" data-exclude-show-more="true" data-follow-yt="UCyNA6UJhApZkrLbJF4gXOmw" data-selection-enable="false" data-follow-fb="marinatravelblog" class="uptolike-buttons" ></div>');

// uptolike code
        (function (w, doc) {
            if (!w.__utlWdgt) {
                w.__utlWdgt = true;
                var d = doc, s = d.createElement('script'), g = 'getElementsByTagName';
                s.type = 'text/javascript';
                s.charset = 'UTF-8';
                s.async = true;
                s.src = ('https:' == w.location.protocol ? 'https' : 'http') + '://w.uptolike.com/widgets/v1/uptolike.js';
                var h = d[g]('body')[0];
                h.appendChild(s);
            }
        })(window, document);

        $(window).scroll(function () {
            if (isScrolledIntoView($('#uptolike_holder_bottom')) || isScrolledIntoView($('#mainMenu'))) {
                $('#uptolike_holder_side').fadeOut("slow");
            } else {
                $('#uptolike_holder_side').fadeIn("slow");
            }
        });


        function isScrolledIntoView(elem) {
            var $elem = $(elem);
            var $window = $(window);

            var docViewTop = $window.scrollTop();
            var docViewBottom = docViewTop + $window.height();

            var elemTop = $elem.offset().top;
            var elemBottom = elemTop + $elem.height();

            return ((elemTop <= docViewBottom) && (elemBottom >= docViewTop));
        }
    }
});