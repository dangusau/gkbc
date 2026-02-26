import { useAuth } from '../contexts/AuthContext';

export const useAuthStatus = () => {
  const { userProfile } = useAuth();
  const isVerified = userProfile?.user_status === 'verified';
  return { isVerified, userProfile };
};