import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './utils/preloadAssets.ts';

import { ErrorBoundary } from './components/ErrorBoundary';
import { isSupabaseConfigured } from './lib/supabase';
createRoot(document.getElementById('root')!).render(
  <StrictMode><ErrorBoundary>{isSupabaseConfigured ? <App /> : <div role="alert" className="p-8 text-center"><h1 className="text-xl font-bold">Meat Ghar setup required</h1><p className="mt-3">Configure the Supabase URL and public key before starting the application.</p></div>}</ErrorBoundary></StrictMode>
);
