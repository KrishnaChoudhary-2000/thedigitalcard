
import React, { useState, useEffect } from 'react';
import { CopyIcon, ShareIcon } from '../Icons';

export const ShareModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  url: string;
}> = ({ isOpen, onClose, url }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center font-sans" onClick={onClose}>
      <div className="bg-brand-card border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShareIcon className="w-6 h-6 text-brand-accent" />
            Shareable Link
          </h2>
          <button onClick={onClose} className="text-gray-400 text-3xl leading-none hover:text-white transition-colors">&times;</button>
        </div>
        
        <div className="bg-green-900/50 border border-green-700 text-green-200 text-sm rounded-lg p-4 mb-6">
          <p><strong className="font-semibold">Your card is live!</strong> This is a permanent, shareable link. Anyone with this link can view your digital card, including all content and images.</p>
        </div>

        <p className="text-gray-300 mb-2 font-medium">Your shareable URL:</p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={url}
            className="w-full bg-gray-900 text-gray-300 border border-gray-600 rounded-md px-3 py-2 select-all"
          />
          <button
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-5 rounded-lg transition"
          >
            <CopyIcon className="w-5 h-5" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
