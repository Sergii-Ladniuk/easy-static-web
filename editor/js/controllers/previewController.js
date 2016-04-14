eswEditor.controller('PreviewController', function ($scope, $http, PreviewService) {

    var lastHtml;

    function updatePreview() {

        const promise = PreviewService.loadPreview();

        if (!promise) {
            setTimeout(updatePreview, 1000);
            return;
        }

        promise.then(function (answer) {
            var previewHtml = answer.data;
            if (previewHtml !== lastHtml) {
                var scrollTop = $('#post-preview').scrollTop();
                $('#post-preview-old').attr('id', 'post-preview-new');
                $('#post-preview').attr('id', 'post-preview-old');
                $('#post-preview-new').attr('id', 'post-preview');
                $('#post-preview-old').css('z-index', 2);
                $('#post-preview').css('z-index', 1);
                $('#post-preview > div').replaceWith('<div>' + previewHtml + '</div>')
                $('#post-preview > div').replaceWith('<div>'
                    + '<link rel="stylesheet" href="http://localhost:4000/css/travel-style.css">'
                    + $('#post-preview .post').html() + +'</div>')
                $('#post-preview').scrollTop(scrollTop);
                $('#post-preview-old').css('z-index', 0);
                lastHtml = previewHtml;
            }
            setTimeout(updatePreview, 2000);
        })
    }

    updatePreview();
});