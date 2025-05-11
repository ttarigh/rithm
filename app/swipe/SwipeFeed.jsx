'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSwipeable } from 'react-swipeable'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image' // Ensure Image is imported
import Link from 'next/link' // Import Link

// Placeholder for Card component - we'll define this later
const ProfileCard = ({ profile }) => {
  if (!profile) return <div className="w-64 h-96 bg-gray-200 rounded-lg shadow-md flex items-center justify-center text-gray-800">No more profiles</div>;

  return (
    <div className="absolute w-64 h-96 bg-white rounded-lg shadow-md overflow-hidden">
      <img src={profile.explore_screenshot_url || '/placeholder.png'} alt={profile.full_name || 'Profile'} className="w-full h-4/5 object-cover" />
      <div className="p-2 text-gray-900"> {/* Ensure text color contrast */}
        <h3 className="font-bold text-lg">{profile.full_name}, {profile.age}</h3>
      </div>
    </div>
  );
};

// Updated Match Notification Component
const MatchNotification = ({ onDismiss, matchedProfile }) => (
  <div
    className="absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-10 cursor-pointer rounded-lg p-4 text-center"
    onClick={onDismiss}
  >
    <h2 className="text-4xl font-bold text-white mb-4 animate-pulse">You got Rithm!</h2>
    {matchedProfile && (
        <div className="mb-4">
            <p className="text-xl text-white">You matched with {matchedProfile.full_name || 'someone'}!</p>
            <p className="text-lg text-gray-300 mt-2">
                Their Instagram: 
                <a 
                    href={`https://instagram.com/${matchedProfile.instagram_handle}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} // Prevent closing popup when clicking link
                    className="font-semibold text-blue-400 hover:text-blue-300 ml-1"
                >
                    @{matchedProfile.instagram_handle}
                </a>
            </p>
        </div>
    )}
    <p className="text-lg text-gray-400">(Click anywhere to continue swiping)</p>
  </div>
);

export default function SwipeFeed({ user }) {
  const supabase = createClient();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [matchOccurred, setMatchOccurred] = useState(false); 
  const [matchedProfileInfo, setMatchedProfileInfo] = useState(null);

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
          return; 
        } else {
          // Liked, but no mutual match found yet. Advance to the next card.
          console.log("SwipeFeed: Liked, but no mutual match yet.");
          setCurrentIndex(prevIndex => prevIndex + 1);
        }
      } else {
        // Not liked (it was a "pass" swipe). Swipe was successful. Advance to the next card.
        console.log("SwipeFeed: Passed.");
        setCurrentIndex(prevIndex => prevIndex + 1);
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
        <div className="flex flex-col justify-center items-center h-screen text-red-500">
            <p>{error}</p>
            <a href="/account" className="mt-2 text-indigo-600 hover:text-indigo-800">Go to Profile</a> 
        </div>
     );
  }

  // Main return logic with Match Notification
  return (
    <div {...handlers} className="flex justify-center items-center h-screen bg-gray-100 touch-none overflow-hidden"> {/* Added overflow-hidden */}
      <div className="relative w-64 h-96">
        {/* Conditional Match Notification - pass matched info */} 
        {matchOccurred && <MatchNotification onDismiss={dismissMatchNotification} matchedProfile={matchedProfileInfo} />}
        
        {/* Render the stack of cards - ensure it's below the notification if visible */}
        <div className={`${matchOccurred ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
            {currentIndex < profiles.length ? (
               <ProfileCard profile={profiles[currentIndex]} />
            ) : (
               <ProfileCard profile={null} /> // Show "No more profiles" card
            )}
        </div>

        {/* Buttons - Disable if match popup is showing */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-around z-20"> {/* Ensure buttons are above card */}
          <button
            onClick={() => {
              if (!matchOccurred && currentIndex < profiles.length) {
                handleSwipe(false, profiles[currentIndex].id);
              }
            }}
            disabled={matchOccurred || currentIndex >= profiles.length} // Disable if match or no profile
            className="bg-red-500 text-white rounded-full p-4 disabled:opacity-50 shadow-lg"
          >
            Pass
          </button>
          <button
            onClick={() => {
               if (!matchOccurred && currentIndex < profiles.length) {
                handleSwipe(true, profiles[currentIndex].id);
               }
            }}
            disabled={matchOccurred || currentIndex >= profiles.length} // Disable if match or no profile
             className="bg-green-500 text-white rounded-full p-4 disabled:opacity-50 shadow-lg"
           >
            Like
          </button>
        </div> 
        <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
          <button onClick={() => window.location.href = '/account'} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg text-xs w-24">
            Profile
          </button>
          <Link href="/matches">
             <span className="inline-block bg-purple-500 hover:bg-purple-600 text-white rounded-full p-3 shadow-lg text-xs w-24 text-center">
                 Matches
             </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Note: We need a page component to actually use this SwipeFeed.
// e.g., app/swipe/page.jsx 