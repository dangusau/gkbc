import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string | null;
  author?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const AnnouncementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('announcements')
          .select(`
            *,
            author:profiles!created_by (
              first_name,
              last_name
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setAnnouncement(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load announcement');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto text-center py-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Announcement not found</h2>
          <p className="text-gray-600 text-sm mb-4">{error || 'The announcement may have been removed.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {announcement.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{format(new Date(announcement.created_at), 'MMMM d, yyyy')}</span>
            </div>
            {announcement.author && (
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>
                  {announcement.author.first_name} {announcement.author.last_name}
                </span>
              </div>
            )}
          </div>

          <div className="prose prose-sm md:prose-base max-w-none text-gray-700">
            {announcement.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
};