import { useState } from 'react';
import { useVideoPlayer } from '../hooks/useVideoPlayer';

// Helper to format date
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Helper to shorten URL for display
const shortenUrl = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const filename = pathParts[pathParts.length - 1] || '';
    return `${urlObj.hostname}/${filename.length > 20 ? filename.substring(0, 20) + '...' : filename}`;
  } catch (e) {
    return url.substring(0, 30) + '...';
  }
};

export const Sidebar = () => {
  const { 
    history, 
    loadVideo, 
    isSidebarOpen, 
    toggleSidebar, 
    clearHistory 
  } = useVideoPlayer();
  
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const handleClearHistory = () => {
    if (confirmDelete) {
      clearHistory();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      
      // Auto-reset confirm state after 3 seconds
      setTimeout(() => {
        setConfirmDelete(false);
      }, 3000);
    }
  };
  
  if (!isSidebarOpen) {
    return (
      <button 
        onClick={toggleSidebar}
        className="fixed top-6 right-6 z-20 bg-background-light/80 hover:bg-background-light p-3 rounded-full shadow-lg border border-primary/20 backdrop-blur-sm transition-all duration-200 hover:scale-110"
        aria-label="Open history"
      >
        <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z" fill="currentColor"/>
        </svg>
      </button>
    );
  }
  
  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-background-light z-30 shadow-2xl flex flex-col border-l border-primary/10 backdrop-blur-sm fade-in">
      <div className="flex items-center justify-between p-6 border-b border-background">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z" fill="currentColor"/>
          </svg>
          Watch History
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearHistory}
            className={`p-2 rounded-full transition-all duration-200 ${
              confirmDelete 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'text-text-dark hover:text-primary hover:bg-background-light/80'
            }`}
            aria-label={confirmDelete ? "Confirm clear history" : "Clear history"}
            title={confirmDelete ? "Confirm clear history" : "Clear history"}
          >
            {confirmDelete ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
              </svg>
            )}
          </button>
          <button
            onClick={toggleSidebar}
            className="p-2 text-text-dark hover:text-primary hover:bg-background-light/80 rounded-full transition-all duration-200"
            aria-label="Close history"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-dark">
            <svg className="w-16 h-16 mb-4 text-primary/30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z" fill="currentColor"/>
            </svg>
            <p className="text-lg font-medium mb-2">No history found</p>
            <p className="text-center text-sm max-w-[80%]">
              Videos you watch will appear here so you can easily access them again
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {history.map((item) => (
              <li key={item.url} className="group">
                <button
                  onClick={() => loadVideo(item.url)}
                  className="w-full p-4 bg-background hover:bg-background-light/50 rounded-lg transition-all duration-200 text-left flex flex-col border border-primary/5 shadow-sm hover:shadow-md hover:border-primary/10 active:scale-[0.98]"
                >
                  <div className="line-clamp-2 text-text font-medium group-hover:text-primary transition-colors text-base">
                    {item.title}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-text-dark text-xs truncate max-w-[60%] bg-background-dark/30 px-2 py-1 rounded-md">
                      {shortenUrl(item.url)}
                    </div>
                    <div className="text-text-dark text-xs px-2 py-1 rounded-md bg-primary/10">
                      {formatDate(item.timestamp)}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {history.length > 0 && (
        <div className="px-4 py-3 text-center border-t border-background">
          <p className="text-xs text-text-dark">
            {history.length} {history.length === 1 ? 'video' : 'videos'} in history
          </p>
        </div>
      )}
    </div>
  );
}; 