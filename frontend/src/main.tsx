import { AppRegistry } from 'react-native-web';
import App from '../App';

// React Native Web 애플리케이션 진입점 등록 및 마운트
AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
