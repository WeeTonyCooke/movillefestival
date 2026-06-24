/**
 * netlify/functions/weather.js
 * Returns a 6-day festival forecast for Moville (8-12 July 2026 + Tue 7)
 * using the Open-Meteo free API — no API key required.
 *
 * Uses forecast_days=16 to get the full 16-day window, then filters
 * to the festival dates (2026-07-07 through 2026-07-12).
 *
 * Response shape:
 * {
 *   forecast: {
 *     TUE: { high: 17, low: 11, code: 2, description: "Partly cloudy", emoji: "⛅", rain: 20, wind: 18 },
 *     WED: { ... },
 *     ...
 *   }
 * }
 */

function describeCode(code) {
  if (code === 0)                 return 'Clear skies';
  if (code <= 2)                  return 'Partly cloudy';
  if (code === 3)                 return 'Overcast';
  if (code <= 49)                 return 'Foggy';
  if (code <= 55)                 return 'Light drizzle';
  if (code <= 57)                 return 'Freezing drizzle';
  if (code <= 61)                 return 'Light rain';
  if (code <= 63)                 return 'Moderate rain';
  if (code <= 65)                 return 'Heavy rain';
  if (code <= 67)                 return 'Freezing rain';
  if (code <= 71)                 return 'Light snow';
  if (code <= 73)                 return 'Moderate snow';
  if (code <= 77)                 return 'Heavy snow';
  if (code <= 81)                 return 'Light showers';
  if (code <= 82)                 return 'Heavy showers';
  if (code === 85 || code === 86) return 'Snow showers';
  if (code === 95)                return 'Thunderstorm';
  if (code >= 96)                 return 'Thunderstorm with hail';
  return 'Variable';
}

function emojiForCode(code) {
  if (code === 0)                 return '☀️';
  if (code <= 2)                  return '⛅';
  if (code === 3)                 return '☁️';
  if (code <= 49)                 return '🌫️';
  if (code <= 67)                 return '🌧️';
  if (code <= 77)                 return '❄️';
  if (code <= 82)                 return '🌦️';
  if (code <= 86)                 return '🌨️';
  return '⛈️';
}

// Festival dates → day key
const FESTIVAL_DATES = {
  '2026-07-07': 'TUE',
  '2026-07-08': 'WED',
  '2026-07-09': 'THU',
  '2026-07-10': 'FRI',
  '2026-07-11': 'SAT',
  '2026-07-12': 'SUN',
};

exports.handler = async function () {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=1800',
  };

  try {
    // Request 16 days from today — Open-Meteo filters by date internally
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=55.1858' +
      '&longitude=-7.0397' +
      '&daily=weathercode,temperature_2m_max,temperature_2m_min,' +
      'precipitation_probability_max,windspeed_10m_max' +
      '&timezone=Europe%2FDublin' +
      '&forecast_days=16';

    const res = await fetch(url);
    if (!res.ok) {
      return { statusCode: 200, headers, body: JSON.stringify({ forecast: null }) };
    }

    const data = await res.json();
    const forecast = {};

    (data.daily?.time || []).forEach((date, i) => {
      const key = FESTIVAL_DATES[date];
      if (!key) return; // skip non-festival dates
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

    // If no festival dates matched (too far out), return null gracefully
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        forecast: Object.keys(forecast).length > 0 ? forecast : null,
      }),
    };

  } catch (err) {
    console.error('Weather function error:', err);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ forecast: null }),
    };
  }
};
