import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Icons
import { TbLayoutDashboardFilled, TbReportSearch } from 'react-icons/tb';
import { FaCartShopping, FaBarsStaggered, FaUser } from 'react-icons/fa6';
import { GrUnorderedList } from 'react-icons/gr';
import { IoReceipt, IoSettings } from 'react-icons/io5';
import { RiAlignItemBottomFill } from 'react-icons/ri';
import { LiaTableSolid } from 'react-icons/lia';
import { IoMdHome } from 'react-icons/io';

export default function Sidebar({ nav = [] }) {
  const { user } = useAuth();

  // Icon mapping
  const getIcon = (label) => {
    const iconProps = { className: 'w-5 h-5' };
    const lower = label.toLowerCase();

    if (lower.includes('dashboard')) return <TbLayoutDashboardFilled {...iconProps} />;
    if (lower.includes('pos')) return <FaCartShopping {...iconProps} />;
    if (lower.includes('orders')) return <GrUnorderedList {...iconProps} />;
    if (lower.includes('receipt')) return <IoReceipt {...iconProps} />;
    if (lower.includes('items')) return <RiAlignItemBottomFill {...iconProps} />;
    if (lower.includes('categories')) return <FaBarsStaggered {...iconProps} />;
    if (lower.includes('tables')) return <LiaTableSolid {...iconProps} />;
    if (lower.includes('reports')) return <TbReportSearch {...iconProps} />;
    if (lower.includes('users')) return <FaUser {...iconProps} />;
    if (lower.includes('settings')) return <IoSettings {...iconProps} />;
    if (lower.includes('home')) return <IoMdHome {...iconProps} />;

    return <TbLayoutDashboardFilled {...iconProps} />;
  };

  return (
    <aside className="sticky top-0 h-screen w-72 border-r border-[var(--color-tropical-teal-200)] dark:border-[var(--color-tropical-teal-700)] bg-white dark:bg-[#112222] p-6 shadow-xl overflow-y-auto">
      
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-tropical-teal-600)] flex items-center justify-center text-white text-2xl font-black shadow-lg">
            A
          </div>
          <div>
            <div className="text-2xl font-black text-[var(--color-tropical-teal-800)] dark:text-[var(--color-tropical-teal-300)]">
              Anexxa POS
            </div>
            <div className="text-xs text-[var(--color-tropical-teal-600)] dark:text-[var(--color-tropical-teal-400)]">
              Hotel Management System
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="mt-8 p-4 rounded-2xl bg-[var(--color-tropical-teal-50)] dark:bg-[var(--color-tropical-teal-900)/30] border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-tropical-teal-600)] flex items-center justify-center text-white font-bold">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="font-semibold text-[var(--color-tropical-teal-800)] dark:text-[var(--color-tropical-teal-300)]">
                {user?.username || 'Guest'}
              </div>
              <div className="text-xs text-[var(--color-tropical-teal-600)] dark:text-[var(--color-tropical-teal-400)] capitalize">
                {user?.role || 'user'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-[var(--color-tropical-teal-600)] text-white shadow-lg translate-x-2'
                  : 'text-[var(--color-tropical-teal-700)] dark:text-[var(--color-tropical-teal-300)] hover:bg-[var(--color-tropical-teal-100)] dark:hover:bg-[var(--color-tropical-teal-900)/40] hover:translate-x-1 hover:shadow-md'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Icon */}
                <div
                  className={`transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-[var(--color-tropical-teal-700)] dark:text-[var(--color-tropical-teal-400)] group-hover:text-[var(--color-tropical-teal-600)]'
                  }`}
                >
                  {getIcon(item.label)}
                </div>

                {/* Label */}
                <span>{item.label}</span>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-[var(--color-tropical-teal-600)] rounded-r-full shadow-lg" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-6 left-6 right-6 text-center text-xs text-[var(--color-tropical-teal-500)]">
        © 2025 Anexxa Hotel POS
      </div>
    </aside>
  );
}
