function loadJs() {
    var script = document.createElement("script");
    script.src = "/js/all-{version}.js";
    document.body.appendChild(script);
}

var loadCss = function () {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = '/css/all-{version}.css';
    var h = document.getElementsByTagName('head')[0];
    h.parentNode.insertBefore(l, h);
};

function onload(f) {
    if (window.addEventListener)
        window.addEventListener("load", f, false);
    else if (window.attachEvent)
        window.attachEvent("onload", f);
    else window.onload = f;
}

onload(loadJs);

var raf = requestAnimationFrame || mozRequestAnimationFrame ||
    webkitRequestAnimationFrame || msRequestAnimationFrame;
if (raf) raf(loadCss);
else onload(loadCss);