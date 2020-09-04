const mix = require("laravel-mix");

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

 //ここを追加！
const WebpackGoogleCloudStoragePlugin = require("webpack-google-cloud-storage-plugin");

const plugins = [];
if (mix.inProduction()) {
    mix.version();
    plugins.push(
        new WebpackGoogleCloudStoragePlugin({
            directory: "public",
            include: ["app.js","app.css"],
            exclude: ["images"],
            storageOptions: {
                keyFilename: process.env.MIX_CLOUD_STORAGE_CREDENTIAL_FILE
            },
            uploadOptions: {
                bucketName: process.env.MIX_PUBLIC_BUCKET_NAME,
                destinationNameFn: file => path.join("", file.path),
                gzip: true,
                makePublic: true,
                resumable: true,
                concurrency: 5
            }
        })
    );
}
//追加ここまで

mix.ts("resources/assets/ts/app.tsx", "public/js")
    .sass("resources/assets/sass/app.scss", "public/css")
    .options({
        processCssUrls: false
    })
    .webpackConfig({
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    exclude: /node_modules/
                },
                {
                    test: /\.js?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env", "@babel/react"]
                        }
                    }
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        {
                            loader: "resolve-url-loader",
                            options: {}
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                }
            ]
        },
        resolve: {
            extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
            alias: {
                react: path.resolve("./node_modules/react")
            }
        },
        plugins: plugins//ここも追加しています。
    });
    
    