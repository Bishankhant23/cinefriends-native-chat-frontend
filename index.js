import { AppRegistry } from 'react-native';
import App from './App';
import appConfig from './app.json';
const appName = appConfig.name;

import './global.css';

AppRegistry.registerComponent(appName, () => App);
