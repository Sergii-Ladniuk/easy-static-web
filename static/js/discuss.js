if (typeof slug !== 'undefined') {
    var disqus_url = 'http://marinatravelblog.com/' + slug + '/';
    var disqus_identifier = post_id+' '+shortLink;
    var disqus_container_id = 'disqus_thread';
    var disqus_shortname = 'httpmarinatravelblogcom';
    var disqus_config_custom = window.disqus_config;
    var disqus_config = function () {
        this.language = '';
        this.callbacks.onReady.push(function () {
            var script = document.createElement('script');
            script.async = true;
            script.src = '?cf_action=sync_comments&post_id=8783';
            var firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(script, firstScript);
        });
        if (disqus_config_custom) {
            disqus_config_custom.call(this);
        }
    };
    (function () {
        var dsq = document.createElement('script');
        dsq.type = 'text/javascript';
        dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
}