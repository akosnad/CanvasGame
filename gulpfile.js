var gulp = require('gulp');
var pug = require('gulp-pug');

gulp.task('default', ['build-pug', 'copy-dist']);

gulp.task('watch', function () {
    gulp.watch('./pug/**', ['build-pug']);
})

gulp.task('build-pug', function() {
    return gulp.src('./pug/*.pug')
        .pipe(pug())
        .pipe(gulp.dest('./wwwroot/'));
});

gulp.task('copy-dist', function () {
    gulp.src('./bower_components/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('./wwwroot/lib/js/'));
    //gulp.src('./bower_components/requirejs/require.js')
    //    .pipe(gulp.dest('./wwwroot/lib/js/'))
});