import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './Providers/QueryProvider';
import { usePresence } from './hooks/usePresence';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsPage } from './pages/NotificationsPage';
import { AnnouncementPage } from './pages/AnnouncementPage';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Members from './pages/Members';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ForgotPassword from './pages/forgot-password';
import ResetPassword from './pages/ResetPassword';
import Marketplace from './pages/Marketplace';
import MarketplaceDetail from './pages/MarketplaceDetail';
import MarketplaceEdit from './pages/MarketplaceEdit';
import Explore from './pages/Explore';
import Businesses from './pages/Businesses';
import BusinessDetails from './pages/BusinessDetails';
import Profile from './pages/Profile';
import NewConversation from './components/messages/NewConversation';
import ChatWindow from './components/messages/ChatWindow';
import ConversationsList from './components/messages/ConversationsList';
import HelpSupport from './pages/HelpSupport';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import LandingPage from './pages/LandingPage';

import AdminLogin from './pages/admin/AdminLogin';
import AdminOverview from './pages/admin/AdminOverview';
import AdminGuard from './components/AdminGuard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMarketplace from './pages/admin/AdminMarketplace';
import AdminBusinesses from './pages/admin/AdminBusinesses';
import AdminJobsEvents from './pages/admin/AdminJobsEvents';
import AdminTickets from './pages/admin/AdminTickets';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminManagement from './pages/admin/AdminManagement';

// Presence tracker component – must be inside AuthProvider
const PresenceTracker: React.FC = () => {
  usePresence();
  return null;
};

// Layout wrapper for web/mobile responsiveness
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      {/* Desktop Sidebar - FIXED */}
      <aside className="hidden md:block md:w-64 md:fixed md:top-0 md:left-0 md:h-screen bg-white border-r z-40">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 w-full md:ml-64">
        {/* Header is fixed - sits outside normal flow */}
        <Header />

        {/* Add margin-top to this container instead of padding */}
        <div className="mt-20 flex-1 flex flex-col">
          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4 w-full">
            <div className="w-full max-w-full mx-auto">
              {children}
            </div>
          </main>

          {/* Bottom nav - FIXED on mobile */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            <BottomNav />
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PresenceTracker />
        <QueryProvider>
          <Routes>
            {/* Public / Auth pages - no layout */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/Terms" element={<Terms />} />
            <Route path="/Privacy" element={<Privacy />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin routes – protected by AdminGuard, nested under /admin */}
            <Route path="/admin" element={<AdminGuard />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="marketplace" element={<AdminMarketplace />} />
              <Route path="businesses" element={<AdminBusinesses />} />
              <Route path="jobs-events" element={<AdminJobsEvents />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="manage-admins" element={<AdminManagement />} />
            </Route>

            {/* Protected pages - with main layout */}
            <Route path="/Home" element={<Layout><Home /></Layout>} />
            <Route path="/Members" element={<Layout><Members /></Layout>} />
            <Route path="/Marketplace" element={<Layout><Marketplace /></Layout>} />
            <Route path="/Marketplace/:id" element={<Layout><MarketplaceDetail /></Layout>} />
            <Route path="/Marketplace/edit/:id" element={<Layout><MarketplaceEdit /></Layout>} />
            <Route path="/Explore" element={<Layout><Explore /></Layout>} />
            <Route path="/Businesses" element={<Layout><Businesses /></Layout>} />
            <Route path="/Business/:id" element={<Layout><BusinessDetails /></Layout>} />
            <Route path="/Profile/:userId?" element={<Layout><Profile /></Layout>} />
            <Route path="/messages" element={<Layout><ConversationsList /></Layout>} />
            <Route path="/messages/new/chat" element={<ChatWindow />} />
            <Route path="/messages/:conversationId" element={<ChatWindow />} />
            <Route path="/messages/new" element={<Layout><NewConversation /></Layout>} />
            <Route path="/HelpSupport" element={<Layout><HelpSupport /></Layout>} />
            <Route path="/notifications" element={<Layout><NotificationsPage /></Layout>} />
            <Route path="/announcements/:id" element={<Layout><AnnouncementPage /></Layout>} />

            {/* Notification navigation routes */}
            <Route path="/post/:id" element={<Layout><Home /></Layout>} />
            <Route path="/event/:id" element={<Layout><Explore /></Layout>} />
            <Route path="/support/:id" element={<Layout><HelpSupport /></Layout>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/Home" replace />} />
          </Routes>
        </QueryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;