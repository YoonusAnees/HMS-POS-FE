import React from 'react';

export default function EmptyState({ title = "No data", hint = "Try again later." }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-zinc-600">{hint}</div>
    </div>
  );
}
