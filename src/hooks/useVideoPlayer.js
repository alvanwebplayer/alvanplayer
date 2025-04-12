import { useRef, useCallback, useEffect } from 'react';
import { useVideoStore } from '../store/videoStore';
import { isValidVideoUrl } from '../utils/validators';

/**
 * Custom hook for video player functionality
 * @returns {Object} Video player methods and state
 */
export const useVideoPlayer = () => {
  const playerRef = useRef(null);
  
  // Get state and actions from the store
  const {
    currentVideo,
    isPlaying,
    volume,
    playbackRate,
    currentTime,
    isFullscreen,
    isSidebarOpen,
    error,
    history,
    
    // Actions
    loadVideo,
    setPlaybackState,
    setVolume,
    setPlaybackRate,
    setCurrentTime,
    setDuration,
    toggleSidebar,
    toggleFullscreen,
    clearError,
    clearHistory
  } = useVideoStore();
  
  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    setPlaybackState(!isPlaying);
  }, [isPlaying, setPlaybackState]);
  
  // Handle seeking
  const handleSeek = useCallback((time) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time);
    }
    setCurrentTime(time);
  }, [setCurrentTime]);
  
  // Handle volume change
  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
  }, [setVolume]);
  
  // Handle playback rate change
  const handlePlaybackRateChange = useCallback((rate) => {
    setPlaybackRate(rate);
  }, [setPlaybackRate]);
  
  // Handle video progress
  const handleProgress = useCallback(({ playedSeconds }) => {
    // Only update every second to reduce localStorage writes
    if (Math.abs(playedSeconds - currentTime) >= 1) {
      setCurrentTime(playedSeconds);
    }
  }, [currentTime, setCurrentTime]);
  
  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);
  
  // Handle entering/leaving fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      if (isFullscreen !== isCurrentlyFullscreen) {
        toggleFullscreen();
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen, toggleFullscreen]);
  
  // Request fullscreen on the player element
  const requestFullscreen = useCallback(() => {
    if (playerRef.current && !document.fullscreenElement) {
      // Get the container element
      const container = playerRef.current.wrapper;
      if (container && container.requestFullscreen) {
        container.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      }
    } else if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  }, []);
  
  // Forward/backward by 10 seconds
  const handleForward = useCallback(() => {
    if (playerRef.current) {
      const newTime = Math.min(currentTime + 10, playerRef.current.getDuration());
      handleSeek(newTime);
    }
  }, [currentTime, handleSeek]);
  
  const handleBackward = useCallback(() => {
    if (playerRef.current) {
      const newTime = Math.max(currentTime - 10, 0);
      handleSeek(newTime);
    }
  }, [currentTime, handleSeek]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleBackward();
          break;
        case 'f':
          e.preventDefault();
          requestFullscreen();
          break;
        case 'm':
          e.preventDefault();
          handleVolumeChange(volume > 0 ? 0 : 0.7); // Toggle mute
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    handlePlayPause, 
    handleForward, 
    handleBackward, 
    requestFullscreen, 
    handleVolumeChange,
    volume
  ]);
  
  return {
    playerRef,
    
    // State
    currentVideo,
    isPlaying,
    volume,
    playbackRate,
    currentTime,
    isFullscreen,
    isSidebarOpen,
    error,
    history,
    
    // Video URL handling
    loadVideo,
    isValidVideoUrl,
    
    // Playback controls
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    handlePlaybackRateChange,
    handleProgress,
    handleFullscreenToggle,
    requestFullscreen,
    handleForward,
    handleBackward,
    
    // UI actions
    toggleSidebar,
    clearError,
    clearHistory,
  };
}; 