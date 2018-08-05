var gulp = require('gulp');
var coffee = require('gulp-coffee');
var pug = require('gulp-pug');

gulp.task('default', ['build-pug', 'build-coffee', 'copy-dist']);

gulp.task('build-pug', function() {
    return gulp.src('./pug/*.pug')
        .pipe(pug())
        .pipe(gulp.dest('./wwwroot/'));
});

gulp.task('build-coffee', function () {
    return gulp.src('./coffee/*.coffee')
        .pipe(coffee())
        .pipe(gulp.dest('./wwwroot/'));
});

gulp.task('copy-dist', function () {
    gulp.src('./bower_components/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('./wwwroot/lib/js/'));
});