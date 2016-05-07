eswEditor.controller('PreviewController', function (PreviewService) {
    var lastPreviewHtml;

    runUpdatePreviewLoop();

    function runUpdatePreviewLoop() {
        const promise = PreviewService.loadPreview();
        const isPreviewNotAvailable = !promise;

        if (isPreviewNotAvailable) {
            waitAndTryReloadPreview()
        } else {
            promise.then(function (answer) {
                var previewHtml = answer.data;
                addPreviewToEditorHtml(previewHtml);
                waitAndTryReloadPreview()
            })
        }
    }

    function waitAndTryReloadPreview() {
        setTimeout(runUpdatePreviewLoop, 2000)
    }

    function addPreviewToEditorHtml(previewHtml) {
        if (previewHtml !== lastPreviewHtml) {
            var scrollTop = $('#post-preview').scrollTop();

            var updatedPreviewFull = $(previewHtml);
            var updatedPreviewHeader = updatedPreviewFull.find('.post > article > header')[0];
            var updatedPreviewContent = updatedPreviewFull.find('.post > article > .post-content')[0];

            var updatedPreviewDestinationElement = $('#post-preview > .content');
            updatedPreviewDestinationElement.empty();
            updatedPreviewDestinationElement
                .append(updatedPreviewHeader)
                .append(updatedPreviewContent);

            lastPreviewHtml = previewHtml;
        }
    }
});