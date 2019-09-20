'use strict';

var gulp = require('gulp'),
  gutil = require('gulp-util'),
  exec = require('gulp-exec'),
  sass = require('gulp-sass'),
  concat = require('gulp-concat'),
  eslint = require('gulp-eslint'),
  prettier = require('gulp-prettier'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  bs = require('browser-sync').create(),
  axe = require('gulp-axe-cli'),
  eslintConfig = {
    configFile: 'eslintrc.json',
    rules: {
      "no-console": "off"
    }
  },
  prettierConfig = {
    config: '.prettierrc'
  },
  sasslintConfig = {
    configFile: '.sass-lint.yml'
  },
  axeConfig = {
    urls: function(file) {
      var host = 'http://localhost:9999/';
      var dir = file.substring(file.lastIndexOf('/'));
      var page = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'));

      return host + path;
    },
    tags: ['wcag2a','wcag2aa']
  };

// Dev mode with hot-reloading
gulp.task('browser-sync', function() {
  bs.init({
    proxy: 'localhost:3000',
    logFileChanges: true
  });

  return gulp.watch(['./static/**/*.*'], function() {
    setTimeout(function() {
      bs.reload();
    }, 500);
  });
});

gulp.task('sass', function() {
  return gulp
    .src(['./src/layouts/styles.scss'])
    .pipe(
      sass({
        includePaths: ['./src/layouts/', './src/components/', './src/modules'],
        outputStyle: 'compressed'
      }).on('error', sass.logError)
    )
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest('./static/stys'));
})

gulp.task('sass:watch', function() {
  return gulp.watch(['./src/**/*.scss'], ['sass']);
});

gulp.task('js', function() {
  return gulp
    .src('./src/**/*.js')
    .pipe(eslint(eslintConfig))
    .pipe(eslint.format())
    .on('error', function(err) {
      gutil.log(gutil.colors.red('[ERROR]', err.toString()));
    })
    .pipe(concat('bundle.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./static/scrs'));
});

gulp.task('js:watch', function() {
  return gulp.watch('./src/**/*.js', ['js']);
});

gulp.task("test:a11y", function() {
  return gulp
    .src(["./static/**/*.html"])
    .pipe(axe(axeConfig))
    .pipe(gulp.dest('./.axe-dump'));
});

gulp.task("test", gulp.series("test:a11y"));

gulp.task('dev', function() {
  gulp.start('sass');
  gulp.start('sass:watch');
  gulp.start('js');
  gulp.start('js:watch');
  gulp.start('browser-sync');
});

gulp.task('prod', function() {
  gulp.start('sass');
  gulp.start('js');
});
