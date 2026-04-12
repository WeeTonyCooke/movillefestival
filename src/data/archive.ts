export interface ArchiveItem {
  id: string;
  title: string;
  date: string;
  source: string;
  decade: string;
  excerpt: string;
  pdf: string;
}

const BASE_URL = 'https://res.cloudinary.com/dwpx6hrud/image/upload/v1775981670/';

export const archiveItems: ArchiveItem[] = [
  {
    id: '1958-a-trip-through-romantic-inishowen',
    title: 'A Trip Through Romantic Inishowen',
    date: '17 October 1958',
    source: 'The Derry Journal',
    decade: '1950s',
    excerpt: 'A feature on the Inishowen peninsula published around the time of the 1958 festival, capturing the region\'s charm.',
    pdf: `${BASE_URL}1958_-_A_Trip_Through_Romantic_Inishowen_eiud0y.pdf`,
  },
  {
    id: '1958-competitors-say-moville-has-everything-festival-report',
    title: 'Competitors Say Moville Has Everything — Festival Report',
    date: '2 September 1958',
    source: 'The Derry Journal',
    decade: '1950s',
    excerpt: 'Archive coverage of the Moville Festival from 1958, preserved from local newspapers.',
    pdf: `${BASE_URL}1958_-_Competitors_Say_Moville_Has_Everything_-_Festival_Report_vj0hgd.pdf`,
  },
  {
    id: '1958-foyle-sea-angling-festival',
    title: 'Foyle Sea Angling Festival',
    date: '7 January 1958',
    source: 'The Derry Journal',
    decade: '1950s',
    excerpt: 'Newspaper coverage of the 1958 sea angling festival in Moville, Co. Donegal — from the local press archives.',
    pdf: `${BASE_URL}1958_-_Foyle_Sea_Angling_Festival_cdnjb7.pdf`,
  },
  {
    id: '1958-gala-dance-moville-festival',
    title: 'Gala Dance — Moville Festival',
    date: '1958',
    source: 'The Derry Journal',
    decade: '1950s',
    excerpt: 'The festival gala in 1958 — an evening of music and dancing to close out another successful week in Moville.',
    pdf: `${BASE_URL}1958_-_Gala_Dance_-_Moville_Festival_unxjaf.pdf`,
  },
  {
    id: '1958-moville-plans-big-sea-angling-event',
    title: 'Moville Plans Big Sea Angling Event',
    date: '1958',
    source: 'The Derry Journal',
    decade: '1950s',
    excerpt: 'Newspaper coverage of the 1958 sea angling festival in Moville, Co. Donegal — from the local press archives.',
    pdf: `${BASE_URL}1958_-_Moville_Plans_Big_Sea_Angling_Event_rcbxzd.pdf`,
  },
  {
    id: '1959-during-lough-foyle-sea-angling-festival-minister-on-economic-importanc',
    title: 'Minister on Economic Importance of the Sea Angling Festival',
    date: '1959',
    source: 'The Derry Journal',
    decade: '1950s',
    excerpt: 'Ministerial attendance at the 1959 festival highlights its standing as one of Ireland\'s premier sea angling events.',
    pdf: `${BASE_URL}1959_-_During_Lough_Foyle_Sea_Angling_Festival_-_Minister_on_Economic_Importanc_ehzvb2.pdf`,
  },
  {
    id: '1960-3rd-international-festival-of-sea-angling-at-moville',
    title: '3rd International Festival of Sea Angling at Moville',
    date: '19 August 1960',
    source: 'The Derry Journal',
    decade: '1960s',
    excerpt: 'Newspaper coverage of the 1960 sea angling festival in Moville, Co. Donegal — from the local press archives.',
    pdf: `${BASE_URL}1960_-_3rd_International_Festival_of_Sea_Angling_at_Moville_s5xgeb.pdf`,
  },
  {
    id: '1961-fourth-sea-angling-festival-gets-under-way',
    title: 'Fourth Sea Angling Festival Gets Under Way',
    date: '22 August 1961',
    source: 'The Derry Journal',
    decade: '1960s',
    excerpt: 'The fourth Sea Angling Festival gets under way in 1961, with competitors and visitors arriving in Moville.',
    pdf: `${BASE_URL}1961_-_Fourth_Sea_Angling_Festival_Gets_Under_Way_xuljxa.pdf`,
  },
  {
    id: '1994-fabulous-finale-to-moville-song-contest',
    title: 'Fabulous Finale to Moville Song Contest',
    date: '26 August 1994',
    source: 'The Derry Journal',
    decade: '1990s',
    excerpt: 'The Moville Song Contest finale — one of the festival\'s most popular and hotly contested events, 1994.',
    pdf: `${BASE_URL}1994_-_Fabulous_Finale_to_Moville_Song_Contest_tgbnl9.pdf`,
  },
  {
    id: '2001-regatta-and-festival-fun-in-moville',
    title: 'Regatta and Festival Fun in Moville',
    date: '3 August 2001',
    source: 'The Derry Journal',
    decade: '2000s',
    excerpt: 'Regatta day on the Foyle — a favourite of the Moville festival week, drawing spectators from across Inishowen.',
    pdf: `${BASE_URL}2001_-_Regatta_and_Festival_Fun_in_Moville_jyryrp.pdf`,
  },
];