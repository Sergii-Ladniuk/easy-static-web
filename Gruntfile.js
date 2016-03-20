module.exports = function (grunt) {

    var settings = require('./scripts/settings').loadSync();

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
            seo: {
                expand: true,
                cwd: 'static/seo',
                src: '**',
                dest: '../public',
                flatten: true,
                filter: 'isFile'
            },
            htaccess: {
                expand: true,
                cwd: 'static/seo',
                src: '.htaccess',
                dest: '../public',
                flatten: true
            },
            css: {
                expand: true,
                cwd: 'static/css',
                src: '**',
                dest: './public-debug/css',
                flatten: true,
                filter: 'isFile'
            },
            "bootstrap-css": {
                expand: true,
                cwd: 'static/components/bootstrap/dist/css/',
                src: 'bootstrap.min.css',
                dest: './public-debug/css',
                flatten: true,
                filter: 'isFile'
            },
            "font-awesome-css": {
                expand: true,
                cwd: 'static/components/font-awesome/css/',
                src: 'font-awesome.min.css',
                dest: './public-debug/css',
                flatten: true,
                filter: 'isFile'
            },
            "bootstrap-fonts": {
                expand: true,
                cwd: 'static/components/bootstrap/dist/fonts/',
                src: 'glyphicons-halflings-regular.*',
                dest: './public-debug/fonts',
                flatten: true,
                filter: 'isFile'
            },
            "font-awesome-fonts": {
                expand: true,
                cwd: 'static/components/font-awesome/fonts/',
                src: 'fontawesome-webfont.*',
                dest: './public-debug/fonts',
                flatten: true,
                filter: 'isFile'
            },
            "font-awesome-fonts-publish": {
                expand: true,
                cwd: 'static/components/font-awesome/fonts/',
                src: 'fontawesome-webfont.*',
                dest: '../public/fonts',
                flatten: true,
                filter: 'isFile'
            },
            "bootstrap-js": {
                expand: true,
                cwd: 'static/components/bootstrap/dist/js/',
                src: 'bootstrap.min.js',
                dest: './public-debug/js',
                flatten: true,
                filter: 'isFile'
            },
            "bootstrap-dropdown-js": {
                expand: true,
                cwd: 'static/components/bootstrap-dropdown/',
                src: 'index.js',
                dest: './public-debug/js/bootstrap-dropdown/',
                flatten: true,
                filter: 'isFile'
            },
            "jquery": {
                expand: true,
                cwd: 'static/components/jquery/dist/',
                src: 'jquery.min.js',
                dest: './public-debug/js',
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
            },
            js1: {
                expand: true,
                cwd: 'static/js-alone',
                src: '**',
                dest: './public-debug/js',
                flatten: true,
                filter: 'isFile'
            },
            pretty: {
                expand: true,
                cwd: 'public-pretty',
                src: '**/*',
                dest: 'public-debug',
                flatten: true,
                filter: 'isFile'
            },
            favicon: {
                expand: true,
                cwd: 'static',
                src: 'favicon.ico',
                dest: 'public-debug',
                flatten: true,
                filter: 'isFile'
            },
            "favicon-publish": {
                expand: true,
                cwd: 'static',
                src: 'favicon.ico',
                dest: '../public',
                flatten: true,
                filter: 'isFile'
            }
        },
        mkdir: {
            init: {
                options: {
                    create: ['content/posts/drafts', 'content/posts/published',
                        'content/pages/drafts', 'content/pages/published', 'public-debug/img', 'public/img']
                }
            }
        },
        bower: {
            install: {}
        },
        clean: {
            bower: [
                "lib"
            ],
            "public-debug": {
                contents: [
                    "public-debug",
                    "!public-debug/img",
                    "!public-debug/img/**"
                ]
            }
        },
        uglify: {
            options: {
                ASCIIOnly: true
            },
            publish: {
                files: {
                     '../public/js/all.js': [
                         'static/components/jquery/dist/jquery.min.js',
                         //'static/components/bootstrap/dist/js/bootstrap.min.js',
                         //'static/components/bootstrap-dropdown/index.js',
                         'static/js/*.js']
                }
            },
            'publish-alone': {
                files: {
                    '../public/js/no-defer.js': [
                        'static/js-alone/*.js'
                    ]
                }
            }
        },
        cssmin: {
            options: {
                preserveComments: 0,
                keepSpecialComments: 0
            },
            publish: {
                files: {
                    '../public/css/all.css': [
                        'public-debug/css/bootstrap.css',
                        'public-debug/css/font-awesome.min.css',
                        'public-debug/css/lazy-img.css',
                        'public-debug/css/return-to-top.css',
                        'public-debug/css/travel-style.css'
                    ]
                }
            }
        },
        linkChecker: {
            // Use a large amount of concurrency to speed up check
            options: {
                maxConcurrency: 20
            },
            dev: {
                site: 'localhost',
                options: {
                    initialPort: 4000
                }
            },
            postDeploy: {
                site: 'marinatravelblog.com'
            }
        }
    });


    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-imageoptim');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-link-checker');

    grunt.registerTask('init', ['mkdir:init']);

    grunt.registerTask('static', ['bower', 'clean:bower', 'copy:css', 'copy:js', 'copy:js1',
        'copy:html',
        //'copy:bootstrap-css',
        'copy:font-awesome-css',
        'copy:font-awesome-fonts',
        //'copy:bootstrap-js',
        //'copy:bootstrap-dropdown-js',
        'copy:jquery',
        'copy:favicon']);

    grunt.registerTask('run-import', function () {
        var done = this.async();

        var importFileName = grunt.option('target') || 'marinatravelblogcom.wordpress.2016-02-10_(1).xml';

        var promise = require('./scripts/plugins/wp-import/wp-import').import(importFileName);
        promise.then(function () {
            done(true);
        });
    });
    grunt.registerTask('new', function () {
        var type = grunt.option('type') || 'post';
        var imgPattern = grunt.option('img') || '';
        var alt = grunt.option('alt') || '';
        var title = grunt.option('title');

        if (!title) {
            throw new Error('Post title is not specified!\n Usage:\n ' +
                'grunt new --title [title] --img [image pattern] --type ["post" or "page"] --alt [common alt for images]')
        }

        if (type && type !== 'post' && type !== 'page') {
            throw new Error('Type argument should either "post" or "page"!\n Usage:\n ' +
                'grunt new --title [title] --img [image pattern] --type ["post" or "page"] --alt [common alt for images]')
        }

        var done = this.async();
        require('./scripts/new-post')(title, imgPattern, alt, type);
    });
    grunt.registerTask('load-settings', function () {
        var done = this.async();
        require('./scripts/settings').load.then(function (settings) {
            this.customSettings = settings;
        });
    });
    grunt.registerTask('run-generate', function () {
        var done = this.async();
        require('./scripts/generate').generate().then(done);
    });
    grunt.registerTask('fix-links', function() {
        var done = this.async();
        require('./scripts/tools/pre-publish')()
            .then(done);
    });
    grunt.registerTask('deploy', function() {
        var done = this.async();
        var msg = grunt.option('m') || grunt.option('msg') || 'update';
        require('./scripts/tools/deploy')(msg)
            .then(done);
    });

    grunt.registerTask('generate', ['static', 'run-generate']);
    grunt.registerTask('pre-publish', ['generate', 'uglify', 'cssmin',
        'copy:font-awesome-fonts-publish', 'copy:favicon-publish', 'copy:seo', 'copy:htaccess']);
    grunt.registerTask('publish', ['pre-publish', 'fix-links']);
    grunt.registerTask('publish-deploy', ['publish', 'deploy']);
    grunt.registerTask('import', ['init', 'run-import']);
    grunt.registerTask('all', ['import', 'generate']);

};