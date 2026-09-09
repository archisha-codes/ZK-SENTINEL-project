import { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Documents } from './components/Documents';
import { Activity } from './components/Activity';
import { Settings } from './components/Settings';
import { VoiceOnboarding } from './components/VoiceOnboarding';
import { DataUploadPreview } from './components/DataUploadPreview';
import { AssessmentView } from './components/AssessmentView';
import { CertificateView } from './components/CertificateView';
import { PublicVerifier } from './components/PublicVerifier';
import { FloatingNav } from './components/FloatingNav';

type NavItem = 'home' | 'documents' | 'activity' | 'settings';

function App() {
  const [hasLaunched, setHasLaunched] = useState(() => {
    return window.location.pathname !== '/';
  });
  const [onboardingProfile, setOnboardingProfile] = useState<any>(null);
  const [parsedData, setParsedDataState] = useState<any>(() => {
    try {
      const saved = sessionStorage.getItem('zk_sentinel_parsed_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setParsedData = (data: any) => {
    setParsedDataState(data);
    try {
      if (data) {
        sessionStorage.setItem('zk_sentinel_parsed_data', JSON.stringify(data));
      } else {
        sessionStorage.removeItem('zk_sentinel_parsed_data');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [selectedCertId, setSelectedCertId] = useState<string>('ZKS-8F2A9C14B7002');

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
            background: 'rgba(10, 10, 15, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 148, 0.3)',
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
            <Route
              path="/"
              element={
                <Dashboard
                  onStartOnboarding={() => navigate('/onboard')}
                  onStartUpload={() => navigate('/documents')}
                />
              }
            />
            <Route
              path="/onboard"
              element={
                <VoiceOnboarding
                  onComplete={(profile) => {
                    setOnboardingProfile(profile);
                    navigate('/documents');
                  }}
                  onNavigate={handleNavigate}
                />
              }
            />
            <Route
              path="/documents"
              element={<Documents />}
            />
            <Route
              path="/upload"
              element={
                <DataUploadPreview
                  onParsed={(data) => {
                    setParsedData(data);
                    navigate('/assessment');
                  }}
                  onNavigate={handleNavigate}
                />
              }
            />
            <Route
              path="/assessment"
              element={
                <AssessmentView
                  financialData={parsedData}
                  onGenerateProof={(assessment) => {
                    setAssessmentResult(assessment);
                    navigate('/certificate');
                  }}
                  onNavigate={handleNavigate}
                />
              }
            />
            <Route
              path="/certificate"
              element={
                <CertificateView
                  assessmentResult={assessmentResult}
                  onNavigate={handleNavigate}
                  onOpenPublicVerifier={(certId) => {
                    setSelectedCertId(certId);
                    navigate(`/verify/${certId}`);
                  }}
                />
              }
            />
            <Route
              path="/verify/:certificateId?"
              element={
                <PublicVerifier
                  initialCertId={selectedCertId}
                  onNavigate={handleNavigate}
                  onBackToHome={() => navigate('/')}
                />
              }
            />
            <Route path="/activity" element={<Activity activeItem="activity" onNavigate={handleNavigate} />} />
            <Route path="/settings" element={<Settings activeItem="settings" onNavigate={handleNavigate} />} />
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
