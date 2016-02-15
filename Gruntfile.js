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
            }
        },
        mkdir: {
            init: {
                options: {
                    create: ['content/posts/drafts', 'content/posts/published',
                        'content/pages/drafts', 'content/pages/published', 'public-debug/img']
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
            pretty: [
                "public-pretty"
            ]
        },
        prettify: {
            options: {
            },
            all: {
                expand: true,
                cwd: 'public-debug',
                ext: '.html',
                src: ['**/*.html'],
                dest: 'public-pretty'
            }
        }
    });


    grunt.loadNpmTasks('grunt-prettify');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-contrib-clean');
    //    grunt.loadNpmTasks('grunt-sharp');

    // Default task(s).
    grunt.registerTask('ri', ['responsive_images']);
    grunt.loadNpmTasks('grunt-execute');
//    grunt.registerTask('sharp', ['grunt-sharp']);

    grunt.registerTask('init', ['mkdir:init']);

    grunt.registerTask('static', ['bower', 'clean:bower', 'copy:css', 'copy:js',
        'copy:html', 'copy:bootstrap-css', 'copy:font-awesome-css',
        'copy:bootstrap-fonts', 'copy:font-awesome-fonts', 'copy:bootstrap-js',
        'copy:bootstrap-dropdown-js', 'copy:jquery', 'copy:favicon']);

    grunt.registerTask('run-import', function () {
        var done = this.async();

        var parseArgs = require('minimist');
        var argv = require('minimist')(process.argv.slice(2));

        var importFileName = argv.target || 'marinatravelblogcom.wordpress.2016-02-10_(1).xml';
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

    grunt.registerTask('run-generate', function () {
        var done = this.async();
        require('./scripts/generate').generate().then(done);
    });

    grunt.registerTask('generate', ['static', 'run-generate']);
    grunt.registerTask('import', ['init', 'run-import']);

    grunt.registerTask('all', ['import', 'generate']);

    grunt.registerTask('pretty-html', ['prettify', 'copy-pretty', 'clean:pretty']);
};