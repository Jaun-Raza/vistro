import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ApiProvider } from '@reduxjs/toolkit/query/react';
import { Api } from "./RTK/ApiRequests.js";

ReactDOM.createRoot(document.getElementById('root')).render(
  <ApiProvider api={Api}>
    <App />
  </ApiProvider>,
)
