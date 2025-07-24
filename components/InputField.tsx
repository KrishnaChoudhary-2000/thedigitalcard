
import React from 'react';

export const InputField = React.forwardRef<
  HTMLInputElement,
  {
    label: string;
    name: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
  }
>(({ label, name, type = 'text', ...props }, ref) => (
  <div>
    <label htmlFor={name} className={`block text-sm font-medium text-gray-300 mb-1 ${props.disabled ? 'opacity-50' : ''}`}>{label}</label>
    <input 
        id={name} 
        name={name} 
        type={type} 
        ref={ref} 
        {...props} 
        className="w-full bg-gray-900 text-white border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition disabled:opacity-50 disabled:cursor-not-allowed" />
  </div>
));
InputField.displayName = "InputField";
