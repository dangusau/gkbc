import React, { useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  postId: string;
  playingVideo: string | null;
  onPlay: (postId: string) => void;
  onEnded: (postId: string) => void;
  onLoaded?: (postId: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  postId,
  playingVideo,
  onPlay,
  onEnded,
  onLoaded,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (playingVideo === postId) {
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
    }
  }, [playingVideo, postId]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto max-h-[320px] object-contain bg-black"
        controls={playingVideo === postId}
        onClick={() => onPlay(postId)}
        onEnded={() => onEnded(postId)}
        onLoadedData={() => onLoaded?.(postId)}
        playsInline
        preload="metadata"
        aria-label="Post video"
      />
      {playingVideo !== postId && (
        <button
          onClick={() => onPlay(postId)}
          className="absolute inset-0 flex items-center justify-center bg-black/20 group hover:bg-black/30 transition-colors"
          aria-label="Play video"
        >
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play size={24} className="text-gray-900 ml-0.5" fill="currentColor" />
          </div>
        </button>
      )}
    </div>
  );
};