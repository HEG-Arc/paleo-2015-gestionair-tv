// Generated on 2015-05-29 using generator-angular 0.11.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json']
      },
      typescript: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.ts'],
        tasks: ['typescript:base']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '*.css',
          '.tmp/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect().use(
                '/app/styles',
                connect.static('./app/styles')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    tslint: {
      options: {
          configuration: grunt.file.readJSON("tslint.json")
      },
      all: {
          src: ["scripts/*.ts"] // avoid linting typings files and node_modules files
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git{,*/}*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Compiles TypeScript to JavaScript
    typescript: {
      base: {
        src: ['<%= yeoman.app %>/scripts/{,*/}*.ts'],
          dest: '.tmp/scripts',
          options: {
          module: 'commonjs', //or commonjs
            target: 'ES5', //or es3
            'base_path': '<%= yeoman.app %>/scripts', //quoting base_path to get around jshint warning.
            sourcemap: true,
            declaration: false
        }
      }
    },


    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            '*.css',
            'images/{,*/}*.*',
            'fonts/{,*/}*.*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*']
        },{
          expand: true,
          cwd: '.',
          dest: '<%= yeoman.dist %>',
          src: [
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/phaser/build/phaser.min.js',
            'bower_components/sockjs-client/dist/sockjs.min.js',
            'bower_components/stomp-websocket/lib/stomp.min.js']
        }, {
          expand: true,
          cwd: '.tmp/scripts',
          dest: '<%= yeoman.dist %>/scripts',
          src: '{,*/}*.js'
        }]
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'tslint:all',
        'typescript:base'
      ],
      dist: [
        'tslint:all',
        'typescript'
      ]
    }
  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'concurrent:dist',
    'copy:dist'
  ]);

};
