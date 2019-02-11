var gulp = require('gulp');
var pug = require('gulp-pug');
var strip = require('gulp-strip-code');
var rename = require('gulp-rename');


gulp.task('watch', function () {
    gulp.watch('./pug/**', gulp.parallel(['build-pug']));
    gulp.watch('./ts_gen/**', gulp.parallel(['nostrip']));
})

gulp.task('strip', function() {
    return gulp.src('./ts_gen/main.ts')
    .pipe(strip({
        start_comment: "start-debug",
        end_comment: "end-debug"
    }))
    .pipe(rename('main_generated.ts'))
    .pipe(gulp.dest('./ts'));
})

gulp.task('nostrip', function() {
    return gulp.src('./ts_gen/main.ts')
    .pipe(rename('main_generated.ts'))
    .pipe(gulp.dest('./ts'));
})


gulp.task('build-pug', function() {
    return gulp.src('./pug/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('./wwwroot/'));
});

gulp.task('copy-dist', function (done) {
    gulp.src('./node_modules/jquery/dist/jquery.min.js')
    .pipe(gulp.dest('./wwwroot/lib/js/'));
    gulp.src('./node_modules/mdbootstrap/js/popper.min.js')
    .pipe(gulp.dest('./wwwroot/lib/js/'));
    gulp.src('./node_modules/mdbootstrap/js/bootstrap.min.js')
    .pipe(gulp.dest('./wwwroot/lib/js'));
    gulp.src('./node_modules/mdbootstrap/js/mdb.min.js')
    .pipe(gulp.dest('./wwwroot/lib/js'));
    gulp.src('./node_modules/@aspnet/signalr/dist/browser/signalr.min.js')
    .pipe(gulp.dest('./wwwroot/lib/js'));
    gulp.src('./node_modules/file-saver/FileSaver.min.js')
    .pipe(gulp.dest('./wwwroot/lib/js'));
    
    
    gulp.src('./node_modules/mdbootstrap/css/bootstrap.min.css')
    .pipe(gulp.dest('./wwwroot/lib/css'));
    gulp.src('./node_modules/mdbootstrap/css/mdb.min.css')
    .pipe(gulp.dest('./wwwroot/lib/css'));
    gulp.src('./node_modules/font-awesome/css/font-awesome.min.css')
    .pipe(gulp.dest('./wwwroot/lib/css'));
    gulp.src('./node_modules/mdbootstrap/font/roboto/*')
    .pipe(gulp.dest('./wwwroot/lib/font/roboto'));
    gulp.src('./node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest('./wwwroot/lib/fonts/'));
    done();
});

gulp.task('release', gulp.parallel(['build-pug', 'copy-dist', 'strip']));
gulp.task('dev', gulp.parallel(['build-pug', 'copy-dist', 'nostrip']));