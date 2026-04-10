import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import MovilleHero from "./pages/MovilleHero";
import ProgrammePage from "./pages/ProgrammePage";
import ArchivePage from "./pages/ArchivePage";

function App() {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsNight(hour >= 18 || hour < 6);
    };

    checkTime();
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={isNight ? "theme-night" : "theme-day"}>
      <Routes>
        <Route path="/" element={<MovilleHero />} />
        <Route path="/programme" element={<ProgrammePage />} />
        <Route path="/archive" element={<ArchivePage />} />
      </Routes>
    </div>
  );
}

export default App;