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
              <p style={{ backgroundColor: 'yellow' }}>mark zuckerberg knows you better than your mother.</p> 
              <p>he's watched your every move on instagram for years.</p>
              <p>he knows what you like, what you don't like, and what you're looking for.</p>
              <br></br>
              <p>this algorithm has made you conscious of hip dips, disrupted governments, made millionaires overnight.</p>
              <p> <strong> what if we repurposed it for love?</strong></p>
              <br></br>
              <p>your explore page is a mirror of your digital microinteractions. it's more honest than any dating profile you've ever written.</p>
              <p>other dating apps make you perform. curate. lie about loving hiking.</p>
              <p>your algorithm already knows who you'd swipe right on.</p>
              <p>rithm.love: screenshot your explore page. find your scrollmate. no bios. no prompts. just pure digital pheromones.</p>
            </div>
            {/* Sign Up Now Button */}
            <div className="mt-6"> {/* Spacing for the new button */}
                <Link href="/signup-steps">
                    <span className="inline-block py-2 px-4 italic border border-dashed border-[#ff00ff] text-[#ff00ff] bg-white hover:bg-[#ffff00] hover:border-black hover:text-black text-lg cursor-pointer">
                        sign up for Rithm
                    </span>
                </Link>
            </div>
            <div className="mt-auto pt-10"> {/* Pushes link to bottom if content above is short */}
              <Link href="https://tina.zone" target="_blank" rel="noopener noreferrer"> {/* Updated link and added hover */}
                <span className="inline-block text-blue-700 text-lg font-medium hover:underline">
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