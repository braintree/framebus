"use strict";

var gulp = require("gulp");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var uglify = require("gulp-uglify");
var streamify = require("gulp-streamify");
var size = require("gulp-size");
var concat = require("gulp-concat");
var del = require("del");
var removeCode = require("gulp-remove-code");
var browserify = require("browserify");
var tsify = require("tsify");

function cleanBuild() {
  return del(["dist-app/*"]);
}

function cleanTest() {
  return del(["spec/functional/public/js/test-app.js"]);
}

function build() {
  var b = browserify({
    entries: "./src/lib/framebus.ts",
    standalone: "framebus",
    debug: true,
  });

  return b
    .plugin("tsify", { strict: true })
    .bundle()
    .pipe(source("framebus.min.js"))
    .pipe(buffer())
    .pipe(removeCode({ production: true }))
    .pipe(streamify(size({ showFiles: true })))
    .pipe(uglify())
    .pipe(gulp.dest("./dist-app/"));
}

function functionalPrep() {
  return gulp.series(build, function () {
    return gulp
      .src([
        "dist-app/framebus.min.js",
        "spec/functional/public/js/app-support.js",
      ])
      .pipe(concat("test-app.js"))
      .pipe(gulp.dest("spec/functional/public/js"));
  });
}

function watch() {
  gulp.watch(["lib/**/*.js", "index.js"], gulp.task(build));
}

function watchIntegration() {
  gulp.watch(["lib/**/*.js", "index.js"], gulp.task(build));
}

function clean() {
  return gulp.series(cleanBuild, cleanTest);
}

exports.clean = clean();
exports.functionalTestPrep = functionalPrep();
exports.functionalTestPrep.displayName = "functional:prep";
exports.watchIntegration = watchIntegration;
exports.watchIntegration.displayName = "watch:integration";
exports.watch = watch;
