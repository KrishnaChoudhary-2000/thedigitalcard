
import React, { useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { InputField } from '../components/InputField';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const LoginPage: React.FC = () => {
  const { login, loading, error } = useAuth();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameRef.current && passwordRef.current) {
      login(usernameRef.current.value, passwordRef.current.value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans">
      <div className="w-full max-w-md">
        <form onSubmit={handleLogin} className="bg-brand-card/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center text-white">Glydus Admin Login</h1>
          {error && <p className="text-red-400 text-sm text-center bg-red-900/50 p-2 rounded-md">{error}</p>}
          <InputField name="username" label="Username" placeholder="admin" ref={usernameRef} disabled={loading}/>
          <InputField name="password" label="Password" type="password" placeholder="password" ref={passwordRef} disabled={loading}/>
          <button type="submit" className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center h-10 disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? <LoadingSpinner className="w-5 h-5" /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
