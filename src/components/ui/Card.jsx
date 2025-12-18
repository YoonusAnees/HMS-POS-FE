import React from 'react';

export default function Card({ title, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm ${className}`}>
      {title && <div className="mb-3 text-base font-semibold">{title}</div>}
      {children}
    </div>
  );
}
