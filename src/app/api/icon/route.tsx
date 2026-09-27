import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get('size');
  const size = sizeParam ? parseInt(sizeParam) : 512;

  // Render the Moon icon with a dark background to match the theme
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#110e1f',
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="#c89aff"
          style={{ width: size * 0.7, height: size * 0.7 }}
        >
          <path d="M14 2c1.82 0 3.53.5 5 1.35-2.99 1.73-5 4.95-5 8.65s2.01 6.92 5 8.65C17.53 21.5 15.82 22 14 22 8.48 22 4 17.52 4 12S8.48 2 14 2z"/>
        </svg>
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}
