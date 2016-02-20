RespImgs = {};

//get pixel ratio, default to 1
RespImgs.devicePixelRatio = window.devicePixelRatio || 1;

//screenwidth = width * pixelratio

RespImgs.getScreenWidth = function () {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth || screen.width;

    console.log('w', x);

    RespImgs.screenWidth = Math.min(x, screen.width);
};

RespImgs.shouldResize = function () {
    return RespImgs.prevWidth < RespImgs.screenWidth
        && RespImgs.getPrefix(RespImgs.screenWidth) !== RespImgs.getPrefix(RespImgs.prevWidth);
};


//get images blocks and loop through them
RespImgs.lazyLoadImages = function () {
    RespImgs.getScreenWidth();
    if (RespImgs.prevWidth === 0 || RespImgs.shouldResize()) {
        var lazyloadUs = document.getElementsByClassName("lazy-load");
        for (var i = 0; i < lazyloadUs.length; i++) {
            RespImgs.lazyloadImage(lazyloadUs[i]);
        }
    }
};

RespImgs.prevWidth = 0;

RespImgs.getPrefix = function (width) {
    if (width <= 375) {
        return '-sm';
    } else if (width <= 600) {
        return '-md';
    } else {
        return '';
    }
};

//insert 'correct' image
RespImgs.lazyloadImage = function (lazyLoadMe) {

    var children = lazyLoadMe.children;

    var noscriptTag = children[0];

    if (noscriptTag) {

        var imgAlt = noscriptTag.getAttribute("data-alt");
        var imgUrl = noscriptTag.getAttribute("data-s");
        var imgExt = noscriptTag.getAttribute("data-ext");

        //create element with correct size and insert it
        var img = document.createElement("img");

        if (imgAlt) {
            img.setAttribute("alt", imgAlt);
        }

        var width = RespImgs.screenWidth;

        var pre = RespImgs.getPrefix(RespImgs.screenWidth);

        var baseUrl = 'http://localhost:4000/';

        img.setAttribute('src', baseUrl + 'img/' + imgUrl + pre + imgExt);

        if (children.length == 1) {
            lazyLoadMe.appendChild(img);
        } else {
            lazyLoadMe.replaceChild(img, children[1]);
        }

        RespImgs.prevWidth = width;
    }
};

RespImgs.resizingNow = false;
RespImgs.resizingRequested = false;

RespImgs.lazyResize = function () {
    if (!this.resizingNow) {
        RespImgs.resizingNow = true;
        RespImgs.resizingRequested = false;
        RespImgs.lazyLoadImages();
        setTimeout(1000, function () {
            RespImgs.resizingNow = false;
            if (RespImgs.resizingRequested) {
                RespImgs.lazyResize();
            }
        });
    } else {
        this.resizingRequested = true;
    }
};

// run the code
RespImgs.lazyLoadImages();

window.onresize = RespImgs.lazyResize;


//timeoutOffset = false;
//
//$(window).resize(function(){
//
//    if(timeoutOffset !== false)
//        clearTimeout(timeoutOffset);
//
//    timeoutOffset = setTimeout(RespImgs.lazyLoadImages, 200);
//
//});