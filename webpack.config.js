const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

const appDirectory = path.resolve(__dirname);

// Load .env variables
const dotenvPath = path.resolve(appDirectory, '.env');
if (fs.existsSync(dotenvPath)) {
  const envConfig = fs.readFileSync(dotenvPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
}


const compileNodeModules = [
  'react-native-reanimated',
  'react-native-gesture-handler',
  'react-native-screens',
  'react-native-safe-area-context',
  'nativewind',
  'react-native-css-interop',
  'react-native-svg',
  'lucide-react-native',
].map((moduleName) => path.resolve(appDirectory, `node_modules/${moduleName}`));

module.exports = {
  entry: path.resolve(appDirectory, 'index.web.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(appDirectory, 'dist'),
    publicPath: '/',
  },
  resolve: {
    fullySpecified: false,
    alias: {
      'react-native$': 'react-native-web',
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: [
          path.resolve(appDirectory, 'index.web.js'),
          path.resolve(appDirectory, 'App.tsx'),
          path.resolve(appDirectory, 'screens'),
          path.resolve(appDirectory, 'components'),
          path.resolve(appDirectory, 'navigation'),
          path.resolve(appDirectory, 'services'),
          path.resolve(appDirectory, 'store'),
          path.resolve(appDirectory, 'hooks'),
          path.resolve(appDirectory, 'theme'),
          path.resolve(appDirectory, 'constants'),
          ...compileNodeModules,
        ],
        use: {
          loader: 'babel-loader',
          options: {
            configFile: false,
            babelrc: false,
            cacheDirectory: true,
            sourceType: 'unambiguous',
            presets: [
              ['@babel/preset-env', { targets: { browsers: ['last 2 versions'] }, loose: true, modules: false }],
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
              'nativewind/babel',
            ],
            plugins: [
              '@babel/plugin-transform-flow-strip-types',
              ['@babel/plugin-transform-private-methods', { loose: true }],
              ['@babel/plugin-transform-private-property-in-object', { loose: true }],
              ['@babel/plugin-transform-class-properties', { loose: true }],
              'react-native-web',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(appDirectory, 'public/index.html'),
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL || 'https://cinefriends-native-chat-backend.onrender.com/api'),
      'process.env.SOCKET_URL': JSON.stringify(process.env.SOCKET_URL || 'https://cinefriends-native-chat-backend.onrender.com'),
    }),
  ],
  devServer: {
    historyApiFallback: true,
    port: 3001,
    hot: true,
  },
};

