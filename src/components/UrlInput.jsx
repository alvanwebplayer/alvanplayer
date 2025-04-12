import { useState } from 'react';
import { useVideoPlayer } from '../hooks/useVideoPlayer';

export const UrlInput = () => {
  const { loadVideo, isValidVideoUrl, error, clearError } = useVideoPlayer();
  const [url, setUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!url.trim()) return;
    
    setIsValidating(true);
    
    // Simple validation
    if (!isValidVideoUrl(url)) {
      setIsValidating(false);
      return;
    }
    
    // Load the video
    const success = loadVideo(url);
    
    if (success) {
      // Clear the input on success
      setUrl('');
    }
    
    setIsValidating(false);
  };
  
  const videoFormats = ['.mp4', '.mkv', '.webm', '.avi', '.mov', '.flv', '.wmv'];
  
  return (
    <div className="w-full p-6 fade-in">
      <div className="flex items-center justify-center mb-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
          <span className="mr-2">NUSAIR</span>
          <span className="inline-flex items-center bg-primary/10 px-3 py-1 rounded-md">
            <span className="text-primary">FAMILY PLAYER</span>
          </span>
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div 
          className={`relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 ${isHovered ? 'shadow-primary/20' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-stretch">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) clearError();
              }}
              placeholder="Paste video URL here (.mp4, .mkv, .webm, etc.)"
              className="input flex-1 py-5 px-6 bg-background-light text-lg border-2 border-transparent focus:border-primary/30 focus:ring-0 rounded-l-lg rounded-r-none transition-all duration-200"
              disabled={isValidating}
            />
            
            <button
              type="submit"
              disabled={isValidating || !url.trim()}
              className="px-8 bg-primary hover:bg-primary-light disabled:opacity-50 disabled:hover:bg-primary text-background-dark font-bold rounded-r-lg transition-all duration-200 shadow-lg disabled:shadow-none"
            >
              {isValidating ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading</span>
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Play</span>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5.14V19.14L19 12.14L8 5.14Z" fill="currentColor"/>
                  </svg>
                </div>
              )}
            </button>
          </div>
          
          {/* Animated highlight border at bottom */}
          <div 
            className="h-1 bg-primary transition-all duration-500 ease-out" 
            style={{ 
              width: isHovered ? '100%' : '0%',
              opacity: isHovered ? 1 : 0
            }}
          ></div>
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-5 rounded-lg animate-pulse">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" fill="currentColor"/>
              </svg>
              <div>
                <p className="font-medium">{error}</p>
                <p className="text-sm mt-1 text-red-400/80">
                  Make sure your URL ends with a valid video extension like .mp4, .mkv, .webm, .avi, .mov, .flv, or .wmv
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {videoFormats.map(format => (
            <div 
              key={format} 
              className="px-3 py-1 bg-background-light rounded-full text-text-dark text-sm font-medium"
            >
              {format}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}; 