import gulp from "gulp";
import plumber from "gulp-plumber";
import less from "gulp-less";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import rename from "gulp-rename";
import csso from "postcss-csso";
import svgstore from "gulp-svgstore";
import squoosh from "gulp-libsquoosh";
import svgo from "gulp-svgmin";
import minify from "gulp-htmlmin";
import terser from "gulp-terser";
import del from "del";
import browser from "browser-sync";

// Styles
export const styles = () => {
  return gulp
    .src("source/less/style.less", { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([autoprefixer(), csso()]))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css", { sourcemaps: "." }))
    .pipe(browser.stream());
};

// HTML
const html = () => {
  return gulp
    .src("source/*.html")
    .pipe(minify({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
};

// Scripts
const scripts = () => {
  return gulp
    .src("source/js/*.js")
    .pipe(terser())
    .pipe(gulp.dest("build/js"))
    .pipe(browser.stream());
};

// Images
const optimizeImages = () => {
  return gulp
    .src("source/img/**/*.{png,jpg}")
    .pipe(squoosh())
    .pipe(gulp.dest("build/img"));
};

const copyImages = () => {
  return gulp.src("source/img/**/*.{png,jpg}").pipe(gulp.dest("build/img"));
};

// WebP
const createWebp = () => {
  return gulp
    .src("source/img/**/*.{png,jpg}")
    .pipe(
      squoosh({
        webp: {},
      })
    )
    .pipe(gulp.dest("build/img"));
};

// SVG
const svg = () =>
  gulp
    .src([
      "source/img/*.svg",
      "!source/img/icons/*.svg",
      "!source/img/sprite.svg",
    ])
    .pipe(svgo())
    .pipe(gulp.dest("build/img"));

const sprite = () => {
  return gulp
    .src("source/img/icons/*.svg")
    .pipe(svgo())
    .pipe(
      svgstore({
        inlineSvg: true,
      })
    )
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
};

// Copy
const copy = (done) => {
  gulp
    .src(
      [
        "source/fonts/*.{woff2,woff}",
        "source/*.ico",
        "source/manifest.webmanifest",
        "source/img/sprite.svg",
      ],
      {
        base: "source",
      }
    )
    .pipe(gulp.dest("build"));
  done();
};

// Clean
const clean = () => {
  return del("build");
};

// Server
const server = (done) => {
  browser.init({
    server: {
      baseDir: "build",
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

// Reload
const reload = (done) => {
  browser.reload();
  done();
};

// Watcher
const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series(styles));
  gulp.watch("source/js/*.js", gulp.series(scripts));
  gulp.watch("source/*.html", gulp.series(html, reload));
};

// Build
export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(styles, html, scripts, svg, sprite, createWebp)
);

// Default
export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(styles, html, scripts, svg, sprite, createWebp),
  gulp.series(server, watcher)
);
