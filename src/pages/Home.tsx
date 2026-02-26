import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, MessageCircle } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useFeed } from '../hooks/useFeed';
import { PostCard } from '../components/feed/PostCard';
import { CreatePostModal } from '../components/feed/CreatePostModal';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { userProfile } = useAuth();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    refetch,
  } = useFeed();

  const [showPostModal, setShowPostModal] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const posts = data?.pages.flat() ?? [];

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !isFetching) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

  const handleRefresh = async () => {
    const toastId = toast.loading('Refreshing...');
    await refetch();
    toast.dismiss(toastId);
    toast.success('Feed refreshed');
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="p-3 safe-area">
        <Toaster position="top-right" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-green-200 shadow p-3 animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-1" />
                  <div className="h-2 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white safe-area">
      <Toaster position="top-right" />

      {/* Refresh button */}
      {posts.length > 0 && (
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={handleRefresh}
            className="w-full py-2 bg-gradient-to-r from-green-50 to-green-50 text-green-600 rounded-lg text-xs font-medium border border-green-200 hover:from-green-100 hover:to-green-100 transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={14} />
            Refresh Feed
          </button>
        </div>
      )}

      {/* Create post button */}
      <div className="sticky top-12 z-30 bg-gradient-to-b from-white to-green-50/50 px-3 pb-3 pt-1.5">
        <div className="bg-white rounded-xl shadow border border-green-200 overflow-hidden">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                {userProfile?.first_name?.charAt(0) || '+'}
              </div>
              <div className="flex-1">
                <button
                  onClick={() => {
                    if (!userProfile) {
                      toast.error('Please login to create posts');
                      return;
                    }
                    setShowPostModal(true);
                  }}
                  className="w-full p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors border border-gray-200"
                >
                  <p className="text-xs text-gray-600">What's on your mind?</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts feed */}
      <div className="pb-20">
        {posts.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 border border-green-200">
              <MessageCircle size={24} className="text-green-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1.5">No posts yet</h3>
            <p className="text-xs text-gray-600 mb-4">Be the first to share something!</p>
            <button
              onClick={() => setShowPostModal(true)}
              className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white px-5 py-2.5 rounded-lg font-medium shadow text-xs"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-3 px-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="h-2" />

            {/* Loading more indicator */}
            {isFetchingNextPage && (
              <div className="py-6 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-600 font-medium">Loading more posts...</span>
                </div>
              </div>
            )}

            {/* End of feed */}
            {!hasNextPage && posts.length > 0 && (
              <div className="py-6 text-center">
                <div className="text-gray-500 text-xs font-medium">You've reached the end of the feed</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create post modal */}
      <CreatePostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onPostCreated={() => {
          // Optionally scroll to top or show a message; refetch is automatic if query invalidated
          // We can also manually refetch to get the new post at top
          refetch();
        }}
      />
    </div>
  );
};

export default Home;