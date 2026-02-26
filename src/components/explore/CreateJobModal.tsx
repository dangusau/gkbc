import React, { useState, useCallback } from 'react';
import { X, DollarSign, MapPin, Briefcase, Mail, Phone, FileText } from 'lucide-react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: any) => Promise<void>;
  isLoading?: boolean;
}

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

const CreateJobModal: React.FC<CreateJobModalProps> = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState('full-time');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      salary: salary.trim(),
      job_type: jobType,
      location: location.trim(),
      contact_info: {
        email: contactEmail.trim(),
        phone: contactPhone.trim()
      }
    });
    // Form will be reset by parent on success
  }, [title, description, salary, jobType, location, contactEmail, contactPhone, onSubmit]);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setSalary('');
    setJobType('full-time');
    setLocation('');
    setContactEmail('');
    setContactPhone('');
  }, []);

  const formatJobType = useCallback((type: string): string => {
    return type.replace('-', ' ').toUpperCase();
  }, []);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center md:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-job-title"
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-hidden bg-white rounded-t-2xl md:rounded-2xl
                    border border-green-200 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg
                            flex items-center justify-center">
                <Briefcase size={16} className="text-white" />
              </div>
              <div>
                <h2 id="create-job-title" className="text-sm font-bold text-gray-900">Post a Job</h2>
                <p className="text-xs text-gray-500">Fill in the details below</p>
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
            {/* Job Title */}
            <div className="space-y-1">
              <label htmlFor="job-title" className="block text-xs font-medium text-gray-700">Job Title *</label>
              <div className="relative group">
                <FileText className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400
                                   group-focus-within:text-green-600 transition-colors" size={16} />
                <input
                  id="job-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-green-200 rounded-lg text-xs
                           focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all
                           min-h-[36px]"
                  required
                  autoComplete="off"
                  aria-required="true"
                />
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-1">
              <label htmlFor="job-description" className="block text-xs font-medium text-gray-700">Description</label>
              <textarea
                id="job-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the job responsibilities, requirements, and benefits..."
                className="w-full p-2 bg-white border border-green-200 rounded-lg text-xs
                         focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400
                         transition-all h-24 resize-none"
                maxLength={1000}
                aria-describedby="description-help"
              />
              <div id="description-help" className="flex justify-between text-xs text-gray-500">
                <span>Optional but recommended</span>
                <span>{description.length}/1000</span>
              </div>
            </div>

            {/* Salary & Job Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor="job-salary" className="block text-xs font-medium text-gray-700">Salary</label>
                <div className="relative group">
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400
                                       group-focus-within:text-green-600 transition-colors" size={16} />
                  <input
                    id="job-salary"
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g., ₦200,000 - ₦300,000"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-green-200 rounded-lg text-xs
                             focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all
                             min-h-[36px]"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="job-type" className="block text-xs font-medium text-gray-700">Job Type *</label>
                <div className="relative group">
                  <Briefcase className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400
                                      group-focus-within:text-green-600 transition-colors pointer-events-none" size={16} />
                  <select
                    id="job-type"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-green-200 rounded-lg text-xs
                             focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400
                             transition-all appearance-none cursor-pointer min-h-[36px]"
                    required
                    aria-required="true"
                  >
                    {JOB_TYPES.map(type => (
                      <option key={type} value={type}>{formatJobType(type)}</option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label htmlFor="job-location" className="block text-xs font-medium text-gray-700">Location</label>
              <div className="relative group">
                <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400
                                 group-focus-within:text-green-600 transition-colors" size={16} />
                <input
                  id="job-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Jigawa, Nigeria"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-green-200 rounded-lg text-xs
                           focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all
                           min-h-[36px]"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-green-200 rounded-lg
                              flex items-center justify-center">
                  <Mail size={12} className="text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 text-xs">Contact Information</h3>
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-email" className="text-xs text-gray-600">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400
                                 group-focus-within:text-green-600 transition-colors" size={16} />
                  <input
                    id="contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-green-200 rounded-lg text-xs
                             focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all
                             min-h-[36px]"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-phone" className="text-xs text-gray-600">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400
                                  group-focus-within:text-green-600 transition-colors" size={16} />
                  <input
                    id="contact-phone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g., +2348000000000"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-green-200 rounded-lg text-xs
                             focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all
                             min-h-[36px]"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white
                       font-bold py-2 rounded-lg shadow-md hover:shadow-lg
                       hover:from-green-700 hover:to-green-800
                       disabled:opacity-50 disabled:cursor-not-allowed
                       active:scale-[0.99] transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-green-500/50 mt-3 text-xs min-h-[36px]"
              aria-label={isLoading ? 'Posting job...' : 'Post job listing'}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Posting Job...</span>
                </div>
              ) : (
                'Post Job Listing'
              )}
            </button>
          </form>
        </div>

        <div className="h-2 md:h-0" />
      </div>
    </div>
  );
};

export default CreateJobModal;