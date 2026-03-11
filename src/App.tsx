import { Routes, Route } from 'react-router-dom';
import MovilleHero from "./pages/MovilleHero";
import ProgrammePage from "./pages/ProgrammePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MovilleHero />} />
      <Route path="/programme" element={<ProgrammePage />} />
    </Routes>
  );
}

export default App;