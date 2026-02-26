import { useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { messagingService } from '../services/supabase/messaging';

export const usePresence = () => {
  const { user } = useAuth();
  const heartbeatInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!user) return;

    // Update last_seen immediately
    messagingService.updateLastSeen(user.id);

    // Then every 30 seconds while component is active
    heartbeatInterval.current = setInterval(() => {
      messagingService.updateLastSeen(user.id);
    }, 30000);

    // Set up real-time presence channel
    const channel = supabase.channel('online-users', {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        // You can access presence state if needed later
        // const state = channel.presenceState();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      // Update last_seen on unmount
      messagingService.updateLastSeen(user.id);
      supabase.removeChannel(channel);
    };
  }, [user]);
};