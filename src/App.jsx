import { VideoPlayer } from './components/VideoPlayer';
import { UrlInput } from './components/UrlInput';
import { Sidebar } from './components/Sidebar';
import { useVideoPlayer } from './hooks/useVideoPlayer';

function App() {
  const { currentVideo } = useVideoPlayer();

  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        {!currentVideo ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
            <div className="w-full card p-0 overflow-hidden">
              <UrlInput />
            </div>
            
            <div className="mt-8 text-center text-text-dark">
              <p className="mb-2">Welcome to Nusair Family Player</p>
              <p>Paste a video link above to start watching</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Player container with 16:9 aspect ratio */}
            <div className="w-full bg-black relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <VideoPlayer />
            </div>
            
            {/* URL input below player */}
            <div className="mt-6">
              <UrlInput />
            </div>
          </div>
        )}
      </div>
      
      {/* Sidebar */}
      <Sidebar />
    </div>
  );
}

export default App;
