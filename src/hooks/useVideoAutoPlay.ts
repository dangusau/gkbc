import { useState, useCallback, useRef } from 'react';

export const useVideoAutoplay = () => {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const playVideo = useCallback((postId: string) => {
    if (playingVideo === postId) {
      videoRefs.current[postId]?.pause();
      setPlayingVideo(null);
    } else {
      if (playingVideo) {
        videoRefs.current[playingVideo]?.pause();
      }
      videoRefs.current[postId]?.play().catch(() => setPlayingVideo(null));
      setPlayingVideo(postId);
    }
  }, [playingVideo]);

  const registerVideo = useCallback((postId: string, element: HTMLVideoElement | null) => {
    videoRefs.current[postId] = element;
  }, []);

  const handleVideoEnded = useCallback((postId: string) => {
    setPlayingVideo(null);
  }, []);

  return {
    playingVideo,
    playVideo,
    registerVideo,
    handleVideoEnded,
  };
};