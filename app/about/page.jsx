import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          
          {/* Left Column */}
          <div className="w-full md:w-1/2 flex flex-col space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold italic text-black">abt Rithm...</h1>
            <div className="space-y-1 text-black text-lg">
              <p>placeholder text</p>
              <p>placeholder text</p>
              <p>placeholder text</p>
              <p>placeholder text</p>
              <p>placeholder text</p>
              <p>placeholder text</p>
              <p>placeholder text</p>
              <p>placeholder text</p>
            </div>
            <div className="mt-auto pt-10"> {/* Pushes link to bottom if content above is short */}
              <Link href="#"> {/* Placeholder link */}
                <span className="inline-block bg-[#ffff00] text-black py-2 px-4 text-lg font-medium">
                  more from www.tina.zone
                </span>
              </Link>
            </div>
          </div>

          {/* Right Column (Image Card) */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start">
            <div className="w-64 h-96 bg-white flex flex-col border border-dashed border-[#ff00ff]">
              <div className="p-2 text-left flex-shrink-0">
                <h3 className="text-lg text-[#ff00ff]">me, 23</h3>
              </div>
              <div className="relative w-full flex-grow bg-gray-200"> {/* Added bg-gray-200 for image loading */}
                <img 
                  src="/myFYP.jpeg" 
                  alt="My FYP Screenshot" 
                  className="w-full h-full object-cover" // Ensure image covers the area
                />
              </div>
            </div>
            <p className="text-xs text-black mt-20 text-center md:text-left">explore page at the time of deployment ^</p>
          </div>

        </div>
      </div>
    </div>
  );
} 