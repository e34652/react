import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { worker } from './mocks/browser';

const root = ReactDOM.createRoot(document.getElementById('root'));

if (process.env.NODE_ENV === 'development') {
    worker.start().then(() => {
        root.render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
    });
} else {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
}
