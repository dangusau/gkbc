import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/supabase/profile';

export const profileKeys = {
  all: ['profiles'] as const,
  detail: (profileUserId: string, viewerId: string) => [...profileKeys.all, profileUserId, viewerId] as const,
  posts: (profileUserId: string, viewerId: string) => [...profileKeys.all, profileUserId, viewerId, 'posts'] as const,
  comments: (profileUserId: string, postId: string) => [...profileKeys.all, profileUserId, 'posts', postId, 'comments'] as const,
};

export const useProfile = (profileUserId: string, viewerId: string) => {
  return useQuery({
    queryKey: profileKeys.detail(profileUserId, viewerId),
    queryFn: () => profileService.getProfileData(profileUserId, viewerId),
    enabled: !!profileUserId && !!viewerId,
  });
};

export const useProfilePosts = (profileUserId: string, viewerId: string) => {
  return useQuery({
    queryKey: profileKeys.posts(profileUserId, viewerId),
    queryFn: () => profileService.getUserPosts(profileUserId, viewerId),
    enabled: !!profileUserId && !!viewerId,
  });
};