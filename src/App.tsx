import { Routes, Route } from 'react-router-dom';
import MovilleHero from './pages/MovilleHero';
import ProgrammePage from './pages/ProgrammePage';
import ArchivePage from './pages/ArchivePage';
import GettingToMoville from './pages/gettingtomoville';
import CraftFairPage from './pages/CraftFairPage';
import BedPushPage from './pages/BedPushPage';
import BallDropPage from './pages/BallDropPage';
import AdminPage from './pages/AdminPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import { useNightMode } from './hooks/useNightMode';

function App() {
  const isNight = useNightMode();

  return (
    <div className={isNight ? 'theme-night' : 'theme-day'}>
      <Routes>
        <Route path="/" element={<MovilleHero isNight={isNight} />} />
        <Route path="/programme" element={<ProgrammePage isNight={isNight} />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/getting-to-moville" element={<GettingToMoville />} />
        <Route path="/craft-fair" element={<CraftFairPage />} />
        <Route path="/bed-push" element={<BedPushPage />} />
        <Route path="/ball-drop" element={<BallDropPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </div>
  );
}

export default App;