import React from 'react';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99]";
  const styles = {
    primary: "bg-black text-white hover:bg-zinc-800",
    ghost: "bg-transparent text-black hover:bg-zinc-100",
    danger: "bg-red-600 text-white hover:bg-red-500"
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
