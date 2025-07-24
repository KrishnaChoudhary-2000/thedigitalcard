
import React from 'react';

export const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <details open className="bg-gray-900/50 border border-white/10 rounded-lg overflow-hidden">
    <summary className="px-6 py-4 text-lg font-semibold text-white cursor-pointer hover:bg-white/5 list-none flex justify-between items-center">
      {title}
      <span className="text-gray-400 transition-transform duration-300 transform-gpu">▼</span>
    </summary>
    <div className="px-6 py-5 border-t border-white/10 space-y-4">
      {children}
    </div>
  </details>
);
