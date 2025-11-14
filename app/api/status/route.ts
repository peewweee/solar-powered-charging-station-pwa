// src/app/api/status/route.ts
import { NextResponse } from 'next/server';

const ESP32_IP = process.env.ESP32_IP_ADDRESS;

export async function GET(request: Request) {
  if (!ESP32_IP) {
    return NextResponse.json(
      { error: 'ESP32 IP address not configured' },
      { status: 500 }
    );
  }

  try {
    // Fetch data from your ESP32
    const espResponse = await fetch(`${ESP32_IP}/status`, {
      cache: 'no-store', // Crucial for real-time data
    });

    if (!espResponse.ok) {
      throw new Error(`Failed to fetch from ESP32: ${espResponse.statusText}`);
    }
    
    const data = await espResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to connect to the charging station' },
      { status: 502 }
    );
  }
}