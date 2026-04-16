import { useEffect, useState } from 'react';

function getNightState() {
  const hour = new Date().getHours();
  return hour >= 21 || hour < 6;
}

export function useNightMode() {
  const [isNight, setIsNight] = useState(getNightState);

  useEffect(() => {
    const checkTime = () => {
      setIsNight(getNightState());
    };

    checkTime();
    const timer = window.setInterval(checkTime, 60000);

    return () => window.clearInterval(timer);
  }, []);

  return isNight;
}