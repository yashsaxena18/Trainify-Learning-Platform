// src/components/course/VideoPlayer.jsx - OPTIMIZED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const VideoPlayer = ({ 
  lecture, 
  courseId, 
  onPlay, 
  onTimeUpdate, 
  onComplete,
  className = "" 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Extract YouTube ID helper
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[1] : null;
  };

  // Handle video events
  const handlePlay = () => {
    setIsPlaying(true);
    if (onPlay) onPlay();
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = (event) => {
    const current = event.target.currentTime;
    setCurrentTime(current);
    if (onTimeUpdate) onTimeUpdate(event);
  };

  const handleLoadedMetadata = (event) => {
    setDuration(event.target.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onComplete) onComplete();
  };

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Format time display
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!lecture) {
    return (
      <div className={`aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📺</div>
          <h3 className="text-xl font-bold mb-2">No Lecture Selected</h3>
          <p className="text-white/70">Please select a lecture to start watching.</p>
        </div>
      </div>
    );
  }

  const youtubeId = getYouTubeId(lecture.videoUrl);

  return (
    <div className={`relative group ${className}`}>
      <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
        {youtubeId ? (
          <iframe
            ref={videoRef}
            src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&origin=${window.location.origin}`}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lecture.title}
            onLoad={handlePlay}
          />
        ) : lecture.videoUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            controls
          >
            <source src={lecture.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎥</div>
              <h3 className="text-xl font-bold mb-2">No Video Available</h3>
              <p className="text-white/70">This lecture doesn't have a video yet.</p>
            </div>
          </div>
        )}
      </div>

      {/* Video Info Overlay - Only for non-YouTube videos */}
      {!youtubeId && lecture.videoUrl && (
        <motion.div 
          className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-2xl p-4 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showControls ? 1 : 0, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="font-bold text-lg mb-1">{lecture.title}</h3>
          {lecture.description && (
            <p className="text-sm text-white/80 line-clamp-2">{lecture.description}</p>
          )}
          
          {/* Progress bar for custom videos */}
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VideoPlayer;
