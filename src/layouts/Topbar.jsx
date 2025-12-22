import React, { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { logout, user } = useAuth();
  const nav = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3); // Example: replace with real count

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      nav(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-tropical-teal-200)] bg-white/95 dark:bg-[#112222]/95 backdrop-blur-lg shadow-md">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
      
        </div>

     

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
         

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl hover:bg-[var(--color-tropical-teal-100)] dark:hover:bg-[var(--color-tropical-teal-900)/50] transition"
          >
            {darkMode ? (
              <svg className="w-6 h-6 text-[var(--color-tropical-teal-500)]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-[var(--color-tropical-teal-700)]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-[var(--color-tropical-teal-100)] dark:hover:bg-[var(--color-tropical-teal-900)/50] transition"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--color-tropical-teal-600)] dark:bg-[var(--color-tropical-teal-500)] flex items-center justify-center text-white font-bold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-medium text-[var(--color-tropical-teal-800)] dark:text-[var(--color-tropical-teal-300)]">
                  {user?.username}
                </div>
                <div className="text-xs text-[var(--color-tropical-teal-600)] dark:text-[var(--color-tropical-teal-400)] capitalize">
                  {user?.role}
                </div>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white dark:bg-[#112222] shadow-2xl border border-[var(--color-tropical-teal-200)] dark:border-[var(--color-tropical-teal-700)] overflow-hidden">
                <div className="p-4 border-b border-[var(--color-tropical-teal-100)] dark:border-[var(--color-tropical-teal-800)]">
                  <div className="font-bold text-[var(--color-tropical-teal-800)] dark:text-[var(--color-tropical-teal-300)]">
                    {user?.username}
                  </div>
                  <div className="text-sm text-[var(--color-tropical-teal-600)] dark:text-[var(--color-tropical-teal-400)] capitalize">
                    {user?.role} access
                  </div>
                </div>
                <button
                  onClick={() => { logout(); nav('/'); }}
                  className="w-full text-left px-5 py-3 hover:bg-[var(--color-tropical-teal-100)] dark:hover:bg-[var(--color-tropical-teal-900)/50] flex items-center gap-3 text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}