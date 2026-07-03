
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';
import { ShiftProvider } from './contexts/ShiftContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <ShiftProvider>

        <App />
    </ShiftProvider>
);
