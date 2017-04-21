var gulp = require("gulp");
var cleanCSS = require("gulp-clean-css");
var del = require("del");
var imagemin = require("gulp-imagemin");
var minify = require("gulp-minify");
var rename = require("gulp-rename");

gulp.task("clean", function() {
	return del([
		"www/gulpfile.js",
		"www/css/**/*.css",
		"!www/css/**/style.css",
		"www/js/*-debug.js",
		"www/node_modules/**"
	]);
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

gulp.task("build", ["images", "compress"]);

gulp.task("minify-css", function() {
	return gulp
		.src("css/*.css")
		.pipe(cleanCSS({ compatibility: "ie8" }))
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest("css/"));
});
