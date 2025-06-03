import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Image generation
export default async function Icon() {
  // Font options: You might need to load a font if the emoji isn't rendering well
  // or to ensure consistency. For emojis, system fonts usually work okay.

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 140, // Adjusted for a good fit in 180x180
          background: 'white', // Or 'transparent' if you prefer, but white is safe
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // No specific color needed for emoji, it uses its own color
        }}
      >
        🩷
      </div>
    ),
    {
      ...size,
      // You can embed fonts here if needed, e.g.:
      // fonts: [
      //   {
      //     name: 'Noto Color Emoji',
      //     data: await fetch(
      //       new URL('https://example.com/fonts/NotoColorEmoji.ttf')
      //     ).then((res) => res.arrayBuffer()),
      //     weight: 'normal',
      //     style: 'normal',
      //   },
      // ],
    }
  );
} 