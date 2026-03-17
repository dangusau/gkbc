import { createClient } from '@supabase/supabase-js';

// ========== DISABLED ==========
// All database access has been permanently disabled.
// No console messages, just silent failures.
// ===============================

// Comment out real Supabase client
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables');
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Dummy export to satisfy imports (won't actually work)
export const supabase = {} as any;

// ========== TYPES ==========
export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  user_status: 'verified' | 'member';
  created_at: string;
  updated_at: string;
}

// ========== BASIC FUNCTIONS ==========
export const getCurrentUser = async () => {
  return null;
};

export const getCurrentProfile = async (): Promise<UserProfile | null> => {
  return null;
};

export const getUserStatus = async (): Promise<'verified' | 'member' | null> => {
  return null;
};

// ========== PASSWORD RESET FUNCTIONS ==========
export const sendPasswordResetEmail = async (
  email: string,
  redirectTo: string = `${window.location.origin}/ResetPassword`
) => {
  throw new Error('Failed');
};

export const updateUserPassword = async (newPassword: string) => {
  throw new Error('Failed');
};

// ========== PERMISSIONS ==========
export const hasMemberAccess = async (): Promise<boolean> => {
  return false;
};

export const getUserPermissions = async () => {
  return {
    marketListings: false,
    jobListings: false,
    eventListings: false,
    friendChat: false,
    socialFeed: false,
    marketplaceChat: false,
    showVerificationBadge: false,
  };
};

// ========== ADMIN FUNCTIONS ==========
export const isUserAdmin = async (): Promise<boolean> => {
  return false;
};

export const getVerifiedUsers = async () => {
  return { data: null, error: new Error('Failed') };
};

export const approveUserAsMember = async (userId: string) => {
  return { data: null, error: new Error('Failed') };
};

// ========== TEST ==========
export const testConnection = async () => {
  return false;
};
