// src/pages/PassSuccessPage.tsx
// FIX 4: Copy updated — no implication that the email itself is the pass.
//         Directs buyer to check email and tap "View Your Pass".

import React, { useEffect, useState } from 'react'
import { useNightMode } from '../hooks/useNightMode';
import { Link } from 'react-router-dom';

const PassSuccessPage: React.FC = () => {
  const isNight    = useNightMode();
  const bg         = isNight ? '#0c1a22' : '#FAF8F4';
  const textPri    = isNight ? '#f4efe5' : '#16323C';
  const textSec    = isNight ? 'rgba(244,239,229,0.64)' : 'rgba(22,50,60,0.72)';
  const textMut    = isNight ? 'rgba(244,239,229,0.44)' : 'rgba(22,50,60,0.52)';
  const btnBg      = isNight ? '#f4efe5' : '#16323C';
  const btnText    = isNight ? '#16323C' : '#fff';
  const [passAccent, setPassAccent] = useState('#B0894F');
  useEffect(() => {
    const accent = sessionStorage.getItem('lastPassAccent');
    if (accent) setPassAccent(accent);
  }, []);

  return (
    <div style={{
      minHeight:      '100vh',
      background:     bg,
      fontFamily:     "'Outfit', sans-serif",
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
    }}>
      <div style={{ maxWidth: 520, width: '100%', margin: '0 24px', textAlign: 'center' }}>

        {/* Tick */}
        <div style={{
          width:          72,
          height:         72,
          borderRadius:   '50%',
          background:     passAccent,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          marginInline:   'auto',
          marginBottom:   28,
          fontSize:       32,
          color:          '#fff',
        }}>
          ✓
        </div>

        <h1 style={{
          margin:     '0 0 16px',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize:   'clamp(24px, 5vw, 34px)',
          color:      textPri,
          fontWeight: 700,
        }}>
          Purchase Confirmed
        </h1>

        <p style={{ margin: '0 0 24px', fontSize: 17, color: textSec, lineHeight: 1.6 }}>
          Your festival pass is booked. Check your email — there's a
          <strong> View Your Pass</strong> button that opens your pass with QR code,
          ready to show at the entrance.
        </p>

        <p style={{ margin: '0 0 36px', fontSize: 14, color: textMut, lineHeight: 1.6 }}>
          The email may take a couple of minutes to arrive. If you don't see it,
          check your spam folder or contact{' '}
          <a href="mailto:movillefestival@gmail.com" style={{ color: isNight ? '#C9A56A' : 'var(--accent, #1F4E5F)' }}>
            movillefestival@gmail.com
          </a>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Link
            to="/passes"
            style={{
              display:        'inline-block',
              padding:        '14px 32px',
              borderRadius:   999,
              background:     btnBg,
              color:          btnText,
              fontWeight:     700,
              fontSize:       15,
              textDecoration: 'none',
            }}
          >
            Buy another pass
          </Link>
          <Link
            to="/programme"
            style={{
              display:        'inline-block',
              padding:        '14px 32px',
              borderRadius:   999,
              background:     'transparent',
              border:         `1.5px solid ${isNight ? 'rgba(244,239,229,0.25)' : 'rgba(22,50,60,0.22)'}`,
              color:          textPri,
              fontWeight:     600,
              fontSize:       15,
              textDecoration: 'none',
            }}
          >
            View the programme
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PassSuccessPage;
