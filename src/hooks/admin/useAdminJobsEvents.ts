import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useState } from 'react';

// Job types
export interface Job {
  id: string;
  title: string;
  description: string;
  salary: string | null;
  job_type: string;
  location: string | null;
  contact_info: any;
  experience_level: string | null;
  category: string | null;
  is_verified: boolean;
  views_count: number;
  created_at: string;
  company: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string;
  image_url: string | null;
  rsvp_count: number;
  created_at: string;
  organizer: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

interface UseAdminJobsProps {
  search?: string;
  jobType?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

interface UseAdminEventsProps {
  search?: string;
  location?: string;
  page?: number;
  limit?: number;
}

// Jobs hook
export const useAdminJobs = ({
  search = '',
  jobType = '',
  isVerified,
  page = 0,
  limit = 20,
}: UseAdminJobsProps = {}) => {
  const queryClient = useQueryClient();
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const jobsQuery = useQuery({
    queryKey: ['admin', 'jobs', search, jobType, isVerified, page, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_jobs_for_admin', {
        p_search: search || null,
        p_job_type: jobType || null,
        p_is_verified: isVerified ?? null,
        p_limit: limit,
        p_offset: page * limit,
      });
      if (error) throw error;
      return data as { jobs: Job[]; total_count: number };
    },
    placeholderData: (previousData) => previousData,
  });

  const verifyJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.rpc('verify_job', { p_job_id: jobId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
  });

  const unverifyJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.rpc('unverify_job', { p_job_id: jobId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.rpc('delete_job', { p_job_id: jobId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      if (expandedJobId) setExpandedJobId(null);
    },
  });

  return {
    jobs: jobsQuery.data?.jobs ?? [],
    totalCount: jobsQuery.data?.total_count ?? 0,
    isLoading: jobsQuery.isLoading,
    isFetching: jobsQuery.isFetching,
    error: jobsQuery.error,
    expandedJobId,
    setExpandedJobId,
    verifyJob,
    unverifyJob,
    deleteJob,
  };
};

// Events hook
export const useAdminEvents = ({
  search = '',
  location = '',
  page = 0,
  limit = 20,
}: UseAdminEventsProps = {}) => {
  const queryClient = useQueryClient();
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const eventsQuery = useQuery({
    queryKey: ['admin', 'events', search, location, page, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_events_for_admin', {
        p_search: search || null,
        p_location: location || null,
        p_limit: limit,
        p_offset: page * limit,
      });
      if (error) throw error;
      return data as { events: Event[]; total_count: number };
    },
    placeholderData: (previousData) => previousData,
  });

  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.rpc('delete_event', { p_event_id: eventId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      if (expandedEventId) setExpandedEventId(null);
    },
  });

  return {
    events: eventsQuery.data?.events ?? [],
    totalCount: eventsQuery.data?.total_count ?? 0,
    isLoading: eventsQuery.isLoading,
    isFetching: eventsQuery.isFetching,
    error: eventsQuery.error,
    expandedEventId,
    setExpandedEventId,
    deleteEvent,
  };
};