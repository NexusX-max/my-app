import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app.jsx'
import './index.css' 
import { AuthProvider } from './context/AuthContext'
import { ModeProvider } from './context/ModeContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

// 🚨 Simple-Peer & WebRTC Global Polyfills
// ব্রাউজারে Node.js এর ফিচারগুলো সাপোর্ট করার জন্য এই অংশটি সবার আগে থাকা জরুরি
import { Buffer } from 'buffer'

window.global = window;
window.Buffer = Buffer;

// process অবজেক্ট এবং nextTick নিশ্চিত করা যাতে simple-peer এরর না দেয়
if (typeof window.process === 'undefined') {
  window.process = {
    env: { NODE_ENV: 'development' },
    nextTick: (fn, ...args) => setTimeout(() => fn(...args), 0),
    browser: true
  };
} else if (!window.process.nextTick) {
  window.process.nextTick = (fn, ...args) => setTimeout(() => fn(...args), 0);
}

// ✅ Google Client ID
const GOOGLE_CLIENT_ID = "417838664506-q76pv076phqeoejkmdtbn1jvgpbt6kui.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* 
          BrowserRouter-এ Future Flags অ্যাড করা হয়েছে যাতে 
          কনসোলের Transition এবং Splat Path ওয়ার্নিংগুলো চলে যায়।
      */}
      <BrowserRouter 
        future={{ 
          v7_startTransition: true, 
          v7_relativeSplatPath: true 
        }}
      >
        <AuthProvider>
          <ModeProvider>
            <App />
          </ModeProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)