'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var size = require('gulp-size');
var concat = require('gulp-concat');
var del = require('del');
var removeCode = require('gulp-remove-code');
var browserify = require('browserify');

gulp.task('clean:build', function (cb) {
  del(['dist/*'], cb);
});

gulp.task('clean:test', function (cb) {
  del(['spec/functional/public/js/test-app.js'], cb);
});

gulp.task('build', function () {
  var b = browserify({
    entries: './lib/framebus.js',
    standalone: 'framebus',
    debug: true
  });

  return b.bundle()
    .pipe(source('framebus.min.js'))
    .pipe(buffer())
    .pipe(removeCode({production: true}))
    .pipe(streamify(size({showFiles: true})))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('unit', function () {
  return gulp.src('spec/unit/**/*.js', {read: false})
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('functional:prep', ['build'], function () {
  return gulp.src([
    'dist/framebus.min.js',
    'spec/functional/public/js/app-support.js'
  ])
    .pipe(concat('test-app.js'))
    .pipe(gulp.dest('spec/functional/public/js'));
});

gulp.task('watch', function () {
  gulp.watch(['spec/unit/**/*.js'], ['unit']);
  gulp.watch(['lib/**/*.js', 'index.js'], ['build']);
});

gulp.task('watch:integration', function () {
  gulp.watch(['lib/**/*.js', 'index.js'], ['build']);
});

gulp.task('clean', ['clean:build', 'clean:test']);
gulp.task('test', ['unit']);
gulp.task('default', ['test']);
