'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSwipeable } from 'react-swipeable'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image' // Ensure Image is imported
import Link from 'next/link' // Import Link

// Placeholder for Card component - we'll define this later
const ProfileCard = ({ profile }) => {
  if (!profile) return <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-800 border-2 border-dashed border-[#ff00ff]">No more profiles</div>;

  return (
    <div className="w-full h-full bg-white overflow-hidden flex flex-col border-2 border-dashed border-[#ff00ff]">
      <div className="p-2 text-left flex-shrink-0">
        <h3 className="text-lg text-[#ff00ff]">{profile.full_name}, {profile.age}</h3>
      </div>
      <img src={profile.explore_screenshot_url || '/placeholder.png'} alt={profile.full_name || 'Profile'} className="w-full object-cover flex-grow" />
    </div>
  );
};

// Updated Match Notification Component
const MatchNotification = ({ onDismiss, matchedProfile }) => {
  // Generate styles for hearts once, or when component mounts if preferred
  // For simplicity here, generating inline, but useMemo could optimize if needed
  const numHearts = 50; // Number of hearts for the background
  const heartStyles = Array.from({ length: numHearts }).map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    fontSize: `${Math.random() * 3 + 1}rem`, // e.g., 1rem to 4rem
    color: ['#ff00ff', '#ffc3ff', '#000000'][Math.floor(Math.random() * 3)],
    transform: `rotate(${Math.random() * 90 - 45}deg)`,
    zIndex: 10, // Ensure hearts are behind the card content but above page
  }));

  return (
    <div
      className="absolute inset-0 flex flex-col justify-center items-center z-20 cursor-pointer p-4"
      onClick={onDismiss}
      // No specific background here, hearts will fill it. Or a very light base if needed.
    >
      {/* Background Hearts Layer */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {heartStyles.map((style, i) => (
          <span
            key={i}
            className="absolute pointer-events-none"
            style={style}
          >
            &lt;3
          </span>
        ))}
      </div>

      {/* Yellow Notification Card - sits above the hearts */}
      <div className="relative bg-[#ffff00] p-6 md:p-20 rounded-md text-center z-30 max-w-md w-full">
        <h2 className="text-4xl md:text-5xl font-bold text-[#ff00ff] mb-4 animate-pulse">You've got Rithm!</h2>
        {matchedProfile && (
            <div className="mb-4">
                <p className="text-lg text-black/80 italic">continue the conversation on IG</p>
                <p className="text-2xl text-[#ff00ff]">
                    with 
                    <a 
                        href={`https://instagram.com/${matchedProfile.instagram_handle}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} 
                        className="font-semibold text-blue-600 hover:text-blue-500 ml-1"
                    >
                        @{matchedProfile.instagram_handle}
                    </a>
                </p>
            </div>
        )}
        <p className="text-xs text-gray-800/50">(Click anywhere to continue swiping)</p>
      </div>
    </div>
  );
};

export default function SwipeFeed({ user }) {
  const supabase = createClient();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [matchOccurred, setMatchOccurred] = useState(false); 
  const [matchedProfileInfo, setMatchedProfileInfo] = useState(null);
  const [showHeartConfetti, setShowHeartConfetti] = useState(false);
  const [flashPageRed, setFlashPageRed] = useState(false); // State for red flash

  const fetchCurrentUserProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, gender, dating_preference') // Added full_name
        .eq('id', user.id)
        .single();

      if (profileError) {
        // Handle case where profile might not exist yet
        if (profileError.code === 'PGRST116') { // PGRST116 = "requested range not satisfiable"
             setError('Please complete your profile first.');
             return null;
        } else {
            throw profileError;
        }
      }
       if (!data?.full_name || !data?.gender || !data?.dating_preference) { // Check full_name too
           setError('Please ensure your profile (including name, gender, and preferences) is complete.');
           return null;
       }
      setCurrentUserProfile(data);
      return data;
    } catch (err) {
      console.error("Error fetching current user profile:", err);
      setError('Could not load your profile data.');
      return null;
    }
  }, [user, supabase]);

  // Fetch potential match profiles based on preferences
  const fetchProfiles = useCallback(async (currentUserData) => {
    if (!user || !currentUserData) {
        setLoading(false); // Ensure loading stops if no user data
        return;
    }

    setLoading(true);
    setError(null); // Clear previous errors

    const { gender: currentUserGender, dating_preference: currentUserPrefsString } = currentUserData;
    const currentUserPreferences = currentUserPrefsString ? currentUserPrefsString.split(',') : [];

    if (currentUserPreferences.length === 0) {
        setError("Please set your dating preferences in your profile.");
        setLoading(false);
        return;
    }

    try {
      // 1. Get IDs the user has already swiped on
      const { data: swipedIdsData, error: swipedIdsError } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      if (swipedIdsError) throw swipedIdsError;

      const swipedIds = swipedIdsData.map(s => s.swiped_id);
      const idsToExclude = [user.id, ...swipedIds];

      // 2. Build the query to fetch profiles based on preferences
      let query = supabase
        .from('profiles')
        .select('id, full_name, age, explore_screenshot_url, gender, dating_preference') // Include gender and prefs for potential filtering/display
        .not('id', 'in', `(${idsToExclude.join(',')})`)
        // Filter 1: Potential match's gender must be in current user's preferences
        .in('gender', currentUserPreferences)
        // Filter 2: Potential match's preferences must include current user's gender
        // Use OR conditions to check comma-separated string
        .or(`dating_preference.eq.${currentUserGender},dating_preference.like.%${currentUserGender}%,dating_preference.like.${currentUserGender}%,dating_preference.like.%${currentUserGender}`)
        .limit(10);

      const { data: profilesData, error: profilesError } = await query;

      if (profilesError) throw profilesError;

      console.log("Fetched Profiles:", profilesData);
      setProfiles(profilesData || []);
      setCurrentIndex(0);

    } catch (err) {
      console.error("Error fetching profiles:", err);
      setError('Failed to load profiles. Please try again later.');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  // Effect to fetch current user profile and then potential matches
  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        const profileData = await fetchCurrentUserProfile();
        if (profileData) {
            await fetchProfiles(profileData);
        }
         // If profileData is null, fetchCurrentUserProfile already set an error and setLoading(false)
         // or fetchProfiles will handle the null case and set loading false.
         // But ensure loading is false if profile fetching failed early.
         else {
            setLoading(false);
         }
    };
    loadData();
  }, [fetchCurrentUserProfile, fetchProfiles]);

  const handleSwipe = async (liked, swipedProfileId) => {
    // Initial guards for critical data and existing match popup
    if (!user || !swipedProfileId || !currentUserProfile || !currentUserProfile.full_name) {
      console.warn("SwipeFeed: Missing critical data for swipe. User:", !!user, "swipedProfileId:", !!swipedProfileId, "currentUserProfile:", !!currentUserProfile, "currentUserProfile.name:", !!currentUserProfile?.full_name);
      return;
    }
    if (matchOccurred) {
      console.log("SwipeFeed: Swipe attempt while match notification is active.");
      return;
    }

    try {
      // Insert the swipe record into the database
      const { error: swipeError } = await supabase.from('swipes').insert({
        swiper_id: user.id,
        swiped_id: swipedProfileId,
        liked: liked,
      });

      if (swipeError) {
        console.error("SwipeFeed: Error saving swipe:", swipeError);
        setError('Could not save swipe.');
        // Do not change index if DB operation failed
        return;
      }

      console.log(`SwipeFeed: Swiped ${liked ? 'right (like)' : 'left (pass)'} on ${swipedProfileId}`);

      // Logic after successful swipe recording
      if (liked) {
        // --- MATCH DETECTION --- (This is for 'like' swipes)
        const { data: matchData, error: matchError } = await supabase
          .from('swipes')
          .select('id')
          .eq('swiper_id', swipedProfileId) // The other person...
          .eq('swiped_id', user.id)     // ...swiped on the current user...
          .eq('liked', true)              // ...and liked them.
          .maybeSingle();

        if (matchError) {
          console.error("SwipeFeed: Error checking for match:", matchError);
          // It was a 'like' but an error occurred checking for a match.
          // Still advance to the next card.
          setCurrentIndex(prevIndex => prevIndex + 1);
        } else if (matchData) {
          // MATCH FOUND!
          console.log("SwipeFeed: MATCH DETECTED! Fetching profile info...");
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, instagram_handle')
            .eq('id', swipedProfileId)
            .single();
            
          if (profileError) {
            console.error("SwipeFeed: Error fetching matched profile info:", profileError);
            setMatchedProfileInfo(null); 
          } else {
            setMatchedProfileInfo(profileData);
            // Send notification email
            if (currentUserProfile?.full_name && profileData?.full_name) {
              fetch('/api/notify-match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  currentUser: { id: user.id, name: currentUserProfile.full_name },
                  matchedUser: { id: swipedProfileId, name: profileData.full_name }
                })
              })
              .then(async res => {
                if (!res.ok) {
                  const errorPayload = await res.json();
                  console.error('Match notification API error:', res.status, errorPayload);
                } else {
                  console.log('Match notification email request sent successfully.');
                }
              })
              .catch(err => {
                console.error('Failed to send match notification request:', err);
              });
            }
          }
          setMatchOccurred(true);
          // Important: DO NOT call setCurrentIndex here. 
          // It will be called when the match notification is dismissed.
          // Trigger confetti on like
          setShowHeartConfetti(true);
          setTimeout(() => setShowHeartConfetti(false), 1500); // Reset after 1.5s
          return; 
        } else {
          // Liked, but no mutual match found yet. Advance to the next card.
          console.log("SwipeFeed: Liked, but no mutual match yet.");
          setCurrentIndex(prevIndex => prevIndex + 1);
        }
        // Trigger confetti on like
        setShowHeartConfetti(true);
        setTimeout(() => setShowHeartConfetti(false), 1500); // Reset after 1.5s

      } else {
        // Not liked (it was a "pass" swipe). Swipe was successful. Advance to the next card.
        console.log("SwipeFeed: Passed.");
        setCurrentIndex(prevIndex => prevIndex + 1);
        // Trigger red flash on pass
        setFlashPageRed(true);
        setTimeout(() => setFlashPageRed(false), 150); // Flash for 150ms
      }

      // Proactively fetch more profiles if nearing the end of the current list
      // This check should ideally use the index value *after* it has been updated.
      // However, since setCurrentIndex is async, `currentIndex` here might be the old value.
      // A more robust way could be to pass the nextIndex to fetchProfiles if needed,
      // or rely on useEffect to fetch when profiles array is empty or short.
      // For simplicity and given current structure, this might be okay if fetchProfiles appends.
      if (currentIndex + 1 >= profiles.length - 2 && profiles.length > 0 && !matchOccurred) {
         console.log("SwipeFeed: Approaching end of profiles list, fetching more.");
         if(currentUserProfile) {
             fetchProfiles(currentUserProfile); // Assuming this appends and doesn't reset index.
         }
      }

    } catch (err) {
      console.error("SwipeFeed: General error during swipe handling:", err);
      setError('An error occurred while swiping.');
    }
  };

  // Dismiss the match notification and advance to the next card
  const dismissMatchNotification = () => {
      setMatchOccurred(false);
      setMatchedProfileInfo(null); // Clear matched profile info
      setCurrentIndex(prevIndex => prevIndex + 1); // Now advance index
       // Fetch more profiles if needed after dismissing
       if (currentIndex >= profiles.length - 3 && currentUserProfile) {
           console.log("Fetching more profiles after match dismissal...");
           fetchProfiles(currentUserProfile);
       }
  }

  // Configure react-swipeable
  const handlers = useSwipeable({
    // Prevent swipe if match popup is showing
    onSwipeStart: (eventData) => matchOccurred,
    onSwipedLeft: (eventData) => {
       if (!matchOccurred && currentIndex < profiles.length) {
        handleSwipe(false, profiles[currentIndex].id);
       }
    },
    onSwipedRight: (eventData) => {
       if (!matchOccurred && currentIndex < profiles.length) {
        handleSwipe(true, profiles[currentIndex].id);
       }
    },
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  if (loading && profiles.length === 0 && !error) { // Show loading only initially or if error clears
    return <div className="flex justify-center items-center h-screen">Loading profiles...</div>;
  }

  if (error) {
     return (
        <div className="flex flex-col justify-center items-center h-screen text-red-500 bg-white p-4">
            <p>{error}</p>
            <a href="/account" className="mt-2 text-indigo-600 hover:text-indigo-800">Go to Profile</a> 
        </div>
     );
  }

  // Main return logic with Match Notification
  return (
    // Conditionally apply red background for flash effect
    <div className={`relative flex flex-col items-center justify-center min-h-screen ${flashPageRed ? 'bg-[#ff0000]' : 'bg-white'} overflow-y-auto p-4 md:p-6`}>

      {/* Header Text: Positioned absolutely */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-30">
        <Link href="/matches">
          <span className="italic text-black hover:bg-[#ffff00] cursor-pointer text-2xl font-bold">
            matches
          </span>
        </Link>
      </div>
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30">
        <Link href="/account">
          <span className="italic text-black hover:bg-[#ffff00] cursor-pointer text-2xl font-bold">
            me
          </span>
        </Link>
      </div>

      {/* Swipeable Content Area: Added touch-none here */}
      <div {...handlers} className="flex flex-col md:flex-row items-center md:justify-center md:gap-x-16 touch-none"> 
        
        {/* Desktop Pass Button (Visible on MD screens and up) */}
        <button
            onClick={() => {
              if (!matchOccurred && currentIndex < profiles.length) {
                handleSwipe(false, profiles[currentIndex].id);
              }
            }}
            disabled={matchOccurred || currentIndex >= profiles.length}
            className="group hidden md:flex bg-transparent border-2 border-dashed border-[#ff00ff] text-[#ff00ff] rounded-full w-32 h-32 items-center justify-center text-3xl disabled:opacity-50 hover:bg-red-500 hover:text-white hover:border-red-500 focus:outline-none" /* Increased size to w-32 h-32, removed font-bold */
            aria-label="Pass Desktop"
          >
            <span className="group-hover:text-white">X</span>
        </button>

        {/* Profile Card and Match Notification Container - Sized for mobile and desktop */}
        <div className="relative w-64 h-96 md:w-96 md:h-[576px]"> {/* Responsive sizing */}
          {/* Conditional Match Notification - pass matched info */} 
          {matchOccurred && <MatchNotification onDismiss={dismissMatchNotification} matchedProfile={matchedProfileInfo} />}
          
          {/* Render the stack of cards - ensure it's below the notification if visible */}
          <div className={`${matchOccurred ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 w-full h-full`}>
              {currentIndex < profiles.length ? (
                 <ProfileCard profile={profiles[currentIndex]} />
              ) : (
                 <ProfileCard profile={null} /> // Show "No more profiles" card
              )}
          </div>
        </div>

        {/* Desktop Like Button (Visible on MD screens and up) */}
        <button
            onClick={() => {
               if (!matchOccurred && currentIndex < profiles.length) {
                handleSwipe(true, profiles[currentIndex].id);
               }
            }}
            disabled={matchOccurred || currentIndex >= profiles.length}
            className="group hidden md:flex relative bg-transparent border-2 border-dashed border-[#ff00ff] text-[#ff00ff] rounded-full w-32 h-32 items-center justify-center text-2xl disabled:opacity-50 hover:bg-green-500 hover:text-white hover:border-green-500 focus:outline-none" /* Increased size to w-32 h-32, removed font-bold, added relative */
            aria-label="Like Desktop"
          >
            <span className="group-hover:text-white">&lt;3</span>
            {showHeartConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span
                    key={i}
                    className={`absolute top-1/2 left-1/2 text-3xl ${i % 2 === 0 ? 'text-black' : 'text-[#ff00ff]'} heart-particle-${i + 1}`}
                    style={{ transform: 'translate(-50%, -50%)' }} // Initial position
                  >
                    &lt;3
                  </span>
                ))}
              </div>
            )}
        </button>

        {/* Mobile Action Buttons - directly below the card, part of the swipeable/centered block, hidden on MD up */}
        <div className="flex justify-around items-center w-full max-w-xs mt-8 md:hidden"> 
          <button
            onClick={() => {
              if (!matchOccurred && currentIndex < profiles.length) {
                handleSwipe(false, profiles[currentIndex].id);
              }
            }}
            disabled={matchOccurred || currentIndex >= profiles.length}
            className="group bg-transparent border-2 border-dashed border-[#ff00ff] text-[#ff00ff] rounded-full w-20 h-20 flex items-center justify-center text-3xl disabled:opacity-50 hover:bg-red-500 hover:text-white hover:border-red-500 focus:outline-none"
            aria-label="Pass"
          >
            <span className="group-hover:text-white">X</span>
          </button>
          <button
            onClick={() => {
               if (!matchOccurred && currentIndex < profiles.length) {
                handleSwipe(true, profiles[currentIndex].id);
               }
            }}
            disabled={matchOccurred || currentIndex >= profiles.length}
            className="group relative bg-transparent border-2 border-dashed border-[#ff00ff] text-[#ff00ff] rounded-full w-20 h-20 flex items-center justify-center text-2xl disabled:opacity-50 hover:bg-green-500 hover:text-white hover:border-green-500 focus:outline-none" /* Added relative */
            aria-label="Like"
          >
            <span className="group-hover:text-white">&lt;3</span>
            {showHeartConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 5 }).map((_, i) => ( // 5 particles for mobile
                  <span
                    key={i}
                    className={`absolute top-1/2 left-1/2 text-3xl ${i % 2 === 0 ? 'text-black' : 'text-[#ff00ff]'} heart-particle-mobile-${i + 1}`}
                    style={{ transform: 'translate(-50%, -50%)' }}
                  >
                    &lt;3
                  </span>
                ))}
              </div>
            )}
          </button>
        </div> 
      </div>

      {/* Footer Text: Positioned absolutely */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:bottom-6 z-30">
        <span className="italic text-black hover:bg-[#ffff00] cursor-pointer text-sm">
          about Rithm.love
        </span>
      </div>
      
      {/* JSX Styles for Heart Confetti Animation */}
      <style jsx>{`
        @keyframes heartSwarm1 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-100px, -120px) scale(1.5) rotate(-15deg); opacity: 0; }
        }
        .heart-particle-1, .heart-particle-mobile-1 {
          animation: heartSwarm1 1s ease-out forwards;
        }

        @keyframes heartSwarm2 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(80px, -100px) scale(1.3) rotate(10deg); opacity: 0; }
        }
        .heart-particle-2, .heart-particle-mobile-2 {
          animation: heartSwarm2 1s ease-out 0.1s forwards; /* Stagger start */
        }

        @keyframes heartSwarm3 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-70px, 90px) scale(1.6) rotate(25deg); opacity: 0; }
        }
        .heart-particle-3, .heart-particle-mobile-3 {
          animation: heartSwarm3 1s ease-out 0.2s forwards;
        }

        @keyframes heartSwarm4 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(110px, 50px) scale(1.2) rotate(-20deg); opacity: 0; }
        }
        .heart-particle-4, .heart-particle-mobile-4 {
          animation: heartSwarm4 1s ease-out 0.05s forwards;
        }

        @keyframes heartSwarm5 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(0px, -130px) scale(1.4) rotate(5deg); opacity: 0; }
        }
        .heart-particle-5, .heart-particle-mobile-5 {
          animation: heartSwarm5 1s ease-out 0.15s forwards;
        }

        /* Extra for desktop if using 7 particles */
        @keyframes heartSwarm6 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-120px, 20px) scale(1.3) rotate(30deg); opacity: 0; }
        }
        .heart-particle-6 {
          animation: heartSwarm6 1s ease-out 0.25s forwards;
        }

        @keyframes heartSwarm7 {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(90px, 100px) scale(1.5) rotate(-35deg); opacity: 0; }
        }
        .heart-particle-7 {
          animation: heartSwarm7 1s ease-out 0.3s forwards;
        }
      `}</style>
    </div>
  );
}

// Note: We need a page component to actually use this SwipeFeed.
// e.g., app/swipe/page.jsx 