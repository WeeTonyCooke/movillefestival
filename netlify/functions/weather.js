/**
 * netlify/functions/weather.js
 * Returns a 6-day festival forecast for Moville (8–12 July 2026 + Tue 7)
 * using the Open-Meteo free API — no API key required.
 *
 * Response shape:
 * {
 *   forecast: {
 *     TUE: { high: 17, low: 11, code: 2, description: "Partly cloudy", rain: 20, wind: 18 },
 *     WED: { ... },
 *     THU: { ... },
 *     FRI: { ... },
 *     SAT: { ... },
 *     SUN: { ... },
 *   }
 * }
 */

// WMO Weather interpretation codes → plain English
function describeCode(code) {
  if (code === 0)               return 'Clear skies';
  if (code <= 2)                return 'Partly cloudy';
  if (code === 3)               return 'Overcast';
  if (code <= 49)               return 'Foggy';
  if (code <= 55)               return 'Light drizzle';
  if (code <= 57)               return 'Freezing drizzle';
  if (code <= 61)               return 'Light rain';
  if (code <= 63)               return 'Moderate rain';
  if (code <= 65)               return 'Heavy rain';
  if (code <= 67)               return 'Freezing rain';
  if (code <= 71)               return 'Light snow';
  if (code <= 73)               return 'Moderate snow';
  if (code <= 77)               return 'Heavy snow';
  if (code <= 81)               return 'Light showers';
  if (code <= 82)               return 'Heavy showers';
  if (code === 85 || code === 86) return 'Snow showers';
  if (code === 95)              return 'Thunderstorm';
  if (code >= 96)               return 'Thunderstorm with hail';
  return 'Variable';
}

// WMO code → emoji
function emojiForCode(code) {
  if (code === 0)               return '☀️';
  if (code <= 2)                return '⛅';
  if (code === 3)               return '☁️';
  if (code <= 49)               return '🌫️';
  if (code <= 67)               return '🌧️';
  if (code <= 77)               return '❄️';
  if (code <= 82)               return '🌦️';
  if (code <= 86)               return '🌨️';
  return '⛈️';
}

exports.handler = async function () {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=1800', // cache 30 min
  };

  try {
    // Fetch daily forecast for Moville, Co. Donegal
    // Festival runs Tue 7 – Sun 12 July 2026
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=55.1858' +
      '&longitude=-7.0397' +
      '&daily=weathercode,temperature_2m_max,temperature_2m_min,' +
      'precipitation_probability_max,windspeed_10m_max' +
      '&timezone=Europe%2FDublin' +
      '&start_date=2026-07-07' +
      '&end_date=2026-07-12';

    const res = await fetch(url);
    // Open-Meteo returns 400 if dates are out of forecast range (>16 days out)
    // Return empty forecast gracefully — front end shows nothing rather than crashing
    if (!res.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ forecast: null }),
      };
    }
    const data = await res.json();

    const days = ['TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const forecast = {};

    (data.daily?.time || []).forEach((date, i) => {
      const key = days[i];
      if (!key) return;
      const code = data.daily.weathercode[i];
      forecast[key] = {
        high:        Math.round(data.daily.temperature_2m_max[i]),
        low:         Math.round(data.daily.temperature_2m_min[i]),
        code,
        description: describeCode(code),
        emoji:       emojiForCode(code),
        rain:        data.daily.precipitation_probability_max[i] ?? 0,
        wind:        Math.round(data.daily.windspeed_10m_max[i]),
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ forecast }),
    };

  } catch (err) {
    console.error('Weather function error:', err);
    return {
      statusCode: 200, // still 200 — front end handles missing gracefully
      headers,
      body: JSON.stringify({ forecast: null, error: err.message }),
    };
  }
};
