import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'rithm.love - find your scrollmate';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 200, // Adjusted for a large emoji
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'black', // Emoji color will be its own
        }}
      >
        🩷
      </div>
    ),
    {
      ...size,
    }
  );
} 