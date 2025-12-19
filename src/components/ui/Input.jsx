import React from 'react';

export default function Input({ label, className = '', ...props }) {
  return (
    <label className="block">
      {label && <div className="mb-1.5 text-sm font-medium text-[var(--color-tropical-teal-800)]">{label}</div>}
      <input
        className={`w-full rounded-xl border border-[var(--color-tropical-teal-300)] bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 focus:ring-[var(--color-tropical-teal-300)] ${className}`}
        {...props}
      />
    </label>
  );
}
