'use strict';

//# declarations 
// Include/require Libs
var gulp = require('gulp'); 
var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path')
var colors = require('colors')
// Include/require Our Gulp Plugins
var plumber = require("gulp-plumber");
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var inject = require("gulp-inject");
var flatten = require("gulp-flatten");
var twig = require('twig');
var gulpTwig = require("gulp-twig");
var liveReload = require("gulp-livereload");
var del = require("del");
var autoprefixer = require("gulp-autoprefixer");
var ifElse = require("gulp-if-else");

// base dirs
var views = 'src/views';
var libs = 'src/libs';
var layouts = 'src/layouts';
var assets = ['src/assets/*.*', 'src/assets/**/*.*'];
var fonts = ['src/fonts/*.*'];

// Our External Javascript Libraries to Bring In
var jslibs = require('./'+libs+'/scripts.json');
// structure dirs
var viewsJS =  views+'/*/*.js';
var viewsTwig =  views+'/*/*.html';
var viewsSass =  views+'/*/*.scss';
var libJS = libs+'/js/*.js';
var libSass = libs+'/sass/*.scss';
var libsTwig = libs+'/twig/*.html';
var layoutsJS = layouts+'/*/*.js';
var layoutsTwig = layouts+'/*/*.html';
var layoutsSass = layouts+'/*/*.scss';
var buildDir = "build/public";
var buildImg = buildDir + "/assets";
var buildFont = buildDir + "/assets/fonts";
var buildCSS = buildDir + "/css";
var buildJS = buildDir + "/js";
var buildJSON = buildDir + "/assets/json";
var buildAssetsJS = buildDir + "/assets/js";
// global vars
var that = this;
var _building = true;


//# Functions for common tasks between tasks
function onError(err) {
    console.log(err);
    this.emit('end');
}

function mvFiles(src, dest) {
    // console.log( "Move Files" );
    return gulp.src( src )
        .pipe(gulp.dest( dest ))
        .pipe(ifElse( !_building, liveReload ));
}

function mvFilesConcat(src, dest, concatName) {
    return gulp.src( src )
        .pipe(concat(concatName))
        .pipe(gulp.dest( dest ))
        .pipe(ifElse( !_building, liveReload ));
}

function sassCompile(src, name, dest) {
    // console.log( "Sass compile" );
    return gulp.src( src )
        .pipe(plumber({errorHandler: onError}))
        .pipe(sass( { includePaths: [ libs+'/sass/'] } ))
        .pipe(autoprefixer())
        .pipe(concat(name))
        .pipe(gulp.dest( dest ))
        .pipe(ifElse( !_building, liveReload ));
}

function jsCompile(src, name, dest) {
    // console.log( "js compile" );
    return gulp.src( src )
        .pipe(plumber({errorHandler: onError}))
        .pipe(concat( name ))
        .pipe(gulp.dest( dest ))
        .pipe(ifElse( !_building, liveReload ));
}

// #Gulp Tasks
// Lint Task
gulp.task('lint', function() {
    return gulp.src( [viewsJS, libJS, layoutsJS] )
        .pipe(plumber({errorHandler: onError}))
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


var data = {
  'siteUrl': '/'
}

// #Layout related tasks
// Build out the layout twig
gulp.task('layout-twig', function() {
    // console.log( "Twig Tasks" );
    return gulp.src( layoutsTwig )
        .pipe(plumber({errorHandler: onError}))
        .pipe(gulpTwig({
          debug: false,
          base: path.join(__dirname, "/src/views"),
          data: data
        }))
        .pipe(gulp.dest( buildDir+"/" ))
        .pipe(ifElse( !_building, liveReload ));

});
// Compile Our Layout Sass
gulp.task('layout-sass', function() {
    return sassCompile(layoutsSass, 'layouts.css', buildCSS);
});
// Compile our layout js
gulp.task('layout-js', function() {
    mvFiles(libs+'/app.js', buildJS);
    return jsCompile(layoutsJS, "layouts.js", buildJS);
});

// #Libs related tasks
gulp.task('libs-js', function(){
  var srcs = [];
  for (var jl in jslibs) {
    srcs.push( jslibs[jl] );    
  }
  mvFilesConcat(srcs, buildJS,'libs.js');
});


// Build out libs (ie. common.scss )
gulp.task('libs-sass', function() {
    return sassCompile(libSass, 'libs.css', buildCSS);
});

// #Views related tasks
// compiled views sass files
gulp.task('views-sass', function() {
    return sassCompile(viewsSass, 'views.css', buildCSS);
});

gulp.task('views-js', function(){
    mvFilesConcat(viewsJS, buildJS, 'views.js');
})

// #Assets related tasks
// move files
gulp.task('assets-img-files', function() {
    return mvFiles(assets, buildImg);
});

gulp.task('assets-js-files', function() {
    return mvFiles(assets, buildAssetsJS);
});

gulp.task('assets-json-files', function() {
    return mvFiles(assets, buildJSON);
});

gulp.task('fonts-files', function() {
    return mvFiles(fonts, buildFont);
});


// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch( layoutsJS, ['lint', 'layout-js'] );
    gulp.watch( layoutsSass, ['layout-sass'] );
    gulp.watch( layoutsTwig, ['layout-twig'] );
    gulp.watch( viewsJS, ['views-js']);
    gulp.watch( viewsTwig, ['layout-twig']);
    gulp.watch( viewsSass, ['views-sass']);
    gulp.watch( assets, ['assets-img-files']);
    gulp.watch( assets, ['assets-json-files']);
    gulp.watch( assets, ['assets-js-files']);
    gulp.watch( fonts, ['fonts-files']);
    gulp.watch( libs+'/scripts.json', ['libs-js']);
    gulp.watch( libs+'/app.js', ['layout-js']);
    gulp.watch( libSass, ['libs-sass']);
    gulp.watch( libsTwig, ['layout-twig']);
});

gulp.task('remove-it-all', function(){
    return del(['build']);
});

gulp.task('server', function() {
    var dir = __dirname + '/build/public';
    app.use(require('connect-livereload')());
    app.use(express.static( dir ));
    app.listen(3001);
    liveReload.listen({quiet:true});
});

// Default Task
gulp.task('default', ['libs-js', 'libs-sass', 'assets-img-files', 'assets-json-files', 'assets-js-files', 'fonts-files', 'views-sass', 'views-js', 'layout-sass', 'layout-js', 'layout-twig', 'watch', 'server'], function(){
    _building = false;
    console.log(colors.rainbow("---------------------------------------------------------"));
    console.log(colors.rainbow("------------>>> Ready! Server On Port 3001 <<<-----------"));
    console.log(colors.rainbow("->> URL: http://localhost:3001/<layout>/<layout>.html <<-"));
    console.log(colors.rainbow("---------------------------------------------------------"));
});

//gulp.task('build', ['core', 'core-sass', 'partials', 'sass', 'scripts', 'assets']);

gulp.task('clean', ['remove-it-all']);