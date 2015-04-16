var gulp = require('gulp');
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var size = require('gulp-size');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
var del = require('del');
var removeCode = require('gulp-remove-code');

gulp.task('clean:build', function (cb) {
  del(['dist/*'], cb);
});

gulp.task('clean:test', function (cb) {
  del(['spec/functional/public/js/test-app.js'], cb);
});

gulp.task('lint', function () {
  return gulp.src(['lib/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('build', function () {
  return gulp.src('./lib/framebus.js')
    .pipe(removeCode({ production: true }))
    .pipe(streamify(size({ showFiles: true })))
    .pipe(gulp.dest('dist'))
    .pipe(streamify(uglify()))
    .pipe(rename('framebus.min.js'))
    .pipe(streamify(size({ showFiles: true })))
    .pipe(streamify(size({ showFiles: true, gzip: true })))
    .pipe(gulp.dest('dist'));
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

gulp.task('functional', ['functional:prep'], function () {
  return gulp.src([
    'spec/functional/**/*.js',
    '!spec/functional/public/**/*.js',
  ], {read: false})
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('watch', function () {
  gulp.watch(['spec/unit/**/*.js'], ['unit']);
  gulp.watch(['spec/functional/**/*.js'], ['functional']);
  gulp.watch(['lib/**/*.js', 'index.js'], ['lint', 'build']);
});

gulp.task('watch:integration', function () {
  gulp.watch(['lib/**/*.js', 'index.js'], ['lint', 'build']);
});

gulp.task('clean', ['clean:build', 'clean:test'])
gulp.task('test', ['unit', 'functional', 'lint']);
gulp.task('default', ['test']);
