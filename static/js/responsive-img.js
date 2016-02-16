RespImgs = {};

//get pixel ratio, default to 1
RespImgs.devicePixelRatio = window.devicePixelRatio || 1;

//screenwidth = width * pixelratio
RespImgs.screenWidth = Math.min( window.innerWidth * RespImgs.devicePixelRatio, screen.width);

//get images blocks and loop through them
RespImgs.lazyLoadImages = function () {
    var lazyloadUs = document.getElementsByClassName("lazy-load");
    for (var i = 0; i < lazyloadUs.length; i++) {
        RespImgs.lazyloadImage(lazyloadUs[i]);
    }
    timeoutOffset = false;
}

//insert 'correct' image
RespImgs.lazyloadImage = function (lazyLoadMe) {

    var noscriptTag = lazyLoadMe.children[0];

    var imgAlt = noscriptTag.getAttribute("data-alt");
    var imgUrl = noscriptTag.getAttribute("data-s");
    var imgExt = noscriptTag.getAttribute("data-ext");

    //create element with correct size and insert it
    var img = document.createElement("img");

    if (imgAlt) {
        img.setAttribute("alt", imgAlt);
    }

    var pre;
    var width = RespImgs.screenWidth;
    if (width <= 375) {
        pre = '-sm';
    } else if (width <= 600) {
        pre = '-md';
    } else {
        pre = '';
    }

    var baseUrl = 'http://localhost:4000/';

    img.setAttribute('src', '/img/' + imgUrl + pre + imgExt);
    lazyLoadMe.appendChild(img);
}

// run the code
RespImgs.lazyLoadImages();


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