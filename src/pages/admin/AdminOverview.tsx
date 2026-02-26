import type { UserType, TimeRange, OverviewStats } from '../../hooks/admin/useAdminOverview';
import React, { useState } from 'react';
import {
  Users, UserCheck, Activity, Award, Target, BarChart2,
  Clock, FileText, MessageCircle, Heart, ShoppingBag, Star,
  Briefcase, Calendar, Ticket, Megaphone, Mail, CheckCircle,
  AlertCircle, XCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { useAdminOverview } from '../../hooks/admin/useAdminOverview';
import { StatCard } from '../../components/admin/StatCard';

const AdminOverview: React.FC = () => {
  const [userType, setUserType] = useState<UserType>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const { data, isLoading, error, isFetching } = useAdminOverview(userType, timeRange);

  if (isLoading) {
    return <div className="p-6 animate-pulse">Loading insights...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>;
  }

  // Type assertion to restore the correct shape
  const overall = (data?.overall ?? {}) as OverviewStats['overall'];
  const trends = data?.trends ?? [];

  // Compute daily averages with safe access (only using fields that exist)
  const avgNewUsers = trends.length
    ? Math.round(trends.reduce((sum: number, d) => sum + (d.new_users ?? 0), 0) / trends.length)
    : 0;
  const avgNewPosts = trends.length
    ? Math.round(trends.reduce((sum: number, d) => sum + (d.new_posts ?? 0), 0) / trends.length)
    : 0;
  const avgNewMarketplaceListings = trends.length
    ? Math.round(trends.reduce((sum: number, d) => sum + (d.new_marketplace_listings ?? 0), 0) / trends.length)
    : 0;

  // Conversion rate from overall stats (not trends)
  const totalNewUsers = overall.users?.current ?? 0;
  const totalVerifiedUsers = overall.verified_users?.current ?? 0;
  const conversionRate = totalNewUsers ? ((totalVerifiedUsers / totalNewUsers) * 100).toFixed(1) : '0';

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Growth Dashboard</h1>
        <div className="flex gap-3">
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value as UserType)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="all">All Users</option>
            <option value="verified">Verified Only</option>
            <option value="members">Members Only</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {isFetching && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs shadow">
          <Clock size={14} className="inline animate-spin mr-1" /> Updating...
        </div>
      )}

      {/* Key Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg. New Users / Day"
          value={avgNewUsers}
          previous={null}
          icon={<Users size={20} />}
        />
        <StatCard
          title="Avg. New Posts / Day"
          value={avgNewPosts}
          previous={null}
          icon={<Activity size={20} />}
        />
        <StatCard
          title="Avg. New Listings / Day"
          value={avgNewMarketplaceListings}
          previous={null}
          icon={<ShoppingBag size={20} />}
        />
        <StatCard
          title="Conversion to Verified"
          value={parseFloat(conversionRate)}
          previous={null}
          icon={<Award size={20} />}
          suffix="%"
          precision={1}
        />
      </div>

      {/* Growth Trend Chart */}
      {trends.length > 0 && (
        <section className="bg-white rounded-xl border border-green-200 p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <BarChart2 className="text-green-600" size={20} /> Growth Trends
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="period"
                tickFormatter={(str: string) => {
                  const d = new Date(str);
                  if (timeRange === 'day') return d.toLocaleTimeString([], { hour: '2-digit' });
                  if (timeRange === 'week' || timeRange === 'month') return d.toLocaleDateString();
                  return d.toLocaleDateString();
                }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="new_users" stroke="#10b981" name="New Users" />
              <Line type="monotone" dataKey="new_posts" stroke="#3b82f6" name="New Posts" />
              <Line type="monotone" dataKey="new_marketplace_listings" stroke="#8b5cf6" name="New Listings" />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Overall Stats – with safe access */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-green-200 pb-2">
          <Users className="inline text-green-600 mr-2" size={20} /> Users & Connections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Users" value={overall.users?.current ?? 0} previous={overall.users?.previous ?? null} icon={<Users size={20} />} />
          <StatCard title="Verified Users" value={overall.verified_users?.current ?? 0} previous={overall.verified_users?.previous ?? null} icon={<UserCheck size={20} />} />
          <StatCard title="Connections" value={overall.connections?.current ?? 0} previous={overall.connections?.previous ?? null} icon={<Activity size={20} />} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-green-200 pb-2">Content</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Posts" value={overall.posts?.current ?? 0} previous={overall.posts?.previous ?? null} icon={<FileText size={20} />} />
          <StatCard title="Comments" value={overall.comments?.current ?? 0} previous={overall.comments?.previous ?? null} icon={<MessageCircle size={20} />} />
          <StatCard title="Likes" value={overall.likes?.current ?? 0} previous={overall.likes?.previous ?? null} icon={<Heart size={20} />} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-green-200 pb-2">
          <ShoppingBag className="inline text-green-600 mr-2" size={20} /> Marketplace
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Listings" value={overall.marketplace_listings?.current ?? 0} previous={overall.marketplace_listings?.previous ?? null} icon={<ShoppingBag size={20} />} />
          <StatCard title="Favorites" value={overall.marketplace_favorites?.current ?? 0} previous={overall.marketplace_favorites?.previous ?? null} icon={<Star size={20} />} />
          <StatCard title="Reviews" value={overall.marketplace_reviews?.current ?? 0} previous={overall.marketplace_reviews?.previous ?? null} icon={<MessageCircle size={20} />} />
          <StatCard title="Avg Rating" value={overall.marketplace_reviews?.average_rating ?? 0} previous={null} icon={<Star size={20} />} precision={2} suffix=" ★" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-green-200 pb-2">
          <Briefcase className="inline text-green-600 mr-2" size={20} /> Businesses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Businesses" value={overall.businesses?.total ?? 0} previous={overall.businesses?.previous ?? null} icon={<Briefcase size={20} />} />
          <StatCard title="Approved" value={overall.businesses?.approved ?? 0} previous={null} icon={<CheckCircle size={20} />} />
          <StatCard title="Pending" value={overall.businesses?.pending ?? 0} previous={null} icon={<AlertCircle size={20} />} />
          <StatCard title="Rejected" value={overall.businesses?.rejected ?? 0} previous={null} icon={<XCircle size={20} />} />
          <StatCard title="Reviews" value={overall.business_reviews?.current ?? 0} previous={overall.business_reviews?.previous ?? null} icon={<MessageCircle size={20} />} />
          <StatCard title="Avg Rating" value={overall.business_reviews?.average_rating ?? 0} previous={null} icon={<Star size={20} />} precision={2} suffix=" ★" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-green-200 pb-2">
          <Calendar className="inline text-green-600 mr-2" size={20} /> Jobs & Events
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Jobs" value={overall.jobs?.current ?? 0} previous={overall.jobs?.previous ?? null} icon={<Briefcase size={20} />} />
          <StatCard title="Verified Jobs" value={overall.jobs?.verified ?? 0} previous={null} icon={<CheckCircle size={20} />} />
          <StatCard title="Events" value={overall.events?.current ?? 0} previous={overall.events?.previous ?? null} icon={<Calendar size={20} />} />
          <StatCard title="Event RSVPs" value={overall.event_rsvps?.current ?? 0} previous={overall.event_rsvps?.previous ?? null} icon={<Calendar size={20} />} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-green-200 pb-2">
          <Ticket className="inline text-green-600 mr-2" size={20} /> Support & Communication
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Tickets" value={overall.support_tickets?.total ?? 0} previous={overall.support_tickets?.previous ?? null} icon={<Ticket size={20} />} />
          <StatCard title="Open Tickets" value={overall.support_tickets?.open ?? 0} previous={null} icon={<AlertCircle size={20} />} />
          <StatCard title="Announcements" value={overall.announcements?.current ?? 0} previous={overall.announcements?.previous ?? null} icon={<Megaphone size={20} />} />
          <StatCard title="Conversations" value={overall.conversations?.current ?? 0} previous={overall.conversations?.previous ?? null} icon={<Mail size={20} />} />
          <StatCard title="Messages" value={overall.messages?.current ?? 0} previous={overall.messages?.previous ?? null} icon={<MessageCircle size={20} />} />
        </div>
      </section>
    </div>
  );
};

export default AdminOverview;