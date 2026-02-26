import React, { useState, useCallback } from 'react';
import { MapPin, Briefcase, Clock, Mail, Phone, Building, Award, Eye, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import type { Job } from '../../types/index';
import { formatTimeAgo } from '../../utils/formatters';
import VerifiedBadge from '../VerifiedBadge';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../contexts/AuthContext';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onDelete }) => {
  const { incrementViews } = useJobs();
  const { user } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = job.company_id === user?.id;

  const formatSalary = useCallback((salary: string): string => {
    if (!salary) return '';
    if (salary.toLowerCase().includes('negotiable') || salary.toLowerCase().includes('competitive')) {
      return salary;
    }
    return salary.startsWith('₦') || salary.startsWith('$') || salary.startsWith('€') || salary.startsWith('£')
      ? salary
      : `₦${salary}`;
  }, []);

  const handleShowContact = useCallback(() => {
    if (!showContact) {
      incrementViews(job.id);
    }
    setShowContact(true);
  }, [showContact, job.id, incrementViews]);

  const getJobTypeStyle = useCallback((): string => {
    switch (job.job_type?.toLowerCase()) {
      case 'full-time':
        return 'bg-gradient-to-r from-green-100 to-green-50 border border-green-200 text-green-700';
      case 'part-time':
        return 'bg-gradient-to-r from-green-100 to-green-50 border border-green-200 text-green-700';
      case 'contract':
        return 'bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 text-purple-700';
      case 'remote':
        return 'bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 text-orange-700';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 text-gray-700';
    }
  }, [job.job_type]);

  return (
    <div
      className="group bg-white rounded-xl shadow-lg border border-green-200/50 overflow-hidden
                hover:shadow-xl hover:border-green-300 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-green-500/20"
      role="article"
      aria-label={`${job.title} at ${job.company_name}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 via-green-50 to-green-100 p-3 border-b border-green-100">
        <div className="flex items-start gap-3">
          {/* Company Avatar with Verified Badge */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg
                          flex items-center justify-center shadow-md border-2 border-white overflow-hidden">
              {job.company_avatar ? (
                <img
                  src={job.company_avatar}
                  alt={job.company_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {job.company_name?.charAt(0) || 'C'}
                </span>
              )}
            </div>
            {job.company_verified && (
              <div className="absolute -bottom-1 -right-1">
                <VerifiedBadge size={16} />
              </div>
            )}
          </div>

          {/* Title and Salary */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{job.title}</h3>
                  {job.is_verified && <VerifiedBadge size={14} />}
                </div>
                <div className="flex items-center gap-1">
                  <Building size={12} className="text-green-500" />
                  <p className="text-green-700 text-xs font-medium truncate">{job.company_name}</p>
                </div>
              </div>
              {job.salary && (
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white
                              px-2 py-1 rounded-full text-xs font-bold shadow-sm
                              border border-green-400/30 ml-2 flex-shrink-0">
                  {formatSalary(job.salary)}
                </div>
              )}
            </div>
          </div>

          {/* Owner Actions Menu */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-white/50 transition-colors"
                aria-label="Job options"
              >
                <MoreVertical size={16} className="text-gray-600" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => { onEdit(job); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-green-50 flex items-center gap-2"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => { onDelete(job.id); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Job Details */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Job Type */}
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase size={14} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-medium">Job Type</div>
              <div className={`font-semibold text-xs truncate ${getJobTypeStyle().split(' ').pop()}`}>
                {job.job_type}
              </div>
            </div>
          </div>

          {/* Location */}
          {job.location && (
            <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin size={14} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 font-medium">Location</div>
                <div className="font-semibold text-gray-900 text-xs truncate">{job.location}</div>
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
              <div className="font-semibold text-gray-900 text-xs">{formatTimeAgo(job.created_at)}</div>
            </div>
          </div>

          {/* Views */}
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye size={14} className="text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-medium">Views</div>
              <div className="font-semibold text-gray-900 text-xs">{job.views_count}</div>
            </div>
          </div>
        </div>

        {/* Description Preview */}
        {job.description && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1 font-medium">Job Description</div>
            <p className="text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100/50
                        p-2 rounded-lg text-xs line-clamp-3 border border-gray-200">
              {job.description}
            </p>
          </div>
        )}

        {/* Contact Section */}
        {!showContact ? (
          <button
            onClick={handleShowContact}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white
                     font-bold py-2 rounded-lg shadow-md hover:shadow-lg
                     hover:from-green-700 hover:to-green-800
                     active:scale-[0.98] transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-green-500/50 text-xs min-h-[36px]"
          >
            Show Contact & Apply
          </button>
        ) : (
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <div className="text-xs text-gray-500 font-medium mb-1">Contact Information</div>
            {job.contact_email && (
              <a
                href={`mailto:${job.contact_email}`}
                className="flex items-center gap-2 p-2 bg-gradient-to-r from-green-50 to-green-100/50
                          rounded-lg border border-green-200 hover:border-green-400 hover:bg-green-100
                          transition-all duration-200 text-left min-h-[36px]"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <Mail size={14} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 font-medium">Email</div>
                  <div className="text-green-600 font-semibold text-xs truncate">{job.contact_email}</div>
                </div>
              </a>
            )}
            {job.contact_phone && (
              <a
                href={`tel:${job.contact_phone.replace(/\D/g, '')}`}
                className="flex items-center gap-2 p-2 bg-gradient-to-r from-green-50 to-green-100/50
                          rounded-lg border border-green-200 hover:border-green-400 hover:bg-green-100
                          transition-all duration-200 text-left min-h-[36px]"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <Phone size={14} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 font-medium">Phone</div>
                  <div className="text-green-600 font-semibold text-xs truncate">{job.contact_phone}</div>
                </div>
              </a>
            )}
            {!job.contact_email && !job.contact_phone && (
              <div className="text-center p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-xs">No contact details provided</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;