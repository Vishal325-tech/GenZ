import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Centralized API fetch redirect interceptor
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  let targetInput = input;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  if (typeof input === 'string') {
    if (input.startsWith('/api/')) {
      targetInput = apiBase + input;
    }
  } else if (input instanceof Request) {
    const url = input.url;
    if (url.startsWith(window.location.origin + '/api/')) {
      const relativePath = url.substring(window.location.origin.length);
      targetInput = new Request(apiBase + relativePath, input);
    }
  }
  
  return originalFetch(targetInput, init);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
// 
