module.exports = function(grunt) {

    grunt.initConfig({
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['src/*.js'],
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

