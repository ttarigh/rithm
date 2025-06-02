'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const onLandMobileVideoRef = useRef(null);
  const onLandDesktopVideoRef = useRef(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const mobileVideo = onLandMobileVideoRef.current;
    const desktopVideo = onLandDesktopVideoRef.current;

    if (isMobile && mobileVideo) {
      mobileVideo.muted = true;
      mobileVideo.play().catch(error => {
        console.error("Autoplay prevented for onLand mobile video:", error);
      });
    } else if (!isMobile && desktopVideo) {
      desktopVideo.muted = true;
      desktopVideo.play().catch(error => {
        console.error("Autoplay prevented for onLand desktop video:", error);
      });
    }
  }, [isMobile]);

  return (
    <div className="relative flex flex-col items-center justify-start h-screen w-full overflow-hidden" style={{ outline: 'none' }}>
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {/* --- Mobile Videos --- */}
        <div className="block sm:hidden w-full h-full">
          <video
            ref={onLandMobileVideoRef}
            key="/onLandMobile.mp4"
            className="w-full h-full object-cover -translate-y-[18%] scale-80"
            src="/onLandMobile.mp4"
            autoPlay
            muted
            playsInline
            loop
          />
        </div>

        {/* --- Desktop Videos --- */}
        <div className="hidden sm:block w-full h-full">
          <video
            ref={onLandDesktopVideoRef}
            key="/onLandDesktop.mp4"
            className="w-full h-full object-cover sm:translate-y-0 scale-80"
            src="/onLandDesktop.mp4"
            autoPlay
            muted
            playsInline
            loop
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start text-center p-4 sm:p-6 md:p-8 gap-2 sm:gap-6 pt-4 sm:pt-8 md:pt-8 font-sans w-full flex-grow">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight">
          <span className="text-[#ffc3ff]">www.</span>
          <span className="text-[#ff00ff]">rithm</span>
          <span className="text-[#ffc3ff]">.love</span>
        </h1>

        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#ff00ff] bg-[#ffff00] italic px-2">
          find your scrollmate
        </p>

        <div className="pt-20 sm:pt-80 flex-grow-0 sm:flex-grow-0"></div>

        <Link href="/login" className="w-full max-w-xs mx-auto">
          <span
            className={`inline-block w-full rounded-full bg-[#ffffff] px-6 py-3 sm:px-8 sm:py-4 text-xl sm:text-2xl md:text-3xl font-semibold text-[#ff00ff] hover:bg-[#ff00ff] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer ${
              !isButtonHovered ? (isMobile ? 'animate-fun-text-flash' : 'animate-fun-yellow-flash') : ''
            }`}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            LOGIN | SIGNUP
          </span>
        </Link>

        <div className="flex-grow"></div>

      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-20 flex justify-center pb-4 bg-white bg-opacity-10 backdrop-blur-sm sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:z-10 sm:bg-transparent sm:backdrop-blur-none sm:pb-6 md:pb-8">
        <Link href="/about">
          <span className="text-lg text-[#ff00ff] underline italic cursor-pointer">
            about
          </span>
        </Link>
      </footer>
      <style jsx>{`
        @keyframes fun-yellow-flash {
          0%, 45%, 100% { background-color: #ffffff; } /* Base white, long pause */
          50%, 60% { background-color: #ffff00; color:rgb(0, 0, 0); }     /* Quick double flash yellow */
          55%, 65% { background-color: #ffffff;}     /* Quick off */
        }
        .animate-fun-yellow-flash {
          animation: fun-yellow-flash 1.5s infinite;
        }
        @keyframes fun-text-flash {
          0%, 45%, 100% { color: #ff00ff; } /* Base pink text */
          50%, 60% { color:rgb(0, 0, 0); }     /* Quick double flash yellow text */
          55%, 65% { color: #ff00ff; }     /* Quick off */
        }
        .animate-fun-text-flash {
          animation: fun-text-flash 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
