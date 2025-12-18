import React from 'react';

export default function Input({ label, className = '', ...props }) {
  return (
    <label className="block">
      {label && <div className="mb-1 text-sm font-medium text-zinc-700">{label}</div>}
      <input
        className={`w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 ${className}`}
        {...props}
      />
    </label>
  );
}
