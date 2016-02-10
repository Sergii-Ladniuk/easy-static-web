/**
 * Returns a promise to an object, which has only one property 'prop'
 * pointing to the 'promise' result.
 * @param prop
 * @param promise
 * @returns {Promise}
 */
function promiseObject(prop, promise) {
    return new Promise(function (done) {
        promise.then(function(result) {
            var answer = {};
            answer[prop] = result;
            done(answer);
        })
    });
}

module.exports = promiseObject;