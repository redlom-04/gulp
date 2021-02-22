// main methods
const { src, dest, watch, parallel, series } = require("gulp");
// compiler
const pug = require("gulp-pug");
const sass = require("gulp-sass");
// js
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
// images
const imagemin = require("gulp-imagemin");
// del
const del = require("del");
// browser
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
// functions

// functions browser
function browserSyncFunction() {
	browserSync.init({
		server: {
			baseDir: "app/compiled",
			index: "html/index.html",
		},
	});
}

// functions del
function delDist() {
	return del("dist");
}

// functions build
function build() {
	return src(
		[
			"app/compiled/html/*.html",
			"app/compiled/fonts/**/*",
			"app/compiled/css/index.min.css",
			"app/compiled/js/index.min.js",
			"app/compiled/images/**/*"
		],
		{ base: "app/compiled/" }
	).pipe(dest("dist/"));
}

// functions image
function imageCompress() {
	return src("app/source/images/**/*").pipe(
		imagemin([
			imagemin.gifsicle({ interlaced: true }),
			imagemin.mozjpeg({ quality: 75, progressive: true }),
			imagemin.optipng({ optimizationLevel: 5 }),
			imagemin.svgo({
				plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
			}),
		])
	).pipe(dest("app/compiled/images/"));
}

// functions compiler
function pugCompiler() {
	return src("app/source/pug/index.pug")
		.pipe(
			pug({
				pretty: false,
				doctype: "html",
			})
		)
		.pipe(dest("app/compiled/html/"))
		.pipe(browserSync.stream());
}

function sassCompiler() {
	return src("app/source/scss/index.scss")
		.pipe(
			sass({
				outputStyle: "compressed",
			})
		)
		.pipe(concat("index.min.css"))
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 10 version"],
			})
		)
		.pipe(dest("app/compiled/css/"))
		.pipe(browserSync.stream());
}

function jsConcatUglify() {
	return src(["app/source/js/index.js"])
		.pipe(concat("index.min.js"))
		.pipe(uglify())
		.pipe(dest("app/compiled/js/"))
		.pipe(browserSync.stream());
}

// function file watcher
function fileWatching() {
	watch(["app/source/pug/**/*.pug"], pugCompiler);
	watch(["app/source/scss/**/*.scss"], sassCompiler);
	watch(["app/source/js/**/*.js"], jsConcatUglify);
	watch(["app/compiled/html/**/*.html"]).on("change", browserSync.reload);
}

exports.fileWatching = fileWatching;
exports.pugCompiler = pugCompiler;
exports.sassCompiler = sassCompiler;
exports.browserSyncFunction = browserSyncFunction;
exports.jsConcatUglify = jsConcatUglify;
exports.delDist = delDist;
exports.imageCompress = imageCompress;

exports.build = series(delDist, imageCompress, build);
exports.default = parallel(
	pugCompiler,
	sassCompiler,
	jsConcatUglify,
	browserSyncFunction,
	fileWatching
);
