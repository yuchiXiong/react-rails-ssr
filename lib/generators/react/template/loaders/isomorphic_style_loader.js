const {resolve} = require('path');

const isomorphicCssLoader = {
    test: /\.(css)$/i,
    use: [
        {
            loader: 'isomorphic-style-loader'
        }, {
            loader: 'css-loader',
            options: {
                importLoaders: 2,
                modules: {
                    localIdentName: '[name]__[local]--[hash:base64:5]',
                },
                sourceMap: true
            }
        }, {
            loader: 'postcss-loader',
            options: {
                config: {
                    path: resolve()
                },
                sourceMap: true
            }
        }
    ]
};

const isomorphicSassLoader = {
    test: /\.(scss|sass)(\.erb)?$/i,
    use: [
        {
            loader: 'isomorphic-style-loader'
        }, {
            loader: 'css-loader',
            options: {
                importLoaders: 2,
                modules: {
                    localIdentName: '[name]__[local]--[hash:base64:5]',
                },
                sourceMap: true
            }
        }, {
            loader: 'postcss-loader',
            options: {
                config: {
                    path: resolve()
                },
                sourceMap: true
            }
        }, {
            loader: 'sass-loader',
            options: {
                sourceMap: true,
                sassOptions: {
                    includePaths: []
                }
            }
        }
    ]
};

const reloadStyleLoader = environment => {
    environment.loaders.delete('css').append('css', isomorphicCssLoader);
    environment.loaders.delete('sass').append('sass', isomorphicSassLoader);
    return environment;
}

module.exports = reloadStyleLoader
