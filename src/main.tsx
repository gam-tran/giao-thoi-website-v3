import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';
import AuthGate from './admin/AuthGate';
import { supabase } from './lib/supabase';
import './index.css';

// Attach the active Supabase access token to every same-origin Admin API request.
if (supabase) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestHeaders = input instanceof Request ? input.headers : undefined;
    const headers = new Headers(init?.headers ?? requestHeaders);
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (url.startsWith('/api/') || url.startsWith(window.location.origin + '/api/')) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
    return originalFetch(input, { ...init, headers });
  };
}

const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';

createRoot(document.getElementById('root')!).render(
  isAdmin ? <AuthGate><AdminApp /></AuthGate> : <App />
);
