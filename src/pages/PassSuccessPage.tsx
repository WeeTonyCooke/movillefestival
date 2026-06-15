// src/pages/PassSuccessPage.tsx
// FIX 4: Copy updated — no implication that the email itself is the pass.
//         Directs buyer to check email and tap "View Your Pass".

import React from 'react';
import { Link } from 'react-router-dom';

const PassSuccessPage: React.FC = () => {
  return (
    <div style={{
      minHeight:      '100vh',
      background:     '#F4E9D8',
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
          background:     '#1F4E5F',
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
          color:      '#1F4E5F',
          fontWeight: 700,
        }}>
          Purchase Confirmed
        </h1>

        <p style={{ margin: '0 0 24px', fontSize: 17, color: '#555', lineHeight: 1.6 }}>
          Your festival pass is booked. Check your email — there's a
          <strong> View Your Pass</strong> button that opens your pass with QR code,
          ready to show at the entrance.
        </p>

        <p style={{ margin: '0 0 36px', fontSize: 14, color: '#888', lineHeight: 1.6 }}>
          The email may take a couple of minutes to arrive. If you don't see it,
          check your spam folder or contact{' '}
          <a href="mailto:movillefestival@gmail.com" style={{ color: '#1F4E5F' }}>
            movillefestival@gmail.com
          </a>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Link
            to="/passes"
            style={{
              display:        'inline-block',
              padding:        '14px 32px',
              borderRadius:   8,
              background:     '#F26A4B',
              color:          '#fff',
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
              borderRadius:   8,
              background:     'transparent',
              border:         '1.5px solid #1F4E5F',
              color:          '#1F4E5F',
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
