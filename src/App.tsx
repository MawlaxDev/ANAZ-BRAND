/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { User, AuthState } from './types';

export default function App() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('anashop_auth');
    if (saved) {
      return { user: JSON.parse(saved), isAuthenticated: true };
    }
    return { user: null, isAuthenticated: false };
  });

  const handleLogin = (user: User) => {
    localStorage.setItem('anashop_auth', JSON.stringify(user));
    setAuth({ user, isAuthenticated: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('anashop_auth');
    setAuth({ user: null, isAuthenticated: false });
  };

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Dashboard 
      user={auth.user!} 
      onLogout={handleLogout} 
    />
  );
}
