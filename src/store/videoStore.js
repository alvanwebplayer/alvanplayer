import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper to check if a URL is a valid video
const isValidVideoUrl = (url) => {
  if (!url) return false;
  
  const videoExtensions = ['.mp4', '.mkv', '.webm', '.avi', '.mov', '.flv', '.wmv'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

// Extract title from URL
const extractTitleFromUrl = (url) => {
  if (!url) return '';
  try {
    // Try to get the filename from the path
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop();
    // Remove extension and replace dashes/underscores with spaces
    return filename
      ? decodeURIComponent(filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
      : url;
  } catch (e) {
    // If URL parsing fails, return the URL as is
    return url;
  }
};

export const useVideoStore = create(
  persist(
    (set, get) => ({
      // Current video state
      currentVideo: null,
      isPlaying: false,
      volume: 0.7,
      playbackRate: 1.0,
      currentTime: 0,
      duration: 0,
      
      // UI state
      isFullscreen: false,
      isSidebarOpen: false,
      error: null,
      
      // History
      history: [],
      
      // Actions
      loadVideo: (url) => {
        if (!isValidVideoUrl(url)) {
          set({ error: 'Invalid video URL. Please provide a URL ending with a valid video extension.' });
          return false;
        }
        
        const title = extractTitleFromUrl(url);
        const timestamp = Date.now();
        
        // Get last position if it exists
        const positions = get().positions || {};
        const savedPosition = positions[url]?.position || 0;
        
        // Save to history
        const history = get().history;
        const historyItem = { 
          url, 
          title,
          timestamp
        };
        
        // Filter out duplicate entries
        const updatedHistory = [
          historyItem,
          ...history.filter(item => item.url !== url)
        ].slice(0, 100); // Limit history to 100 items
        
        set({
          currentVideo: { url, title },
          currentTime: savedPosition,
          isPlaying: true,
          history: updatedHistory,
          error: null
        });
        
        return true;
      },
      
      setPlaybackState: (isPlaying) => set({ isPlaying }),
      
      setVolume: (volume) => set({ volume }),
      
      setPlaybackRate: (playbackRate) => set({ playbackRate }),
      
      setCurrentTime: (currentTime) => {
        const { currentVideo, positions = {} } = get();
        if (!currentVideo) return;
        
        // Update position in localStorage
        const newPositions = {
          ...positions,
          [currentVideo.url]: {
            position: currentTime,
            lastPlayed: Date.now(),
            title: currentVideo.title,
          }
        };
        
        set({ 
          currentTime,
          positions: newPositions
        });
      },
      
      setDuration: (duration) => set({ duration }),
      
      toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      toggleFullscreen: () => set(state => ({ isFullscreen: !state.isFullscreen })),
      
      clearError: () => set({ error: null }),
      
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'nusair-player-storage',
      partialize: (state) => ({
        positions: state.positions,
        history: state.history,
        volume: state.volume,
      }),
    }
  )
); 