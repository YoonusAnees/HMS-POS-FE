import React from 'react';

export default function Card({ title, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-[var(--color-tropical-teal-200)] bg-white p-6 shadow-md transition-shadow hover:shadow-xl ${className}`}>
      {title && <div className="mb-4 text-lg font-bold text-[var(--color-tropical-teal-800)]">{title}</div>}
      {children}
    </div>
  );
}
