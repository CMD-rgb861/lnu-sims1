import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store'; 

import '@mantine/core/styles.css';
import 'mantine-datatable/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import 'react-toastify/dist/ReactToastify.css';

import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);