import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Nav.css';

interface NavProps {
  transparent?: boolean;
}

const NAV_LINKS = [
  { label: 'Home',            anchor: null,            path: '/' },
  { label: 'Programme',       anchor: 'programme',     path: '/' },
  { label: 'Food & Pop-Ups',  anchor: 'food',          path: '/' },
  { label: 'Accommodation',   anchor: 'accommodation', path: '/' },
  { label: 'Getting Here',    anchor: 'getting-here',  path: '/' },
];

const Nav: React.FC<NavProps> = ({ transparent = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e: React.MouseEvent, anchor: string | null, path: string) => {
    e.preventDefault();
    if (anchor) {
      if (location.pathname === path) {
        // Already on homepage — just scroll
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Navigate home then scroll after mount
        navigate(`${path}#${anchor}`);
      }
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className={`site-nav ${transparent ? 'site-nav--transparent' : 'site-nav--solid'}`}>
      <div className="nav-inner">
        <ul className="nav-links">
          {NAV_LINKS.map(({ label, anchor, path }) => (
            <li key={label}>
              <a
                href={anchor ? `${path}#${anchor}` : path}
                onClick={(e) => handleClick(e, anchor, path)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Nav;