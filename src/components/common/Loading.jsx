import React from 'react';

export default function Loading({ text = 'Loading...' }) {
  return <div className="py-10 text-center text-zinc-600">{text}</div>;
}
