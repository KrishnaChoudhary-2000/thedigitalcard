
import React, { useState } from 'react';
import { InputField } from '../InputField';

export const CreateCardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
      setName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center font-sans">
      <div className="bg-brand-card border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-white mb-6">Create a New Digital Card</h2>
        <form onSubmit={handleSubmit}>
          <InputField
            label="Card Name"
            name="newCardName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., John Doe's Profile"
          />
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold py-2 px-6 rounded-lg transition disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Create Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
