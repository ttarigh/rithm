'use client' // Required for useState and Suspense

import { Suspense, useState } from 'react' // Import Suspense and useState
import { useSearchParams } from 'next/navigation' // Import useSearchParams
import { login, signup } from './actions'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; // Or use react-icons if preferred
import Link from 'next/link'

// Helper component for password input with visibility toggle
function PasswordInput({ id, name, label, required = false }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative"> {/* Relative positioning for the button */} 
      <label htmlFor={id} className="block text-sm italic text-black">{label}</label> {/* Updated label style */}
      <input 
        id={id} 
        name={name} 
        type={isVisible ? 'text' : 'password'} // Toggle type based on state
        required={required} 
        className="mt-1 block w-full px-3 py-2 border border-dashed border-black placeholder-gray-500 focus:outline-none focus:border-[#ff00ff] sm:text-sm pr-10" // Updated input style
      />
      <button
        type="button" // Prevent form submission
        onClick={() => setIsVisible(!isVisible)}
        className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        {isVisible 
          ? <EyeSlashIcon className="h-5 w-5 text-black" />  // Icon color updated
          : <EyeIcon className="h-5 w-5 text-black" /> // Icon color updated
        }
      </button>
    </div>
  );
}

// New component containing the form logic
function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false) // State to track mode
  const [error, setError] = useState('') // State for error messages
  const [loading, setLoading] = useState(false) // State for loading indicator
  const searchParams = useSearchParams() // Get search params - NOW SAFE INSIDE SUSPENSE
  const urlMessage = searchParams.get('message') // Get message from URL

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setLoading(true); // Set loading state
    setError(''); // Clear previous errors

    const formData = new FormData(event.currentTarget);
    const password = formData.get('password');
    const passwordVerify = formData.get('passwordVerify');

    if (isSignUp) {
      // Client-side password match validation
      if (password !== passwordVerify) {
        setError('Passwords do not match');
        setLoading(false); // Reset loading state
        return; // Stop submission
      }
      // Call signup server action
      await signup(formData);
      // If signup redirects, this won't be reached. 
      // If it returns an error (e.g., user exists), the redirect in action handles it.
      // We might need more sophisticated error handling if actions return error objects instead of redirecting.

    } else {
      // Call login server action
      await login(formData);
      // Similar to signup, redirects are handled by the action.
    }
    // setLoading(false); // Might not be reached if action redirects
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4"> {/* Main bg white, added padding */}
      {/* RITHM Title Link */}
      <div className="mb-10 text-center">
        <Link href="/">
          <span className="text-6xl text-black hover:bg-[#ffff00] cursor-pointer">
            RITHM
          </span>
        </Link>
      </div>

      <div className="w-full max-w-sm p-8 space-y-6 border-2 border-dashed border-black"> {/* Form card styled */}
        <h1 className="text-3xl italic text-center text-[#000000]">{
           isSignUp ? 'sign up girl...' : 'hiiii again:)'
        }</h1>

        {/* Display URL message (for server errors) */} 
        {urlMessage && (
          <div className={`p-4 mb-4 text-sm border border-dashed border-black ${urlMessage.includes('failed') || urlMessage.includes('match') || urlMessage.includes('authenticate') ? 'text-red-700 bg-[#ffc3ff]' : 'text-black bg-[#ffff00]'}`} role="alert">
            {urlMessage}
          </div>
        )}
        {/* Display client-side error message */}
        {error && (
             <div className="p-4 mb-4 text-sm text-red-700 bg-[#ffc3ff] border border-dashed border-black" role="alert">
                {error}
            </div>
        )}

        {/* Attach onSubmit handler */}
        <form className="space-y-6" onSubmit={handleSubmit}> {/* Increased space-y */}
          <div>
            <label htmlFor="email" className="block text-sm italic text-black">Email</label> {/* Updated label style */}
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="mt-1 block w-full px-3 py-2 border border-dashed border-black placeholder-gray-500 focus:outline-none focus:border-[#ff00ff] sm:text-sm" // Updated input style
              placeholder="you@example.com"
            />
          </div>

          {/* Use PasswordInput component for Password */}
          <PasswordInput 
            id="password"
            name="password"
            label="Password"
            required
          />
          
          {/* Use PasswordInput component for Verify Password (conditionally rendered) */}
          {isSignUp && (
             <PasswordInput 
                id="passwordVerify"
                name="passwordVerify"
                label="Verify Password"
                required
             />
          )}

          <button 
            type="submit" // Change from formAction to type="submit"
            disabled={loading} // Disable button when loading
            className="w-full flex justify-center py-3 px-4 border border-dashed border-black italic text-black text-sm font-medium bg-[#ff00ff] hover:bg-[#ffc3ff] focus:outline-none disabled:opacity-70"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
        </form>

        {/* Toggle button/link */} 
        <div className="text-center text-sm pt-2"> {/* Added padding-top */}
          <button 
            type="button" // Ensure it's type button
            onClick={() => { 
                setIsSignUp(!isSignUp); 
                setError(''); // Clear error on mode toggle
            }} 
            className="italic text-black hover:bg-[#ffff00] py-1 px-2"
          >
            {isSignUp 
              ? 'Already have an account? Login' 
              : 'New? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Default export now wraps LoginForm with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="italic text-black text-center p-10 min-h-screen flex justify-center items-center bg-white">Loading page...</div>}> {/* Styled fallback */}
      <LoginForm />
    </Suspense>
  )
}