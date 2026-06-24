 // src/pages/ScanPage.tsx
// Festival entrance QR scanner — committee use only.
// Uses the device camera via jsQR (loaded from CDN via a script tag approach
// doesn't work in React — we use the browser's BarcodeDetector API where
// available, with a jsQR canvas fallback).
//
// Flow:
//   1. Admin login grants access
//   2. Camera view — continuous scan
//   3. Result: green (admit) or red (reject) — tap to scan next

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

// ── Types ─────────────────────────────────────────────────────────────────────
type Screen = 'login' | 'scanning' | 'result';

interface ScanResult {
  valid:      boolean;
  full_name?: string;
  pass_type?: string;
  pass_ref?:  string;
  reason?:    string;
}

const PASS_LABELS: Record<string, string> = {
  festival_pass: 'Full Festival Pass',
  friday:        'Friday Day Pass',
  saturday:      'Saturday Day Pass',
  sunday:        'Sunday Day Pass',
};

const REF_PATTERN = /^MF-[A-Z]+-\d{4}$/;

// ── ScanPage ──────────────────────────────────────────────────────────────────
export default function ScanPage() {
  const [screen,   setScreen]   = useState<Screen>(() => sessionStorage.getItem('movilleAdminPassword') ? 'scanning' : 'login');
  const [password, setPassword] = useState(() => sessionStorage.getItem('movilleAdminPassword') || '');
  const [authError, setAuthError] = useState('');
  const [result,   setResult]   = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState('');

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const rafRef      = useRef<number | null>(null);
  const passwordRef = useRef(password);
  useEffect(() => { passwordRef.current = password; }, [password]);

  // ── Start camera ────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCamError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCamError('Camera access denied. Please allow camera access and reload.');
    }
  }, []);

  // ── Stop camera ─────────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  // ── Scan loop ────────────────────────────────────────────────────────────────
  const scanFrame = useCallback(async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2 || scanning) {
      rafRef.current = requestAnimationFrame(scanFrame); // eslint-disable-line react-hooks/immutability
      return;
    }

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) { rafRef.current = requestAnimationFrame(scanFrame); return; }
    ctx.drawImage(video, 0, 0);

    // Try BarcodeDetector API (Chrome on Android, Safari 17+)
    if ('BarcodeDetector' in window) {
      try {
        // @ts-expect-error -- BarcodeDetector not in TS lib yet
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const codes    = await detector.detect(canvas);
        if (codes.length > 0) {
          const raw = codes[0].rawValue;
          if (REF_PATTERN.test(raw)) {
            await handleScan(raw); // eslint-disable-line react-hooks/immutability
            return;
          }
        }
      } catch { /* fall through to next frame */ }
    } else {
      // Fallback: load jsQR dynamically
      try {
        // @ts-expect-error -- jsQR loaded dynamically
        if (!window.jsQR) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
            s.onload  = () => resolve();
            s.onerror = () => reject();
            document.head.appendChild(s);
          });
        }
        // @ts-expect-error -- jsQR loaded dynamically
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // @ts-expect-error -- jsQR loaded dynamically
        const code = window.jsQR(imageData.data, imageData.width, imageData.height);
        if (code && REF_PATTERN.test(code.data)) {
          await handleScan(code.data);
          return;
        }
      } catch { /* fall through */ }
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [scanning]); // eslint-disable-line

  // ── Validate scan against API ────────────────────────────────────────────────
  const handleScan = useCallback(async (ref: string) => {
    if (scanning) return;
    setScanning(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    try {
      const res = await fetch('/.netlify/functions/validate-pass-scan', {
        method:  'POST',
        headers: {
          'Content-Type':    'application/json',
          'x-admin-password': passwordRef.current,
        },
        body: JSON.stringify({ ref }),
      });

      if (res.status === 401) {
        sessionStorage.removeItem('movilleAdminPassword');
        setPassword('');
        setScreen('login');
        setAuthError('Session expired. Please return to admin and sign in again.');
        setScanning(false);
        stopCamera();
        return;
      }

      const data: ScanResult = await res.json();
      setResult(data);
      setScreen('result');
    } catch {
      setResult({ valid: false, reason: 'Network error. Check your connection.' });
      setScreen('result');
    }
    setScanning(false);
  }, [scanning, stopCamera]);

  // ── Start scan loop when on scanning screen ──────────────────────────────────
  useEffect(() => {
    if (screen === 'scanning') {
      startCamera().then(() => { // eslint-disable-line react-hooks/set-state-in-effect
        rafRef.current = requestAnimationFrame(scanFrame);
      });
    }
    return () => {
      if (screen === 'scanning') stopCamera();
    };
  }, [screen]); // eslint-disable-line

  // ── Scan next ────────────────────────────────────────────────────────────────
  const handleScanNext = () => {
    setResult(null);
    setScreen('scanning');
  };

  // ── Render: access required ───────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <div style={styles.screen}>
        <div style={styles.loginCard}>
          <div style={styles.loginLogo}>
            <img src="/lighthouse-mark.svg" alt="Moville Festival" style={{ width: 48, height: 48, objectFit: 'contain' }} />
          </div>
          <h1 style={styles.loginTitle}>Scanner access</h1>
          <p style={styles.loginSub}>Sign in through Committee Admin first.</p>

          {authError && <p style={styles.errorText}>{authError}</p>}

          <Link to="/admin" style={styles.loginBtn}>
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Render: Result ───────────────────────────────────────────────────────────
  if (screen === 'result' && result) {
    const isValid = result.valid;
    return (
      <div style={{ ...styles.screen, background: isValid ? '#166534' : '#991b1b' }}>
        <div style={styles.resultIcon}>
          {isValid ? '✓' : '✗'}
        </div>

        {isValid ? (
          <>
            <p style={styles.resultAction}>ADMIT</p>
            <p style={styles.resultName}>{result.full_name}</p>
            <p style={styles.resultType}>{PASS_LABELS[result.pass_type!] ?? result.pass_type}</p>
            <p style={styles.resultRef}>{result.pass_ref}</p>
          </>
        ) : (
          <>
            <p style={styles.resultAction}>DO NOT ADMIT</p>
            <p style={styles.resultReason}>{result.reason}</p>
          </>
        )}

        <button onClick={handleScanNext} style={styles.nextBtn}>
          Scan Next Pass
        </button>

        <Link to="/admin" style={styles.resultMenuLink}>← Back to menu</Link>
      </div>
    );
  }

  // ── Render: Scanning ─────────────────────────────────────────────────────────
  return (
    <div style={styles.screen}>
      <div style={styles.scanHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/lighthouse-mark.svg" alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span style={styles.scanHeaderText}>Moville Festival · Scanner</span>
        </div>
        <Link to="/admin" style={styles.scanHeaderLink}>← Menu</Link>
      </div>

      {camError ? (
        <div style={styles.camError}>
          <p>{camError}</p>
        </div>
      ) : (
        <div style={styles.videoWrap}>
          <video
            ref={videoRef}
            playsInline
            muted
            style={styles.video}
          />
          {/* Targeting overlay */}
          <div style={styles.overlay}>
            <div style={styles.targetBox} />
          </div>
          <p style={styles.scanHint}>Point camera at the QR code on the pass</p>
        </div>
      )}

      {/* Hidden canvas for jsQR processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {scanning && (
        <div style={styles.scanningIndicator}>
          Checking pass…
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight:      '100vh',
    background:     '#0f1923',
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    fontFamily:     "'Outfit', Arial, sans-serif",
    padding:        '20px 16px',
  },
  loginCard: {
    background:   '#fff',
    borderRadius: 16,
    padding:      '32px 28px',
    width:        '100%',
    maxWidth:     360,
    display:      'flex',
    flexDirection:'column',
    alignItems:   'center',
    gap:          12,
  },
  loginLogo: {
    width:        72,
    height:       72,
    borderRadius: '50%',
    background:   'var(--accent)',
    display:      'flex',
    alignItems:   'center',
    justifyContent:'center',
    marginBottom: 4,
    padding:      12,
  },
  loginTitle: {
    margin:      0,
    fontSize:    22,
    fontWeight:  800,
    color:       'var(--accent)',
    fontFamily:  "'Playfair Display', Georgia, serif",
  },
  loginSub: {
    margin:    '0 0 12px',
    fontSize:  13,
    color:     '#6B7280',
  },
  loginInput: {
    width:        '100%',
    padding:      '12px 14px',
    border:       '1px solid #D1D5DB',
    borderRadius: 8,
    fontSize:     15,
    marginBottom: 8,
    boxSizing:    'border-box',
    outline:      'none',
  },
  loginBtn: {
    width:        '100%',
    padding:      '13px',
    background:   'var(--accent)',
    color:        '#fff',
    border:       'none',
    borderRadius: 10,
    fontSize:     15,
    fontWeight:   700,
    cursor:       'pointer',
    marginTop:    4,
    textDecoration: 'none',
    textAlign:    'center',
    boxSizing:    'border-box',
  },
  errorText: {
    margin:   '0 0 8px',
    fontSize: 13,
    color:    '#DC2626',
  },
  // Scanning screen
  scanHeader: {
    position:   'absolute',
    top:        0,
    left:       0,
    right:      0,
    padding:    '14px 16px',
    display:    'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap:        10,
    background: 'rgba(0,0,0,0.6)',
  },
  scanHeaderText: {
    fontSize:   13,
    fontWeight: 600,
    color:      'rgba(255,255,255,0.85)',
  },
  scanHeaderLink: {
    color:      'rgba(255,255,255,0.82)',
    fontSize:   13,
    fontWeight: 700,
    textDecoration: 'none',
    padding:    '6px 10px',
    border:     '1px solid rgba(255,255,255,0.25)',
    borderRadius: 999,
  },
  videoWrap: {
    position:     'relative',
    width:        '100%',
    maxWidth:     480,
    borderRadius: 12,
    overflow:     'hidden',
    background:   '#000',
  },
  video: {
    width:   '100%',
    display: 'block',
  },
  overlay: {
    position:       'absolute',
    inset:          0,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    background:     'rgba(0,0,0,0.25)',
  },
  targetBox: {
    width:        220,
    height:       220,
    border:       '3px solid rgba(255,255,255,0.9)',
    borderRadius: 16,
    boxShadow:    '0 0 0 2000px rgba(0,0,0,0.35)',
  },
  scanHint: {
    position:   'absolute',
    bottom:     12,
    left:       0,
    right:      0,
    textAlign:  'center',
    fontSize:   12,
    color:      'rgba(255,255,255,0.75)',
    fontWeight: 500,
    margin:     0,
  },
  scanningIndicator: {
    marginTop:  20,
    fontSize:   14,
    color:      'rgba(255,255,255,0.7)',
    fontWeight: 500,
  },
  camError: {
    background:   'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding:      '20px 24px',
    textAlign:    'center',
    color:        '#f87171',
    fontSize:     14,
    maxWidth:     320,
  },
  // Result screen
  resultIcon: {
    fontSize:   80,
    fontWeight: 900,
    color:      '#fff',
    lineHeight: 1,
    marginBottom: 8,
  },
  resultAction: {
    margin:       0,
    fontSize:     28,
    fontWeight:   900,
    color:        '#fff',
    letterSpacing: 3,
  },
  resultName: {
    margin:       '12px 0 4px',
    fontSize:     26,
    fontWeight:   700,
    color:        '#fff',
    fontFamily:   "'Playfair Display', Georgia, serif",
    textAlign:    'center',
  },
  resultType: {
    margin:     '0 0 4px',
    fontSize:   16,
    fontWeight: 600,
    color:      'rgba(255,255,255,0.8)',
  },
  resultRef: {
    margin:       '0 0 32px',
    fontSize:     14,
    color:        'rgba(255,255,255,0.55)',
    letterSpacing: 1,
  },
  resultReason: {
    margin:     '12px 0 32px',
    fontSize:   18,
    fontWeight: 600,
    color:      '#fff',
    textAlign:  'center',
    maxWidth:   300,
    lineHeight: 1.5,
  },
  nextBtn: {
    padding:      '14px 36px',
    background:   'rgba(255,255,255,0.18)',
    border:       '2px solid rgba(255,255,255,0.4)',
    borderRadius: 999,
    color:        '#fff',
    fontSize:     15,
    fontWeight:   700,
    cursor:       'pointer',
    backdropFilter: 'blur(8px)',
  },
  resultMenuLink: {
    marginTop:      18,
    fontSize:       13,
    color:          'rgba(255,255,255,0.65)',
    textDecoration: 'none',
  },
};
