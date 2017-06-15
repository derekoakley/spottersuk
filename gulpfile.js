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
			imagemin([
				imagemin.svgo({ plugins: [{ removeTitle: true, removeDesc: true }] })
			])
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
							"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODk1cHgiIGhlaWdodD0iODk1cHgiIHZpZXdCb3g9IjAgMCA4OTUgODk1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0My4yICgzOTA2OSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+TG9nby9pY29uPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlN5bWJvbHMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJMb2dvL2ljb24iPgogICAgICAgICAgICA8cGF0aCBkPSJNMCw0NDggQzAsNjk0LjY0NzcxMiAyMDAuMzUyMjg4LDg5NSA0NDgsODk1IEM2OTQuNjQ3NzEyLDg5NSA4OTUsNjk0LjY0NzcxMiA4OTUsNDQ4IEM4OTUsMjAwLjM1MjI4OCA2OTQuNjQ3NzEyLDAgNDQ4LDAgQzIwMC4zNTIyODgsMCAwLDIwMC4zNTIyODggMCw0NDggWiIgaWQ9ImJhbGwiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTY2Mi4wNTY1NSw1NC42MjA0NjMzIEM4MDAuNzk1MzcyLDEzMC42MTAyMjkgODk1LDI3OC4xODYwODEgODk1LDQ0OCBDODk1LDY5NC42NDc3MTIgNjk0LjY0NzcxMiw4OTUgNDQ4LDg5NSBDMjg2LjY3ODA3MSw4OTUgMTQ1LjQyNTY3Nyw4MDkuOTgxNjg4IDY2LjU1MTU1NDEsNjgyLjUzMDIyNiBDNjYuNzAwODM1Myw2ODIuNjg3MDM3IDY2Ljg1MDMxNzIsNjgyLjg0MzYyOCA2Nyw2ODMgQzY0Mi4wNjExOCw5NjAuNTA1NTk5IDk2MC4yOTgxNDIsMzMxLjQwODg4IDY2NSw1OCBDNjY0LjA2Mzk4Nyw1Ni44NjIyNzE2IDY2My4wODI0OTksNTUuNzM1NjUwOSA2NjIuMDU2NTM5LDU0LjYyMDQ1NzMgWiIgaWQ9InNoYWRvdyIgZmlsbD0iI0NGRTBEOCI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNNTcuMDI2MDMzMSwyMjguOTIxMjM2IEMyMC43MDM0MTgxLDI5My42NzA3MzQgMCwzNjguMzkxNzI5IDAsNDQ4IEMwLDQ0OS43MjM3NTkgMC4wMDk3ODU3MzE5LDQ1MS40NDUyNTcgMC4wMjkzMDQ5NDk5LDQ1My4xNjQ0NDEgQzAuMzM3MzQ3MTgzLDQ1My4wNjE3NCAwLjY2MDgyNTczNiw0NTMuMDA2NDQ5IDEsNDUzIEw5MiwzNTkgTDU4LDIyOSBDNTcuNjQ0MTUwNCwyMjkuMDA1MTMgNTcuMzE5NzExMSwyMjguOTc4NTkxIDU3LjAyNjAzMzEsMjI4LjkyMTIzNiBaIE0yMzAuNjg4Mjk5LDU2LjA0MDAxNDMgQzI5Mi41NTE0NTYsMjEuNzAzOTMwOSAzNjMuNDI0MzkyLDEuNTg4MjIzNjIgNDM4LjkwOTg3NCwwLjA5MDEyNTg4NzggTDM1MSw4OCBMMjMyLDU2IEMyMzEuNTY4Mzg0LDU2LjAwMjYzMzkgMjMxLjEzMTA5NCw1Ni4wMTYwMzY0IDIzMC42ODgyNTgsNTYuMDQwMDM3IFogTTY2Mi4xODE4NTEsNTQuNjg5MTE5IEM3MzcuOTY2MDkyLDk2LjIyOTA5NDYgODAwLjQ1Mjg1OSwxNTkuMTMyMzY0IDg0MS41NDIwMTIsMjM1LjM1MTM2NCBMNzAwLDE5OCBMNjYyLjE4MTg1MSw1NC42ODkxMTkgWiBNMjE5Ljk1OTAyNCw4MzIuODQ3MjcgQzE1Ni41NTc3ODMsNzk1LjM2Mjk0NCAxMDMuMjMzNDE5LDc0Mi43MjcyNzggNjQuOTcyNjcyOCw2NzkuOTU5NTkzIEM2NS4zMTU5NzQyLDY3OS45OTA4NzIgNjUuNjU4NDM2NCw2ODAuMDA0NDQ4IDY2LDY4MCBMMTg3LDcxMCBMMjE5Ljk1OTAyNCw4MzIuODQ3MjcgWiIgaWQ9InNtYWxsLXMiIGZpbGw9IiMxMzVDMjkiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTY2Mi4xODE4NTEsNTQuNjg5MTE5IEM3MzguMDY3MDk3LDk2LjI4NDQ1OTIgODAwLjYxOTQwMSwxNTkuMzAwMDc3IDg0MS43MDYxODksMjM1LjY1NjE5IEw3NjIuMDEyNDQ5LDIxNC40Nzg4MzMgQzc0NC45Mjg3NTYsMTU2LjUxODA3NCA3MTMuMTA1MzA3LDEwMi41Mzk0NTUgNjY1LDU4IEM2NjQuMTA5ODQzLDU2LjkxODAwOTUgNjYzLjE3ODU1Nyw1NS44NDYwNjQ4IDY2Mi4yMDcwMDUsNTQuNzg0NDQxIEw2NjIuMTgxODQ3LDU0LjY4OTEwMzMgWiBNODk0Ljc5MjcxMyw0MzQuMjIwMTQ3IEM4OTQuOTMwNTczLDQzOC43OTYzODQgODk1LDQ0My4zODk5OTggODk1LDQ0OCBDODk1LDUyNy42MzE0ODQgODc0LjExNjE4OSw2MDIuNDM3MzQ0IDgzNy41MzMwMzcsNjY3LjIzMzExMSBMODAxLDUyOSBMODk0Ljc5MjcwOSw0MzQuMjIgWiBNNjY0Ljc0MTI1LDgzOC45Mjk0MzIgQzYwMC41MjI0NDgsODc0LjY0NzEzOSA1MjYuNjEyNjkzLDg5NSA0NDgsODk1IEM0NDYuMDA5Njk3LDg5NSA0NDQuMDIyNDQ4LDg5NC45ODcwNTkgNDQyLjAzODMzNCw4OTQuOTYxMjU3IEw1MzMsODAzIEw2NjQuNzQxMjUsODM4LjkyOTQzMiBaIE0yMjIuNjI5NDMzLDgzNC40MTM2NDcgQzE1OC45MjYwMzYsNzk3LjM0MjY5NSAxMDUuMjM2Miw3NDUuMDQwMTQxIDY2LjU1MTU1NDEsNjgyLjUzMDIyNiBDNjYuNzAwODM1Myw2ODIuNjg3MDM3IDY2Ljg1MDMxNzIsNjgyLjg0MzYyOCA2Nyw2ODMgQzExMC40ODIzMjEsNzAzLjk4MzEzNyAxNTIuNDk2Mjc5LDcxOS43ODI4ODEgMTkyLjg4NzY2NSw3MzAuOTQ0OTMzIEwyMjAsODMyIEMyMjAuODY0OTEyLDgzMi44MDg2NzIgMjIxLjc0MTQ1LDgzMy42MTMyOTQgMjIyLjYyOTQ1Miw4MzQuNDEzNjY0IFoiIGlkPSJzaGFkb3ctY29weSIgZmlsbD0iIzJBNTEzNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMjU1LDM5NSBMMzk3LDI1NCBMNTg2LDMwNiBMNTE3LDM3NiBMNjEyLDQwMiBMNjM4LDQ5NyBMNDk3LDYzOCBMMzA4LDU4NiBMMzc3LDUxNyBMMjgyLDQ5MSBMMjU1LDM5NSBaIE00NDgsNDQ3IEw1MTcsMzc2IEw0MjEsMzUwIEwzNTIsNDIxIEw0NDcsNDQ3IEwzNzcsNTE2IEw0NzMsNTQyIEw1NDIsNDcyIEw0NDgsNDQ3IEw0NDgsNDQ3IFoiIGlkPSJQYXRoIiBmaWxsPSIjMTM1QzI5Ij48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4="
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
							"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODk1cHgiIGhlaWdodD0iODk1cHgiIHZpZXdCb3g9IjAgMCA4OTUgODk1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0My4yICgzOTA2OSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+TG9nby9pY29uPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlN5bWJvbHMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJMb2dvL2ljb24iPgogICAgICAgICAgICA8cGF0aCBkPSJNMCw0NDggQzAsNjk0LjY0NzcxMiAyMDAuMzUyMjg4LDg5NSA0NDgsODk1IEM2OTQuNjQ3NzEyLDg5NSA4OTUsNjk0LjY0NzcxMiA4OTUsNDQ4IEM4OTUsMjAwLjM1MjI4OCA2OTQuNjQ3NzEyLDAgNDQ4LDAgQzIwMC4zNTIyODgsMCAwLDIwMC4zNTIyODggMCw0NDggWiIgaWQ9ImJhbGwiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTY2Mi4wNTY1NSw1NC42MjA0NjMzIEM4MDAuNzk1MzcyLDEzMC42MTAyMjkgODk1LDI3OC4xODYwODEgODk1LDQ0OCBDODk1LDY5NC42NDc3MTIgNjk0LjY0NzcxMiw4OTUgNDQ4LDg5NSBDMjg2LjY3ODA3MSw4OTUgMTQ1LjQyNTY3Nyw4MDkuOTgxNjg4IDY2LjU1MTU1NDEsNjgyLjUzMDIyNiBDNjYuNzAwODM1Myw2ODIuNjg3MDM3IDY2Ljg1MDMxNzIsNjgyLjg0MzYyOCA2Nyw2ODMgQzY0Mi4wNjExOCw5NjAuNTA1NTk5IDk2MC4yOTgxNDIsMzMxLjQwODg4IDY2NSw1OCBDNjY0LjA2Mzk4Nyw1Ni44NjIyNzE2IDY2My4wODI0OTksNTUuNzM1NjUwOSA2NjIuMDU2NTM5LDU0LjYyMDQ1NzMgWiIgaWQ9InNoYWRvdyIgZmlsbD0iI0NGRTBEOCI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNNTcuMDI2MDMzMSwyMjguOTIxMjM2IEMyMC43MDM0MTgxLDI5My42NzA3MzQgMCwzNjguMzkxNzI5IDAsNDQ4IEMwLDQ0OS43MjM3NTkgMC4wMDk3ODU3MzE5LDQ1MS40NDUyNTcgMC4wMjkzMDQ5NDk5LDQ1My4xNjQ0NDEgQzAuMzM3MzQ3MTgzLDQ1My4wNjE3NCAwLjY2MDgyNTczNiw0NTMuMDA2NDQ5IDEsNDUzIEw5MiwzNTkgTDU4LDIyOSBDNTcuNjQ0MTUwNCwyMjkuMDA1MTMgNTcuMzE5NzExMSwyMjguOTc4NTkxIDU3LjAyNjAzMzEsMjI4LjkyMTIzNiBaIE0yMzAuNjg4Mjk5LDU2LjA0MDAxNDMgQzI5Mi41NTE0NTYsMjEuNzAzOTMwOSAzNjMuNDI0MzkyLDEuNTg4MjIzNjIgNDM4LjkwOTg3NCwwLjA5MDEyNTg4NzggTDM1MSw4OCBMMjMyLDU2IEMyMzEuNTY4Mzg0LDU2LjAwMjYzMzkgMjMxLjEzMTA5NCw1Ni4wMTYwMzY0IDIzMC42ODgyNTgsNTYuMDQwMDM3IFogTTY2Mi4xODE4NTEsNTQuNjg5MTE5IEM3MzcuOTY2MDkyLDk2LjIyOTA5NDYgODAwLjQ1Mjg1OSwxNTkuMTMyMzY0IDg0MS41NDIwMTIsMjM1LjM1MTM2NCBMNzAwLDE5OCBMNjYyLjE4MTg1MSw1NC42ODkxMTkgWiBNMjE5Ljk1OTAyNCw4MzIuODQ3MjcgQzE1Ni41NTc3ODMsNzk1LjM2Mjk0NCAxMDMuMjMzNDE5LDc0Mi43MjcyNzggNjQuOTcyNjcyOCw2NzkuOTU5NTkzIEM2NS4zMTU5NzQyLDY3OS45OTA4NzIgNjUuNjU4NDM2NCw2ODAuMDA0NDQ4IDY2LDY4MCBMMTg3LDcxMCBMMjE5Ljk1OTAyNCw4MzIuODQ3MjcgWiIgaWQ9InNtYWxsLXMiIGZpbGw9IiMxMzVDMjkiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTY2Mi4xODE4NTEsNTQuNjg5MTE5IEM3MzguMDY3MDk3LDk2LjI4NDQ1OTIgODAwLjYxOTQwMSwxNTkuMzAwMDc3IDg0MS43MDYxODksMjM1LjY1NjE5IEw3NjIuMDEyNDQ5LDIxNC40Nzg4MzMgQzc0NC45Mjg3NTYsMTU2LjUxODA3NCA3MTMuMTA1MzA3LDEwMi41Mzk0NTUgNjY1LDU4IEM2NjQuMTA5ODQzLDU2LjkxODAwOTUgNjYzLjE3ODU1Nyw1NS44NDYwNjQ4IDY2Mi4yMDcwMDUsNTQuNzg0NDQxIEw2NjIuMTgxODQ3LDU0LjY4OTEwMzMgWiBNODk0Ljc5MjcxMyw0MzQuMjIwMTQ3IEM4OTQuOTMwNTczLDQzOC43OTYzODQgODk1LDQ0My4zODk5OTggODk1LDQ0OCBDODk1LDUyNy42MzE0ODQgODc0LjExNjE4OSw2MDIuNDM3MzQ0IDgzNy41MzMwMzcsNjY3LjIzMzExMSBMODAxLDUyOSBMODk0Ljc5MjcwOSw0MzQuMjIgWiBNNjY0Ljc0MTI1LDgzOC45Mjk0MzIgQzYwMC41MjI0NDgsODc0LjY0NzEzOSA1MjYuNjEyNjkzLDg5NSA0NDgsODk1IEM0NDYuMDA5Njk3LDg5NSA0NDQuMDIyNDQ4LDg5NC45ODcwNTkgNDQyLjAzODMzNCw4OTQuOTYxMjU3IEw1MzMsODAzIEw2NjQuNzQxMjUsODM4LjkyOTQzMiBaIE0yMjIuNjI5NDMzLDgzNC40MTM2NDcgQzE1OC45MjYwMzYsNzk3LjM0MjY5NSAxMDUuMjM2Miw3NDUuMDQwMTQxIDY2LjU1MTU1NDEsNjgyLjUzMDIyNiBDNjYuNzAwODM1Myw2ODIuNjg3MDM3IDY2Ljg1MDMxNzIsNjgyLjg0MzYyOCA2Nyw2ODMgQzExMC40ODIzMjEsNzAzLjk4MzEzNyAxNTIuNDk2Mjc5LDcxOS43ODI4ODEgMTkyLjg4NzY2NSw3MzAuOTQ0OTMzIEwyMjAsODMyIEMyMjAuODY0OTEyLDgzMi44MDg2NzIgMjIxLjc0MTQ1LDgzMy42MTMyOTQgMjIyLjYyOTQ1Miw4MzQuNDEzNjY0IFoiIGlkPSJzaGFkb3ctY29weSIgZmlsbD0iIzJBNTEzNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMjU1LDM5NSBMMzk3LDI1NCBMNTg2LDMwNiBMNTE3LDM3NiBMNjEyLDQwMiBMNjM4LDQ5NyBMNDk3LDYzOCBMMzA4LDU4NiBMMzc3LDUxNyBMMjgyLDQ5MSBMMjU1LDM5NSBaIE00NDgsNDQ3IEw1MTcsMzc2IEw0MjEsMzUwIEwzNTIsNDIxIEw0NDcsNDQ3IEwzNzcsNTE2IEw0NzMsNTQyIEw1NDIsNDcyIEw0NDgsNDQ3IEw0NDgsNDQ3IFoiIGlkPSJQYXRoIiBmaWxsPSIjMTM1QzI5Ij48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4="
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
