import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, ShoppingCart, Users, CreditCard, Settings, LogOut, Package } from 'lucide-react';

const iconMap = {
  box: Box,
  'shopping-cart': ShoppingCart,
  users: Users,
  'credit-card': CreditCard,
  settings: Settings,
};

const Sidebar = () => {
  const { accessiblePages, isLoadingPermissions, logout } = useAuth();

  if (isLoadingPermissions) {
    return (
      <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col transition-all duration-300">
        <div className="p-6">
          <div className="h-8 bg-slate-700 rounded animate-pulse w-3/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-slate-700 rounded animate-pulse w-full"></div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  // Generate sidebar from accessible pages (canView = true)
  const menuItems = accessiblePages.filter(page => page.canView);

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800 transition-all duration-300">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <Package className="w-8 h-8 text-blue-500" />
        <h1 className="text-xl font-bold text-white tracking-wide">WareHouse</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.length === 0 ? (
          <div className="text-sm text-slate-500 italic p-2">No accessible modules.</div>
        ) : (
          menuItems.map(item => {
            const IconComponent = iconMap[item.icon] || Package;
            return (
              <NavLink
                key={item.pageId}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 group ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-500' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <IconComponent className="w-5 h-5 opacity-75 group-hover:opacity-100" />
                <span className="font-medium">{item.moduleName}</span>
              </NavLink>
            );
          })
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-red-400 hover:bg-red-500/10 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
