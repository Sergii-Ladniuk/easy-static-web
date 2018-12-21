eswEditor.factory('PreviewService', function ($http, PostEditorService) {
    return {
        loadPreview: function () {
            if (!PostEditorService.post || PostEditorService.isPublishing()) {
                return;
            }
            return $http.get('http://localhost:4002/preview/' + PostEditorService.post.meta.slug)
        }
    }
});
