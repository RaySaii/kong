import paths, {appDll} from './paths'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import autoprefixer from 'autoprefixer'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import AddAssetHtmlPlugin from 'add-asset-html-webpack-plugin'
import ManifestPlugin from 'webpack-manifest-plugin'
import webpack from 'webpack'
import SystemBellPlugin from 'system-bell-webpack-plugin'
import ModuleScopePlugin from 'react-dev-utils/ModuleScopePlugin'

export const commonResolve = {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We placed these paths second because we want `node_modules` to "win"
    // if there are any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebookincubator/create-react-app/issues/253
    modules: [ 'node_modules' ],
    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebookincubator/create-react-app/issues/290
    // `web` extension prefixes have been added for better support
    // for React Native Web.
    extensions: [ '.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx', '.ts', '.tsx' ],
    alias: {
        // 'react': 'anujs',
        // 'react-dom': 'anujs',
        // Support React Native Web
        // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
        'react-native': 'react-native-web',
    },
    plugins: [
        // Prevents users from importing files from outside of src/ (or node_modules/).
        // This often causes confusion because we only process files within src/ with babel.
        // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
        // please link the files into your node_modules/ and let module-resolution kick in.
        // Make sure your source files are compiled, as they will not be processed in any way.
        new ModuleScopePlugin(paths.appSrc, [ paths.appPackageJson ]),
    ],
}
export const optimization = {
    splitChunks: {
        chunks: 'async', // 必须三选一： "initial" | "all"(推荐) | "async" (默认就是async)
        minSize: 30000, // 最小尺寸，30000
        minChunks: 2, // 最小 chunk ，默认1
        maxAsyncRequests: 5, // 最大异步请求数， 默认5
        maxInitialRequests: 3, // 最大初始化请求书，默认3
        automaticNameDelimiter: '~',// 打包分隔符
    },
    minimizer: [
        new UglifyJsPlugin({
            uglifyOptions: {
                parse: {
                    // we want uglify-js to parse ecma 8 code. However, we don't want it
                    // to apply any minfication steps that turns valid ecma 5 code
                    // into invalid ecma 5 code. This is why the 'compress' and 'output'
                    // sections only apply transformations that are ecma 5 safe
                    // https://github.com/facebook/create-react-app/pull/4234
                    ecma: 8,
                },
                compress: {
                    ecma: 5,
                    warnings: false,
                    // Disabled because of an issue with Uglify breaking seemingly valid code:
                    // https://github.com/facebook/create-react-app/issues/2376
                    // Pending further investigation:
                    // https://github.com/mishoo/UglifyJS2/issues/2011
                    comparisons: false,
                },
                mangle: {
                    safari10: true,
                },
                output: {
                    ecma: 5,
                    comments: false,
                    // Turned on because emoji and regex is not minified properly using default
                    // https://github.com/facebook/create-react-app/issues/2488
                    ascii_only: true,
                },
            },
            // Use multi-process parallel running to improve the build speed
            // Default number of concurrent runs: os.cpus().length - 1
            parallel: true,
            // Enable file caching
            cache: true,
            sourceMap: false,
        }),
        new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: { discardComments: { removeAll: true }, zindex: false },
        }),
    ],
}


export function getStyleLoader(env, cssLoader) {
    const lastLoader = env === 'development' ? require.resolve('style-loader') : MiniCssExtractPlugin.loader
    const postLoader = {
        loader: require.resolve('postcss-loader'),
        options: {
            // Necessary for external CSS imports to work
            // https://github.com/facebookincubator/create-react-app/issues/2677
            ident: 'postcss',
            plugins: () => [
                require('postcss-flexbugs-fixes'),
                autoprefixer({
                    browsers: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9', // React doesn't support IE8 anyway
                    ],
                    flexbox: 'no-2009',
                }),
            ],
        },
    }
    const preCssLoader = {
        ...cssLoader,
        options: {
            ...cssLoader.options,
            importLoaders: 2,
        },
    }
    return [
        // 全局样式和外部样式
        {
            test: /\.css$/,
            include: [ /global/, /node_modules/ ],
            sideEffects: true,
            use: [
                lastLoader,
                require.resolve('css-loader'),
            ],
        },
        {
            test: /\.s(c|a)ss$/,
            include: [ /global/, /node_modules/ ],
            sideEffects: true,
            use: [
                lastLoader,
                { loader: require.resolve('css-loader'), options: { importLoaders: 2 } },
                postLoader,
                require.resolve('sass-loader'),
            ],
        },
        {
            test: /\.less$/,
            include: [ /node_modules/, /global/ ],
            use: [
                lastLoader,
                { loader: require.resolve('css-loader'), options: { importLoaders: 2 } },
                postLoader,
                require.resolve('less-loader'),
            ],
        },
        // css-modules
        {
            test: /\.css$/,
            exclude: [ /node_modules/, /global/ ],
            use: [
                lastLoader,
                cssLoader,
                postLoader,
            ],
        },
        {
            test: /\.s(c|a)ss$/,
            exclude: [ /node_modules/, /global/ ],
            use: [
                lastLoader,
                preCssLoader,
                postLoader,
                require.resolve('sass-loader'),
            ],
        },
        {
            test: /\.less$/,
            exclude: [ /node_modules/, /global/ ],
            use: [
                lastLoader,
                preCssLoader,
                postLoader,
                require.resolve('less-loader'),
            ],
        },
    ]
}

export const commonLoader = [
    // "url" loader works like "file" loader except that it embeds assets
    // smaller than specified limit in bytes as data URLs to avoid requests.
    // A missing `test` is equivalent to a match.
    {
        test: [ /\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/ ],
        loader: require.resolve('url-loader'),
        options: {
            limit: 10000,
            name: 'static/media/[name].[hash:8].[ext]',
        },
    },
    // Process JS with Babel.
    {
        test: /jquery/,
        use: [ {
            loader: require.resolve('expose-loader'),
            options: '$',
        } ],
    },
    { test: /\.xml$/, loader: require.resolve('xml-loader') },
    {
        loader: require.resolve('file-loader'),
        // Exclude `js` files to keep "css" loader working as it injects
        // it's runtime that would otherwise processed through "file" loader.
        // Also exclude `html` and `json` extensions so they get processed
        // by webpacks internal loaders.
        exclude: [ /\.(js|jsx|mjs)$/, /\.html$/, /\.json$/ ],
        options: {
            name: 'static/media/[name].[hash:8].[ext]',
        },
    },
]

export const commonNode = {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
}

export function getCommonPlugins(env) {
    return [
        new ProgressBarPlugin(),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new AddAssetHtmlPlugin({
            filepath: path.join(appDll(env), '*.dll.js'),
            includeSourcemap: env === 'production' ? false : true,
        }),
        new webpack.DllReferencePlugin({
            context: paths.appSrc,
            manifest: require(path.join(appDll(env), 'vendor.manifest.json')),
            extensions: [ '.js', '.jsx' ],
        }),
        new ManifestPlugin({
            fileName: 'asset-manifest.json',
            // publicPath: '/',
        }),
        new SystemBellPlugin(),
    ]
}
