'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ExploreScreenshotUpload from '@/components/ExploreScreenshotUpload'

// Step 1: Collect Name and Age
const Step1NameAge = ({ onComplete, initialData }) => {
  const [name, setName] = useState(initialData.name || '');
  const [age, setAge] = useState(initialData.age === null ? '' : initialData.age);

  const handleNext = () => {
    const ageNum = parseInt(age, 10);
    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (isNaN(ageNum) || ageNum < 18) {
      alert('Age must be a number and at least 18.');
      return;
    }
    onComplete({ name: name.trim(), age: ageNum });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">First, tell us about yourself</h2>
      <div>
        <label htmlFor="step1-name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="step1-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="step1-age" className="block text-sm font-medium text-gray-700">Age (Must be 18+)</label>
        <input
          id="step1-age"
          type="number"
          min="18"
          value={age}
          onChange={(e) => setAge(e.target.value)} // Keep as string for input control, parse in handleNext
          placeholder="Your Age"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <button
        onClick={handleNext}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Next
      </button>
    </div>
  );
};

// Step 2: Upload Explore Screenshot
const Step2ExploreScreenshot = ({ onComplete, onPrevious, initialData, userId }) => {
  const [screenshotUrl, setScreenshotUrl] = useState(initialData.screenshotUrl || null);
  const [uploading, setUploading] = useState(false);

  const handleNext = () => {
    // Optional: Add validation to ensure a screenshot was uploaded
    if (!screenshotUrl) {
      alert('Please upload your Explore page screenshot.');
      return;
    }
    onComplete({ screenshotUrl });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Upload Your IG Explore Page</h2>
      <p className="text-sm text-gray-600">This will be shown on your profile.</p>
      <ExploreScreenshotUpload
        uid={userId} // Pass the user ID for storage path
        url={screenshotUrl}
        size={200} // Adjust size as needed
        onUpload={(url) => {
          setScreenshotUrl(url);
          setUploading(false); // Reset upload status on success
        }}
        onUploading={setUploading} // Optional: prop to track upload status
      />
      <div className="flex flex-col space-y-2 pt-2"> {/* Container for buttons */} 
        <button
          onClick={handleNext}
          disabled={uploading || !screenshotUrl} 
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Next'}
        </button>
        <button 
          onClick={onPrevious} 
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Previous
        </button>
      </div>
    </div>
  );
};

// Define options (can be moved to a constants file later)
const GENDER_OPTIONS = ['Female', 'Male', 'Other'];
const PREFERENCE_OPTIONS = ['Female', 'Male', 'Other'];

