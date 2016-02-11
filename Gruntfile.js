module.exports = function (grunt) {

    var img = grunt.option('img');
    //FIXME
    var imgPath = '/Users/sergii/dev/blog-hugo/' + img;
    console.log(imgPath);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        responsive_images: {
            myTask: {
                options: {
                    quality: 60,
                    sizes: [{
                        name: 'sm',
                        width: 330
                    }, {
                        name: 'md',
                        width: 570
                    }, {
                        name: "lg",
                        width: 800
                    }]
                },
                files: [{
                    expand: true,
                    src: ['**.jpg'],
                    cwd: 'zz_all_wp_img_bk',
                    dest: '/Users/sergii/dev/blog-hugo/public/img/'
                }]
            }
        },
        copy: {
            css: {
                expand: true,
                cwd: 'static/css',
                src: '**',
                dest: './public-debug/css',
                flatten: true,
                filter: 'isFile'
            },
            html: {
                expand: true,
                cwd: 'static/html',
                src: '**',
                dest: './public-debug/',
                flatten: true,
                filter: 'isFile'
            },
            js: {
                expand: true,
                cwd: 'static/js',
                src: '**',
                dest: './public-debug/js',
                flatten: true,
                filter: 'isFile'
            }
        },
        mkdir: {
            init: {
                options: {
                    create: ['content/posts/drafts', 'content/posts/published',
                        'content/pages/drafts', 'content/pages/published', 'public-debug/img']
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-mkdir');
//    grunt.loadNpmTasks('grunt-sharp');

    // Default task(s).
    grunt.registerTask('ri', ['responsive_images']);
    grunt.loadNpmTasks('grunt-execute');
//    grunt.registerTask('sharp', ['grunt-sharp']);

    grunt.registerTask('init', ['mkdir:init']);

    grunt.registerTask('static', ['copy:css', 'copy:js', 'copy:html']);

    grunt.registerTask('run-import', function () {
        var done = this.async();

        var parseArgs = require('minimist');
        var argv = require('minimist')(process.argv.slice(2));

        var importFileName = argv.target || 'marinatravelblogcom.wordpress.2016-02-10_(1).xml';
        var promise = require('./scripts/plugins/wp-import/wp-import').import(importFileName);
        promise.then(function() {
            done(true);
        });

    });

    grunt.registerTask('run-generate', function () {
        var done = this.async();
        require('./scripts/generate').generate().then(done);
    });

    grunt.registerTask('generate', ['static', 'run-generate']);
    grunt.registerTask('import', ['init', 'run-import']);

    grunt.registerTask('all', ['import', 'generate']);
};