import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, MapPin, Users, Clock, Eye, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import type { Event } from '../../types/index';
import { formatTimeAgo } from '../../utils/formatters';
import { useEvents } from '../../hooks/useEvents';
import { useAuth } from '../../contexts/AuthContext';
import VerifiedBadge from '../VerifiedBadge';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  const { toggleRSVP } = useEvents({});
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = useMemo(() => event.organizer_id === user?.id, [event.organizer_id, user]);
  const hasRSVPed = useMemo(() => event.user_rsvp_status !== null, [event.user_rsvp_status]);

  const formatEventDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const handleRSVP = useCallback(async () => {
    if (isOwner || hasRSVPed) return;
    try {
      await toggleRSVP({ eventId: event.id, status: 'going' });
    } catch {
      // error handled in hook
    }
  }, [event.id, isOwner, hasRSVPed, toggleRSVP]);

  const getRSVPButtonStyle = useCallback((): string => {
    if (isOwner) {
      return "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 cursor-default";
    }
    if (hasRSVPed) {
      return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md cursor-default";
    }
    return "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg active:scale-[0.98]";
  }, [isOwner, hasRSVPed]);

  const getButtonText = useCallback((): string => {
    if (isOwner) return "Your Event";
    if (hasRSVPed) return "Going ✓";
    return "RSVP Now";
  }, [isOwner, hasRSVPed]);

  return (
    <div
      className="group bg-white rounded-xl shadow-lg border border-green-200/50 overflow-hidden
                hover:shadow-xl hover:border-green-300 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-green-500/20"
      role="article"
      aria-label={`${event.title} event organized by ${event.organizer_name}`}
    >
      {/* Header with Image/Placeholder */}
      <div className="relative h-36 bg-gradient-to-r from-green-500 to-green-600">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar size={32} className="text-white/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* RSVP Count Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full
                        text-xs font-medium shadow-md flex items-center gap-1 border border-white/50">
            <Users size={12} className="text-green-600" />
            <span className="font-bold text-gray-900">{event.rsvp_count}</span>
          </div>
        </div>

        {/* Owner Actions Menu */}
        {isOwner && (
          <div className="absolute top-3 left-3">
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-md hover:bg-white transition-colors"
                aria-label="Event options"
              >
                <MoreVertical size={16} className="text-gray-700" />
              </button>
              {showMenu && (
                <div className="absolute left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => { onEdit(event); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-green-50 flex items-center gap-2"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => { onDelete(event.id); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-3">
        {/* Title with Verified Badge */}
        <div className="flex items-center gap-1 mb-2">
          <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{event.title}</h3>
          {event.organizer_verified && <VerifiedBadge size={14} />}
        </div>

        {/* Organizer Information with Verified Badge */}
        <div className="flex items-center gap-2 mb-3 p-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-100">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full
                          flex items-center justify-center text-white text-xs font-bold shadow-sm
                          border-2 border-white">
              {event.organizer_name?.charAt(0).toUpperCase() || 'O'}
            </div>
            {event.organizer_verified && (
              <div className="absolute -top-1 -right-1">
                <VerifiedBadge size={10} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 font-medium">Organized by</div>
            <div className="font-semibold text-gray-900 text-xs truncate flex items-center gap-1">
              {event.organizer_name}
            </div>
          </div>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Date & Time */}
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar size={14} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-medium">Date & Time</div>
              <div className="font-semibold text-gray-900 text-xs truncate">{formatEventDate(event.event_date)}</div>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin size={14} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 font-medium">Location</div>
                <div className="font-semibold text-gray-900 text-xs truncate">{event.location}</div>
              </div>
            </div>
          )}

          {/* Posted Date */}
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock size={14} className="text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-medium">Posted</div>
              <div className="font-semibold text-gray-900 text-xs">{formatTimeAgo(event.created_at)}</div>
            </div>
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye size={14} className="text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-medium">Attendees</div>
              <div className="font-semibold text-gray-900 text-xs">{event.rsvp_count}</div>
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1 font-medium">About this event</div>
            <p className="text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100/50
                        p-2 rounded-lg text-xs line-clamp-2 border border-gray-200">
              {event.description}
            </p>
          </div>
        )}

        {/* RSVP Button */}
        <button
          onClick={handleRSVP}
          disabled={isOwner || hasRSVPed}
          className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-1
                    transition-all duration-200 text-xs min-h-[36px] ${getRSVPButtonStyle()}`}
          aria-label={isOwner ? "Your event" : hasRSVPed ? "Already RSVPed" : "RSVP to this event"}
        >
          {hasRSVPed && !isOwner && <span>✓</span>}
          <span>{getButtonText()}</span>
        </button>
      </div>
    </div>
  );
};

export default EventCard;