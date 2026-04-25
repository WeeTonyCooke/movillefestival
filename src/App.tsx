import { Routes, Route } from 'react-router-dom';
import MovilleHero from './pages/MovilleHero';
import ProgrammePage from './pages/ProgrammePage';
import ArchivePage from './pages/ArchivePage';
import GettingToMoville from './pages/gettingtomoville';
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
      </Routes>
    </div>
  );
}

export default App;