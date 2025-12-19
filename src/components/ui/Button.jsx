import React from 'react';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium transition-all active:scale-98";
  const styles = {
    primary: "bg-[var(--color-tropical-teal-600)] text-white hover:bg-[var(--color-tropical-teal-700)] shadow-md",
    ghost: "bg-transparent text-[var(--color-tropical-teal-700)] hover:bg-[var(--color-tropical-teal-100)]",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
