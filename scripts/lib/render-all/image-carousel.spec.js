let testHtml =
    '<h2 id="город-лорето">Город Лорето</h2><p>Лорето - это типичный прибрежный городок. Ближе к набережной приятно, а чем дальше вглубь побережья, тем проще и грязнее. Он небольшой, всего 18.5 тысяч жителей, и всюду можно добраться пешком.</p>\n' +
    '<p>\n' +
    '<div style="padding-bottom:67%;" class="lazy-load"><img alt="" src="http://localhost:4000/img/Loreto-1003.jpg" srcset="http://localhost:4000/img/Loreto-1003.jpg 800w,http://localhost:4000/img/Loreto-1003-md.jpg 570w,http://localhost:4000/img/Loreto-1003-sm.jpg 330w"/></div></p>\n' +
    '<p>\n' +
    '<div style="padding-bottom:67%;" class="lazy-load"><img alt="" src="http://localhost:4000/img/Loreto-1001.jpg" srcset="http://localhost:4000/img/Loreto-1001.jpg 800w,http://localhost:4000/img/Loreto-1001-md.jpg 570w,http://localhost:4000/img/Loreto-1001-sm.jpg 330w"/></div></p>\n' +
    '<h2 id="снорклинг-на-исла-коронада-isla-coronada">Снорклинг на Исла Коронада (Isla Coronada)</h2><p>Лорето находится в Калифорнийском заливе (море Кортеса), который славится разнообразием морской жизни. Жак-Ив Кусто называл море Кортеса &quot;всемирным аквариумом&quot; за то, что здесь сосредоточено более 40% видов рыб и морских млекопитающих, обитающих в Мировом океане. Соответственно, здесь отличный снорклинг и наблюдение за китами.</p>\n' +
    '<p>Чтобы поплавать с маской и трубкой на острове Коронада, нужно прийти на причал между 8 и 9 утра, тогда отправляются все лодки и есть шансы с кем-то скооперироваться, чтобы сэкономить. Спрашивайте цены в песо, это будет немного дешевле, чем если платить в долларах. Когда мы там были, то за 5-часовую экскурсию просили 1200 песо (65$) за лодку.</p>\n' +
    '<p>Мы там были в конце февраля - вода очень холодная. Если есть возможность, то берите в аренду гидрокостюмы.</p>\n' +
    '<p>Отплываем от берега. Горы там великолепные.</p>\n' +
    '<p>\n' +
    '<div style="padding-bottom:67%;" class="lazy-load"><img alt="" src="http://localhost:4000/img/Loreto-Snorkeling-1002.jpg" srcset="http://localhost:4000/img/Loreto-Snorkeling-1002.jpg 800w,http://localhost:4000/img/Loreto-Snorkeling-1002-md.jpg 570w,http://localhost:4000/img/Loreto-Snorkeling-1002-sm.jpg 330w"/></div></p>\n' +
    '<p></p><p>\n' +
    '<div style="padding-bottom:67%;" class="lazy-load"><img alt="" src="http://localhost:4000/img/Loreto-Snorkeling-1005.jpg" srcset="http://localhost:4000/img/Loreto-Snorkeling-1005.jpg 800w,http://localhost:4000/img/Loreto-Snorkeling-1005-md.jpg 570w,http://localhost:4000/img/Loreto-Snorkeling-1005-sm.jpg 330w"/></div></p>\n' +
    '<p>\n' +
    '<div style="padding-bottom:67%;" class="lazy-load"><img alt="" src="http://localhost:4000/img/Loreto-Snorkeling-1010.jpg" srcset="http://localhost:4000/img/Loreto-Snorkeling-1010.jpg 800w,http://localhost:4000/img/Loreto-Snorkeling-1010-md.jpg 570w,http://localhost:4000/img/Loreto-Snorkeling-1010-sm.jpg 330w"/></div></p>\n' +
    '<p>\n' +
    '<div style="padding-bottom:67%;" class="lazy-load"><img alt="" src="http://localhost:4000/img/Loreto-Snorkeling-1016.jpg" srcset="http://localhost:4000/img/Loreto-Snorkeling-1016.jpg 800w,http://localhost:4000/img/Loreto-Snorkeling-1016-md.jpg 570w,http://localhost:4000/img/Loreto-Snorkeling-1016-sm.jpg 330w"/></div></p>\n' +
    '<p>Видели в воду выдру.</p>\n' +
    '<p>\n' +
    '<div style="padding-bottom:67%;" class="lazy-load"><img alt="" src="http://localhost:4000/img/Loreto-Snorkeling-1007.jpg" srcset="http://localhost:4000/img/Loreto-Snorkeling-1007.jpg 800w,http://localhost:4000/img/Loreto-Snorkeling-1007-md.jpg 570w,http://localhost:4000/img/Loreto-Snorkeling-1007-sm.jpg 330w"/></div></p>';

