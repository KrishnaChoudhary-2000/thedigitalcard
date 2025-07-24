
import React from 'react';

export const ConfirmDeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cardName: string;
}> = ({ isOpen, onClose, onConfirm, cardName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center font-sans">
      <div className="bg-brand-card border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-white mb-4">Confirm Deletion</h2>
        <p className="text-gray-300 mb-8">
          Are you sure you want to delete the card "<strong>{cardName}</strong>"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
