var gulp = require("gulp");
var del = require("del");
var imagemin = require("gulp-imagemin");
var inlinesource = require("gulp-inline-source");
var minify = require("gulp-minify");

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

gulp.task("inlinesource", function() {
	var options = {
		compress: false
	};

	return gulp.src("www/*.html").pipe(inlinesource()).pipe(gulp.dest("www/"));
});

gulp.task("build", ["images", "compress", "inlinesource"]);
