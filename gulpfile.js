'use strict';

var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

var del = require('del');

gulp.task('lint', function () {
  return gulp.src('scripts/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('coverage', function (cb) {
  gulp.src('src/**/*.js')
    .pipe(istanbul({
      includeUntested: true
    })) // Covering files
    .on('finish', function () {
      gulp.src(['test/*.js'])
        .pipe(mocha({ reporter: 'spec' }))
        .pipe(istanbul.writeReports()) // Creating the reports after tests runned
        .on('end', cb);
    });
});

gulp.task('test', function (cb) {
  gulp.src(['test/*.js'])
    .pipe(mocha({ reporter: 'spec' }))
    .on('end', cb);
});

gulp.task('watch', function () {
  gulp.watch('tests/**/*', ['test']);
});

gulp.task('clean', function (cb) {
  del(['build'], cb);
});

gulp.task('developServer', function () {
  nodemon({
    script: 'src/server.js'
  })
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('restarted!');
    });
});

gulp.task('develop', ['developServer', 'tdd']);

gulp.task('default', ['lint', 'test']);

gulp.task('build', ['lint', 'coverage']);
