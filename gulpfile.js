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
							"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODk1cHgiIGhlaWdodD0iODk1cHgiIHZpZXdCb3g9IjAgMCA4OTUgODk1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0My4yICgzOTA2OSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+TG9nby9pY29uPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlN5bWJvbHMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJMb2dvL2ljb24iPgogICAgICAgICAgICA8ZyBpZD0iR3JvdXAiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTAsNDQ3IEMwLDY5My44NzE1NjkgMjAwLjEyODQzMSw4OTQgNDQ3LDg5NCBDNjkzLjg3MTU2OSw4OTQgODk0LDY5My44NzE1NjkgODk0LDQ0NyBDODk0LDIwMC4xMjg0MzEgNjkzLjg3MTU2OSwwIDQ0NywwIEMyMDAuMTI4NDMxLDAgMCwyMDAuMTI4NDMxIDAsNDQ3IFoiIGlkPSJCYWxsIiBmaWxsPSIjMTM1QzI5Ij48L3BhdGg+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMjMwLjc0MTg5OSw1NS45Mzc1IEMxNTcuNTgxODQxLDk2LjMzMzY2MDUgOTcuMjY4ODg2MiwxNTYuNDQyNzAxIDU2LjkzNjMxMjgsMjI4Ljc0NDQyIEw5MC44OTgzMjQsMzU4LjU5OTMzIEwtMi44NDIxNzA5NGUtMTQsNDUyLjQ5NDQyIEMxLjA0NjY1NDU0LDUzNS43ODg3MTkgMjQuNzI3MDQ0OCw2MTMuMzUxMDM3IDY0LjkyNzM3NDMsNjc5LjI0MTA3MSBMMTg1Ljc5MjE3OSw3MDguMjA4NzA1IEwyMTguNzU1MzA3LDgzMS4wNzE0MjkgQzI4My41NzA4NDYsODcwLjA4NTY3OSAzNTkuNDM4MTE4LDg5Mi44MzQzOTYgNDQwLjUwNzI2Myw4OTQuMDAxMTE2IEw1MzEuNDA1NTg3LDgwMi4xMDM3OTUgTDY2My4yNTgxMDEsODM4LjA2MzYxNiBDNzM1LjI5NTQ3NSw3OTguNjA3MjI3IDc5NS4yNDM5NTQsNzM5LjM2ODU5NCA4MzYuMDY0ODA0LDY2OC4yNTMzNDggTDc5OS4xMDYxNDUsNTI4LjQwOTU5OCBMODk0LDQzMi41MTY3NDEgQzg5MS43NjQ3NjgsMzYxLjY2OTk5MiA4NzIuOTUwNzAxLDI5NC44MTAwNjMgODQxLjA1OTIxOCwyMzUuNzM2NjA3IEw2OTguMjE4OTk0LDE5Ny43NzkwMTggTDY2MC4yNjE0NTMsNTMuOTM5NzMyMSBDNTk3LjI2Mzc2NywxOS42NTE1MzE2IDUyNC40NzQ1NTksLTIuODQyMTcwOTRlLTE0IDQ0Ny40OTk0NDEsLTIuODQyMTcwOTRlLTE0IEM0NDMuODc5NTU3LC0yLjg0MjE3MDk0ZS0xNCA0NDAuNjcyNzAzLDAuMDMzOTE4NjQ1OCA0MzcuNTEwNjE1LC0yLjg0MjE3MDk0ZS0xNCBMMzQ5LjYwODkzOSw4Ny45MDE3ODU3IEwyMzAuNzQxODk5LDU1LjkzNzUgWiBNMjU1LDM5NSBMMzk3LjM3MDc1NywyNTQgTDU4Ni44NjQyMywzMDYgTDUxNy42ODQwNzMsMzc2IEw2MTIuOTMyMTE1LDQwMiBMNjM5LDQ5NyBMNDk3LjYzMTg1NCw2MzggTDMwOC4xMzgzODEsNTg2IEwzNzcuMzE4NTM4LDUxNyBMMjgyLjA3MDQ5Niw0OTEgTDI1NSwzOTUgWiBNNDQ4LDQ0NyBMNTE3LDM3NiBMNDIxLDM1MCBMMzUyLDQyMSBMNDQ3LDQ0NyBMMzc3LDUxNiBMNDczLDU0MiBMNTQyLDQ3MiBMNDQ4LDQ0NyBMNDQ4LDQ0NyBaIiBpZD0iU21hbGwtUyIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTc2MiwyMTQgTDg0MiwyMzUgQzg3My42OTYyNjEsMjk0LjIyMzM2NyA4OTIuNjMwOTAxLDM2MS4yMDcwMzIgODk1LDQzMyBMODAwLDUyOCBMODM3LDY2OCBDODIwLjcxNzUxMSw2OTYuNzUyMTM1IDgwMS4wOTMwNzMsNzIzLjcwODI1OCA3NzksNzQ4IEM3NDUuOTQxNTkxLDc4NC4wNTIxNSA3MDcuMzIxMTA4LDgxNC41NzcwNTQgNjY0LDgzOCBMNTMzLDgwMiBMNDQyLDg5NCBDMzY4Ljg0Mzc3MSw4OTIuODI0MzkxIDMwMC40MDg2NzEsODc0LjQxOTE5NSAyNDAsODQzIEMyMzMuMjM5ODY3LDgzOC45ODEwNTMgMjI2LjQyMjY3OCw4MzUuMTIxMjcyIDIyMCw4MzEgTDE5Miw3MjggQzU5OC4yMDYxMTIsODQwLjgyNDgwNiA4NDAuNDc4MDk0LDQ4NC44NzI0NDMgNzYyLDIxNCBMNzYyLDIxNCBaIiBpZD0iUGF0aCIgZmlsbD0iI0NGRTBEOCI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTE5Mi4zMjg2NDcsNzI3Ljg2MTMyMSBDMTUyLjExMDMwNyw3MTYuNjg2MjM0IDExMC4yODMyODgsNzAwLjkxMTk0MSA2Nyw2ODAgQzExNC42NjM0MzYsNzU3Ljk5ODQxNSAxODUuNDM4NzE4LDgyMC4xMjg3NDkgMjY5Ljk0MzIyLDg1Ni45MzIyNDEgQzI1Mi42NjUyMDIsODQ5LjM0MTk0NiAyMzUuOTg5MzIxLDg0MC42NzE1OTUgMjIwLDgzMSBMMTkyLjMyODY0Nyw3MjcuODYxMzIxIFogTTc2MS44OTc2NzUsMjE0LjcxNDA2OCBDNzQ0LjkxNjIxMywxNTUuOTE5NjE2IDcxMi44MTg2ODgsMTAxLjEyNDc0NCA2NjQsNTYgQzczOS4xODM4OTMsOTcuNTQ1ODYwOSA4MDEuMTM1MjE3LDE2MC4xNDczNTUgODQxLjg4ODUzNSwyMzUuOTcwMzggTDc2MS44OTc2NzUsMjE0LjcxNDA2OCBaIE04OTQuNzYyNjYyLDQzMy4yNDAwMTYgQzg5NC45MjA0ODIsNDM4LjE0MDAzOCA4OTUsNDQzLjA2MDQzMiA4OTUsNDQ4IEM4OTUsNTI3LjkwMzgyMSA4NzMuODk0ODksNjAyLjk1NDMyNyA4MzYuOTY2NTQ0LDY2Ny44NzQzMTIgTDgwMCw1MjkgTDg5NC43NjI2NTYsNDMzLjIzOTg0MiBaIE03ODUuODk5MzU2LDczOS45OTgyMTkgQzcwNC4wNjY4MjYsODM0LjI5Mjk0OSA1ODMuMzg2NTA3LDg5NCA0NDksODk0IEM0NDYuNjc5NDYzLDg5NCA0NDQuMzYzMTgyLDg5My45ODI0OTEgNDQyLjA1MTI4MSw4OTMuOTQ3NTk3IEw1MzIsODAyIEw2NjQsODM4IEM3MTAuMzAyNTEyLDgxMi44MTE0MTYgNzUxLjUzMjkwNiw3NzkuNDc4MDE3IDc4NS44OTkzNTYsNzM5Ljk5ODIxOSBaIiBpZD0iQ29tYmluZWQtU2hhcGUiIGZpbGw9IiMyQTUxMzUiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+"
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
							"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODk1cHgiIGhlaWdodD0iODk1cHgiIHZpZXdCb3g9IjAgMCA4OTUgODk1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0My4yICgzOTA2OSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+TG9nby9pY29uPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlN5bWJvbHMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJMb2dvL2ljb24iPgogICAgICAgICAgICA8ZyBpZD0iR3JvdXAiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTAsNDQ3IEMwLDY5My44NzE1NjkgMjAwLjEyODQzMSw4OTQgNDQ3LDg5NCBDNjkzLjg3MTU2OSw4OTQgODk0LDY5My44NzE1NjkgODk0LDQ0NyBDODk0LDIwMC4xMjg0MzEgNjkzLjg3MTU2OSwwIDQ0NywwIEMyMDAuMTI4NDMxLDAgMCwyMDAuMTI4NDMxIDAsNDQ3IFoiIGlkPSJCYWxsIiBmaWxsPSIjMTM1QzI5Ij48L3BhdGg+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMjMwLjc0MTg5OSw1NS45Mzc1IEMxNTcuNTgxODQxLDk2LjMzMzY2MDUgOTcuMjY4ODg2MiwxNTYuNDQyNzAxIDU2LjkzNjMxMjgsMjI4Ljc0NDQyIEw5MC44OTgzMjQsMzU4LjU5OTMzIEwtMi44NDIxNzA5NGUtMTQsNDUyLjQ5NDQyIEMxLjA0NjY1NDU0LDUzNS43ODg3MTkgMjQuNzI3MDQ0OCw2MTMuMzUxMDM3IDY0LjkyNzM3NDMsNjc5LjI0MTA3MSBMMTg1Ljc5MjE3OSw3MDguMjA4NzA1IEwyMTguNzU1MzA3LDgzMS4wNzE0MjkgQzI4My41NzA4NDYsODcwLjA4NTY3OSAzNTkuNDM4MTE4LDg5Mi44MzQzOTYgNDQwLjUwNzI2Myw4OTQuMDAxMTE2IEw1MzEuNDA1NTg3LDgwMi4xMDM3OTUgTDY2My4yNTgxMDEsODM4LjA2MzYxNiBDNzM1LjI5NTQ3NSw3OTguNjA3MjI3IDc5NS4yNDM5NTQsNzM5LjM2ODU5NCA4MzYuMDY0ODA0LDY2OC4yNTMzNDggTDc5OS4xMDYxNDUsNTI4LjQwOTU5OCBMODk0LDQzMi41MTY3NDEgQzg5MS43NjQ3NjgsMzYxLjY2OTk5MiA4NzIuOTUwNzAxLDI5NC44MTAwNjMgODQxLjA1OTIxOCwyMzUuNzM2NjA3IEw2OTguMjE4OTk0LDE5Ny43NzkwMTggTDY2MC4yNjE0NTMsNTMuOTM5NzMyMSBDNTk3LjI2Mzc2NywxOS42NTE1MzE2IDUyNC40NzQ1NTksLTIuODQyMTcwOTRlLTE0IDQ0Ny40OTk0NDEsLTIuODQyMTcwOTRlLTE0IEM0NDMuODc5NTU3LC0yLjg0MjE3MDk0ZS0xNCA0NDAuNjcyNzAzLDAuMDMzOTE4NjQ1OCA0MzcuNTEwNjE1LC0yLjg0MjE3MDk0ZS0xNCBMMzQ5LjYwODkzOSw4Ny45MDE3ODU3IEwyMzAuNzQxODk5LDU1LjkzNzUgWiBNMjU1LDM5NSBMMzk3LjM3MDc1NywyNTQgTDU4Ni44NjQyMywzMDYgTDUxNy42ODQwNzMsMzc2IEw2MTIuOTMyMTE1LDQwMiBMNjM5LDQ5NyBMNDk3LjYzMTg1NCw2MzggTDMwOC4xMzgzODEsNTg2IEwzNzcuMzE4NTM4LDUxNyBMMjgyLjA3MDQ5Niw0OTEgTDI1NSwzOTUgWiBNNDQ4LDQ0NyBMNTE3LDM3NiBMNDIxLDM1MCBMMzUyLDQyMSBMNDQ3LDQ0NyBMMzc3LDUxNiBMNDczLDU0MiBMNTQyLDQ3MiBMNDQ4LDQ0NyBMNDQ4LDQ0NyBaIiBpZD0iU21hbGwtUyIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTc2MiwyMTQgTDg0MiwyMzUgQzg3My42OTYyNjEsMjk0LjIyMzM2NyA4OTIuNjMwOTAxLDM2MS4yMDcwMzIgODk1LDQzMyBMODAwLDUyOCBMODM3LDY2OCBDODIwLjcxNzUxMSw2OTYuNzUyMTM1IDgwMS4wOTMwNzMsNzIzLjcwODI1OCA3NzksNzQ4IEM3NDUuOTQxNTkxLDc4NC4wNTIxNSA3MDcuMzIxMTA4LDgxNC41NzcwNTQgNjY0LDgzOCBMNTMzLDgwMiBMNDQyLDg5NCBDMzY4Ljg0Mzc3MSw4OTIuODI0MzkxIDMwMC40MDg2NzEsODc0LjQxOTE5NSAyNDAsODQzIEMyMzMuMjM5ODY3LDgzOC45ODEwNTMgMjI2LjQyMjY3OCw4MzUuMTIxMjcyIDIyMCw4MzEgTDE5Miw3MjggQzU5OC4yMDYxMTIsODQwLjgyNDgwNiA4NDAuNDc4MDk0LDQ4NC44NzI0NDMgNzYyLDIxNCBMNzYyLDIxNCBaIiBpZD0iUGF0aCIgZmlsbD0iI0NGRTBEOCI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTE5Mi4zMjg2NDcsNzI3Ljg2MTMyMSBDMTUyLjExMDMwNyw3MTYuNjg2MjM0IDExMC4yODMyODgsNzAwLjkxMTk0MSA2Nyw2ODAgQzExNC42NjM0MzYsNzU3Ljk5ODQxNSAxODUuNDM4NzE4LDgyMC4xMjg3NDkgMjY5Ljk0MzIyLDg1Ni45MzIyNDEgQzI1Mi42NjUyMDIsODQ5LjM0MTk0NiAyMzUuOTg5MzIxLDg0MC42NzE1OTUgMjIwLDgzMSBMMTkyLjMyODY0Nyw3MjcuODYxMzIxIFogTTc2MS44OTc2NzUsMjE0LjcxNDA2OCBDNzQ0LjkxNjIxMywxNTUuOTE5NjE2IDcxMi44MTg2ODgsMTAxLjEyNDc0NCA2NjQsNTYgQzczOS4xODM4OTMsOTcuNTQ1ODYwOSA4MDEuMTM1MjE3LDE2MC4xNDczNTUgODQxLjg4ODUzNSwyMzUuOTcwMzggTDc2MS44OTc2NzUsMjE0LjcxNDA2OCBaIE04OTQuNzYyNjYyLDQzMy4yNDAwMTYgQzg5NC45MjA0ODIsNDM4LjE0MDAzOCA4OTUsNDQzLjA2MDQzMiA4OTUsNDQ4IEM4OTUsNTI3LjkwMzgyMSA4NzMuODk0ODksNjAyLjk1NDMyNyA4MzYuOTY2NTQ0LDY2Ny44NzQzMTIgTDgwMCw1MjkgTDg5NC43NjI2NTYsNDMzLjIzOTg0MiBaIE03ODUuODk5MzU2LDczOS45OTgyMTkgQzcwNC4wNjY4MjYsODM0LjI5Mjk0OSA1ODMuMzg2NTA3LDg5NCA0NDksODk0IEM0NDYuNjc5NDYzLDg5NCA0NDQuMzYzMTgyLDg5My45ODI0OTEgNDQyLjA1MTI4MSw4OTMuOTQ3NTk3IEw1MzIsODAyIEw2NjQsODM4IEM3MTAuMzAyNTEyLDgxMi44MTE0MTYgNzUxLjUzMjkwNiw3NzkuNDc4MDE3IDc4NS44OTkzNTYsNzM5Ljk5ODIxOSBaIiBpZD0iQ29tYmluZWQtU2hhcGUiIGZpbGw9IiMyQTUxMzUiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+"
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
