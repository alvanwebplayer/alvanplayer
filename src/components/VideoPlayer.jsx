import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useVideoPlayer } from '../hooks/useVideoPlayer';
import ControlBar from './ControlBar';

export const VideoPlayer = () => {
  const {
    playerRef,
    currentVideo,
    isPlaying,
    volume,
    playbackRate,
    currentTime,
    isFullscreen,
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    handlePlaybackRateChange,
    handleProgress,
    handleFullscreenToggle,
    requestFullscreen,
    handleForward,
    handleBackward,
    setDuration,
  } = useVideoPlayer();
  
  const [showControls, setShowControls] = useState(true);
  const [controlTimer, setControlTimer] = useState(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const loaderTimerRef = useRef(null);
  
  // Show controls when user interacts with the player
  const showControlsTemporarily = () => {
    setShowControls(true);
    
    // Clear existing timer
    if (controlTimer) {
      clearTimeout(controlTimer);
    }
    
    // Set new timer to hide controls after 5 seconds
    const timer = setTimeout(() => {
      if (isPlaying && !isBuffering) {
        setShowControls(false);
      }
    }, 5000);
    
    setControlTimer(timer);
  };
  
  // Handle clicks on the video to show controls
  const handleVideoClick = (e) => {
    e.stopPropagation();
    showControlsTemporarily();
    handlePlayPause();
  };
  
  // Handle mousemove to show controls
  const handleMouseMove = () => {
    showControlsTemporarily();
  };
  
  // Handle buffering state
  const handleBuffer = (buffering) => {
    setIsBuffering(buffering);
    
    if (buffering) {
      // Show controls while buffering
      setShowControls(true);
      
      // Show loading indicator after a small delay
      if (loaderTimerRef.current) {
        clearTimeout(loaderTimerRef.current);
      }
      
      loaderTimerRef.current = setTimeout(() => {
        setShowLoader(true);
      }, 500);
    } else {
      // Hide loader when buffering ends
      setShowLoader(false);
      
      if (loaderTimerRef.current) {
        clearTimeout(loaderTimerRef.current);
        loaderTimerRef.current = null;
      }
      
      // Start timer to hide controls
      showControlsTemporarily();
    }
  };
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (controlTimer) {
        clearTimeout(controlTimer);
      }
      if (loaderTimerRef.current) {
        clearTimeout(loaderTimerRef.current);
      }
    };
  }, [controlTimer]);
  
  // Add keyboard event listener for fullscreen toggling with 'f' key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        requestFullscreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [requestFullscreen]);
  
  if (!currentVideo) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text text-xl">No video selected</div>
      </div>
    );
  }
  
  return (
    <div 
      className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-background-dark' : ''}`}
      onMouseMove={handleMouseMove}
      onClick={handleVideoClick}
    >
      <ReactPlayer
        ref={playerRef}
        url={currentVideo.url}
        playing={isPlaying}
        volume={volume}
        playbackRate={playbackRate}
        width="100%"
        height="100%"
        style={{ backgroundColor: 'black' }}
        progressInterval={500}
        onProgress={handleProgress}
        onDuration={(duration) => setDuration(duration)}
        onBuffer={() => handleBuffer(true)}
        onBufferEnd={() => handleBuffer(false)}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
              disablePictureInPicture: true,
            },
          },
        }}
      />
      
      {/* Loading indicator */}
      {showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-dark/50 z-10">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <div className="text-primary mt-4 font-medium">Loading video...</div>
          </div>
        </div>
      )}
      
      {/* Gradient overlay at the bottom for better control visibility */}
      <div className={`absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background-dark/90 to-transparent pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* Gradient overlay at the top for title visibility */}
      <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background-dark/80 to-transparent pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* Control bar */}
      <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 transform ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <ControlBar
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={playerRef.current?.getDuration() || 0}
          volume={volume}
          playbackRate={playbackRate}
          isFullscreen={isFullscreen}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onPlaybackRateChange={handlePlaybackRateChange}
          onFullscreenToggle={requestFullscreen}
          onForward={handleForward}
          onBackward={handleBackward}
        />
      </div>
      
      {/* Video title and info overlay */}
      <div className={`absolute top-0 left-0 right-0 p-6 transition-all duration-300 transform ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <h2 className="text-xl font-bold truncate text-text drop-shadow-lg">{currentVideo.title}</h2>
      </div>
      
      {/* Center play/pause button overlay (visible briefly on state change) */}
      {isPlaying ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-fadeout">
            <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-fadeout">
            <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5.14V19.14L19 12.14L8 5.14Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}; 