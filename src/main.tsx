import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';
import AuthGate from './admin/AuthGate';
import './index.css';

const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';

createRoot(document.getElementById('root')!).render(
  isAdmin ? <AuthGate><AdminApp /></AuthGate> : <App />
);
