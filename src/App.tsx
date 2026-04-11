import { Routes, Route } from 'react-router-dom';
import MovilleHero from './pages/MovilleHero';
import ProgrammePage from './pages/ProgrammePage';
import ArchivePage from './pages/ArchivePage';
import { useNightMode } from './hooks/useNightMode';

function App() {
  const isNight = useNightMode();

  return (
    <div className={isNight ? 'theme-night' : 'theme-day'}>
      <Routes>
        <Route path="/" element={<MovilleHero isNight={isNight} />} />
        <Route path="/programme" element={<ProgrammePage isNight={isNight} />} />
        <Route path="/archive" element={<ArchivePage />} />
      </Routes>
    </div>
  );
}

export default App;