module.exports = function(grunt) {

    grunt.initConfig({
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'src/base.js',
                    'src/top.js',
                    'src/overlay.js',
                    'src/menu.js',
                    'src/head.js',
                    'src/users.js',
                    'src/channelmenu.js',
                    'src/control.js',
                    'src/book.js',
                    'src/channel.js',
                    'src/protocol.js',
                    'src/commands.js',
                    'src/settings.js'
                ],
                dest: 'dist/tadpole.js'
            }
        },
        uglify: {
            build: {
                src: 'dist/tadpole.js',
                dest: 'dist/tadpole.min.js'
            }
        },
        sass: {
            options: {
                unixNewlines: true
            },
            build: {
                src: 'css/tadpole.scss',
                dest: 'dist/tadpole.css'
            }
        },
        cssmin: {
            minify: {
                expand: true,
                cwd: 'dist/',
                src: ['dist/*.css', 'dist/!*.min.css'],
                dest: 'dist/',
                ext: '.min.css'
            }
        },
        copy: {
            css: {
                expand: true,
                src: ['dist/*.css'],
                dest: '../../heroku/frogpond/static/css/chat/',
                flatten: true
            },
            js: {
                expand: true,
                src: ['dist/*.js'],
                dest: '../../heroku/frogpond/static/js/chat/',
                flatten: true
            },
            font: {
                expand: true,
                src: ['font/*'],
                dest: '../../heroku/frogpond/static/font/',
                flatten: true
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    
    grunt.registerTask('default', ['concat', 'uglify', 'sass', 'cssmin', 'copy']);
    grunt.registerTask('js', ['concat', 'uglify', 'copy:js']);
    grunt.registerTask('css', ['sass', 'cssmin', 'copy:css']);

};

