import { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Documents } from './components/Documents';
import { Activity } from './components/Activity';
import { Settings } from './components/Settings';
import { FloatingNav } from './components/FloatingNav';

type NavItem = 'home' | 'documents' | 'activity' | 'settings';

function App() {
  const [hasLaunched, setHasLaunched] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveItem = (pathname: string): NavItem => {
    switch (pathname) {
      case '/': return 'home';
      case '/documents': return 'documents';
      case '/activity': return 'activity';
      case '/settings': return 'settings';
      default: return 'home';
    }
  };

  const handleNavigate = (item: NavItem) => {
    switch (item) {
      case 'home': navigate('/'); break;
      case 'documents': navigate('/documents'); break;
      case 'activity': navigate('/activity'); break;
      case 'settings': navigate('/settings'); break;
    }
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 148, 0.2)',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
      {!hasLaunched ? (
        <LandingPage onLaunch={() => setHasLaunched(true)} />
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          <FloatingNav activeItem={getActiveItem(location.pathname)} onNavigate={handleNavigate} />
        </>
      )}
    </>
  );
}

export default App;
