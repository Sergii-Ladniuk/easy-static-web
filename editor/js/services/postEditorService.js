eswEditor.factory('PostEditorService', function ($http) {
    var shouldSave, savingNow;
    return {
        save: function save(post) {
            if (savingNow) {
                shouldSave = true;
            } else {
                savingNow = true;
                var promise = $http.post("/post", post);
                promise.then(function () {
                    savingNow = false;
                    if (shouldSave) {
                        shouldSave = false;
                        setTimeout(function () {
                            save(post);
                        }, 2000)
                    }
                });
                return promise;
            }
        }
    };
});