import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChristmasPage from './ChristmasPage';
import RegularHoldingPage from './RegularHoldingPage';
import { isChristmasSeason } from '../utils/christmasSeason';

export default function HoldingPage() {
  const { search } = useLocation();
  const preview = new URLSearchParams(search).get('preview') === 'christmas';
  const [seasonal, setSeasonal] = useState(() => isChristmasSeason());
  useEffect(() => {
    const update = () => setSeasonal(isChristmasSeason());
    const timer = window.setInterval(update, 30_000);
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return preview || seasonal ? <ChristmasPage /> : <RegularHoldingPage />;
}
