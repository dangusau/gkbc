import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Menu, X, LayoutDashboard, Users, ShoppingBag, Briefcase,
  Calendar, Ticket, Megaphone, Settings, LogOut, Loader2
} from 'lucide-react';
import { supabase } from '../../services/supabase';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Detect screen size to close sidebar on desktop by default and handle responsiveness
  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true); // open on desktop
      else setSidebarOpen(false); // closed on mobile by default
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/admin/login'); // Redirect to admin login
    } catch (error) {
      console.error('Logout error:', error);
      // Optionally show a toast notification
    } finally {
      setLoggingOut(false);
    }
  };

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/marketplace', icon: ShoppingBag, label: 'Marketplace' },
    { to: '/admin/businesses', icon: Briefcase, label: 'Businesses' },
    { to: '/admin/jobs-events', icon: Calendar, label: 'Explore' },
    { to: '/admin/tickets', icon: Ticket, label: 'Support' },
    { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/admin/manage-admins', icon: Settings, label: 'Admin Management' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          transform transition-transform duration-300 ease-in-out
          bg-white border-r border-green-200 w-64
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:w-64 md:block
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo / Header */}
          <div className="p-4 border-b border-green-200 flex items-center justify-between">
            <h1 className="text-lg font-bold text-green-700">Admin Panel</h1>
            {isMobile && (
              <button onClick={toggleSidebar} className="p-1 text-gray-600">
                <X size={20} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-green-200">
            <button
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogOut size={18} />
              )}
              <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for mobile */}
        {isMobile && (
          <header className="bg-white border-b border-green-200 p-3 flex items-center sticky top-0 z-10">
            <button onClick={toggleSidebar} className="p-2 text-gray-600">
              <Menu size={20} />
            </button>
            <h2 className="ml-2 text-sm font-medium text-gray-700">Admin</h2>
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;