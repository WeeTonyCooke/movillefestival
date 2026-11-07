import { useState } from 'react';
import './ChristmasPage.css';

export default function ChristmasPage() {
  const [paused, setPaused] = useState(false);
  return <div className={`christmas-page${paused ? ' christmas-paused' : ''}`}>
    <main className="christmas-hero">
      <div className="christmas-scene" aria-hidden="true"><div className="christmas-art">
        <img src="/winter-lighthouse.png" alt="" fetchPriority="high" />
        {[[47.6,35],[53.6,43],[44.5,52],[55.5,57]].map(([left,top], i) => <i key={i} className="christmas-glow" style={{left:`${left}%`,top:`${top}%`,animationDelay:`-${i+1}s`}} />)}
      </div></div>
      <div className="christmas-shade" aria-hidden="true" />
      <div className="christmas-snow" aria-hidden="true">{Array.from({length:65}, (_,i) => <i key={i} className="christmas-flake" style={{left:`${(i*37.7)%100}%`,width:1+i%4,height:1+i%4,opacity:.15+(i%5)*.09,animationDuration:`${14+i%19}s`,animationDelay:`-${i%29}s`,filter:`blur(${i%3===0?1:0}px)`}} />)}</div>
      <header><p className="christmas-eyebrow">Inishowen · Since 1958</p><h1 className="christmas-heading">Moville Festival</h1></header>
      <p className="christmas-greeting">Wishing you a peaceful Christmas<span>from Moville Festival.</span></p>
      <p className="christmas-place">Moville · Inishowen · Donegal</p>
    </main>
    <footer className="christmas-footer">
      <p><strong>6–11 July 2027</strong> &nbsp;·&nbsp; Full programme coming soon</p>
      <button className="christmas-motion" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? 'Resume animation' : 'Pause animation'}</button>
      <nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
      <a className="christmas-credit" href="mailto:hello@quietobjects.ie?subject=Collaboration" aria-label="Website by MCA — email about collaboration"><img src="/mca-logo-dark.svg" alt="MCA" width="34" height="12" /><span>Website by MCA</span></a>
    </footer>
  </div>;
}
