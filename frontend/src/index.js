import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';  // Import Bootstrap
import App from './App';
import { UserProvider } from './context/UserContext';

// Create the necessary HTML structure directly in JavaScript

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <UserProvider>
      <App />
    </UserProvider>
);

