import React, { useState } from 'react';
import {
  Briefcase, Calendar, Search, ChevronDown, ChevronUp, Trash2,
  CheckCircle, XCircle, Loader2, MapPin, DollarSign, Users
} from 'lucide-react';
import { useAdminJobs, useAdminEvents } from '../../hooks/admin/useAdminJobsEvents';
import { StatCard } from '../../components/admin/StatCard';
import { ConfirmationDialog } from '../../components/shared/ConfirmationDialogue';
import { FeedbackToast } from '../../components/shared/FeedbackToast';

type TabType = 'jobs' | 'events';

const AdminJobsEvents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('jobs');

  // Jobs state
  const [jobSearchInput, setJobSearchInput] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);
  const [jobPage, setJobPage] = useState(0);

  // Events state
  const [eventSearchInput, setEventSearchInput] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventPage, setEventPage] = useState(0);

  const limit = 20;

  // Jobs hook
  const {
    jobs,
    totalCount: jobsTotal,
    isLoading: jobsLoading,
    isFetching: jobsFetching,
    error: jobsError,
    expandedJobId,
    setExpandedJobId,
    verifyJob,
    unverifyJob,
    deleteJob,
  } = useAdminJobs({
    search: jobSearch,
    jobType,
    isVerified,
    page: jobPage,
    limit,
  });

  // Events hook
  const {
    events,
    totalCount: eventsTotal,
    isLoading: eventsLoading,
    isFetching: eventsFetching,
    error: eventsError,
    expandedEventId,
    setExpandedEventId,
    deleteEvent,
  } = useAdminEvents({
    search: eventSearch,
    location: eventLocation,
    page: eventPage,
    limit,
  });

  // Shared UI state
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    type: 'verify' | 'unverify' | 'delete';
    itemType: 'job' | 'event';
    item: any;
  } | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
  };

  const closeFeedback = () => setFeedback(null);

  const handleJobSearch = () => {
    setJobSearch(jobSearchInput);
    setJobPage(0);
  };

  const handleEventSearch = () => {
    setEventSearch(eventSearchInput);
    setEventPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'job' | 'event') => {
    if (e.key === 'Enter') {
      if (type === 'job') handleJobSearch();
      else handleEventSearch();
    }
  };

  const confirmHandler = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.itemType === 'job') {
        if (confirmAction.type === 'verify') {
          await verifyJob.mutateAsync(confirmAction.item.id);
          showFeedback('Job verified', 'success');
        } else if (confirmAction.type === 'unverify') {
          await unverifyJob.mutateAsync(confirmAction.item.id);
          showFeedback('Job unverified', 'success');
        } else {
          await deleteJob.mutateAsync(confirmAction.item.id);
          showFeedback('Job deleted', 'success');
        }
      } else {
        await deleteEvent.mutateAsync(confirmAction.item.id);
        showFeedback('Event deleted', 'success');
      }
    } catch (err: any) {
      showFeedback(err.message || 'Action failed', 'error');
    } finally {
      setConfirmAction(null);
    }
  };

  const cancelConfirm = () => setConfirmAction(null);

  const jobsTotalPages = Math.ceil(jobsTotal / limit);
  const eventsTotalPages = Math.ceil(eventsTotal / limit);

  if (jobsLoading || eventsLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  if (jobsError || eventsError) {
    return <div className="p-6 text-red-600">Error loading data</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="text-green-600" size={24} /> Jobs & Events
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'jobs'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'events'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Events
          </button>
        </nav>
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={jobSearchInput}
                  onChange={(e) => setJobSearchInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'job')}
                  placeholder="Search jobs by title or company..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
              <button
                onClick={handleJobSearch}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
              >
                Search
              </button>
            </div>
            <div className="flex gap-2">
              <select
                value={jobType}
                onChange={(e) => { setJobType(e.target.value); setJobPage(0); }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">All Types</option>
                {jobTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <select
                value={isVerified === undefined ? '' : isVerified.toString()}
                onChange={(e) => {
                  const val = e.target.value;
                  setIsVerified(val === '' ? undefined : val === 'true');
                  setJobPage(0);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">All Verification</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>
          </div>

          {jobsFetching && (
            <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs shadow flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Updating jobs...
            </div>
          )}

          {/* Jobs Table with horizontal scroll */}
          <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <React.Fragment key={job.id}>
                      <tr
                        className={`hover:bg-gray-50 cursor-pointer ${expandedJobId === job.id ? 'bg-green-50' : ''}`}
                        onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{job.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{job.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs mr-2">
                              {job.company.avatar_url ? (
                                <img src={job.company.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                              ) : (
                                `${job.company.first_name?.charAt(0) || ''}${job.company.last_name?.charAt(0) || ''}`
                              )}
                            </div>
                            <span className="text-sm">{job.company.first_name} {job.company.last_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.job_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.location || 'Any'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.views_count}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            job.is_verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {job.is_verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {!job.is_verified ? (
                              <button
                                onClick={() => setConfirmAction({ isOpen: true, type: 'verify', itemType: 'job', item: job })}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Verify"
                              >
                                <CheckCircle size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => setConfirmAction({ isOpen: true, type: 'unverify', itemType: 'job', item: job })}
                                className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                                title="Unverify"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => setConfirmAction({ isOpen: true, type: 'delete', itemType: 'job', item: job })}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                            {expandedJobId === job.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                          </div>
                        </td>
                      </tr>
                      {expandedJobId === job.id && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-green-50">
                            <div className="space-y-2">
                              <p className="text-sm text-gray-700">{job.description}</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                                <div className="bg-white rounded-lg border border-green-200 p-2">
                                  <p className="text-xs text-gray-500">Salary</p>
                                  <p className="text-sm font-medium">{job.salary || 'Not specified'}</p>
                                </div>
                                <div className="bg-white rounded-lg border border-green-200 p-2">
                                  <p className="text-xs text-gray-500">Experience</p>
                                  <p className="text-sm font-medium">{job.experience_level || 'Not specified'}</p>
                                </div>
                                <div className="bg-white rounded-lg border border-green-200 p-2">
                                  <p className="text-xs text-gray-500">Category</p>
                                  <p className="text-sm font-medium">{job.category || 'Uncategorized'}</p>
                                </div>
                                <div className="bg-white rounded-lg border border-green-200 p-2">
                                  <p className="text-xs text-gray-500">Contact Info</p>
                                  <p className="text-sm font-medium">View details</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {jobsTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {jobPage * limit + 1} to {Math.min((jobPage + 1) * limit, jobsTotal)} of {jobsTotal} jobs
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setJobPage(p => Math.max(0, p - 1))}
                  disabled={jobPage === 0}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setJobPage(p => Math.min(jobsTotalPages - 1, p + 1))}
                  disabled={jobPage >= jobsTotalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={eventSearchInput}
                  onChange={(e) => setEventSearchInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'event')}
                  placeholder="Search events by title or organizer..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
              <button
                onClick={handleEventSearch}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
              >
                Search
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => { setEventLocation(e.target.value); setEventPage(0); }}
                placeholder="Filter by location"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              />
            </div>
          </div>

          {eventsFetching && (
            <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs shadow flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Updating events...
            </div>
          )}

          {/* Events Table with horizontal scroll */}
          <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organizer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RSVPs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <React.Fragment key={event.id}>
                      <tr
                        className={`hover:bg-gray-50 cursor-pointer ${expandedEventId === event.id ? 'bg-green-50' : ''}`}
                        onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{event.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{event.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs mr-2">
                              {event.organizer.avatar_url ? (
                                <img src={event.organizer.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                              ) : (
                                `${event.organizer.first_name?.charAt(0) || ''}${event.organizer.last_name?.charAt(0) || ''}`
                              )}
                            </div>
                            <span className="text-sm">{event.organizer.first_name} {event.organizer.last_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(event.event_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-400" />
                            {event.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.rsvp_count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setConfirmAction({ isOpen: true, type: 'delete', itemType: 'event', item: event })}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                            {expandedEventId === event.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                          </div>
                        </td>
                      </tr>
                      {expandedEventId === event.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-green-50">
                            <div className="space-y-2">
                              <p className="text-sm text-gray-700">{event.description}</p>
                              {event.image_url && (
                                <img src={event.image_url} alt={event.title} className="max-h-40 rounded" />
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {eventsTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {eventPage * limit + 1} to {Math.min((eventPage + 1) * limit, eventsTotal)} of {eventsTotal} events
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEventPage(p => Math.max(0, p - 1))}
                  disabled={eventPage === 0}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setEventPage(p => Math.min(eventsTotalPages - 1, p + 1))}
                  disabled={eventPage >= eventsTotalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmationDialog
          isOpen={confirmAction.isOpen}
          title={
            confirmAction.type === 'verify' ? 'Verify Job' :
            confirmAction.type === 'unverify' ? 'Unverify Job' :
            `Delete ${confirmAction.itemType === 'job' ? 'Job' : 'Event'}`
          }
          message={
            confirmAction.type === 'verify'
              ? `Verify "${confirmAction.item.title}"?`
              : confirmAction.type === 'unverify'
              ? `Unverify "${confirmAction.item.title}"?`
              : `Delete "${confirmAction.item.title}" permanently? This action cannot be undone.`
          }
          confirmText={
            confirmAction.type === 'verify' ? 'Verify' :
            confirmAction.type === 'unverify' ? 'Unverify' :
            'Delete'
          }
          onConfirm={confirmHandler}
          onCancel={cancelConfirm}
          isDanger={confirmAction.type === 'delete'}
        />
      )}

      {/* Feedback Toast */}
      {feedback && (
        <FeedbackToast
          message={feedback.message}
          type={feedback.type}
          onClose={closeFeedback}
        />
      )}
    </div>
  );
};

export default AdminJobsEvents;