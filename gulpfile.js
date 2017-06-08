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
						content:
							"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODk1cHgiIGhlaWdodD0iODk1cHgiIHZpZXdCb3g9IjAgMCA4OTUgODk1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0My4yICgzOTA2OSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+TG9nby9pY29uPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlN5bWJvbHMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJMb2dvL2ljb24iPgogICAgICAgICAgICA8cGF0aCBkPSJNMCw0NDggQzAsNjk0LjY0NzcxMiAyMDAuMzUyMjg4LDg5NSA0NDgsODk1IEM2OTQuNjQ3NzEyLDg5NSA4OTUsNjk0LjY0NzcxMiA4OTUsNDQ4IEM4OTUsMjAwLjM1MjI4OCA2OTQuNjQ3NzEyLDAgNDQ4LDAgQzIwMC4zNTIyODgsMCAwLDIwMC4zNTIyODggMCw0NDggWiIgaWQ9IkJhbGwiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTY2My44MTEwNjEsNTUuNTg2NTY5NyBDODAxLjU4ODk5LDEzMS44NTY0OTMgODk1LDI3OC45MDI4ODQgODk1LDQ0OCBDODk1LDY5NC42NDc3MTIgNjk0LjY0NzcxMiw4OTUgNDQ4LDg5NSBDMjg1LjQ3Mjc1Nyw4OTUgMTQzLjMxNjA2Niw4MDguNzA2NTE2IDY0Ljc5NDA5NzYsNjc5LjY2NjM4MiBDNjUuNTI0NDc4MSw2ODAuNDQ5NjE3IDY2LjI1OTc4MDMsNjgxLjIyNzUwOSA2Nyw2ODIgQzY0Mi40ODIzNTcsOTU5Ljc3OTg4NSA5NjAuODQxODE3LDMzMC43MTA0MDggNjY1LDU3IEM2NjQuNjExNjAxLDU2LjUyNjkyMzggNjY0LjIxNTI2NCw1Ni4wNTU3NzI2IDY2My44MTEwNjEsNTUuNTg2NTY5NyBaIiBpZD0iU2hhZG93IiBmaWxsPSIjQ0ZFMEQ4Ij48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik02MS4xNDIzNjk5LDIyMS43NDAwMDcgQzIyLjI3MTY5NjQsMjg4LjEyMDcwNiAwLDM2NS40MzE2MSAwLDQ0OCBDMCw0NTIuMTAzNTIyIDAuMDU1NDU2NjQzMiw0NTYuMTk0MjI5IDAuMTY1NjY1MDg4LDQ2MC4yNzE0MTIgQzAuNDE3NzUzOTIzLDQ1Ny44NTA1NDkgMC42OTU4Njk5MzIsNDU1LjQyNjU5OCAxLDQ1MyBMOTIsMzU5IEw1OCwyMjkgQzU5LjAzNTA4MDgsMjI2LjU2MjEzNyA2MC4wODIyMzksMjI0LjE0MjAyOSA2MS4xNDI0MDMyLDIyMS43Mzk5NTEgWiBNMjI4LjY3NzU4Miw1Ny4xNjI4MTU5IEMyOTEuMDEzODU4LDIyLjE0MjY5MDQgMzYyLjYwNTI2OCwxLjYwNDQ4MDA3IDQzOC45MDk4NzQsMC4wOTAxMjU4ODc4IEwzNTEsODggTDIzMiw1NiBDMjMwLjg4NTk1LDU2LjM4MzQ1NzkgMjI5Ljc3ODQ5Niw1Ni43NzEwNjg4IDIyOC42Nzc1ODIsNTcuMTYyODE1OSBaIE02NjIuMTgxODUxLDU0LjY4OTExOSBDNzM4LjA2NzA5Nyw5Ni4yODQ0NTkyIDgwMC42MTk0MDEsMTU5LjMwMDA3NyA4NDEuNzA2MTg5LDIzNS42NTYxOSBMNzAwLDE5OCBMNjYyLjE4MTg1MSw1NC42ODkxMTkgWiBNODk0Ljc5MjcwOSw0MzQuMjIgQzg5NC45MzA1NzIsNDM4Ljc5NjI4NiA4OTUsNDQzLjM4OTk0OCA4OTUsNDQ4IEM4OTUsNTI3LjYzMTQ4NCA4NzQuMTE2MTg5LDYwMi40MzczNDQgODM3LjUzMzAzNyw2NjcuMjMzMTExIEw4MDEsNTI5IEw4OTQuNzkyNzA5LDQzNC4yMiBaIE02NjQuNzQxMjUsODM4LjkyOTQzMiBDNjAwLjUyMjQ0OCw4NzQuNjQ3MTM5IDUyNi42MTI2OTMsODk1IDQ0OCw4OTUgQzQ0Ni4wMDk2OTgsODk1IDQ0NC4wMjI0NSw4OTQuOTg3MDU5IDQ0Mi4wMzgzMzcsODk0Ljk2MTI1NyBMNTMzLDgwMyBMNjY0Ljc0MTI1LDgzOC45Mjk0MzIgWiBNMjIyLjU4OTI1MSw4MzQuMzkwMjYxIEMxNTYuODc2NjI3LDc5Ni4xNDA5NDMgMTAxLjgyMTcxMyw3NDEuNjgzMDMxIDYyLjkwNDU5MjcsNjc2LjUzMjQxMyBDNjMuOTI0MjU5NSw2NzcuNjk2NTExIDY0Ljk1NjA2MDYsNjc4Ljg1MjQxOSA2Niw2ODAgTDE4Nyw3MDkgTDIyMCw4MzIgQzIyMC44NTIwMjgsODMyLjgwMDg0NyAyMjEuNzE1MTY2LDgzMy41OTc2NjcgMjIyLjU4OTI1OSw4MzQuMzkwMjY5IFoiIGlkPSJFZGdlIiBmaWxsPSIjMTM1QzI5Ij48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik04NDEuNzA2MTg5LDIzNS42NTYxOSBDODAwLjkxMzgwOCwxNTkuODQ3MjA3IDczOC45NjI0MzIsOTcuMTg4MjIxIDY2My44MTEwNjEsNTUuNTg2NTY5NyBDNjY0LjIxNTI2NCw1Ni4wNTU3NzI2IDY2NC42MTE2MDEsNTYuNTI2OTIzOCA2NjUsNTcgQzcxMy40NzQ4MywxMDEuODQ4NTEzIDc0NS40NTk1MjYsMTU2LjIzNzc0IDc2Mi41MjQ5MzUsMjE0LjYxNTAxOCBMODQxLjcwNjE4OSwyMzUuNjU2MTkgWiBNODk0Ljc5MjcxMyw0MzQuMjIwMTQ3IEM4OTQuOTMwNTczLDQzOC43OTYzODQgODk1LDQ0My4zODk5OTggODk1LDQ0OCBDODk1LDUyNy42MzE0ODQgODc0LjExNjE4OSw2MDIuNDM3MzQ0IDgzNy41MzMwMzcsNjY3LjIzMzExMSBMODAxLDUyOSBMODk0Ljc5MjcwOSw0MzQuMjIgWiBNNjY0Ljc0MTI1LDgzOC45Mjk0MzIgQzYwMC41MjI0NDgsODc0LjY0NzEzOSA1MjYuNjEyNjkzLDg5NSA0NDgsODk1IEM0NDYuMDA5Njk3LDg5NSA0NDQuMDIyNDQ4LDg5NC45ODcwNTkgNDQyLjAzODMzNCw4OTQuOTYxMjU3IEw1MzMsODAzIEw2NjQuNzQxMjUsODM4LjkyOTQzMiBaIE0yMjIuNTg5MjUxLDgzNC4zOTAyNjEgQzE1Ny45MzMwOSw3OTYuNzU1ODc4IDEwMy41OTQ3MDYsNzQzLjQyOTg4NCA2NC43OTQwOTc2LDY3OS42NjYzODIgQzY1LjUyNDQ3ODEsNjgwLjQ0OTYxNyA2Ni4yNTk3ODAzLDY4MS4yMjc1MDkgNjcsNjgyIEMxMTAuMzgxMjE3LDcwMi45Mzk3MDMgMTUyLjMwMTMzMyw3MTguNzI2MjM0IDE5Mi42MDczOTEsNzI5LjkwMDI3NCBMMjIwLDgzMiBDMjIwLjg1MjAzMSw4MzIuODAwODQ5IDIyMS43MTUxNzEsODMzLjU5NzY3MSAyMjIuNTg5MjY3LDgzNC4zOTAyNzUgWiIgaWQ9IkVkZ2UtU2hhZG93IiBmaWxsPSIjMkE1MTM1Ij48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yNTUsMzk1IEwzOTcsMjU0IEw1ODYsMzA2IEw1MTcsMzc2IEw2MTIsNDAyIEw2MzgsNDk3IEw0OTcsNjM4IEwzMDgsNTg2IEwzNzcsNTE3IEwyODIsNDkxIEwyNTUsMzk1IFogTTQ0OCw0NDcgTDUxNywzNzYgTDQyMSwzNTAgTDM1Miw0MjEgTDQ0Nyw0NDcgTDM3Nyw1MTYgTDQ3Myw1NDIgTDU0Miw0NzIgTDQ0OCw0NDcgTDQ0OCw0NDcgWiIgaWQ9IlMiIGZpbGw9IiMxMzVDMjkiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg=="
					},
					pictureAspect: "backgroundAndMargin",
					backgroundColor: "#009d4f",
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
					backgroundColor: "#009d4f",
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
						content:
							"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODk1cHgiIGhlaWdodD0iODk1cHgiIHZpZXdCb3g9IjAgMCA4OTUgODk1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0My4yICgzOTA2OSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+TG9nby9pY29uPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlN5bWJvbHMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJMb2dvL2ljb24iPgogICAgICAgICAgICA8cGF0aCBkPSJNMCw0NDggQzAsNjk0LjY0NzcxMiAyMDAuMzUyMjg4LDg5NSA0NDgsODk1IEM2OTQuNjQ3NzEyLDg5NSA4OTUsNjk0LjY0NzcxMiA4OTUsNDQ4IEM4OTUsMjAwLjM1MjI4OCA2OTQuNjQ3NzEyLDAgNDQ4LDAgQzIwMC4zNTIyODgsMCAwLDIwMC4zNTIyODggMCw0NDggWiIgaWQ9IkJhbGwiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTY2My44MTEwNjEsNTUuNTg2NTY5NyBDODAxLjU4ODk5LDEzMS44NTY0OTMgODk1LDI3OC45MDI4ODQgODk1LDQ0OCBDODk1LDY5NC42NDc3MTIgNjk0LjY0NzcxMiw4OTUgNDQ4LDg5NSBDMjg1LjQ3Mjc1Nyw4OTUgMTQzLjMxNjA2Niw4MDguNzA2NTE2IDY0Ljc5NDA5NzYsNjc5LjY2NjM4MiBDNjUuNTI0NDc4MSw2ODAuNDQ5NjE3IDY2LjI1OTc4MDMsNjgxLjIyNzUwOSA2Nyw2ODIgQzY0Mi40ODIzNTcsOTU5Ljc3OTg4NSA5NjAuODQxODE3LDMzMC43MTA0MDggNjY1LDU3IEM2NjQuNjExNjAxLDU2LjUyNjkyMzggNjY0LjIxNTI2NCw1Ni4wNTU3NzI2IDY2My44MTEwNjEsNTUuNTg2NTY5NyBaIiBpZD0iU2hhZG93IiBmaWxsPSIjQ0ZFMEQ4Ij48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik02MS4xNDIzNjk5LDIyMS43NDAwMDcgQzIyLjI3MTY5NjQsMjg4LjEyMDcwNiAwLDM2NS40MzE2MSAwLDQ0OCBDMCw0NTIuMTAzNTIyIDAuMDU1NDU2NjQzMiw0NTYuMTk0MjI5IDAuMTY1NjY1MDg4LDQ2MC4yNzE0MTIgQzAuNDE3NzUzOTIzLDQ1Ny44NTA1NDkgMC42OTU4Njk5MzIsNDU1LjQyNjU5OCAxLDQ1MyBMOTIsMzU5IEw1OCwyMjkgQzU5LjAzNTA4MDgsMjI2LjU2MjEzNyA2MC4wODIyMzksMjI0LjE0MjAyOSA2MS4xNDI0MDMyLDIyMS43Mzk5NTEgWiBNMjI4LjY3NzU4Miw1Ny4xNjI4MTU5IEMyOTEuMDEzODU4LDIyLjE0MjY5MDQgMzYyLjYwNTI2OCwxLjYwNDQ4MDA3IDQzOC45MDk4NzQsMC4wOTAxMjU4ODc4IEwzNTEsODggTDIzMiw1NiBDMjMwLjg4NTk1LDU2LjM4MzQ1NzkgMjI5Ljc3ODQ5Niw1Ni43NzEwNjg4IDIyOC42Nzc1ODIsNTcuMTYyODE1OSBaIE02NjIuMTgxODUxLDU0LjY4OTExOSBDNzM4LjA2NzA5Nyw5Ni4yODQ0NTkyIDgwMC42MTk0MDEsMTU5LjMwMDA3NyA4NDEuNzA2MTg5LDIzNS42NTYxOSBMNzAwLDE5OCBMNjYyLjE4MTg1MSw1NC42ODkxMTkgWiBNODk0Ljc5MjcwOSw0MzQuMjIgQzg5NC45MzA1NzIsNDM4Ljc5NjI4NiA4OTUsNDQzLjM4OTk0OCA4OTUsNDQ4IEM4OTUsNTI3LjYzMTQ4NCA4NzQuMTE2MTg5LDYwMi40MzczNDQgODM3LjUzMzAzNyw2NjcuMjMzMTExIEw4MDEsNTI5IEw4OTQuNzkyNzA5LDQzNC4yMiBaIE02NjQuNzQxMjUsODM4LjkyOTQzMiBDNjAwLjUyMjQ0OCw4NzQuNjQ3MTM5IDUyNi42MTI2OTMsODk1IDQ0OCw4OTUgQzQ0Ni4wMDk2OTgsODk1IDQ0NC4wMjI0NSw4OTQuOTg3MDU5IDQ0Mi4wMzgzMzcsODk0Ljk2MTI1NyBMNTMzLDgwMyBMNjY0Ljc0MTI1LDgzOC45Mjk0MzIgWiBNMjIyLjU4OTI1MSw4MzQuMzkwMjYxIEMxNTYuODc2NjI3LDc5Ni4xNDA5NDMgMTAxLjgyMTcxMyw3NDEuNjgzMDMxIDYyLjkwNDU5MjcsNjc2LjUzMjQxMyBDNjMuOTI0MjU5NSw2NzcuNjk2NTExIDY0Ljk1NjA2MDYsNjc4Ljg1MjQxOSA2Niw2ODAgTDE4Nyw3MDkgTDIyMCw4MzIgQzIyMC44NTIwMjgsODMyLjgwMDg0NyAyMjEuNzE1MTY2LDgzMy41OTc2NjcgMjIyLjU4OTI1OSw4MzQuMzkwMjY5IFoiIGlkPSJFZGdlIiBmaWxsPSIjMTM1QzI5Ij48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik04NDEuNzA2MTg5LDIzNS42NTYxOSBDODAwLjkxMzgwOCwxNTkuODQ3MjA3IDczOC45NjI0MzIsOTcuMTg4MjIxIDY2My44MTEwNjEsNTUuNTg2NTY5NyBDNjY0LjIxNTI2NCw1Ni4wNTU3NzI2IDY2NC42MTE2MDEsNTYuNTI2OTIzOCA2NjUsNTcgQzcxMy40NzQ4MywxMDEuODQ4NTEzIDc0NS40NTk1MjYsMTU2LjIzNzc0IDc2Mi41MjQ5MzUsMjE0LjYxNTAxOCBMODQxLjcwNjE4OSwyMzUuNjU2MTkgWiBNODk0Ljc5MjcxMyw0MzQuMjIwMTQ3IEM4OTQuOTMwNTczLDQzOC43OTYzODQgODk1LDQ0My4zODk5OTggODk1LDQ0OCBDODk1LDUyNy42MzE0ODQgODc0LjExNjE4OSw2MDIuNDM3MzQ0IDgzNy41MzMwMzcsNjY3LjIzMzExMSBMODAxLDUyOSBMODk0Ljc5MjcwOSw0MzQuMjIgWiBNNjY0Ljc0MTI1LDgzOC45Mjk0MzIgQzYwMC41MjI0NDgsODc0LjY0NzEzOSA1MjYuNjEyNjkzLDg5NSA0NDgsODk1IEM0NDYuMDA5Njk3LDg5NSA0NDQuMDIyNDQ4LDg5NC45ODcwNTkgNDQyLjAzODMzNCw4OTQuOTYxMjU3IEw1MzMsODAzIEw2NjQuNzQxMjUsODM4LjkyOTQzMiBaIE0yMjIuNTg5MjUxLDgzNC4zOTAyNjEgQzE1Ny45MzMwOSw3OTYuNzU1ODc4IDEwMy41OTQ3MDYsNzQzLjQyOTg4NCA2NC43OTQwOTc2LDY3OS42NjYzODIgQzY1LjUyNDQ3ODEsNjgwLjQ0OTYxNyA2Ni4yNTk3ODAzLDY4MS4yMjc1MDkgNjcsNjgyIEMxMTAuMzgxMjE3LDcwMi45Mzk3MDMgMTUyLjMwMTMzMyw3MTguNzI2MjM0IDE5Mi42MDczOTEsNzI5LjkwMDI3NCBMMjIwLDgzMiBDMjIwLjg1MjAzMSw4MzIuODAwODQ5IDIyMS43MTUxNzEsODMzLjU5NzY3MSAyMjIuNTg5MjY3LDgzNC4zOTAyNzUgWiIgaWQ9IkVkZ2UtU2hhZG93IiBmaWxsPSIjMkE1MTM1Ij48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yNTUsMzk1IEwzOTcsMjU0IEw1ODYsMzA2IEw1MTcsMzc2IEw2MTIsNDAyIEw2MzgsNDk3IEw0OTcsNjM4IEwzMDgsNTg2IEwzNzcsNTE3IEwyODIsNDkxIEwyNTUsMzk1IFogTTQ0OCw0NDcgTDUxNywzNzYgTDQyMSwzNTAgTDM1Miw0MjEgTDQ0Nyw0NDcgTDM3Nyw1MTYgTDQ3Myw1NDIgTDU0Miw0NzIgTDQ0OCw0NDcgTDQ0OCw0NDcgWiIgaWQ9IlMiIGZpbGw9IiMxMzVDMjkiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg=="
					},
					pictureAspect: "backgroundAndMargin",
					margin: "17%",
					backgroundColor: "#009d4f",
					themeColor: "#009d4f",
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
					themeColor: "#009d4f"
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
