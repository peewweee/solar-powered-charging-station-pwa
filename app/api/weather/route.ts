import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const city = 'Manila'; // you can make this dynamic later
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message }, { status: res.status });
    }

    return NextResponse.json({
      city: data.name,
      temperature: data.main.temp,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
