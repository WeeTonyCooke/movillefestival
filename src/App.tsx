import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HoldingPage from './pages/HoldingPage';
import ProgrammePage from './pages/ProgrammePage';

const PAGES = {
  programme: {
    title: 'Programme',
    paragraphs: [
      'The full festival programme will be announced shortly — with lots more events still to be added.',
      'Events will take place across Moville from 8–12 July, including music, community events, local food, street entertainment and more, spread across the town throughout the weekend.',
      'Please check back soon for the full schedule.',
    ],
  },
  accommodation: {
    title: 'Accommodation',
    paragraphs: [
      'Visitors travelling to Moville for the festival are encouraged to book accommodation early.',
      'Details of local hotels, guesthouses and nearby options will be added shortly.',
    ],
  },
  'getting-here': {
    title: 'Getting Here',
    paragraphs: [
      'Moville is located on the Inishowen Peninsula in County Donegal, on the western shore of Lough Foyle — about 25 minutes from Derry city centre.',
      'By car from Derry / Londonderry: Cross the border into Donegal and follow the R238 along the Foyle shore. The drive takes around 25–30 minutes and is straightforward.',
      'By car from Dublin: Moville is approximately 3.5 to 4 hours from Dublin via the M1 motorway and onward through Monaghan or via Derry.',
      'By car from Belfast: Allow around 2 hours via the A6 to Derry, then onward to Moville.',
      'The Foyle Ferry: A seasonal ferry service runs between Magilligan Point in Co. Derry and Greencastle, just 10 minutes south of Moville. This is one of the most scenic ways to arrive — crossing Lough Foyle takes around 20 minutes and avoids the Derry city route entirely. Check current timetables before travel.',
      'City of Derry Airport (Eglinton): The airport is located just 30 minutes from Moville and has direct routes from London Heathrow, London Stansted, Manchester, Glasgow and Edinburgh. Car hire is available at the airport, and taxis can be arranged into Donegal.',
      'The Wild Atlantic Way: Moville sits on the northern reaches of the Wild Atlantic Way. Travelling up the Inishowen Peninsula from Buncrana or Malin Head makes for a stunning approach to the festival.',
      'Travel information and local transport links will be updated here as more details are confirmed.',
    ],
  },
  food: {
    title: 'Food & Pop-Ups',
    paragraphs: [
      'Local food vendors, cafés, restaurants and pop-up stalls will be part of the festival weekend.',
      'More information will be announced soon.',
    ],
  },
  updates: {
    title: 'Festival Updates',
    paragraphs: [
      'This page will be updated as more festival details are confirmed.',
      'Please check back regularly for the latest information.',
    ],
  },
} as const;

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/programme" element={
        <HoldingPage title={PAGES.programme.title} paragraphs={[...PAGES.programme.paragraphs]} />
      } />
      <Route path="/accommodation" element={
        <HoldingPage title={PAGES.accommodation.title} paragraphs={[...PAGES.accommodation.paragraphs]} />
      } />
      <Route path="/getting-here" element={
        <HoldingPage title={PAGES['getting-here'].title} paragraphs={[...PAGES['getting-here'].paragraphs]} />
      } />
      <Route path="/food" element={
        <HoldingPage title={PAGES.food.title} paragraphs={[...PAGES.food.paragraphs]} />
      } />
      <Route path="/updates" element={
        <HoldingPage title={PAGES.updates.title} paragraphs={[...PAGES.updates.paragraphs]} />
      } />

      {/* Full programme page preserved for when content is ready */}
      <Route path="/programme-full" element={<ProgrammePage />} />
    </Routes>
  );
}

export default App;