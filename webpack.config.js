const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path          = require('path');
const CopyPlugin    = require('copy-webpack-plugin');

module.exports = {
    ...defaultConfig,
    entry: {
        'blocks/popup/index': './blocks/popup/index.js',
        'blocks/slide/index': './blocks/slide/index.js',
    },
    output: {
        ...defaultConfig.output,
        path: path.resolve(__dirname, 'build'),
    },
    plugins: [
        ...defaultConfig.plugins,
        new CopyPlugin({
            patterns: [
                { from: 'blocks/popup/editor.css', to: 'blocks/popup/editor.css' },
                { from: 'blocks/slide/editor.css',  to: 'blocks/slide/editor.css'  },
            ],
        }),
    ],
};
