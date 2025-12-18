import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-zinc-50">
      <div className="rounded-2xl border bg-white p-8 text-center">
        <div className="text-xl font-black">404</div>
        <div className="text-sm text-zinc-600 mt-1">Page not found</div>
        <Link className="mt-4 inline-block text-sm font-semibold underline" to="/">Go home</Link>
      </div>
    </div>
  );
}
