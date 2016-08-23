'use strict';

/*!
 * Inspired Gruntfile
 * Copyright 2016 Seth Warburton
 * Version 0.04
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 */

module.exports = function(grunt) {

// Time how long tasks take. A big help when optimizing build times ;)
require('time-grunt')(grunt);

  // Configurable paths
  var config = {
    app: '_src/', // The source directory
    dist: '' // The output directory
  };

  //Initializing the configuration object
  grunt.initConfig({

    // Project settings
    config: config,

    browserSync: {
      files: [
        '_site/css/main.css',
        '<%= config.dist %>_site/**/*.*' // Watch Jekyll's output location
      ],
      options: {
        watchTask: true,
        server: {
          baseDir: '_site'
        }
      }
    },

    // Empties destination and temp folders to start fresh
    clean: {
      build: {
        src: [
          'css/**',
          'img/**',
          'js/**',
          '_site/**',
          '.jekyll-metadata'
        ],
        expand: true,
        options: {
          force: true
        },
      },
    },

    // Combine and copy JS, without minification, for development. Because
    // JS uglify is very slow in comparison we only uglify on build.
    concat: {
        options: {
        stripBanners: false
      },
      dev: {
        files: {
          '<%= config.dist %>js/plugins.js': [
            '<%= config.app %>js/plugins/*.js',
            'node_modules/feature.js/feature.js',
            'node_modules/wow.js/dist/wow.js'
          ],
          '<%= config.dist %>js/main.js': ['<%= config.app %>js/main.js'],
        },
      },
    },

    // Copies any remaining files
    copy: {
      files: {
        cwd: '<%= config.app %>js/vendor/',
        src: '**/*',
        dest: '<%= config.dist %>js/vendor/',
        expand: true
      }
    },

    // Process images to optimise file sizes for production
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>img',
          src: '{,*/}*.{gif,jpeg,jpg,png,svg}',
          dest: '<%= config.dist %>img'
        }]
      }
    },

    // Run a Jekyll site build.
    jekyll: {
      build: {
        dest: '_site'
      },
      options: {
        incremental: false,
      },
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        '<%= config.app %>js/*.js'
      ]
    },

    postcss: {
      options: {
        processors: [
          require('autoprefixer')({
            browsers: 'last 1 version, > 5%' // add vendor prefixes
          }),
        //  require('cssnano')() // optimise and the minify the result
        ],

        },
      dist: {
        files: {
          '<%= config.dist %>css/main.css': '<%= config.dist %>css/main.css'
        }
      }
    },

    // Compile Sass source files to CSS
    sass: {
      dev: {
        options: {
        //  expanded: true,
          precision: '5',
          sourceMap: true
        },
        files: {
          '<%= config.dist %>css/main.css': '<%= config.app %>scss/main.scss'
        }
      },
      dist: {
        options: {
          precision: '5',
          sourceMap: false
        },
        files: {
          '<%= config.dist %>css/main.css': '<%= config.app %>scss/main.scss'
        }
      }
    },

    scsslint: {
      allFiles: [
        '<%= config.app %>scss',
      ],
      options: {
        config: '<%= config.app %>scss-lint.yml',
        reporterOutput: '<%= config.app %>scss-lint-report.xml'
      },
    },

    // Optimise SVGs
    svgmin: {
        options: {
            plugins: [
                {
                    removeViewBox: false
                }, {
                    removeUselessStrokeAndFill: false
                }
            ]
        }
    },

    // Compress JS files for production
    uglify: {
      dist: {
        files: {
          '<%= config.dist %>js/plugins.js': [
            '<%= config.app %>js/plugins/*.js',
            'node_modules/feature.js/feature.js',
            'node_modules/wow.js/dist/wow.js'
          ],
          '<%= config.dist %>js/main.js': '<%= config.app %>js/main.js'
        }
      }
    },

    // Watch files for changes and run tasks based on the changed files
    watch: {
      sass: {
        files: [
          '<%= config.app %>scss/main.scss',
          '<%= config.app %>scss/variables.scss',
          '<%= config.app %>scss/**/**/*.scss'
        ],
        tasks: [
          'styles'
        ]
      },
      jekyll: {
        files: [
          '_data/*.yml',
          '_layouts/*.html',
          '_includes/*.html',
          '_pages/*.{html,md}',
          '**/_posts/*.{html,md}',
          '<%= config.dist %>css/main.css'
        ],
        tasks: ['jekyll']
      },
      js: {
        files: ['<%= config.app %>js/**/*.js', '<%= config.app %>js/*.js'],
        tasks: ['concat:dev']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    }
  });

  // Just-in-time plugin, for loading plugins really quickly.
  require('jit-grunt')(grunt, {
    scsslint: 'grunt-scss-lint',
    sftp: 'grunt-ssh'
  });

  // Task registration
  grunt.registerTask('default', ['dev']);
  grunt.registerTask('build', ['dist']);
  grunt.registerTask('styles', []);
  grunt.registerTask('images', []);
  grunt.registerTask('test', []);

  // Primary Task definition
  grunt.registerTask('build', ['clean','images','sass:dist','postcss','test','uglify','copy','jekyll']);
  grunt.registerTask('dev', ['clean','images','sass:dev','postcss','concat:dev','copy','jekyll','browserSync','watch']);
  grunt.registerTask('dist', ['clean','sass:dist','postcss','test','uglify','copy','jekyll']);

  // Sub-tasks, called by primary tasks, for better organisation.
  grunt.registerTask('images', ['imagemin','svgmin']);
  grunt.registerTask('styles', ['sass','postcss']);
  grunt.registerTask('test', ['scsslint']);
};
