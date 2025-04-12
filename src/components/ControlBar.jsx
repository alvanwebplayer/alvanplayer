import { useState, useEffect, useRef } from 'react';

// Helper to format time
const formatTime = (seconds) => {
  if (isNaN(seconds)) return '00:00';
  
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
  }
  
  return `${mm}:${ss}`;
};

const ControlBar = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackRate,
  isFullscreen,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onPlaybackRateChange,
  onFullscreenToggle,
  onForward,
  onBackward,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(currentTime);
  const [showVolume, setShowVolume] = useState(false);
  const [showPlaybackRate, setShowPlaybackRate] = useState(false);
  const progressRef = useRef(null);
  
  // Update internal seekTime when currentTime changes (if not dragging)
  useEffect(() => {
    if (!isDragging) {
      setSeekTime(currentTime);
    }
  }, [currentTime, isDragging]);
  
  // Handle progress bar click
  const handleProgressBarClick = (e) => {
    if (!progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    const newTime = percentage * duration;
    
    setSeekTime(newTime);
    onSeek(newTime);
  };
  
  // Handle progress bar mouse down (start dragging)
  const handleProgressMouseDown = (e) => {
    setIsDragging(true);
    handleProgressBarClick(e);
  };
  
  // Handle progress bar mouse move during drag
  const handleProgressMouseMove = (e) => {
    if (!isDragging || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percentage * duration;
    
    setSeekTime(newTime);
  };
  
  // Handle progress bar mouse up (end dragging)
  const handleProgressMouseUp = () => {
    if (isDragging) {
      onSeek(seekTime);
      setIsDragging(false);
    }
  };
  
  // Custom forward function for 30 seconds jump
  const handleForward30 = () => {
    if (duration) {
      const newTime = Math.min(currentTime + 30, duration);
      onSeek(newTime);
    }
  };
  
  // Add document-level events for mouse move and up
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleProgressMouseMove);
      document.addEventListener('mouseup', handleProgressMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleProgressMouseMove);
      document.removeEventListener('mouseup', handleProgressMouseUp);
    };
  }, [isDragging, handleProgressMouseMove, handleProgressMouseUp]);
  
  // Calculate progress percentage
  const progress = duration ? (seekTime / duration) * 100 : 0;
  
  return (
    <div className="p-4 text-text" onClick={(e) => e.stopPropagation()}>
      {/* Progress bar */}
      <div 
        ref={progressRef}
        className="relative h-3 cursor-pointer mb-4 group"
        onClick={handleProgressBarClick}
        onMouseDown={handleProgressMouseDown}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-background-light/40 rounded-full"></div>
        
        {/* Buffered Progress (simulated) */}
        <div 
          className="absolute inset-y-0 left-0 bg-primary/30 rounded-full"
          style={{ width: `${Math.min((progress + 15), 100)}%` }}
        ></div>
        
        {/* Progress */}
        <div 
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
        
        {/* Thumb */}
        <div 
          className={`absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-primary shadow-lg transform -translate-x-1/2 opacity-0 group-hover:opacity-100 ${isDragging ? 'opacity-100 scale-110' : ''} transition-all duration-150`}
          style={{ left: `${progress}%` }}
        ></div>
        
        {/* Hover label with time */}
        {isDragging && (
          <div 
            className="absolute bottom-full mb-2 bg-background-dark/90 rounded-md px-3 py-1.5 transform -translate-x-1/2 text-sm font-medium shadow-lg border border-primary/20"
            style={{ left: `${progress}%` }}
          >
            {formatTime(seekTime)}
          </div>
        )}
      </div>
      
      {/* Controls row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Backward button */}
          <button 
            className="p-2 hover:text-primary active:scale-95 transition-all rounded-full hover:bg-background-light/30 focus:outline-none"
            onClick={onBackward}
            aria-label="Backward 10 seconds"
          >
            <div className="relative flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 8V4.5L8 9L12.5 13.5V10C15.03 10 17 11.97 17 14.5C17 17.03 15.03 19 12.5 19C9.97 19 8 17.03 8 14.5H6C6 18.14 8.86 21 12.5 21C16.14 21 19 18.14 19 14.5C19 10.86 16.14 8 12.5 8Z" fill="currentColor"/>
              </svg>
              <span className="absolute text-xs font-bold bg-primary text-background-dark rounded-full px-1.5 py-0.5">10</span>
            </div>
          </button>
          
          {/* Play/pause button */}
          <button 
            className="p-3 hover:text-primary active:scale-95 transition-all rounded-full hover:bg-background-light/30 focus:outline-none"
            onClick={onPlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5.14V19.14L19 12.14L8 5.14Z" fill="currentColor"/>
              </svg>
            )}
          </button>
          
          {/* Forward 10s button */}
          <button 
            className="p-2 hover:text-primary active:scale-95 transition-all rounded-full hover:bg-background-light/30 focus:outline-none"
            onClick={onForward}
            aria-label="Forward 10 seconds"
          >
            <div className="relative flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 9L13.5 4.5V8C9.86 8 7 10.86 7 14.5C7 18.14 9.86 21 13.5 21C17.14 21 20 18.14 20 14.5H18C18 17.03 16.03 19 13.5 19C10.97 19 9 17.03 9 14.5C9 11.97 10.97 10 13.5 10V13.5L18 9Z" fill="currentColor"/>
              </svg>
              <span className="absolute text-xs font-bold bg-primary text-background-dark rounded-full px-1.5 py-0.5">10</span>
            </div>
          </button>
          
          {/* Forward 30s button */}
          <button 
            className="p-2 hover:text-primary active:scale-95 transition-all rounded-full hover:bg-background-light/30 focus:outline-none"
            onClick={handleForward30}
            aria-label="Forward 30 seconds"
          >
            <div className="relative flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 9L13.5 4.5V8C9.86 8 7 10.86 7 14.5C7 18.14 9.86 21 13.5 21C17.14 21 20 18.14 20 14.5H18C18 17.03 16.03 19 13.5 19C10.97 19 9 17.03 9 14.5C9 11.97 10.97 10 13.5 10V13.5L18 9Z" fill="currentColor"/>
              </svg>
              <span className="absolute text-xs font-bold bg-primary text-background-dark rounded-full px-1.5 py-0.5">30</span>
            </div>
          </button>
          
          {/* Volume button and slider */}
          <div className="relative flex items-center" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
            <button 
              className="p-2 hover:text-primary active:scale-95 transition-all rounded-full hover:bg-background-light/30 focus:outline-none"
              onClick={() => onVolumeChange(volume > 0 ? 0 : 1)}
              aria-label={volume > 0 ? "Mute" : "Unmute"}
            >
              {volume === 0 ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.63 3.63C3.24 4.02 3.24 4.65 3.63 5.04L7.29 8.7L7 9H4C3.45 9 3 9.45 3 10V14C3 14.55 3.45 15 4 15H7L12 20V13.41L16.18 17.59C15.69 17.96 15.16 18.27 14.58 18.5V20.5C15.75 20.15 16.81 19.54 17.71 18.73L19.04 20.06C19.43 20.45 20.06 20.45 20.45 20.06C20.84 19.67 20.84 19.04 20.45 18.65L5.04 3.24C4.65 2.85 4.02 2.85 3.63 3.63ZM12 4L9.91 6.09L12 8.18V4ZM16.5 12C16.5 12.06 16.5 12.13 16.5 12.19L18.5 14.19C18.83 13.51 19 12.77 19 12C19 9.79 17.21 8 15 8H14.73L16.73 10H17C17.9 10 18.5 10.9 18.5 12Z" fill="currentColor"/>
                </svg>
              ) : volume < 0.5 ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 9V15H9L14 20V4L9 9H5ZM18.5 12C18.5 10.23 17.5 8.71 16 7.97V16.02C17.5 15.29 18.5 13.77 18.5 12Z" fill="currentColor"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9V15H7L12 20V4L7 9H3ZM16 7.97V16.02C17.48 15.29 18.5 13.77 18.5 12C18.5 10.23 17.48 8.71 16 7.97ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z" fill="currentColor"/>
                </svg>
              )}
            </button>
            
            {/* Volume slider */}
            {showVolume && (
              <div className="absolute left-0 bottom-full p-3 bg-background-dark/90 rounded-lg shadow-xl w-40 border border-primary/20 transform -translate-x-1/4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9V15H7L12 20V4L7 9H3Z" fill="currentColor"/>
                  </svg>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-background-light rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${volume * 100}%, #1E1E1E ${volume * 100}%, #1E1E1E 100%)`
                    }}
                    aria-label="Volume"
                  />
                  <span className="text-sm font-medium">{Math.round(volume * 100)}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Time display */}
          <div className="text-sm font-medium bg-background-light/30 px-2.5 py-1 rounded-full">
            {formatTime(currentTime)} <span className="text-text-dark">/</span> {formatTime(duration)}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Playback speed button */}
          <div className="relative" onMouseEnter={() => setShowPlaybackRate(true)} onMouseLeave={() => setShowPlaybackRate(false)}>
            <button 
              className="p-2 hover:text-primary active:scale-95 transition-all rounded-full hover:bg-background-light/30 focus:outline-none"
              aria-label="Playback speed"
            >
              <div className="w-10 h-7 flex items-center justify-center bg-primary text-background-dark rounded-full text-sm font-bold">
                {playbackRate}x
              </div>
            </button>
            
            {/* Playback rate options */}
            {showPlaybackRate && (
              <div className="absolute right-0 bottom-full p-2 bg-background-dark/90 rounded-lg shadow-xl border border-primary/20">
                <div className="grid grid-cols-4 gap-1">
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                    <button 
                      key={rate}
                      onClick={() => onPlaybackRateChange(rate)}
                      className={`px-2 py-1 text-sm rounded ${playbackRate === rate ? 'bg-primary text-background-dark font-bold' : 'hover:bg-background-light/30'}`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Fullscreen button */}
          <button 
            className="p-2 hover:text-primary active:scale-95 transition-all rounded-full hover:bg-background-light/30 focus:outline-none"
            onClick={onFullscreenToggle}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 16H8V19H10V14H5V16ZM8 8H5V10H10V5H8V8ZM14 19H16V16H19V14H14V19ZM16 8V5H14V10H19V8H16Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14H5V19H10V17H7V14ZM5 10H7V7H10V5H5V10ZM17 17H14V19H19V14H17V17ZM14 5V7H17V10H19V5H14Z" fill="currentColor"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlBar; 