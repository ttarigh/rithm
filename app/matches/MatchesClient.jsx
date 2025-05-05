'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link' // Import Link for navigation

export default function MatchesClient({ matches, error }) {

  if (error) {
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  }

  if (!matches || matches.length === 0) {
    return (
        <div className="text-center text-gray-500 mt-10">
            <p>No matches yet. Keep swiping!</p>
            <Link href="/swipe" className="text-blue-500 hover:underline mt-2 inline-block">
                Go Swiping
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Matches</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {matches.map((match) => (
          <div key={match.id} className="bg-white rounded-lg shadow-md overflow-hidden text-gray-900">
            <Image
              src={match.explore_screenshot_url || '/placeholder.png'}
              alt={match.full_name || 'Match'}
              width={200} // Adjust size as needed
              height={280} // Adjust size as needed
              className="w-full h-48 object-cover" // Basic styling
              onError={(e) => console.error("Match image load error:", e.target.src)}
            />
            <div className="p-3">
              <h2 className="text-lg font-semibold mb-1">{match.full_name}</h2>
              <a
                href={`https://instagram.com/${match.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
              >
                @{match.instagram_handle}
              </a>
            </div>
          </div>
        ))}
      </div>
        <div className="text-center mt-8">
            <Link href="/swipe" className="text-blue-500 hover:underline">
                Back to Swiping
            </Link>
        </div>
    </div>
  );
} 