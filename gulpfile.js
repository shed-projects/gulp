    var gulp = require('gulp'),
        runSequence = require('run-sequence'),
        browserSync = require('browser-sync').create(),
        ect = require('gulp-ect-simple'),
        $ = require("gulp-load-plugins")();

    var OPTION = {
        TO_SHIFTJIS: false//shift-jisに変換するかどうか
    };

    var DIR = {
        DEV: './develop/',
        RELEASE: './release/',
    };

    var PATH = {
        ECT: '**/*.ect',
        ECT_JS: '**/*.jsect',
        HTML: '**/*.html',
        CSS: '**/*.css',
        SASS: '**/*.scss',
        JS: '**/*.js',
        IMG: '**/*.{png,jpg,gif,ico}',
        XML: '**/*.{xml,json}',
        FONTS: '**/*.{eot,svg,ttf,woff,woff2}'
    };


    /**=================================================
     * @DEVELOP TASK
     =================================================*/

    //SASS
    gulp.task('sass', function(){
        return gulp
            .src(DIR.DEV + PATH.SASS)
            .pipe($.plumber({
                errorHandler: $.notify.onError('ERROR: <%= error.message %>')
            }))
            .pipe($.sass())
            .pipe($.pleeease({
                fallbacks: { autoprefixer: ['last 4 versions'] },
                minifier: false
            }))
            .pipe(gulp.dest(DIR.DEV))
            .pipe(browserSync.stream());
    });

    //ECT
    gulp.task('ect', function(){
        return gulp
            .src([
                DIR.DEV + PATH.ECT,
                '!' + DIR.DEV + '**/_*.ect'
            ])
            .pipe($.plumber({
                errorHandler: $.notify.onError('ERROR: <%= error.message %>')
            }))
            .pipe(ect({
                options: {root: DIR.DEV, ext: '.ect', open: '[%', close: '%]' },
                data: {}
            }))
            .pipe(gulp.dest(DIR.DEV));
    });

    //WATCH
    gulp.task('watch', function(){
        gulp.watch(DIR.DEV + PATH.ECT, ['ect']);
        gulp.watch(DIR.DEV + PATH.SASS, ['sass']);
        gulp.watch(DIR.DEV + PATH.CSS).on('change', browserSync.reload);
        gulp.watch(DIR.DEV + PATH.JS).on('change', browserSync.reload);
        gulp.watch(DIR.DEV + PATH.HTML).on('change', browserSync.reload);
    });

    //BROWSER SYNC
    gulp.task('local-server', function(){
        browserSync.init({ server: { baseDir: DIR.DEV }});
    });


    /**=================================================
     * @RELEASE TASK
     =================================================*/
    //COPY
    gulp.task('copy-clean', function(){
        return gulp
            .src(DIR.RELEASE, { read: false })
            .pipe($.clean());
    });

    gulp.task('copy', ['copy-clean'], function(){
        return gulp
            .src([
                DIR.DEV + PATH.HTML,
                DIR.DEV + PATH.CSS,
                DIR.DEV + PATH.JS,
                DIR.DEV + PATH.IMG,
                DIR.DEV + PATH.XML,
                DIR.DEV + PATH.FONTS
            ])
            .pipe(gulp.dest(DIR.RELEASE));
    });

    //BEAUTIFIER
    gulp.task('beautifier', function(){
        return gulp.src([
                DIR.RELEASE + PATH.HTML,
                DIR.RELEASE + PATH.CSS,
                DIR.RELEASE + PATH.JS
            ])
            .pipe($.jsbeautifier({
                indentSize: 4
            }))
            .pipe(gulp.dest(DIR.RELEASE))
    });

    /**-----------
     * RUN TASK
     -----------*/
    gulp.task('default', function(callback){
        runSequence(
            [
                'ect',
                'sass',
                'local-server',
                'watch'
            ],
            callback
        );
    });

    gulp.task('release', function(callback){
        runSequence(
            'copy',
            'beautifier',
            callback
        );
    });
