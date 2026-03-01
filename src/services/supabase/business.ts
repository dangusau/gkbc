import { supabase } from '../supabase';
import type { Business, BusinessFilters, UserVerificationStatus, Review } from '../../types/index';

export const businessService = {
  async getBusinesses(filters?: BusinessFilters): Promise<Business[]> {
    try {
      const { data, error } = await supabase.rpc('get_businesses_with_owners', {
        p_business_type: filters?.business_type ?? null,
        p_category: filters?.category ?? null,
        p_location_axis: filters?.location_axis ?? null,
        p_search: filters?.search ?? null,
        p_min_rating: filters?.min_rating ?? null,
        p_limit: filters?.limit || 20,
        p_offset: filters?.offset || 0,
      });
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async createBusiness(businessData: {
    name: string;
    description: string;
    business_type: 'products' | 'services';
    category: string;
    location_axis: string;
    address?: string;
    email?: string;
    phone?: string;
    website?: string;
    logo_file?: File;
    banner_file?: File;
    is_registered?: boolean;
  }): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to create a business');

      let logo_url: string | undefined;
      let banner_url: string | undefined;

      if (businessData.logo_file) {
        const [logoUrl] = await this.uploadBusinessImages([businessData.logo_file], user.id);
        logo_url = logoUrl;
      }

      if (businessData.banner_file) {
        const [bannerUrl] = await this.uploadBusinessImages([businessData.banner_file], user.id);
        banner_url = bannerUrl;
      }

      const { data, error } = await supabase.rpc('create_business_with_verification_check', {
        p_name: businessData.name,
        p_description: businessData.description,
        p_business_type: businessData.business_type,
        p_category: businessData.category,
        p_location_axis: businessData.location_axis,
        p_address: businessData.address || null,
        p_email: businessData.email || null,
        p_phone: businessData.phone || null,
        p_website: businessData.website || null,
        p_logo_url: logo_url || null,
        p_banner_url: banner_url || null,
        p_is_registered: businessData.is_registered || false,
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create business');
    }
  },

  async uploadBusinessImages(files: File[], userId: string): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('business-images')
        .upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(data.path);
      return publicUrl;
    });
    return Promise.all(uploadPromises);
  },

  async getUserVerificationStatus(): Promise<UserVerificationStatus> {
    try {
      const { data, error } = await supabase.rpc('get_user_verification_status');
      if (error) throw error;
      return data || { user_status: 'member', email: '', can_create_business: false };
    } catch {
      return { user_status: 'member', email: '', can_create_business: false };
    }
  },

  async addReview(businessId: string, rating: number, comment?: string): Promise<{ average_rating: number; review_count: number }> {
    try {
      const { data, error } = await supabase.rpc('add_business_review', {
        p_business_id: businessId,
        p_rating: rating,
        p_comment: comment || null,
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to submit review');
    }
  },

  async getBusinessDetails(businessId: string): Promise<{ business: Business; reviews: Review[] } | null> {
    try {
      const { data, error } = await supabase.rpc('get_business_detail', {
        p_business_id: businessId,
      });
      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  },

  async getCategories(): Promise<{ category: string; business_type: string; count: number }[]> {
    try {
      const { data, error } = await supabase.rpc('get_business_categories');
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async getLocationCounts(): Promise<{ location_axis: string; count: number }[]> {
    try {
      const { data, error } = await supabase.rpc('get_location_axis_counts');
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async deleteBusiness(businessId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('delete_business', {
        p_business_id: businessId,
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete business');
    }
  },
};
