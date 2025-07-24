
import React, { useEffect } from 'react';

export const Toast: React.FC<{ message: string; show: boolean; onClose: () => void; type?: 'success' | 'error' }> = ({ message, show, onClose, type = 'success' }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className={`fixed bottom-5 right-5 z-[100] transition-all duration-300 ease-out ${ show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full' }`}>
      <div className={`${bgColor} text-white font-bold rounded-lg shadow-2xl px-6 py-3`}>
        {message}
      </div>
    </div>
  );
};
