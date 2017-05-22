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
						content: "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODk1cHgiIGhlaWdodD0iODk1cHgiIHZpZXdCb3g9IjAgMCA4OTUgODk1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHN0eWxlPSJiYWNrZ3JvdW5kOiAjMDBBODYwOyI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQzLjIgKDM5MDY5KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5Mb2dvL2lPUyBpY29uIHctbyBzaGFkb3c8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz4KICAgICAgICA8bGluZWFyR3JhZGllbnQgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSIgaWQ9ImxpbmVhckdyYWRpZW50LTEiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMDBBODYwIiBvZmZzZXQ9IjAlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMxMzRCMUQiIG9mZnNldD0iMTAwJSI+PC9zdG9wPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiIGlkPSJsaW5lYXJHcmFkaWVudC0yIj4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzAwNkMzRSIgb2Zmc2V0PSIwJSI+PC9zdG9wPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMDA2QzNFIiBvZmZzZXQ9IjAuNTU3NTQ5NjYlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMxMzRCMUQiIG9mZnNldD0iMTAwJSI+PC9zdG9wPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8ZyBpZD0iU3ltYm9scyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IkxvZ28vaU9TLWljb24tdy1vLXNoYWRvdyI+CiAgICAgICAgICAgIDxnIGlkPSJHcm91cC0yIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0wLDQ0Ny41IEMwLDY5My44NzI0MzUgMjAwLjEyODY4MSw4OTQuMDAxMTE2IDQ0Ny41LDg5NC4wMDExMTYgQzY5My44NzI0MzUsODk0LjAwMTExNiA4OTQuMDAxMTE2LDY5My44NzI0MzUgODk0LjAwMTExNiw0NDcuNSBDODk0LjAwMTExNiwyMDAuMTI4NjgxIDY5My44NzI0MzUsMCA0NDcuNSwwIEMyMDAuMTI4NjgxLDAgMCwyMDAuMTI4NjgxIDAsNDQ3LjUgWiIgaWQ9ImJhbGwiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQtMSkiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMzEuNzQxMDcxLDU1LjkzNzUgQzE1OC41ODA5MjIsOTYuMzMzNjYwNSA5OC4yNjc4OTE1LDE1Ni40NDI3MDEgNTcuOTM1MjY3OSwyMjguNzQ0NDIgTDkxLjg5NzMyMTQsMzU4LjU5OTMzIEwwLjk5ODg4MzkyOSw0NTIuNDk0NDIgQzIuMDQ1NTM5NzgsNTM1Ljc4ODcxOSAyNS43MjU5NTk2LDYxMy4zNTEwMzcgNjUuOTI2MzM5Myw2NzkuMjQxMDcxIEwxODYuNzkxMjk1LDcwOC4yMDg3MDUgTDIxOS43NTQ0NjQsODMxLjA3MTQyOSBDMjg0LjU3MDA4NCw4NzAuMDg1Njc5IDM2MC40Mzc0NSw4OTIuODM0Mzk2IDQ0MS41MDY2OTYsODk0LjAwMTExNiBMNTMyLjQwNTEzNCw4MDIuMTAzNzk1IEw2NjQuMjU3ODEyLDgzOC4wNjM2MTYgQzczNi4yOTUyNzcsNzk4LjYwNzIyNyA3OTYuMjQzODMxLDczOS4zNjg1OTQgODM3LjA2NDczMiw2NjguMjUzMzQ4IEw4MDAuMTA2MDI3LDUyOC40MDk1OTggTDg5NSw0MzIuNTE2NzQxIEM4OTIuNzY0NzY1LDM2MS42Njk5OTIgODczLjk1MDY3NSwyOTQuODEwMDYzIDg0Mi4wNTkxNTIsMjM1LjczNjYwNyBMNjk5LjIxODc1LDE5Ny43NzkwMTggTDY2MS4yNjExNjEsNTMuOTM5NzMyMSBDNTk4LjI2MzM5NiwxOS42NTE1MzE2IDUyNS40NzQwOTgsMCA0NDguNDk4ODg0LDAgQzQ0NC44Nzg5OTUsMCA0NDEuNjcyMTM3LDAuMDMzOTE4NjQ1OCA0MzguNTEwMDQ1LDAgTDM1MC42MDgyNTksODcuOTAxNzg1NyBMMjMxLjc0MTA3MSw1NS45Mzc1IFogTTI1NC43MTU0MDIsMzk0LjU1OTE1MiBMMzk2LjU1NjkyLDI1My43MTY1MTggTDU4NS4zNDU5ODIsMzA1LjY1ODQ4MiBMNTE2LjQyMjk5MSwzNzUuNTgwMzU3IEw2MTEuMzE2OTY0LDQwMS41NTEzMzkgTDYzNy4yODc5NDYsNDk2LjQ0NTMxMiBMNDk2LjQ0NTMxMiw2MzcuMjg3OTQ2IEwzMDcuNjU2MjUsNTg1LjM0NTk4MiBMMzc2LjU3OTI0MSw1MTYuNDIyOTkxIEwyODEuNjg1MjY4LDQ5MC40NTIwMDkgTDI1NC43MTU0MDIsMzk0LjU1OTE1MiBaIE00NDcuNSw0NDYuNTAxMTE2IEw1MTYuNDIyOTkxLDM3NS41ODAzNTcgTDQyMC41MzAxMzQsMzQ5LjYwOTM3NSBMMzUxLjYwNzE0Myw0MjAuNTMwMTM0IEw0NDYuNTAxMTE2LDQ0Ni41MDExMTYgTDM3Ni41NzkyNDEsNTE1LjQyNDEwNyBMNDcyLjQ3MjA5OCw1NDEuMzk1MDg5IEw1NDEuMzk1MDg5LDQ3MS40NzMyMTQgTDQ0Ny41LDQ0Ni41MDExMTYgWiIgaWQ9InNtYWxsLXMiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik02NS45MjYzMzkzLDY4MC4yMzk5NTUgQzE0NC40ODg5MzksODA4LjU0NjEwMyAyODUuODM2NjE3LDg5NC4wMDExMTYgNDQ3LjUsODk0LjAwMTExNiBDNjkzLjkzODY2LDg5NC4wMDExMTYgODk0LjAwMTExNiw2OTMuOTg2OTY1IDg5NC4wMDExMTYsNDQ3LjUgQzg5NC4wMDExMTYsMjc4Ljc0Nzg3IDgwMC42ODM1OTcsMTMyLjAyOTg4MyA2NjMuMjU4OTI5LDU1LjkzNzUgQzk1OC43NzA1NjUsMzI5LjM0MjQyNyA2NDAuNzY2NDE3LDk1Ny43MDk4MTkgNjUuOTI2MzM5Myw2ODAuMjM5OTU1IFoiIGlkPSJzaGFkb3ciIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQtMikiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbXVsdGlwbHk7IiBvcGFjaXR5PSIwLjE1Ij48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg=="
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
					pictureAspect: "whiteSilhouette",
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
						content: "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODk1cHgiIGhlaWdodD0iODk1cHgiIHZpZXdCb3g9IjAgMCA4OTUgODk1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHN0eWxlPSJiYWNrZ3JvdW5kOiAjMDBBODYwOyI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQzLjIgKDM5MDY5KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5Mb2dvL2lPUyBpY29uIHctbyBzaGFkb3c8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz4KICAgICAgICA8bGluZWFyR3JhZGllbnQgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSIgaWQ9ImxpbmVhckdyYWRpZW50LTEiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMDBBODYwIiBvZmZzZXQ9IjAlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMxMzRCMUQiIG9mZnNldD0iMTAwJSI+PC9zdG9wPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiIGlkPSJsaW5lYXJHcmFkaWVudC0yIj4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzAwNkMzRSIgb2Zmc2V0PSIwJSI+PC9zdG9wPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMDA2QzNFIiBvZmZzZXQ9IjAuNTU3NTQ5NjYlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMxMzRCMUQiIG9mZnNldD0iMTAwJSI+PC9zdG9wPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8ZyBpZD0iU3ltYm9scyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IkxvZ28vaU9TLWljb24tdy1vLXNoYWRvdyI+CiAgICAgICAgICAgIDxnIGlkPSJHcm91cC0yIj4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0wLDQ0Ny41IEMwLDY5My44NzI0MzUgMjAwLjEyODY4MSw4OTQuMDAxMTE2IDQ0Ny41LDg5NC4wMDExMTYgQzY5My44NzI0MzUsODk0LjAwMTExNiA4OTQuMDAxMTE2LDY5My44NzI0MzUgODk0LjAwMTExNiw0NDcuNSBDODk0LjAwMTExNiwyMDAuMTI4NjgxIDY5My44NzI0MzUsMCA0NDcuNSwwIEMyMDAuMTI4NjgxLDAgMCwyMDAuMTI4NjgxIDAsNDQ3LjUgWiIgaWQ9ImJhbGwiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQtMSkiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMzEuNzQxMDcxLDU1LjkzNzUgQzE1OC41ODA5MjIsOTYuMzMzNjYwNSA5OC4yNjc4OTE1LDE1Ni40NDI3MDEgNTcuOTM1MjY3OSwyMjguNzQ0NDIgTDkxLjg5NzMyMTQsMzU4LjU5OTMzIEwwLjk5ODg4MzkyOSw0NTIuNDk0NDIgQzIuMDQ1NTM5NzgsNTM1Ljc4ODcxOSAyNS43MjU5NTk2LDYxMy4zNTEwMzcgNjUuOTI2MzM5Myw2NzkuMjQxMDcxIEwxODYuNzkxMjk1LDcwOC4yMDg3MDUgTDIxOS43NTQ0NjQsODMxLjA3MTQyOSBDMjg0LjU3MDA4NCw4NzAuMDg1Njc5IDM2MC40Mzc0NSw4OTIuODM0Mzk2IDQ0MS41MDY2OTYsODk0LjAwMTExNiBMNTMyLjQwNTEzNCw4MDIuMTAzNzk1IEw2NjQuMjU3ODEyLDgzOC4wNjM2MTYgQzczNi4yOTUyNzcsNzk4LjYwNzIyNyA3OTYuMjQzODMxLDczOS4zNjg1OTQgODM3LjA2NDczMiw2NjguMjUzMzQ4IEw4MDAuMTA2MDI3LDUyOC40MDk1OTggTDg5NSw0MzIuNTE2NzQxIEM4OTIuNzY0NzY1LDM2MS42Njk5OTIgODczLjk1MDY3NSwyOTQuODEwMDYzIDg0Mi4wNTkxNTIsMjM1LjczNjYwNyBMNjk5LjIxODc1LDE5Ny43NzkwMTggTDY2MS4yNjExNjEsNTMuOTM5NzMyMSBDNTk4LjI2MzM5NiwxOS42NTE1MzE2IDUyNS40NzQwOTgsMCA0NDguNDk4ODg0LDAgQzQ0NC44Nzg5OTUsMCA0NDEuNjcyMTM3LDAuMDMzOTE4NjQ1OCA0MzguNTEwMDQ1LDAgTDM1MC42MDgyNTksODcuOTAxNzg1NyBMMjMxLjc0MTA3MSw1NS45Mzc1IFogTTI1NC43MTU0MDIsMzk0LjU1OTE1MiBMMzk2LjU1NjkyLDI1My43MTY1MTggTDU4NS4zNDU5ODIsMzA1LjY1ODQ4MiBMNTE2LjQyMjk5MSwzNzUuNTgwMzU3IEw2MTEuMzE2OTY0LDQwMS41NTEzMzkgTDYzNy4yODc5NDYsNDk2LjQ0NTMxMiBMNDk2LjQ0NTMxMiw2MzcuMjg3OTQ2IEwzMDcuNjU2MjUsNTg1LjM0NTk4MiBMMzc2LjU3OTI0MSw1MTYuNDIyOTkxIEwyODEuNjg1MjY4LDQ5MC40NTIwMDkgTDI1NC43MTU0MDIsMzk0LjU1OTE1MiBaIE00NDcuNSw0NDYuNTAxMTE2IEw1MTYuNDIyOTkxLDM3NS41ODAzNTcgTDQyMC41MzAxMzQsMzQ5LjYwOTM3NSBMMzUxLjYwNzE0Myw0MjAuNTMwMTM0IEw0NDYuNTAxMTE2LDQ0Ni41MDExMTYgTDM3Ni41NzkyNDEsNTE1LjQyNDEwNyBMNDcyLjQ3MjA5OCw1NDEuMzk1MDg5IEw1NDEuMzk1MDg5LDQ3MS40NzMyMTQgTDQ0Ny41LDQ0Ni41MDExMTYgWiIgaWQ9InNtYWxsLXMiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik02NS45MjYzMzkzLDY4MC4yMzk5NTUgQzE0NC40ODg5MzksODA4LjU0NjEwMyAyODUuODM2NjE3LDg5NC4wMDExMTYgNDQ3LjUsODk0LjAwMTExNiBDNjkzLjkzODY2LDg5NC4wMDExMTYgODk0LjAwMTExNiw2OTMuOTg2OTY1IDg5NC4wMDExMTYsNDQ3LjUgQzg5NC4wMDExMTYsMjc4Ljc0Nzg3IDgwMC42ODM1OTcsMTMyLjAyOTg4MyA2NjMuMjU4OTI5LDU1LjkzNzUgQzk1OC43NzA1NjUsMzI5LjM0MjQyNyA2NDAuNzY2NDE3LDk1Ny43MDk4MTkgNjUuOTI2MzM5Myw2ODAuMjM5OTU1IFoiIGlkPSJzaGFkb3ciIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQtMikiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbXVsdGlwbHk7IiBvcGFjaXR5PSIwLjE1Ij48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg=="
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
