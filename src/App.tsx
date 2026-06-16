import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProgrammePage from './pages/ProgrammePage';
import ArchivePage from './pages/ArchivePage';
import GettingToMoville from './pages/gettingtomoville';
import CraftFairPage from './pages/CraftFairPage';
import BedPushPage from './pages/BedPushPage';
import BallDropPage from './pages/BallDropPage';
import AdminPage from './pages/AdminPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import BallDropRulesPage from './pages/BallDropRulesPage';
import SponsorshipPage from './pages/SponsorshipPage';
import PassesPage from './pages/PassesPage';
import PassSuccessPage from './pages/PassSuccessPage';
import PassViewPage from './pages/PassViewPage';
import ScanPage from './pages/ScanPage';
import { useNightMode } from './hooks/useNightMode';

const REGISTRATIONS_OPEN = true;

function App() {
  const isNight = useNightMode();

  return (
    <div className={isNight ? 'theme-night' : 'theme-day'}>
      <Routes>
        <Route path="/" element={<HomePage isNight={isNight} />} />
        <Route path="/programme" element={<ProgrammePage isNight={isNight} />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/getting-to-moville" element={<GettingToMoville />} />
        <Route path="/craft-fair" element={REGISTRATIONS_OPEN ? <CraftFairPage /> : <HomePage isNight={isNight} />} />
        <Route path="/bed-push" element={REGISTRATIONS_OPEN ? <BedPushPage /> : <HomePage isNight={isNight} />} />
        <Route path="/ball-drop" element={REGISTRATIONS_OPEN ? <BallDropPage /> : <HomePage isNight={isNight} />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/ball-drop-rules" element={<BallDropRulesPage />} />
        <Route path="/sponsorship" element={<SponsorshipPage />} />
        <Route path="/passes" element={<PassesPage />} />
        <Route path="/passes/success" element={<PassSuccessPage />} />
        <Route path="/passes/view" element={<PassViewPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;