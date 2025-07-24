import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { ExecutiveData } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { SparklesIcon } from '../Icons';

interface AISuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (suggestion: string) => void;
  field: 'name' | 'title';
  context: Partial<ExecutiveData>;
}

export const AISuggestionsModal: React.FC<AISuggestionsModalProps> = ({ isOpen, onClose, onSelect, field, context }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Destructure for stable primitive dependencies
  const { name, title, companyName } = context;

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      const fetchSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions([]);
        try {
          const result = await api.getAISuggestions(field, context);
          if (isMounted) {
            setSuggestions(result);
          }
        } catch (err) {
            if (isMounted) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred.');
                }
            }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
      fetchSuggestions();
    }
    
    // Cleanup function to prevent setting state on unmounted component
    return () => {
      isMounted = false;
    };
  }, [isOpen, field, name, title, companyName, context]); // context is included to satisfy exhaustive-deps, primitives prevent re-fire

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center font-sans" onClick={onClose}>
      <div className="bg-brand-card border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-brand-accent" />
            AI Suggestions for "{field.charAt(0).toUpperCase() + field.slice(1)}"
          </h2>
          <button onClick={onClose} className="text-gray-400 text-3xl leading-none hover:text-white transition-colors">&times;</button>
        </div>
        
        <div className="min-h-[200px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <LoadingSpinner className="w-10 h-10 mb-4" />
              <p>Generating ideas...</p>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center justify-center h-full text-red-300">
              <p className="font-semibold">Could not get suggestions.</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {!isLoading && !error && (
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    onClick={() => onSelect(suggestion)}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-200"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
              {suggestions.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p>No suggestions found. Try adding more detail to your card.</p>
                </div>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};