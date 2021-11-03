const fileswatch = "html,htm,txt,json,md,woff2"; // List of files extensions for watching & hard reload

const { src, dest, parallel, series, watch } = require("gulp");
const browserSync = require("browser-sync").create();
const bssi = require("browsersync-ssi");
const ssi = require("ssi");
const webpack = require("webpack-stream");
const sass = require("gulp-sass");
const sassglob = require("gulp-sass-glob");
const cleancss = require("gulp-clean-css");
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const rsync = require("gulp-rsync");
const del = require("del");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const fs = require("fs");
const webp = require("gulp-webp");
const concat = require("gulp-concat");
const fileinclude = require('gulp-file-include');

function browsersync() {
    browserSync.init({
        server: {
            baseDir: "app/",
            middleware: bssi({ baseDir: "app/", ext: ".html" }),
        },
        notify: false,
        online: true,
    });
}

function scripts() {
    return src(["app/js/*.js", "!app/js/*.min.js"])
		.pipe(fileinclude())
        .pipe(
            webpack({
                mode: "production",
                module: {
                    rules: [
                        {
                            test: /\.(js)$/,
                            exclude: /(node_modules)/,
                            loader: "babel-loader",
                            query: {
                                presets: ["@babel/env"],
                                plugins: ["babel-plugin-root-import"],
                            },
                        },
                    ],
                },
            })
        )
        .on("error", function handleError() {
            this.emit("end");
        })
        .pipe(rename("app.min.js"))
        .pipe(dest("app/js"))
        .pipe(browserSync.stream());
}

function styles() {
    return src([
        "app/scss/*.*",
        "!app/scss/_*.*",
    ])
        .pipe(eval(`sassglob`)())
        .pipe(eval('sass')())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 10 versions"],
                grid: true,
            })
        )
        .pipe(
            cleancss({
                level: { 1: { specialComments: 0 } } /* format: 'beautify' */,
            })
        )
        .pipe(rename({ suffix: ".min" }))
        .pipe(dest("app/" + "css"))
        .pipe(browserSync.stream());
}

function fonts() {
    return src("app/fonts/**/*")
	.pipe(ttf2woff2())
	.pipe(ttf2woff())
        .pipe(dest("app/fonts"));
}

function fontsStyle() {
    let file_content = fs.readFileSync("app/scss/_fonts.scss");
    if (file_content == "") {
        fs.writeFile("app/scss/_fonts.scss", "", cb);
        return fs.readdir("app/fonts", function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split(".");
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile("app/scss/_fonts.scss", '@include font("' + fontname +  '", "' +fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        });
    }
}

function cb() {}

function images() {
	src(["app/images/src/**/*"])
		.pipe(newer("app/images/dist"))
		.pipe(imagemin())
		.pipe(webp())
		.pipe(dest("app/images/dist"));
		
    return src(["app/images/src/**/*"])
        .pipe(newer("app/images/dist"))
        .pipe(imagemin())
        .pipe(dest("app/images/dist"))
        .pipe(browserSync.stream());
}

function buildcopy() {
    return src(
        [
            '{app/js,app/css}/*.min.*',
            "app/images/**/*.*",
            "!app/images/src/**/*",
            "app/fonts/**/*",
        ],
        { base: "app/" }
    ).pipe(dest("dist"));
}

async function buildhtml() {
    let includes = new ssi("app/", "dist/", "/**/*.html");
    includes.compile();
    del("dist/parts", { force: true });
}

function cleandist() {
    return del("dist/**/*", { force: true });
}

function deploy() {
    return src("dist/").pipe(
        rsync({
            root: "dist/",
            hostname: "username@yousite.com",
            destination: "yousite/public_html/",
            include: [
                /* '*.htaccess' */
            ], // Included files to deploy,
            exclude: ["**/Thumbs.db", "**/*.DS_Store"],
            recursive: true,
            archive: true,
            silent: false,
            compress: true,
        })
    );
}

function startwatch() {
    watch(`app/scss/**/*`, { usePolling: true }, styles);
    watch(
        ["app/js/**/*.js", "!app/js/**/*.min.js"],
        { usePolling: true },
        scripts
    );
    watch(
        "app/images/src/**/*.{jpg,jpeg,png,webp,svg,gif}",
        { usePolling: true },
        images
    );
    watch(`app/**/*.{${fileswatch}}`, { usePolling: true }).on(
        "change",
        browserSync.reload
    );
}

function clearImages() {
    return del("app/images/dist", { force: true });
}

exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.clearImages = clearImages;
exports.deploy = deploy;
exports.fonts = fonts;
exports.fontsStyle = fontsStyle;
exports.assets = series(scripts, styles, images);
exports.build = series(
    cleandist,
    scripts,
    styles,
    images,
    buildcopy,
    buildhtml
);
exports.default = series(
    scripts,
    styles,
    images,
    parallel(browsersync, startwatch)
);
