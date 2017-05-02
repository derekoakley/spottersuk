var gulp = require("gulp");
var gulpSequence = require("gulp-sequence");
var cp = require("child_process");
var del = require("del");
var imagemin = require("gulp-imagemin");
var inlinesource = require("gulp-inline-source");
var minify = require("gulp-minify");
var realFavicon = require("gulp-real-favicon");
var fs = require("fs");

gulp.task("clean", function() {
	return del([
		"faviconData.json",
		"manifest.json",
		"www/gulpfile.js",
		"www/package.json",
		"www/style.css",
		"www/css/**",
		"www/js/*-debug.js",
		"www/node_modules/**"
	]);
});

gulp.task("compile", function(done) {
	cp.exec("harp compile", { stdio: "inherit" }).on("close", done);
});

gulp.task("compress", function() {
	gulp
		.src("js/*.js")
		.pipe(
			minify({
				ext: {
					src: "-debug.js",
					min: ".js"
				},
				exclude: ["tasks"],
				ignoreFiles: [".combo.js", "-min.js"]
			})
		)
		.pipe(gulp.dest("www/js"));
});

gulp.task("images", function() {
	return gulp
		.src("img/*")
		.pipe(
			imagemin({
				multipass: true,
				optimizationLevel: 7,
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }]
			})
		)
		.pipe(gulp.dest("www/img"));
});

gulp.task("inlinesource", function() {
	var options = {
		compress: false
	};

	return gulp.src("www/*.html").pipe(inlinesource()).pipe(gulp.dest("www/"));
});

// RealFaviconGenerator

// File where the favicon markups are stored
var FAVICON_DATA_FILE = "faviconData.json";

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task("generate-favicon", function(done) {
	realFavicon.generateFavicon(
		{
			masterPicture: "img/favicon.png",
			dest: "www/",
			iconsPath: "/",
			design: {
				ios: {
					pictureAspect: "backgroundAndMargin",
					backgroundColor: "#00a860",
					margin: "14%",
					assets: {
						ios6AndPriorIcons: false,
						ios7AndLaterIcons: false,
						precomposedIcons: false,
						declareOnlyDefaultIcon: true
					}
				},
				desktopBrowser: {},
				windows: {
					pictureAspect: "noChange",
					backgroundColor: "#00a860",
					onConflict: "override",
					assets: {
						windows80Ie10Tile: false,
						windows10Ie11EdgeTiles: {
							small: false,
							medium: true,
							big: false,
							rectangle: false
						}
					}
				},
				androidChrome: {
					pictureAspect: "noChange",
					themeColor: "#00a860",
					manifest: {
						display: "standalone",
						orientation: "notSet",
						onConflict: "override",
						declared: true
					},
					assets: {
						legacyIcon: false,
						lowResolutionIcons: false
					}
				},
				safariPinnedTab: {
					pictureAspect: "blackAndWhite",
					threshold: 90,
					themeColor: "#00a860"
				}
			},
			settings: {
				scalingAlgorithm: "Mitchell",
				errorOnImageTooSmall: false
			},
			markupFile: FAVICON_DATA_FILE
		},
		function() {
			done();
		}
	);
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task("inject-favicon-markups", function() {
	return gulp
		.src(["www/*.html"])
		.pipe(
			realFavicon.injectFaviconMarkups(
				JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code
			)
		)
		.pipe(gulp.dest("www"));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task("check-for-favicon-update", function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		} else {
			done();
		}
	});
});

gulp.task(
	"build",
	gulpSequence(
		"compile",
		["images", "compress", "inlinesource"],
		"generate-favicon",
		"check-for-favicon-update",
		"inject-favicon-markups",
		"clean"
	)
);
