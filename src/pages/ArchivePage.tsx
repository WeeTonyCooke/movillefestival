import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { archiveItems, type ArchiveItem } from '../data/archive';
import './ArchivePage.css';

function ArchivePage() {
  const navigate = useNavigate();
  const [activeDecade, setActiveDecade] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const decades = useMemo(() => {
    const values = Array.from(new Set(archiveItems.map((item) => item.decade)));
    return ['All', ...values.sort()];
  }, []);

  const filteredItems = useMemo(() => {
    return archiveItems.filter((item) => {
      const matchesDecade = activeDecade === 'All' || item.decade === activeDecade;
      const q = searchTerm.trim().toLowerCase();

      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        item.date.toLowerCase().includes(q) ||
        item.decade.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q);

      return matchesDecade && matchesSearch;
    });
  }, [activeDecade, searchTerm]);

  useEffect(() => {
    if (!copiedId) return;

    const timer = window.setTimeout(() => {
      setCopiedId(null);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [copiedId]);

  const handleShare = async (item: ArchiveItem) => {
    const shareUrl = `${window.location.origin}${item.pdf}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text: item.excerpt,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(item.id);
    } catch {
      // intentionally quiet
    }
  };

  return (
    <div className="archive-page">
      <div className="archive-shell page-shell">
        <header className="archive-header">
          <div className="archive-title-row">
            <button
              className="archive-inline-back"
              onClick={() => navigate('/programme')}
              aria-label="Back to programme"
              type="button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <h1 className="archive-title">Heritage</h1>
          </div>

          <p className="archive-intro">
            Newspaper clippings, local memories and festival history from years gone by.
          </p>
        </header>

        <div className="archive-controls">
          <div className="archive-search-wrap">
            <input
              type="text"
              className="archive-search"
              placeholder="Search heritage"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="archive-decade-row" aria-label="Archive decades">
            {decades.map((decade) => (
              <button
                key={decade}
                className={`archive-decade-pill ${activeDecade === decade ? 'active' : ''}`}
                onClick={() => setActiveDecade(decade)}
                type="button"
                aria-pressed={activeDecade === decade}
              >
                {decade}
              </button>
            ))}
          </div>

          <p className="archive-count">{filteredItems.length} items in the heritage collection</p>
        </div>

        <section className="archive-grid">
          {filteredItems.map((item) => (
            <article className="archive-card" key={item.id}>
              <div className="archive-paper">
                <div className="archive-paper-inner">
                  <div className="archive-meta">
                    <div className="archive-card-date" aria-label={`Published ${item.date}`}>
                      {item.date}
                    </div>
                    <div className="archive-masthead">{item.source}</div>
                  </div>

                  <div className="archive-meta-rule" aria-hidden="true" />

                  <h2 className="archive-card-title">{item.title}</h2>
                  <p className="archive-card-summary">{item.excerpt}</p>
                </div>
              </div>

              <div className="archive-card-footer">
                <div className="archive-card-actions">
                  <a href={item.pdf} className="archive-pdf-button" target="_blank" rel="noreferrer">
                    View PDF
                  </a>

                  <button
                    className={`archive-share-button ${copiedId === item.id ? 'is-copied' : ''}`}
                    type="button"
                    onClick={() => handleShare(item)}
                    aria-live="polite"
                  >
                    {copiedId === item.id ? 'Copied' : 'Share'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

export default ArchivePage;