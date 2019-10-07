'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util'); // @TODO evaluate if there's still need for this
const exec = require('gulp-exec');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const eslint = require('gulp-eslint');
const prettier = require('gulp-prettier');
const sasslint = require('gulp-sass-lint');
const uglify = require('gulp-uglify-es').default;
const bs = require('browser-sync').create();
const axe = require('gulp-axe-webdriver');

let CONFIG = {
  browsersync: {
    proxy: 'localhost:9999',
    logFileChanges: true
  },
  metalsmith: {
    runtime: {
      continueOnError: false,
      pipeStdout: false
    },
    onerror: {
      err: true,
      stderr: true,
      stdout: true
    }
  },
  sass: {
    build: {
      includePaths: ['./src/styles/', './src/modules'],
      outputStyle: 'compressed'
    },
    lint: {
      configFile: '.sass-lint.yml'
    }
  },
  eslint: {
    configFile: 'eslintrc.json',
    rules: {
      "no-console": "off"
    }
  },
  prettier: {
    config: '.prettierrc'
  },
  axe: {
    urls: ['./static/**/*.html'],
    tags: ['wcag2a','wcag2aa'],
    headless: true
  }
};

// Dev mode with hot-reloading
gulp.task('browser-sync', function() {
  bs.init(CONFIG.browsersync);

  return gulp.watch(['./src/**/*.*'], function() {
    setTimeout(function() {
      bs.reload();
    }, 500);
  });
});

/*
// =======================
//  HTML
// =======================
*/
gulp.task('html', function() {
  return gulp
    .src(['./src/modules/**/*.md', './src/layouts/**/*.html'])
    .pipe(
      exec('node index.js', CONFIG.metalsmith.runtime)
    )
    .pipe(
      exec.reporter(CONFIG.metalsmith.onerror)
    );
});

gulp.task('html:watch', function() {
  return gulp.watch(['./src/modules/**/*.md', './src/layouts/*.html'], gulp.parallel('html'));
});

/*
// =======================
//  SASS
// =======================
*/
gulp.task('sass', function() {
  return gulp
    .src(['./src/styles/global.scss'])
    .pipe(
      sass(CONFIG.sass.build).on('error', sass.logError)
    )
    .pipe(rename('bundle.min.css'))
    .pipe(gulp.dest('./static/_styles'));
});

gulp.task('sass:lint', function() {
  return gulp
    .src(['./src/components/**/*.scss', './src/layouts/_stys/*.scss'])
    .pipe(sasslint(CONFIG.sass.lint))
    .pipe(sasslint.format())
    .pipe(sasslint.failOnError());
});

gulp.task('sass:watch', function() {
  return gulp.watch(
    ['./src/styles/*.scss', './src/modules/**/*.scss'],
    gulp.series('sass:lint', 'sass')
  );
});

/*
// =======================
//  Javascript
// =======================
*/
gulp.task('js', function() {
  return gulp
    .src(['./src/scripts/*.js', './src/modules/**/*.js'])
    .pipe(eslint(CONFIG.eslint))
    .pipe(eslint.format())
    .on('error', function(err) {
      gutil.log(gutil.colors.red('[ERROR]', err.toString()));
    })
    .pipe(concat('bundle.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./static/_scripts'));
});

gulp.task('js:watch', function() {
  return gulp.watch(
    ['./src/scripts/*.js', './src/modules/**/*.js'],
    gulp.series('js')
  );
});

/*
// =======================
//  Vendor files
// =======================
*/
gulp.task("copy:vendor:scripts", function() {
  return gulp.src(
    ['./src/scripts/_vendor/**/*'],
    {
      base: 'src/scripts'
    })
    .pipe(gulp.dest('static'));
});

gulp.task("copy:vendor:styles", function() {
  return gulp.src(
    ['./src/styles/_vendor/**/*'],
    {
      base: 'src/styles'
    })
    .pipe(gulp.dest('static'));
});

gulp.task('copy:vendor', gulp.parallel(
  'copy:vendor:scripts',
  'copy:vendor:styles'
));

/*
// =======================
//  Tests
// =======================
*/
gulp.task("test:a11y", function() {
  return axe(CONFIG.axe);
});

gulp.task("test", gulp.series("test:a11y"));

/*
// =======================
//  Build
// =======================
*/
gulp.task('build:prod', gulp.parallel(
  'sass',
  'js',
  'html',
  'copy:vendor'
));

gulp.task('build:dev', gulp.series(
  gulp.parallel(
    'build:prod'
  ),
  gulp.parallel(
    'sass:watch',
    'js:watch',
    'html:watch',
    'browser-sync'
  )
));
