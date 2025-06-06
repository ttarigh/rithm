'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ExploreScreenshotUpload from '@/components/ExploreScreenshotUpload'
import Link from 'next/link'

// Gender and Preference options (already correct as per user last instruction elsewhere)
const GENDER_OPTIONS = ['Man', 'Woman', 'Nonbinary'];
const PREFERENCE_OPTIONS = ['Man', 'Woman', 'Nonbinary'];

// Step 1: Collect Name, Age, Preferences, and Instagram Handle
const StepNameAgePreferencesHandle = ({ onSubmit, onPrevious, initialData }) => {
  const [name, setName] = useState(initialData.name || '');
  const [age, setAge] = useState(initialData.age === null ? '' : initialData.age);
  const [gender, setGender] = useState(initialData.gender || '');
  const [datingPreference, setDatingPreference] = useState(initialData.preference || []);
  const [instagram, setInstagram] = useState(initialData.instagram || '');

  const handlePreferenceChange = (event) => {
    const { value, checked } = event.target;
    setDatingPreference(prev => {
      if (checked) {
        return [...prev, value];
      } else {
        return prev.filter(p => p !== value);
      }
    });
  };

  const handleFinalSubmit = () => {
    const ageNum = parseInt(age, 10);
    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (isNaN(ageNum) || ageNum < 18) {
      alert('Age must be a number and at least 18.');
      return;
    }
    if (!gender) {
      alert('Please select your gender.');
      return;
    }
    if (datingPreference.length === 0) {
      alert('Please select your dating preference(s).');
      return;
    }
    if (!instagram.trim()) {
      alert('Please enter your Instagram Username Handle.');
      return;
    }
    const igHandle = instagram.trim().replace(/^@/, ''); 
    onSubmit({ name: name.trim(), age: ageNum, gender, preference: datingPreference, instagram: igHandle });
  };

  return (
    <div className="space-y-6 p-4 md:p-6 border border-dashed border-black">
      <h2 className="text-3xl italic text-center text-[#ff00ff] mb-6">2. abt u plzzzzz</h2>
      
      <div>
        <label htmlFor="step-name" className="block text-sm italic text-black">first name</label>
        <input
          id="step-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="first name"
          className="mt-1 block w-full border border-dashed border-black p-2 focus:outline-none focus:border-[#ff00ff]"
          required
        />
      </div>
      
      <div>
        <label htmlFor="step-age" className="block text-sm italic text-black">age (must be 18+)</label>
        <input
          id="step-age"
          type="number"
          min="18"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="age"
          className="mt-1 block w-full border border-dashed border-black p-2 focus:outline-none focus:border-[#ff00ff]"
          required
        />
      </div>
      
      <div>
        <label htmlFor="step-gender" className="block text-sm italic text-black">i am a</label>
        <select
          id="step-gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="mt-1 block w-full border border-dashed border-black p-2 bg-white focus:outline-none focus:border-[#ff00ff]"
          required
        >
          <option value="" disabled>Select...</option>
          {GENDER_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm italic text-black">desired scrollmates:</label>
        <div className="mt-2 space-y-2">
          {PREFERENCE_OPTIONS.map(option => (
            <div key={option} className="flex items-center">
              <input
                id={`step-preference-${option}`}
                name="datingPreference"
                type="checkbox"
                value={option}
                checked={datingPreference.includes(option)}
                onChange={handlePreferenceChange}
                className="h-4 w-4 border-black accent-[#ff00ff] focus:ring-0 focus:outline-none"
              />
              <label htmlFor={`step-preference-${option}`} className="ml-2 block text-sm italic text-black">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="step-instagram" className="block text-sm italic text-black">instagram username handle</label>
        <div className="mt-1 flex">
          <span className="inline-flex items-center border-l border-t border-b border-dashed border-black bg-transparent px-3 text-black">
            @
          </span>
          <input
            id="step-instagram"
            type="text"
            placeholder="urhandle"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="block w-full min-w-0 flex-1 border-r border-t border-b border-dashed border-black p-2 focus:outline-none focus:border-[#ff00ff]"
          />
        </div>
         <p className="text-xs text-black/70 italic mt-1">ur handle will only be shown to successful matches.</p>
      </div>

      <div className="flex flex-col space-y-3 pt-4">
        <button
          onClick={handleFinalSubmit}
          className="w-full flex justify-center py-3 px-4 italic border border-dashed border-black text-black text-sm font-medium bg-[#ff00ff] hover:bg-[#ffc3ff] focus:outline-none"
        >
          Complete Profile
        </button>
        <button 
          onClick={onPrevious} 
          className="w-full flex justify-center py-3 px-4 italic border border-dashed border-black text-black text-sm font-medium bg-transparent hover:bg-[#ffff00] focus:outline-none"
        >
          Previous
        </button>
      </div>
    </div>
  );
};

const Step1UploadScreenshot = ({ supabase, onComplete, initialData, userId }) => {
  const [screenshotUrl, setScreenshotUrl] = useState(initialData.screenshotUrl || null);
  const [uploading, setUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); 
  const [digitalPheromoneAnalysis, setDigitalPheromoneAnalysis] = useState(initialData.digitalPheromoneAnalysis || null); 
  const [analysisError, setAnalysisError] = useState(null); 

  const handleImageUpload = async (url) => {
    setScreenshotUrl(url);
    setUploading(false); 
    setDigitalPheromoneAnalysis(null); 
    setAnalysisError(null); 
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Analysis failed with status: ${response.status}`);
      }
      const data = await response.json();
      setDigitalPheromoneAnalysis(data.analysis);
    } catch (error) {
      console.error("Error calling analysis API:", error);
      setAnalysisError(error.message || "Failed to analyze image. Please try again or skip.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (!screenshotUrl) {
      alert('Please upload ur Explore page screenshot.');
      return;
    }
    onComplete({ screenshotUrl, digitalPheromoneAnalysis }); 
  };

  return (
    <div className="space-y-6 p-4 md:p-6 border border-dashed border-black">
      <h2 className="text-3xl italic text-center text-[#ff00ff] mb-6">1. upload ur IG scrollshot</h2>
      <p className="text-sm text-black italic text-center">go to <a href="https://instagram.com/explore" target="_blank" rel="noopener noreferrer" className="text-[#ff00ff] hover:underline">instagram.com/explore</a> and screenshot it. this is what cuties will see on ur profile. we also analyze it to understand ur digital pheromones ;)</p>
      <ExploreScreenshotUpload
        supabase={supabase}
        uid={userId}
        url={screenshotUrl}
        size={200}
        onUpload={handleImageUpload} 
        onUploading={setUploading}
      />
      {isAnalyzing && <p className="text-sm italic text-[#ff00ff] text-center">Analyzing image...</p>}
      {analysisError && <p className="text-sm italic text-red-600 text-center">Error: {analysisError}</p>}
      {digitalPheromoneAnalysis && !isAnalyzing && (
        <div className="p-4 border border-dashed border-black bg-[#ffc3ff]">
          <p className="text-sm font-medium text-black italic">digital pheromone:</p>
          <p className="text-sm text-black/80 italic">{digitalPheromoneAnalysis}</p>
        </div>
      )}
      <div className="flex flex-col space-y-3 pt-4">
        <button
          onClick={handleNext}
          disabled={uploading || isAnalyzing || !screenshotUrl} 
          className="w-full flex justify-center py-3 px-4 italic border border-dashed border-black text-black text-sm font-medium bg-[#ff00ff] hover:bg-[#ffc3ff] focus:outline-none disabled:opacity-70"
        >
          {uploading ? 'uploading...' : isAnalyzing ? 'analyzing...' : 'next'}
        </button>
      </div>
    </div>
  );
};

// Main component for the signup steps page
export default function SignUpSteps() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // Start with screenshot upload
  const [profileData, setProfileData] = useState({
    screenshotUrl: null,
    digitalPheromoneAnalysis: null,
    name: '',
    age: null,
    gender: '',
    preference: [],
    instagram: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Check if profile already exists and potentially skip steps or prefill
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, full_name, age, gender, dating_preference, instagram_handle, explore_screenshot_url, digital_pheromone_analysis')
          .eq('id', session.user.id)
          .single();
        
        if (existingProfile) {
           // Pre-fill if user comes back to this page or for editing later (though this is a signup flow)
           setProfileData({
               screenshotUrl: existingProfile.explore_screenshot_url,
               digitalPheromoneAnalysis: existingProfile.digital_pheromone_analysis,
               name: existingProfile.full_name,
               age: existingProfile.age,
               gender: existingProfile.gender,
               preference: existingProfile.dating_preference ? existingProfile.dating_preference.split(',') : [],
               instagram: existingProfile.instagram_handle
           });
           // Potentially set currentStep based on what's missing, or assume they want to review step 1 if profile exists
        }
      } else {
        router.push('/login'); // Redirect if no user
      }
      setIsLoading(false);
    };
    checkUser();
  }, [supabase, router]);

  const handleStepComplete = (stepData) => {
    setProfileData(prev => ({ ...prev, ...stepData }));
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (stepData) => { 
    const finalData = { ...profileData, ...stepData };
    setIsLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: finalData.name,
        age: finalData.age,
        gender: finalData.gender,
        dating_preference: finalData.preference.join(','),
        instagram_handle: finalData.instagram,
        explore_screenshot_url: finalData.screenshotUrl,
        digital_pheromone_analysis: finalData.digitalPheromoneAnalysis,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile: ' + error.message);
      } else {
        alert('Profile created successfully!');
        router.push('/swipe'); // Navigate to swipe page on success
      }
    } catch (err) {
      console.error('Unexpected error during profile submission:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen bg-white flex justify-center items-center italic text-black p-10">Loading user data...</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start py-8 px-4 md:px-0">
      <div className="mb-12 text-center">
        <Link href="/">
          <span className="text-6xl text-black hover:bg-[#ffff00] cursor-pointer">
            RITHM
          </span>
        </Link>
      </div>
      
      <div className="w-full max-w-lg">
        {currentStep === 1 && (
          <Step1UploadScreenshot 
            supabase={supabase}
            onComplete={handleStepComplete} 
            initialData={profileData} 
            userId={user.id} 
          />
        )}
        {currentStep === 2 && (
          <StepNameAgePreferencesHandle 
            onSubmit={handleSubmit} 
            onPrevious={handlePrevious} 
            initialData={profileData} 
          />
        )}
      </div>
    </div>
  );
} 