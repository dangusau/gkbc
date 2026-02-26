import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Briefcase, Compass, ShoppingCart } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { path: '/Home', icon: Home, label: 'Home' },
    { path: '/Members', icon: Users, label: 'Members' },
    { path: '/Marketplace', icon: ShoppingCart, label: 'Marketplace' },
    { path: '/Businesses', icon: Briefcase, label: 'Businesses' },
    { path: '/Explore', icon: Compass, label: 'Explore' },
  ];

  // Helper function to check if path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="h-full w-full bg-white p-6 overflow-y-auto shadow-xl">
      {/* Simple but bold header */}
      <div className="mb-10 pt-4">
        <div className="inline-flex items-center space-x-3 mb-6">
          
          
        </div>
        
        <div className="h-0.5 w-20 bg-gradient-to-r from-green-500 to-green-800 rounded-full"></div>
      </div>
      
      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300
                w-full text-left group
                ${active 
                  ? 'bg-green-50 border-l-4 border-green-600 text-green-800' 
                  : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
                }
              `}
            >
              <div className={`
                p-2.5 rounded-xl transition-all duration-300
                ${active 
                  ? 'bg-blue-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600 group-hover:bg-gray-300'
                }
              `}>
                <item.icon size={22} />
              </div>
              <span className="font-bold text-lg">{item.label}</span>
              {active && (
                <div className="ml-auto animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="mt-20 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2 font-medium">
            GJBC Community Platform
          </div>
          <div className="text-xs text-gray-400">
            Connect • Collaborate • Grow
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;