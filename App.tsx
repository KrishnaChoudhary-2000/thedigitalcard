
import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { PublicCardPage } from './components/PublicCardPage';
import { ExecutiveData } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { api } from './api';

const AppContent: React.FC = () => {
  const [publicCardData, setPublicCardData] = useState<ExecutiveData | null>(null);
  const [isCheckingUrl, setIsCheckingUrl] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const auth = useAuth();

  useEffect(() => {
    const fetchCardFromSlug = async () => {
        const path = window.location.pathname;
        if (path.startsWith('/c/')) {
            const slug = path.substring(3);
            if (slug) {
                try {
                    const cardData = await api.getCardBySlug(slug);
                    if (cardData){
                        setPublicCardData(cardData);
                    } else {
                       setError(`The requested card link was not found. It may have been deleted or the link is incorrect.`);
                    }
                } catch (e) {
                    console.error("Failed to fetch card data from slug:", e);
                    setError("Could not load the requested card.");
                }
            } else {
                setError("Invalid card link.");
            }
        }
        setIsCheckingUrl(false);
    };

    fetchCardFromSlug();
  }, []);

  if (isCheckingUrl || auth.loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }
  
  if (publicCardData) {
    return <PublicCardPage data={publicCardData} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
        <div className="bg-red-900/50 border border-red-700 text-red-200 rounded-lg p-6 max-w-md text-center">
            <h3 className="text-2xl font-bold mb-3">Link Error</h3>
            <p>{error}</p>
        </div>
      </div>
    );
  }

  if (auth.user) {
    return <Dashboard />;
  }

  return <LoginPage />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
