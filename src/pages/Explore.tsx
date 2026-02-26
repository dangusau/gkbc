import React, { useState, useCallback } from 'react';
import { Search, Filter, Plus, Briefcase, Calendar, AlertCircle } from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../contexts/AuthContext';
import JobCard from '../components/explore/JobCard';
import EventCard from '../components/explore/EventCard';
import CreateJobModal from '../components/explore/CreateJobModal';
import CreateEventModal from '../components/explore/CreateEventModal';
import EditJobModal from '../components/explore/EditJobModal';
import EditEventModal from '../components/explore/EditEventModal';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialogue';
import { FeedbackToast } from '../components/shared/FeedbackToast';
import type { Job, Event } from '../types/index';

const Explore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'events'>('jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'job' | 'event'; id: string } | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { userProfile } = useAuth();
  const isVerified = userProfile?.user_status === 'verified';

  const {
    jobs,
    isLoading: jobsLoading,
    createJob,
    updateJob,
    deleteJob,
    isCreating: jobCreating,
    isUpdating: jobUpdating,
    isDeleting: jobDeleting,
  } = useJobs({ search: searchQuery });

  const {
    events,
    isLoading: eventsLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating: eventCreating,
    isUpdating: eventUpdating,
    isDeleting: eventDeleting,
  } = useEvents({ search: searchQuery });

  const loading = activeTab === 'jobs' ? jobsLoading : eventsLoading;

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCreateClick = useCallback(() => {
    if (!isVerified) {
      showFeedback('Only verified members can create listings', 'error');
      return;
    }
    if (activeTab === 'jobs') {
      setShowJobModal(true);
    } else {
      setShowEventModal(true);
    }
  }, [activeTab, isVerified]);

  const handleCreateJob = useCallback(async (jobData: any) => {
    try {
      await createJob(jobData);
      setShowJobModal(false);
      showFeedback('Job posted successfully', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to post job', 'error');
    }
  }, [createJob]);

  const handleUpdateJob = useCallback(async (jobId: string, jobData: any) => {
    try {
      await updateJob({ jobId, ...jobData });
      setEditingJob(null);
      showFeedback('Job updated successfully', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to update job', 'error');
    }
  }, [updateJob]);

  const handleDeleteJob = useCallback(async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'job') return;
    try {
      await deleteJob(deleteConfirm.id);
      setDeleteConfirm(null);
      showFeedback('Job deleted successfully', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to delete job', 'error');
    }
  }, [deleteJob, deleteConfirm]);

  const handleCreateEvent = useCallback(async (eventData: any) => {
    try {
      await createEvent(eventData);
      setShowEventModal(false);
      showFeedback('Event created successfully', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to create event', 'error');
    }
  }, [createEvent]);

  const handleUpdateEvent = useCallback(async (eventId: string, eventData: any) => {
    try {
      await updateEvent({ eventId, ...eventData });
      setEditingEvent(null);
      showFeedback('Event updated successfully', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to update event', 'error');
    }
  }, [updateEvent]);

  const handleDeleteEvent = useCallback(async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'event') return;
    try {
      await deleteEvent(deleteConfirm.id);
      setDeleteConfirm(null);
      showFeedback('Event deleted successfully', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to delete event', 'error');
    }
  }, [deleteEvent, deleteConfirm]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white safe-area">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 border-b border-green-800">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-sm font-bold mb-1">Explore</h1>
          <p className="text-green-100 text-xs">Find jobs and events in GJBC community</p>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <FeedbackToast
          message={feedback.message}
          type={feedback.type}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Search and Filter Bar */}
      <div className="sticky top-0 bg-white border-b border-green-200 z-10 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'jobs' ? "Search jobs..." : "Search events..."}
              className="w-full pl-10 pr-3 py-2 bg-white rounded-lg border border-green-300
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-xs
                       min-h-[36px]"
              aria-label={`Search ${activeTab}`}
            />
          </div>
          <button
            className="p-2 bg-white rounded-lg border border-green-300 hover:bg-green-50
                     min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Filter results"
          >
            <Filter size={16} className="text-green-600" />
          </button>
          <button
            onClick={handleCreateClick}
            className={`p-2 rounded-lg border min-h-[36px] min-w-[36px] flex items-center justify-center ${
              isVerified
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 border-green-700'
                : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
            }`}
            aria-label={activeTab === 'jobs' ? "Post a job" : "Create an event"}
            title={isVerified
              ? activeTab === 'jobs' ? "Post a job" : "Create an event"
              : "Verified members only"}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-green-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 py-2 text-center font-medium transition-colors min-h-[36px] ${
              activeTab === 'jobs'
                ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            aria-label="Show jobs"
          >
            <div className="flex items-center justify-center gap-2">
              <Briefcase size={14} />
              <span className="text-xs">Jobs</span>
              {jobs.length > 0 && (
                <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {jobs.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-2 text-center font-medium transition-colors min-h-[36px] ${
              activeTab === 'events'
                ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            aria-label="Show events"
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar size={14} />
              <span className="text-xs">Events</span>
              {events.length > 0 && (
                <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {events.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-green-200 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg border border-green-200"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'jobs' ? (
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center border border-green-200">
                  <Briefcase size={24} className="text-green-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">No jobs found</h3>
                <p className="text-xs text-gray-600 mb-3">
                  {isVerified
                    ? 'Be the first to post a job!'
                    : 'No jobs found at the moment.'}
                </p>
                <button
                  onClick={handleCreateClick}
                  className={`px-4 py-2 rounded-lg font-medium shadow-md text-xs min-h-[36px] ${
                    isVerified
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                      : 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
                  }`}
                  aria-label={isVerified ? "Post a job" : "Upgrade to post job"}
                  title={isVerified ? "Post a job" : "Verified members only"}
                >
                  {isVerified ? 'Post a Job' : 'Verified Members Only'}
                </button>
              </div>
            ) : (
              jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={setEditingJob}
                  onDelete={(id) => setDeleteConfirm({ type: 'job', id })}
                />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center border border-green-200">
                  <Calendar size={24} className="text-green-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">No events found</h3>
                <p className="text-xs text-gray-600 mb-3">
                  {isVerified
                    ? 'Be the first to create an event!'
                    : 'No events found at the moment.'}
                </p>
                <button
                  onClick={handleCreateClick}
                  className={`px-4 py-2 rounded-lg font-medium shadow-md text-xs min-h-[36px] ${
                    isVerified
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                      : 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
                  }`}
                  aria-label={isVerified ? "Create an event" : "Upgrade to create event"}
                  title={isVerified ? "Create an event" : "Verified members only"}
                >
                  {isVerified ? 'Create Event' : 'Verified Members Only'}
                </button>
              </div>
            ) : (
              events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={setEditingEvent}
                  onDelete={(id) => setDeleteConfirm({ type: 'event', id })}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating Create Button */}
      <button
        onClick={handleCreateClick}
        className={`fixed bottom-20 right-4 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
          isVerified
            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-green-800'
            : 'bg-gray-400 border-gray-500 cursor-not-allowed'
        }`}
        aria-label={activeTab === 'jobs' ? "Post a job" : "Create an event"}
        title={isVerified
          ? activeTab === 'jobs' ? "Post a job" : "Create an event"
          : "Verified members only"}
      >
        <Plus size={20} />
      </button>

      {/* Modals */}
      <CreateJobModal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        onSubmit={handleCreateJob}
        isLoading={jobCreating}
      />
      <CreateEventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSubmit={handleCreateEvent}
        isLoading={eventCreating}
      />

      {editingJob && (
        <EditJobModal
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          onSubmit={(data) => handleUpdateJob(editingJob.id, data)}
          initialData={editingJob}
          isLoading={jobUpdating}
        />
      )}

      {editingEvent && (
        <EditEventModal
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          onSubmit={(data) => handleUpdateEvent(editingEvent.id, data)}
          initialData={editingEvent}
          isLoading={eventUpdating}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmationDialog
          isOpen={true}
          title={`Delete ${deleteConfirm.type === 'job' ? 'Job' : 'Event'}`}
          message={`Are you sure you want to delete this ${deleteConfirm.type}? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={deleteConfirm.type === 'job' ? handleDeleteJob : handleDeleteEvent}
          onCancel={() => setDeleteConfirm(null)}
          isDanger={true}
        />
      )}
    </div>
  );
};

export default Explore;