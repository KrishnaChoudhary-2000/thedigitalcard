import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { QRCodeIcon } from '../Icons';

export const QRCodeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  url: string;
  cardName: string;
}> = ({ isOpen, onClose, url, cardName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && url && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) console.error('QR Code generation failed:', error);
      });
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `qrcode-${cardName.replace(/\s+/g, '-')}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center font-sans" onClick={onClose}>
      <div className="bg-brand-card border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-sm m-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <QRCodeIcon className="w-6 h-6 text-brand-accent" />
            Share with QR Code
          </h2>
          <button onClick={onClose} className="text-gray-400 text-3xl leading-none hover:text-white transition-colors">&times;</button>
        </div>

        <div className="flex justify-center mb-6 bg-white p-4 rounded-lg">
          <canvas ref={canvasRef} />
        </div>

        <p className="text-gray-300 mb-2 font-medium text-sm">Your shareable URL:</p>
        <input
            type="text"
            readOnly
            value={url}
            className="w-full bg-gray-900 text-gray-400 border border-gray-600 rounded-md px-3 py-2 text-sm select-all mb-6"
        />

        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
};
