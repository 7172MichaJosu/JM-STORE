import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ProveedorTema from './tema/ProveedorTema.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/movimiento.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><ProveedorTema><App /></ProveedorTema></React.StrictMode>);
