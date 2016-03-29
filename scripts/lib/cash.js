var storage = exports.storage = {};

exports.clear = function () {
    storage = exports.storage = {};
};

exports.set = function (key, value) {
    storage[key] = value;
};

exports.get = function (key) {
    return storage[key];
};