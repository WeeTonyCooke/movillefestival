import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import HoldingPage from './pages/HoldingPage';
import ProgrammePage from './pages/ProgrammePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/programme" element={<HoldingPage />} />
      <Route path="/programme-full" element={<ProgrammePage />} />
    </Routes>
  );
}

export default App;