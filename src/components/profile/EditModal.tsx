import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface EditModalProps {
  type: string;
  data: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => Promise<void>;
}

const MARKET_AREAS = [
  'Central / Old City', 'Sabon Gari / Kantin Kwari', 'Farm Center / Beirut',
  'France Road', 'Zoo Road', 'Zaria Road', 'Dawanau', 'Sharada / Challawa',
  'Hotoro', 'Gyadi-Gyadi / Tarauni', 'Jigawa Road', 'Mariri / Sheka',
  'Bompai', 'Transport (Kano Line / Sabon Gari Park)', 'Others'
];

export const EditModal: React.FC<EditModalProps> = ({ type, data, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        bio: data.bio || '',
        phone: data.phone || '',
        address: data.address || '',
        business_name: data.business_name || '',
        business_type: data.business_type || '',
        market_area: data.market_area || '',
      });
    }
  }, [data]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required';
    if (!formData.business_type) newErrors.business_type = 'Business type is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      await onSave(formData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to save changes' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (errors.general) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" disabled={loading}>
            <X size={24} />
          </button>
        </div>

        {success && (
          <div className="m-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-green-700 font-medium">Changes saved successfully!</span>
          </div>
        )}

        {errors.general && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <span className="text-red-700 font-medium">Error</span>
              <p className="text-red-600 text-sm mt-1">{errors.general}</p>
            </div>
          </div>
        )}

        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name || ''}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
              />
              {errors.first_name && (
                <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.first_name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name || ''}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg h-32"
                maxLength={500}
                placeholder="Tell us about yourself..."
                disabled={loading}
              />
              <div className="text-right text-sm text-gray-500">{formData.bio?.length || 0}/500</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="+234 800 000 0000"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="City, State"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Business Name</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name || ''}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Your business name"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Business Type *</label>
              <select
                name="business_type"
                value={formData.business_type || ''}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg ${errors.business_type ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
              >
                <option value="">Select type</option>
                <option value="products">Products</option>
                <option value="services">Services</option>
              </select>
              {errors.business_type && (
                <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.business_type}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Market Area</label>
              <select
                name="market_area"
                value={formData.market_area || ''}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                disabled={loading}
              >
                <option value="">Select market area</option>
                {MARKET_AREAS.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all min-h-[44px] border border-green-800"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>

          {!loading && !success && (
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all min-h-[44px]"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};