import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';
import type { Member } from '../types/index';

interface AuthContextType {
  user: User | null;
  profile: Member | null;
  userProfile: Member | null; // alias for profile, for compatibility
  loading: boolean;
  isAuthenticated: boolean;
  hasStatus: (status: Member['user_status'] | Member['user_status'][]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile when user changes
  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data as Member);
      }
    };

    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [user]);

  // Listen to auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  // Helper to check if user has one of the given statuses
  const hasStatus = (status: Member['user_status'] | Member['user_status'][]) => {
    if (!profile) return false;
    const statuses = Array.isArray(status) ? status : [status];
    return statuses.includes(profile.user_status);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        userProfile: profile, // alias for convenience
        loading,
        isAuthenticated: !!user,
        hasStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};