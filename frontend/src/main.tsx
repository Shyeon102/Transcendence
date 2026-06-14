//import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  //<StrictMode> // 디버깅용
    <Provider store={store}>
      <App />
    </Provider>
  //</StrictMode>,
);
