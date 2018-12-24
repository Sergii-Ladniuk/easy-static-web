eswEditor.factory('PreviewService', function ($http, PostEditorService) {
    return {
        loadPreview: function () {
            if (!PostEditorService.post || PostEditorService.isPublishing()) {
                return;
            }
            return $http.get('/preview/' + PostEditorService.post.meta.slug)
        }
    }
});
