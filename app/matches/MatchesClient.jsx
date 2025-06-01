'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link' // Import Link for navigation

export default function MatchesClient({ matches, error }) {

  if (error) {
    return <div className="text-center text-red-500 mt-10 p-4">Error: {error}</div>;
  }

  if (!matches || matches.length === 0) {
    return (
        <div className="text-center text-gray-500 mt-10 p-4">
            <p className="text-xl mb-4 text-black">No matches yet. Keep swiping!</p>
            <Link href="/swipe" className="text-black hover:bg-[#ffff00] py-2 px-4 border border-black text-lg">
                Go Swiping
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen bg-white">
      <h1 className="text-5xl mt-10 mb-8 text-center text-black italic">Ur Scrollmates xx</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {matches.map((match) => (
          <div key={match.id} className="flex flex-col border-2 border-dashed border-[#ff00ff] h-96">
            <div className="p-2 text-left flex-shrink-0">
              <h2 className="text-lg text-[#ff00ff]">{match.full_name}</h2>
              {match.instagram_handle && (
                <a
                  href={`https://instagram.com/${match.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-black hover:bg-[#ffff00] break-all block mt-1"
                >
                  @{match.instagram_handle}
                </a>
              )}
            </div>
            <div className="relative w-full flex-grow">
                <Image
                  src={match.explore_screenshot_url || '/placeholder.png'}
                  alt={match.full_name || 'Match'}
                  fill
                  style={{ objectFit: 'cover' }}
                  className=""
                  onError={(e) => console.error("Match image load error:", e.target.src)}
                />
            </div>
          </div>
        ))}
      </div>
        <div className="text-center mt-12 mb-6">
            <Link href="/swipe" className="text-black hover:bg-[#ffff00] py-2 px-4 italic text-lg">
                back 2 swiping
            </Link>
        </div>
    </div>
  );
} 