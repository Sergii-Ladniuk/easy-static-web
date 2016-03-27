var state = {};

exports.start = function (id) {
    state[id] = Date.now();
};

exports.finish = function (id) {
    if (state[id]) {
        var time = Date.now() - state[id];
        console.log(id, 'done in', time,'ms');
    }
};