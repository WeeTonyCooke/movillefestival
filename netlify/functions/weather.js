export async function handler() {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=55.19&longitude=-7.04&current_weather=true"
    );

    const data = await res.json();
    const temp = Math.round(data.current_weather.temperature);

    return {
      statusCode: 200,
      body: JSON.stringify({ temp }),
    };
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({ temp: null }),
    };
  }
}