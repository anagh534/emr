import React, { useState } from 'react';
import { useCurrentUser } from './features/auth/hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Activity } from 'lucide-react';

export default function App() {
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'register'
  
  // React Query: Fetch the logged-in user profile if a token exists
  const { data: user, isLoading, isError } = useCurrentUser();

  // If loading user profile, show a sleek loading splash screen
  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="loading-container glass-card" style={{ maxWidth: '300px', width: '100%' }}>
          <Activity size={40} className="loading-spinner" style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)' }}>Verifying Session...</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>EMR Secure Protocol</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, route to the dashboard
  if (user) {
    return <Dashboard user={user} />;
  }

  // Otherwise, route to authentication screens
  return authPage === 'login' ? (
    <Login onNavigate={setAuthPage} />
  ) : (
    <Register onNavigate={setAuthPage} />
  );
}