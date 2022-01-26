/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

const gulp = require("gulp");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");
const streamify = require("gulp-streamify");
const size = require("gulp-size");
const concat = require("gulp-concat");
const del = require("del");
const removeCode = require("gulp-remove-code");
const browserify = require("browserify");

function cleanBuild() {
  return del(["dist-app/*"]);
}

function cleanTest() {
  return del(["spec/functional/public/js/test-app.js"]);
}

function build() {
  const b = browserify({
    entries: "./src/index.ts",
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