describe("image carousel", function () {

    let jade = require('jade');
    let sinon = require('sinon');
    let assert = require('assert');
    let fs = require('../general').fs;

    let carousel = require('./image-carousel');

    it('should replace images with carousel', function () {
        let templateContent =
            'div.test0' +
            '| !{imgs[0]}' +
            'div.test1' +
            '| !{imgs[1]}';
        let template = jade.compile(templateContent, {
            filename: 'test.jade',
            pretty: true
        });
        let templatePromise = new Promise(resolve => {
            resolve(template);
        });
        return carousel.getReplaceImgWithCarouselTasks(testHtml, templatePromise).then(tasks => {
            console.log(tasks);
            assert.equal(tasks.length, 2);
            assert(tasks[0].initial.includes('Loreto-1003.jpg'));
            assert(tasks[0].initial.includes('Loreto-1001-sm.jpg'));
            assert(tasks[0].updated.includes('Loreto-1003.jpg'));
            assert(tasks[0].updated.includes('Loreto-1001-sm.jpg'));
            assert(tasks[0].updated.includes('<div class="test0">'));
            assert(!tasks[0].updated.includes('Loreto-Snorkeling-1002.jpg'));
        });
    });

    it('should work with real template', function () {
        let templatePromise = fs.readFileAsync('layouts/embed/carousel.jade', "utf-8").then(templateContent => {
            console.log(templateContent);
            return jade.compile(templateContent, {
                filename: 'test.jade',
                pretty: true
            });
        });
        return carousel.getReplaceImgWithCarouselTasks(testHtml, templatePromise).then(tasks => {
            console.log(tasks);
            assert.equal(tasks.length, 2);
            console.log(tasks[0].updated);
            assert(tasks[0].initial.includes('Loreto-1003.jpg'));
            assert(tasks[0].initial.includes('Loreto-1001-sm.jpg'));
            assert.equal(
                tasks[0].updated,
                '\n' +
                '<div data-ride="carousel" id="img-carousel-0" class="carousel slide">\n' +
                '  <ol class="carousel-indicators">\n' +
                '    <li data-target="img-carousel-0" data-slide-to=\'0\' class="active"></li>\n' +
                '    <li data-target="img-carousel-0" data-slide-to=\'1\'></li>\n' +
                '  </ol>\n' +
                '  <div role="listbox" class="carousel-inner">\n' +
                '    <div class="item active"><img class=\'d-block w-100\' alt="" src="http://localhost:4000/img/Loreto-1003.jpg" srcset="http://localhost:4000/img/Loreto-1003.jpg 800w,http://localhost:4000/img/Loreto-1003-md.jpg 570w,http://localhost:4000/img/Loreto-1003-sm.jpg 330w"/></div>\n' +
                '    <div class="item"><img class=\'d-block w-100\' alt="" src="http://localhost:4000/img/Loreto-1001.jpg" srcset="http://localhost:4000/img/Loreto-1001.jpg 800w,http://localhost:4000/img/Loreto-1001-md.jpg 570w,http://localhost:4000/img/Loreto-1001-sm.jpg 330w"/></div>\n' +
                '  </div><a href="#img-carousel-0" role="button" data-slide="prev" class="left carousel-control"><span area-hidden="true" class="fa fa-angle-left"></span><span class="sr-only">Previous</span></a><a href="#img-carousel-0" role="button" data-slide="next" class="right carousel-control"><span area-hidden="true" class="fa fa-angle-right"></span><span class="sr-only">Previous</span></a>\n' +
                '</div>');
        });
    })

});