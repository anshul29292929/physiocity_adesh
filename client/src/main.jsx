import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'

// React 19 compatibility fix for libraries using findDOMNode (like react-quill)
if (!ReactDOM.findDOMNode) {
    ReactDOM.findDOMNode = (el) => el;
}
window.ReactDOM = ReactDOM;
import './index.css'
import App from './App.jsx'

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "1020708357108-40lutuhhu19cf3hhnstthjkl1snrnrjl.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
