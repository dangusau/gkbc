import React, { useState, useCallback, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, CalendarDays, FileText } from 'lucide-react';
import type{ Event } from '../../types/index';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => Promise<void>;
  initialData: Event;
  isLoading?: boolean;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description || '');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState(initialData.location || '');

  useEffect(() => {
    if (isOpen && initialData.event_date) {
      const date = new Date(initialData.event_date);
      setEventDate(date.toISOString().split('T')[0]);
      setEventTime(date.toTimeString().slice(0,5));
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setLocation(initialData.location || '');
    }
  }, [isOpen, initialData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate || !eventTime) return;
    const fullDateTime = `${eventDate}T${eventTime}:00`;
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      event_date: fullDateTime,
      location: location.trim(),
      image_url: initialData.image_url // keep existing image
    });
  }, [title, description, eventDate, eventTime, location, initialData.image_url, onSubmit]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-event-title"
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-hidden bg-white rounded-t-2xl md:rounded-2xl
                    border border-green-200 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg
                            flex items-center justify-center">
                <CalendarDays size={16} className="text-white" />
              </div>
              <div>
                <h2 id="edit-event-title" className="text-sm font-bold text-gray-900">Edit Event</h2>
                <p className="text-xs text-gray-500">Update your event details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50
                       active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              aria-label="Close modal"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          <form onSubmit={handleSubmit} className="p-3 space-y-3">
            {/* Event Title */}
            <div className="space-y-1">
              <label htmlFor="edit-event-title" className="block text-xs font-medium text-gray-700">Event Title *</label>
              <div className="relative group">
                <CalendarDays className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400
                                       group-focus-within:text-green-600 transition-colors" size={16} />
                <input
                  id="edit-event-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-green-200 rounded-lg text-xs
                           focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all
                           min-h-[36px]"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Event Description */}
            <div className="space-y-1">
              <label htmlFor="edit-event-description" className="block text-xs font-medium text-gray-700">Description</label>
              <textarea
                id="edit-event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 bg-white border border-green-200 rounded-lg text-xs
                         focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400
                         transition-all h-24 resize-none"
                maxLength={1000}
              />
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor="edit-event-date" className="block text-xs font-medium text-gray-700">Date *</label>
                <div className="relative group">
                  <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400
                                     group-focus-within:text-green-600 transition-colors pointer-events-none" size={16} />
                  <input
                    id="edit-event-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-green-200 rounded-lg text-xs
                             focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400
                             transition-all cursor-pointer min-h-[36px]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-event-time" className="block text-xs font-medium text-gray-700">Time *</label>
                <div className="relative group">
                  <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400
                                  group-focus-within:text-green-600 transition-colors pointer-events-none" size={16} />
                  <input
                    id="edit-event-time"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-green-200 rounded-lg text-xs
                             focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400
                             transition-all cursor-pointer min-h-[36px]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label htmlFor="edit-event-location" className="block text-xs font-medium text-gray-700">Location</label>
              <div className="relative group">
                <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400
                                 group-focus-within:text-green-600 transition-colors" size={16} />
                <input
                  id="edit-event-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-green-200 rounded-lg text-xs
                           focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all
                           min-h-[36px]"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !eventDate || !eventTime}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white
                       font-bold py-2 rounded-lg shadow-md hover:shadow-lg
                       hover:from-green-700 hover:to-green-800
                       disabled:opacity-50 disabled:cursor-not-allowed
                       active:scale-[0.99] transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-green-500/50 text-xs min-h-[36px]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-1">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Event'
              )}
            </button>
          </form>
        </div>

        <div className="h-2 md:h-0" />
      </div>
    </div>
  );
};

export default EditEventModal;