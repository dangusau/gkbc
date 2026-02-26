import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Briefcase, Compass, ShoppingCart } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { path: '/Home', icon: Home, label: 'Home' },
    { path: '/Members', icon: Users, label: 'Members' },
    { path: '/Marketplace', icon: ShoppingCart, label: 'Market' },
    { path: '/Businesses', icon: Briefcase, label: 'Biz' },
    { path: '/Explore', icon: Compass, label: 'Explore' },
  ];

  return (
    // ADDED: w-full and overflow-hidden
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-green-700 via-green-600 to-green-700 shadow-xl w-full pt-2">
      <div className="flex justify-between items-center w-full px-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center transition-all duration-300
              flex-shrink-0
              ${isActive ? 'text-white' : 'text-white/70'}
              min-h-[50px] w-[20%] /* Each item takes 20% width */
            `}
            aria-label={item.label}
          >
            {({ isActive }) => (
              <>
                <div className={`
                  p-2 rounded-2xl transition-all duration-300 mb-1
                  ${isActive ? 'bg-white/50 backdrop-blur-sm shadow-sm' : 'bg-transparent'}
                  flex items-center justify-center
                `}>
                  <item.icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    fill={isActive ? "currentColor" : "none"} 
                    className={isActive ? "text-white" : "text-white/70"}
                  />
                </div>
                <span className={`text-s font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;