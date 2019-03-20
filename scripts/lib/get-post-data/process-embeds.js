class EmbedService {
    constructor(data, text, replaceFunction) {
        this.data = data;
        this.text = text;
        this.replaceFunction = replaceFunction;
    }

    process() {
        return this.data.renderBlockingPromise
            .then(function (promises) {
                return promises.embedTemplates;
            })
            .then(this.processOne.bind(this));
    }

    processOne(embed) {
        let me = this;
        let toReplace = [];
        let tasks = [];
        let index = 0;
        embed
            .forEach(function (templateDef) {
                let match;
                while (match = templateDef.regexp.exec(me.text)) {
                    let item = match[0];
                    let attrsRaw = match[1].replace(/&quot;/g, '"');
                    let attrRegex = /(.*?)=\"(.*?)\" */g;
                    let attrMatch;
                    let attrs = {
                        posts: me.data.list,
                        index: index++
                    };

                    while (attrMatch = attrRegex.exec(attrsRaw)) {
                        let name = attrMatch[1];
                        let val = attrMatch[2];
                        attrs[name] = val;
                    }

                    attrRegex = /(.*?)="<a.*?href="(.*?)"/g;

                    while (attrMatch = attrRegex.exec(attrsRaw)) {
                        let name = attrMatch[1];
                        let val = attrMatch[2];

                        attrs[name] = val;
                    }

                    let nextReplacement = templateDef.template.then(function (template) {
                        return {
                            src: item,
                            dest: typeof template === 'function' ? template(attrs) : template
                        };
                    });
                    toReplace.push(nextReplacement);
                }
                let promise = Promise.map(toReplace, function (next) {
                    me.replaceFunction(next.src, next.dest);
                });
                tasks.push(Promise.all(promise));
            });
        return Promise.all(tasks).then(function () {
            return me.data;
        })
    }
}

module.exports = EmbedService;
