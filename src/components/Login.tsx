/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'Anas' && password === 'M76n13fp@') {
      onLogin({ username: 'Anas', name: 'Anas' });
    } else if (username === 'Rosie' && password === 'Op33Er&b1') {
      onLogin({ username: 'Rosie', name: 'Rosie' });
    } else if (username === 'NewUser' && password === 'K99$n2#s') {
      onLogin({ username: 'NewUser', name: 'NewUser' });
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0C10] px-4 font-sans">
      <div className="max-w-md w-full space-y-8 bg-[#14161C] p-10 rounded-2xl shadow-xl border border-slate-800">
        <div>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-indigo-500/20">
              O
            </div>
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white uppercase tracking-widest">
            ANAZ BRAND
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  placeholder="Username"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 bg-[#0F1115] border border-slate-800 rounded-lg text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs font-bold uppercase tracking-wide text-center bg-red-400/10 py-2.5 rounded-lg border border-red-400/20">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest"
            >
              LOGIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
