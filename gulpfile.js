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
	return del(
		[
			"faviconData.json",
			"manifest.json",
			prod + "/gulpfile.js",
			prod + "/package.json",
			prod + "/style.css",
			prod + "/css/**",
			prod + "/js/*-debug.js",
			prod + "/node_modules/**"
		],
		{ force: true }
	);
});

var prod = "../SpottersSplash";

gulp.task("compile", function(done) {
	cp.exec("harp compile . " + prod, { stdio: "inherit" }).on("close", done);
});

gulp.task("compress", function() {
	gulp
		.src(prod + "/js/*.js")
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
		.pipe(gulp.dest(prod + "/js"));
});

gulp.task("imagemin", function() {
	return gulp
		.src(prod + "/img/*")
		.pipe(
			imagemin({
				multipass: true,
				optimizationLevel: 7,
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }]
			})
		)
		.pipe(gulp.dest(prod + "/img"));
});

gulp.task("inlinesource", function() {
	var options = {
		compress: false
	};

	return gulp
		.src(prod + "/*.html")
		.pipe(inlinesource())
		.pipe(gulp.dest(prod + "/"));
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
			masterPicture: prod + "/img/green s only w-o bg.svg",
			dest: prod,
			iconsPath: "/",
			design: {
				ios: {
					masterPicture: {
						type: "inline",
						content: "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODk1cHgiIGhlaWdodD0iODk1cHgiIHZpZXdCb3g9IjAgMCA4OTUgODk1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0My4yICgzOTA2OSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+TG9nby93aGl0ZSB3LW8gYmc8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iU3ltYm9scyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IkxvZ28vd2hpdGUtdy1vLWJnIiBmaWxsPSIjRkZGRkZGIj4KICAgICAgICAgICAgPHBhdGggZD0iTTIzMSw1NiBDMTU3Ljc1ODEwOCw5Ni40NDEyOTU4IDk3LjM3NzY4ODEsMTU2LjYxNzQ5OCA1NywyMjkgTDkxLDM1OSBMMS40MjEwODU0N2UtMTQsNDUzIEMxLjA0NzgyNTI5LDUzNi4zODczNjYgMjQuNzU0NzAzNyw2MTQuMDM2MzQ2IDY1LDY4MCBMMTg2LDcwOSBMMjE5LDgzMiBDMjgzLjg4ODAzOSw4NzEuMDU3ODQyIDM1OS44NDAxNzQsODkzLjgzMTk3NiA0NDEsODk1IEw1MzIsODAzIEw2NjQsODM5IEM3MzYuMTE3OTUzLDc5OS40OTk1MjYgNzk2LjEzMzQ4OSw3NDAuMTk0NzA0IDgzNyw2NjkgTDgwMCw1MjkgTDg5NSw0MzMgQzg5Mi43NjIyNjcsMzYyLjA3NDA5MyA4NzMuOTI3MTU2LDI5NS4xMzk0NiA4NDIsMjM2IEw2OTksMTk4IEw2NjEsNTQgQzU5Ny45MzE4NDcsMTkuNjczNDg4NiA1MjUuMDYxMjIsMCA0NDgsMCBDNDQ0LjM3NjA2NiwwIDQ0MS4xNjU2MjUsMC4wMzM5NTY1NDM4IDQzOCwwIEwzNTAsODggTDIzMSw1NiBaIE0yNTQsMzk1IEwzOTYsMjU0IEw1ODUsMzA2IEw1MTYsMzc2IEw2MTEsNDAyIEw2MzcsNDk3IEw0OTYsNjM4IEwzMDcsNTg2IEwzNzYsNTE3IEwyODEsNDkxIEwyNTQsMzk1IFogTTQ0Nyw0NDcgTDUxNiwzNzYgTDQyMCwzNTAgTDM1MSw0MjEgTDQ0Niw0NDcgTDM3Niw1MTYgTDQ3Miw1NDIgTDU0MSw0NzIgTDQ0Nyw0NDcgWiIgaWQ9InNtYWxsLXMiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg=="
					},
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
					masterPicture: {
						type: "inline",
						content: "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODk1cHgiIGhlaWdodD0iODk1cHgiIHZpZXdCb3g9IjAgMCA4OTUgODk1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0My4yICgzOTA2OSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+TG9nby93aGl0ZSB3LW8gYmc8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iU3ltYm9scyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IkxvZ28vd2hpdGUtdy1vLWJnIiBmaWxsPSIjRkZGRkZGIj4KICAgICAgICAgICAgPHBhdGggZD0iTTIzMSw1NiBDMTU3Ljc1ODEwOCw5Ni40NDEyOTU4IDk3LjM3NzY4ODEsMTU2LjYxNzQ5OCA1NywyMjkgTDkxLDM1OSBMMS40MjEwODU0N2UtMTQsNDUzIEMxLjA0NzgyNTI5LDUzNi4zODczNjYgMjQuNzU0NzAzNyw2MTQuMDM2MzQ2IDY1LDY4MCBMMTg2LDcwOSBMMjE5LDgzMiBDMjgzLjg4ODAzOSw4NzEuMDU3ODQyIDM1OS44NDAxNzQsODkzLjgzMTk3NiA0NDEsODk1IEw1MzIsODAzIEw2NjQsODM5IEM3MzYuMTE3OTUzLDc5OS40OTk1MjYgNzk2LjEzMzQ4OSw3NDAuMTk0NzA0IDgzNyw2NjkgTDgwMCw1MjkgTDg5NSw0MzMgQzg5Mi43NjIyNjcsMzYyLjA3NDA5MyA4NzMuOTI3MTU2LDI5NS4xMzk0NiA4NDIsMjM2IEw2OTksMTk4IEw2NjEsNTQgQzU5Ny45MzE4NDcsMTkuNjczNDg4NiA1MjUuMDYxMjIsMCA0NDgsMCBDNDQ0LjM3NjA2NiwwIDQ0MS4xNjU2MjUsMC4wMzM5NTY1NDM4IDQzOCwwIEwzNTAsODggTDIzMSw1NiBaIE0yNTQsMzk1IEwzOTYsMjU0IEw1ODUsMzA2IEw1MTYsMzc2IEw2MTEsNDAyIEw2MzcsNDk3IEw0OTYsNjM4IEwzMDcsNTg2IEwzNzYsNTE3IEwyODEsNDkxIEwyNTQsMzk1IFogTTQ0Nyw0NDcgTDUxNiwzNzYgTDQyMCwzNTAgTDM1MSw0MjEgTDQ0Niw0NDcgTDM3Niw1MTYgTDQ3Miw1NDIgTDU0MSw0NzIgTDQ0Nyw0NDcgWiIgaWQ9InNtYWxsLXMiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg=="
					},
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
					masterPicture: {
						type: "inline",
						content: "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODk1cHgiIGhlaWdodD0iODk1cHgiIHZpZXdCb3g9IjAgMCA4OTUgODk1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0My4yICgzOTA2OSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+TG9nby93aGl0ZSB3LW8gYmc8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iU3ltYm9scyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IkxvZ28vd2hpdGUtdy1vLWJnIiBmaWxsPSIjRkZGRkZGIj4KICAgICAgICAgICAgPHBhdGggZD0iTTIzMSw1NiBDMTU3Ljc1ODEwOCw5Ni40NDEyOTU4IDk3LjM3NzY4ODEsMTU2LjYxNzQ5OCA1NywyMjkgTDkxLDM1OSBMMS40MjEwODU0N2UtMTQsNDUzIEMxLjA0NzgyNTI5LDUzNi4zODczNjYgMjQuNzU0NzAzNyw2MTQuMDM2MzQ2IDY1LDY4MCBMMTg2LDcwOSBMMjE5LDgzMiBDMjgzLjg4ODAzOSw4NzEuMDU3ODQyIDM1OS44NDAxNzQsODkzLjgzMTk3NiA0NDEsODk1IEw1MzIsODAzIEw2NjQsODM5IEM3MzYuMTE3OTUzLDc5OS40OTk1MjYgNzk2LjEzMzQ4OSw3NDAuMTk0NzA0IDgzNyw2NjkgTDgwMCw1MjkgTDg5NSw0MzMgQzg5Mi43NjIyNjcsMzYyLjA3NDA5MyA4NzMuOTI3MTU2LDI5NS4xMzk0NiA4NDIsMjM2IEw2OTksMTk4IEw2NjEsNTQgQzU5Ny45MzE4NDcsMTkuNjczNDg4NiA1MjUuMDYxMjIsMCA0NDgsMCBDNDQ0LjM3NjA2NiwwIDQ0MS4xNjU2MjUsMC4wMzM5NTY1NDM4IDQzOCwwIEwzNTAsODggTDIzMSw1NiBaIE0yNTQsMzk1IEwzOTYsMjU0IEw1ODUsMzA2IEw1MTYsMzc2IEw2MTEsNDAyIEw2MzcsNDk3IEw0OTYsNjM4IEwzMDcsNTg2IEwzNzYsNTE3IEwyODEsNDkxIEwyNTQsMzk1IFogTTQ0Nyw0NDcgTDUxNiwzNzYgTDQyMCwzNTAgTDM1MSw0MjEgTDQ0Niw0NDcgTDM3Niw1MTYgTDQ3Miw1NDIgTDU0MSw0NzIgTDQ0Nyw0NDcgWiIgaWQ9InNtYWxsLXMiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg=="
					},
					pictureAspect: "backgroundAndMargin",
					margin: "17%",
					backgroundColor: "#00a860",
					themeColor: "#00a860",
					manifest: {
						name: "Spotters",
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
					pictureAspect: "silhouette",
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

gulp.task("imagemin-favicon", function() {
	return gulp
		.src(prod + "/*")
		.pipe(
			imagemin({
				multipass: true,
				optimizationLevel: 7,
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }]
			})
		)
		.pipe(gulp.dest(prod));
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task("inject-favicon-markups", function() {
	return gulp
		.src([prod + "/*.html"])
		.pipe(
			realFavicon.injectFaviconMarkups(
				JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code
			)
		)
		.pipe(gulp.dest(prod));
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
		["imagemin", "compress", "inlinesource"],
		"generate-favicon",
		"imagemin-favicon",
		"check-for-favicon-update",
		"inject-favicon-markups",
		"clean"
	)
);
