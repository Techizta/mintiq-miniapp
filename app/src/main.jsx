import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Initialize Telegram WebApp
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  
  // Expand to full height
  tg.expand();
  
  // Enable closing confirmation
  tg.enableClosingConfirmation();
  
  // Set header color
  tg.setHeaderColor('#0a0a0c');
  tg.setBackgroundColor('#0a0a0c');
  
  // Ready signal
  tg.ready();
  
  // Add class to body
  document.body.classList.add('tg-webapp');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
