// src/pages/PassViewPage.tsx
// Accessible at /passes/view?ref=MF-SAT-0042
// FIX 2: Fetches pass via /.netlify/functions/get-pass-by-ref — no direct Supabase
//         access from the browser, no anon key exposed.
// FIX 5: QR encodes pass_ref only (e.g. "MF-SAT-0042") — not a URL.

import React, { useEffect, useState } from 'react';

const STUB_COLOURS: Record<string, string> = {
  festival_pass: '#B8860B',
  friday:        '#6BAFA7',
  saturday:      '#F26A4B',
  sunday:        '#6B3FA0',
};

const STUB_LABELS: Record<string, string> = {
  festival_pass: 'Full Festival',
  friday:        'Friday',
  saturday:      'Saturday',
  sunday:        'Sunday',
};

const PASS_DATES: Record<string, string> = {
  festival_pass: '8–12 July 2026',
  friday:        '10 July 2026',
  saturday:      '11 July 2026',
  sunday:        '12 July 2026',
};

interface PassRecord {
  full_name: string;
  pass_type: string;
  pass_ref:  string;
}

const PassViewPage: React.FC = () => {
  const [pass, setPass]         = useState<PassRecord | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const ref = new URLSearchParams(window.location.search).get('ref');

  useEffect(() => {
    if (!ref) {
      setError('No pass reference found in the link.');
      setLoading(false);
      return;
    }

    const load = async () => {
      // FIX 2: Call our server-side function — never touch Supabase directly
      const passRes = await fetch(
        `/.netlify/functions/get-pass-by-ref?ref=${encodeURIComponent(ref)}`
      );

      if (!passRes.ok) {
        setError(
          'Pass not found. Check the link in your confirmation email, or contact movillefestival@gmail.com.'
        );
        setLoading(false);
        return;
      }

      const data: PassRecord = await passRes.json();
      setPass(data);

      // FIX 5: QR encodes pass_ref only — server-side Python generation
      try {
        const qrRes = await fetch(
          `/.netlify/functions/generate-pass-qr?ref=${encodeURIComponent(ref)}`
        );
        if (qrRes.ok) {
          const { qr } = await qrRes.json();
          setQrDataUrl(qr); // base64 PNG data URL
        }
      } catch {
        console.warn('QR fetch failed — showing ref text fallback');
      }

      setLoading(false);
    };

    load();
  }, [ref]);

  if (loading) {
    return (
      <div style={styles.screen}>
        <div style={styles.spinner} />
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: 14,
                    fontFamily: 'Outfit, sans-serif' }}>
          Loading your pass…
        </p>
      </div>
    );
  }

  if (error || !pass) {
    return (
      <div style={styles.screen}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>⚠️</p>
        <p style={{ color: '#f87171', fontSize: 15, textAlign: 'center',
                    maxWidth: 300, lineHeight: 1.6, fontFamily: 'Outfit, sans-serif' }}>
          {error ?? 'Something went wrong.'}
        </p>
      </div>
    );
  }

  const stubColour = STUB_COLOURS[pass.pass_type] ?? '#1F4E5F';
  const stubLabel  = STUB_LABELS[pass.pass_type]  ?? 'Festival';
  const passDate   = PASS_DATES[pass.pass_type]   ?? '';

  return (
    <div style={styles.screen}>
      <div style={styles.pass}>

        {/* FIX 6: Top colour accent strip — pass type identity at a glance */}
        <div style={{ height: 12, background: stubColour }} />

        {/* QR section — gate-facing, visible immediately without scrolling */}
        <div style={styles.qrSection}>
          <p style={styles.scanLabel}>Scan at gate</p>

          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR code for pass ${pass.pass_ref}`}
              style={{ width: 210, height: 210, display: 'block',
                       imageRendering: 'pixelated' }}
            />
          ) : (
            // Fallback if QR function fails — ref is still human-readable
            <div style={styles.qrFallback}>
              <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>QR unavailable</p>
              <p style={{ margin: '8px 0 0', fontSize: 20, fontWeight: 800,
                          color: '#1F4E5F', letterSpacing: 2 }}>
                {pass.pass_ref}
              </p>
            </div>
          )}

          {/* Pass ref below QR — large, readable, manual fallback for volunteers */}
          <p style={styles.refNumber}>{pass.pass_ref}</p>
        </div>

        {/* Perforation — separates functional zone from keepsake zone */}
        <div style={styles.perf} />

        {/* Keepsake section — coloured stub + festival identity + holder name */}
        <div style={styles.passFooter}>

          {/* Coloured stub: day / date / Admit One */}
          <div style={{ ...styles.stub, background: stubColour }}>
            <div style={styles.notch} />
            <span style={styles.stubDay}>{stubLabel}</span>
            <div style={styles.stubDivider} />
            <span style={styles.stubDate}>{passDate}</span>
            <div style={styles.stubDivider} />
            <span style={styles.stubAdmit}>Admit One</span>
          </div>

          {/* Holder section with lighthouse watermark */}
          <div style={styles.holderSection}>

            {/* Lighthouse watermark — real logo, ghosted */}
            <img
              src="/bimi-logo.svg"
              aria-hidden="true"
              style={{
                position:       'absolute',
                right:          -10,
                top:            '50%',
                transform:      'translateY(-50%)',
                width:          100,
                height:         100,
                opacity:        0.06,
                pointerEvents:  'none',
                objectFit:      'contain',
              }}
            />

            {/* Festival logo mark + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8,
                          position: 'relative', zIndex: 1 }}>
              <img
                src="/bimi-logo.svg"
                alt="Moville Festival"
                style={{ width: 24, height: 24, borderRadius: '50%',
                         background: '#1F4E5F', padding: 3, objectFit: 'contain' }}
              />
              <span style={styles.festivalName}>Moville<br />Summer Festival</span>
            </div>

            {/* Pass holder name — Playfair Display for keepsake quality */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={styles.holderLabel}>Pass Holder</p>
              <p style={styles.holderName}>{pass.full_name}</p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={styles.gateFooter}>
          <p style={styles.gateFooterText}>Moville Summer Festival · 2026</p>
        </div>

      </div>

      {/* Brightness tip */}
      <p style={styles.tip}>Turn up screen brightness before scanning</p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight:       '100vh',
    background:      '#111',
    display:         'flex',
    flexDirection:   'column',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         '20px 16px 32px',
    fontFamily:      "'Outfit', Arial, sans-serif",
  },
  spinner: {
    width:           36,
    height:          36,
    borderRadius:    '50%',
    border:          '3px solid rgba(255,255,255,0.1)',
    borderTopColor:  '#6BAFA7',
    animation:       'spin 0.8s linear infinite',
  },
  pass: {
    width:           '100%',
    maxWidth:        360,
    borderRadius:    18,
    overflow:        'hidden',
    background:      '#fff',
    boxShadow:       '0 24px 80px rgba(0,0,0,0.6)',
  },
  qrSection: {
    padding:         '18px 20px 16px',
    display:         'flex',
    flexDirection:   'column',
    alignItems:      'center',
    gap:             12,
    background:      '#fff',
  },
  scanLabel: {
    margin:          0,
    fontSize:        9,
    fontWeight:      700,
    letterSpacing:   '2px',
    textTransform:   'uppercase' as const,
    color:           '#aaa',
  },
  qrFallback: {
    width:           210,
    height:          210,
    border:          '2px dashed #eee',
    borderRadius:    8,
    display:         'flex',
    flexDirection:   'column',
    alignItems:      'center',
    justifyContent:  'center',
  },
  refNumber: {
    margin:          0,
    fontSize:        22,
    fontWeight:      800,
    color:           '#1F4E5F',
    letterSpacing:   '2px',
  },
  perf: {
    borderTop:       '1.5px dashed #ddd',
    margin:          '0 16px',
  },
  passFooter: {
    display:         'flex',
    minHeight:       100,
  },
  stub: {
    width:           64,
    flexShrink:      0,
    display:         'flex',
    flexDirection:   'column',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             5,
    padding:         '14px 0',
    position:        'relative',
  },
  notch: {
    position:        'absolute',
    right:           -8,
    top:             '50%',
    transform:       'translateY(-50%)',
    width:           16,
    height:          16,
    borderRadius:    '50%',
    background:      '#111',
    zIndex:          2,
  },
  stubDay: {
    fontSize:        11,
    fontWeight:      800,
    color:           '#fff',
    writingMode:     'vertical-rl' as const,
    transform:       'rotate(180deg)',
    letterSpacing:   '1px',
  },
  stubDate: {
    fontSize:        8,
    fontWeight:      600,
    color:           'rgba(255,255,255,0.65)',
    writingMode:     'vertical-rl' as const,
    transform:       'rotate(180deg)',
    letterSpacing:   '1px',
  },
  stubDivider: {
    width:           24,
    height:          1,
    background:      'rgba(255,255,255,0.25)',
  },
  stubAdmit: {
    fontSize:        7,
    fontWeight:      700,
    letterSpacing:   '2px',
    textTransform:   'uppercase' as const,
    color:           'rgba(255,255,255,0.45)',
    writingMode:     'vertical-rl' as const,
    transform:       'rotate(180deg)',
  },
  holderSection: {
    flex:            1,
    padding:         '0 16px 0 22px',
    display:         'flex',
    flexDirection:   'column',
    justifyContent:  'center',
    gap:             10,
    position:        'relative',
    overflow:        'hidden',
  },
  festivalName: {
    fontSize:        8,
    fontWeight:      700,
    letterSpacing:   '1.5px',
    textTransform:   'uppercase' as const,
    color:           '#1F4E5F',
    lineHeight:      1.4,
  },
  holderLabel: {
    margin:          '0 0 2px',
    fontSize:        8,
    fontWeight:      700,
    letterSpacing:   '1.5px',
    textTransform:   'uppercase' as const,
    color:           '#aaa',
  },
  holderName: {
    margin:          0,
    fontSize:        18,
    fontWeight:      700,
    color:           '#1F4E5F',
    fontFamily:      "'Playfair Display', Georgia, serif",
    lineHeight:      1.2,
  },
  gateFooter: {
    background:      '#1F4E5F',
    padding:         '9px 16px',
    textAlign:       'center',
  },
  gateFooterText: {
    margin:          0,
    fontSize:        9,
    color:           'rgba(255,255,255,0.4)',
    letterSpacing:   '1px',
    textTransform:   'uppercase' as const,
  },
  tip: {
    marginTop:       16,
    fontSize:        11,
    color:           'rgba(255,255,255,0.28)',
    textAlign:       'center',
  },
};

export default PassViewPage;
