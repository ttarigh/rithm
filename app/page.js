'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-start h-screen w-full overflow-hidden" style={{ outline: 'none' }}>
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {/* --- Mobile GIF --- */}
        <div className="block sm:hidden w-full h-full">
          <img
            src="/afterLandMobile.gif"
            alt="Animated background for mobile"
            className="w-full h-full object-cover -translate-y-[10%] scale-80"
          />
        </div>

        {/* --- Desktop GIF --- */}
        <div className="hidden sm:block w-full h-full">
          <img
            src="/afterLandDesktop.gif"
            alt="Animated background for desktop"
            className="w-full h-full object-cover sm:translate-y-[5%] scale-80"
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start text-center p-4 sm:p-6 md:p-8 gap-2 sm:gap-6 pt-4 sm:pt-8 md:pt-8 font-sans w-full flex-grow">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight">
          <span className="text-[#ffc3ff]">find ur </span>
          <span className="text-[#ff00ff]">scrollmate</span>
        </h1>

        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#ff00ff] bg-[#ffff00] italic px-2 mb-4 sm:mb-2">
          www.rithm.love
        </p>

        <Link href="/login" className="block w-fit mx-auto">
          <span
            className="inline-block border-dashed bg-white border-2 border-[#ff00ff] px-6 py-3 sm:px-8 sm:py-4 text-xl sm:text-2xl md:text-3xl text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff00ff] cursor-pointer hover:bg-[#ff00ff] hover:text-white transition-all duration-300"
          >
            <span className="font-light text-sm text-gray-500">🗝₊˚⊹♡ </span>
            login
            <span className="font-light text-sm text-gray-500"> | </span>
            signup
            <span className="font-light text-sm text-gray-500"> ♡⊹𓂃🖊</span>
          </span>
        </Link>

        <div className="flex-grow"></div>

      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-20 flex justify-center pb-4 bg-white bg-opacity-10 backdrop-blur-sm sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:z-10 sm:bg-transparent sm:backdrop-blur-none sm:pb-6 md:pb-8">
        <Link href="/about">
          <span className="text-lg text-[#ff00ff] italic cursor-pointer">
            😵‍💫 about 😲 
          </span>
        </Link>
      </footer>
      <style jsx>{`
      `}</style>
    </div>
  );
}
