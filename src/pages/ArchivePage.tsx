import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ArchivePage.css';

type ArchiveItem = {
  id: number;
  title: string;
  summary: string;
  date: string;
  decade: string;
  pdf: string;
};

const ARCHIVE_ITEMS: ArchiveItem[] = [
  {
    id: 1,
    title: 'Opening Ceremony of International Angling Festival',
    summary:
      'A prominent festival report linking the event to fishing tourism, Greencastle and the wider development of the area’s visitor economy.',
    date: '26 Aug 1958',
    decade: '1950s',
    pdf: '/archive/opening-ceremony-of-international-angling-festival.pdf',
  },
  {
    id: 2,
    title: 'Sea Angling Benefits Tourist Industry',
    summary:
      'A closing festival report focused on visitor numbers, hospitality, fish and the wider tourism value brought to Moville and the district.',
    date: '2 Sep 1958',
    decade: '1950s',
    pdf: '/archive/competitors-say-moville-has-everything-festival-report.pdf',
  },
  {
    id: 3,
    title: 'Moville Plans for Big Sea Angling Event',
    summary:
      'An early preview piece announcing plans for the annual festival and pointing to competitors from across Ireland and overseas.',
    date: '21 Mar 1958',
    decade: '1950s',
    pdf: '/archive/moville-plans-big-sea-angling-event.pdf',
  },
  {
    id: 4,
    title: 'Moville and Its Deep-Sea Angling Festival',
    summary:
      'A feature-style article setting the scene for the festival and presenting Moville as both a fishing centre and a holiday destination.',
    date: '8 May 1958',
    decade: '1950s',
    pdf: '/archive/moville-sea-angling-festival-upcoming-events-preview.pdf',
  },
  {
    id: 5,
    title: 'European Sea-Angling Festival at Moville',
    summary:
      'A substantial article around the opening ceremony, facilities, entries and the sense that Moville was staging an event of growing importance.',
    date: '22 Aug 1958',
    decade: '1950s',
    pdf: '/archive/moville-sea-angling-festival-08.pdf',
  },
  {
    id: 6,
    title: 'Foyle Sea Angling Club’s First Annual Dinner',
    summary:
      'A follow-on report tied to the festival orbit, showing the wider social life, networks and club culture surrounding angling in the area.',
    date: '2 Dec 1958',
    decade: '1950s',
    pdf: '/archive/foyle-sea-angling-festival.pdf',
  },
  {
    id: 7,
    title: 'A Trip Through Romantic Inishowen',
    summary:
      'A broader travel-style feature that helps place Moville and the festival landscape within the romance, scenery and appeal of Inishowen.',
    date: '17 Oct 1958',
    decade: '1950s',
    pdf: '/archive/a-trip-through-romantic-inishowen.pdf',
  },
];

const DECADES = ['All', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s'];

function ArchivePage() {
  const navigate = useNavigate();
  const [activeDecade, setActiveDecade] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    return ARCHIVE_ITEMS.filter((item) => {
      const matchesDecade = activeDecade === 'All' || item.decade === activeDecade;
      const q = searchTerm.trim().toLowerCase();

      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.date.toLowerCase().includes(q) ||
        item.decade.toLowerCase().includes(q);

      return matchesDecade && matchesSearch;
    });
  }, [activeDecade, searchTerm]);

  return (
    <div className="archive-page">
      <div className="archive-shell">
        <header className="archive-header">
          <button
            className="archive-back"
            onClick={() => navigate('/programme')}
            aria-label="Back to programme"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="archive-header-copy">
            <p className="archive-kicker">Moville Festival</p>
            <h1 className="archive-title">Archive</h1>
            <p className="archive-intro">
              Newspaper clippings, reports and fragments from festival history.
            </p>
          </div>
        </header>

        <div className="archive-controls">
          <div className="archive-search-wrap">
            <input
              type="text"
              className="archive-search"
              placeholder="Search archive"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="archive-decade-row">
            {DECADES.map((decade) => (
              <button
                key={decade}
                className={`archive-decade-pill ${activeDecade === decade ? 'active' : ''}`}
                onClick={() => setActiveDecade(decade)}
              >
                {decade}
              </button>
            ))}
          </div>

          <p className="archive-count">{filteredItems.length} clippings in the archive</p>
        </div>

        <section className="archive-grid">
          {filteredItems.map((item) => (
            <article className="archive-card" key={item.id}>
              <div className="archive-paper">
                <div className="archive-paper-inner">
                  <div className="archive-masthead-wrap">
                    <div className="archive-masthead">Derry Journey</div>
                  </div>

                  <h2 className="archive-card-title">{item.title}</h2>

                  <p className="archive-card-summary">{item.summary}</p>
                </div>
              </div>

              <div className="archive-card-footer">
                <div className="archive-date-stamp">{item.date}</div>

                <div className="archive-card-actions">
                  <a href={item.pdf} className="archive-pdf-button" target="_blank" rel="noreferrer">
                    View PDF
                  </a>
                  <button className="archive-share-button" type="button">
                    Share
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