// Step 3: Select Gender and Dating Preference
const Step3GenderPreference = ({ onComplete, onPrevious, initialData }) => {
  const [gender, setGender] = useState(initialData.gender || '');
  const [datingPreference, setDatingPreference] = useState(initialData.preference || []);

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

  const handleNext = () => {
    if (!gender) {
      alert('Please select your gender.');
      return;
    }
    if (datingPreference.length === 0) {
      alert('Please select your dating preference(s).');
      return;
    }
    onComplete({ gender, preference: datingPreference });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Identity & Preferences</h2>
      {/* Gender Selection */}
      <div>
        <label htmlFor="step3-gender" className="block text-sm font-medium text-gray-700">I am a</label>
        <select
          id="step3-gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="" disabled>Select...</option>
          {GENDER_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Dating Preference Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Show me to (Select all that apply)</label>
        <div className="mt-2 space-y-2">
          {PREFERENCE_OPTIONS.map(option => (
            <div key={option} className="flex items-center">
              <input
                id={`step3-preference-${option}`}
                name="datingPreference"
                type="checkbox"
                value={option}
                checked={datingPreference.includes(option)}
                onChange={handlePreferenceChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={`step3-preference-${option}`} className="ml-2 block text-sm text-gray-900">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col space-y-2 pt-2"> {/* Container for buttons */} 
        <button
          onClick={handleNext}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Next
        </button>
        <button 
          onClick={onPrevious} 
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Previous
        </button>
      </div>
    </div>
  );
};

// Step 4: Enter Instagram Handle
const Step4Instagram = ({ onSubmit, onPrevious, initialData }) => {
  const [instagram, setInstagram] = useState(initialData.instagram || '');

  const handleFinalSubmit = () => {
    // Optional: Add validation if the handle is required
    if (!instagram.trim()) {
       alert('Please enter your Instagram handle (optional, but recommended).');
       // If it's truly optional, you might allow submission here, 
       // or have different logic. Let's assume it's preferred but not strictly required.
       // return; 
    }
    // Remove leading @ if user accidentally typed it
    const handle = instagram.trim().replace(/^@/, ''); 
    onSubmit({ instagram: handle }); // Call the final submit function
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Connect Your Instagram</h2>
      <p className="text-sm text-gray-600">Your handle will only be shown to successful matches. </p>
      <div>
        <label htmlFor="step4-instagram" className="block text-sm font-medium text-gray-700">IG Handle</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
            @
          </span>
          <input
            id="step4-instagram"
            type="text"
            placeholder="yourhandle"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col space-y-2 pt-2"> {/* Container for buttons */} 
        <button
          onClick={handleFinalSubmit}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Complete Profile
        </button>
        <button 
          onClick={onPrevious} 
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Previous
        </button>
      </div>
    </div>
  );
};

export default function SignUpSteps() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    name: '',
    age: null,
    screenshotUrl: null,
    gender: '',
    preference: [],
    instagram: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        router.push('/login'); // Redirect if error getting session
        return;
      }
      if (!session?.user) {
        router.push('/login'); // Redirect if no user
      } else {
        setUser(session.user);
        // Optional: Check if profile is already complete and redirect
        // const { data: profile } = await supabase.from('profiles').select('age').eq('id', session.user.id).single();
        // if (profile && profile.age) {
        //    router.push('/swipe');
        // }
      }
      setLoading(false);
    };
    checkUser();
  }, [supabase, router]);

  const handleStepComplete = (stepData) => {
    setProfileData(prev => ({ ...prev, ...stepData }));
    setCurrentStep(prev => prev + 1);
  };

  // Function to go to the previous step
  const handlePrevious = () => {
    setCurrentStep(prev => (prev > 1 ? prev - 1 : 1)); // Prevent going below step 1
  };

  const handleSubmit = async (stepData) => {
    setLoading(true);
    const finalData = { ...profileData, ...stepData };

    // --- Validation --- 
    if (!finalData.name || finalData.age === null || finalData.age < 18) {
        alert('Please ensure Name is filled and Age is 18+.');
        setLoading(false);
        setCurrentStep(1); // Go back to step 1 if basic info is wrong
        return;
    }
    // Ensure screenshot was uploaded (assuming it's required)
    if (!finalData.screenshotUrl) {
        alert('Please upload your Explore page screenshot.');
        setLoading(false);
        setCurrentStep(2); // Go back to step 2
        return;
    }
    if (!finalData.gender || finalData.preference.length === 0) {
        alert('Please select your gender and dating preferences.');
        setLoading(false);
        setCurrentStep(3); // Go back to step 3
        return;
    }
    // Note: Instagram handle validation is handled in Step4Instagram

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: finalData.name,
        age: finalData.age,
        gender: finalData.gender,
        dating_preference: finalData.preference.join(','),
        instagram_handle: finalData.instagram,
        explore_screenshot_url: finalData.screenshotUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) {
          // Re-throw the error to be caught by the outer catch block
          throw error; 
      }

      alert('Profile created successfully!');
      router.push('/swipe'); // Redirect to swipe page after successful creation

    } catch (error) {
      console.error('Error creating/updating profile:', error);
      // Provide more specific feedback if possible
      let errorMessage = 'Error creating profile!';
      if (error.message) {
        // Example: Check for specific Supabase error codes or messages
        if (error.message.includes('duplicate key value violates unique constraint')) {
             errorMessage = 'An account with this identifier might already exist.';
        } else if (error.message.includes('check constraint')) {
             errorMessage = 'Please ensure all fields meet the required constraints (e.g., age).';
        } else {
             // Generic Supabase error message
             errorMessage = `Error: ${error.message}`;
        }
      } else {
          errorMessage = 'An unexpected error occurred. Please try again.';
      }
      alert(errorMessage); 
      // Optionally, stay on the current step or navigate to a specific step
      // setCurrentStep(4); 

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h1>
      {/* Render the current step component */}
      {currentStep === 1 && <Step1NameAge onComplete={handleStepComplete} initialData={profileData} />}
      {currentStep === 2 && <Step2ExploreScreenshot onComplete={handleStepComplete} onPrevious={handlePrevious} initialData={profileData} userId={user?.id} />}
      {currentStep === 3 && <Step3GenderPreference onComplete={handleStepComplete} onPrevious={handlePrevious} initialData={profileData} />}
      {currentStep === 4 && <Step4Instagram onSubmit={handleSubmit} onPrevious={handlePrevious} initialData={profileData} />}

      {/* Simple progress indicator */}
      <div className="mt-8 text-center text-sm text-gray-500">Step {currentStep} of 4</div>
       {loading && <div className="mt-4 text-center">Submitting...</div>}
    </div>
  );
} 