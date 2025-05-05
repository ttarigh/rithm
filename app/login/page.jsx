'use client' // Required for useState

import { useState } from 'react' // Import useState
import { useSearchParams } from 'next/navigation' // Import useSearchParams
import { login, signup } from './actions'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; // Or use react-icons if preferred

// Helper component for password input with visibility toggle
function PasswordInput({ id, name, label, required = false }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative"> {/* Relative positioning for the button */} 
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <input 
        id={id} 
        name={name} 
        type={isVisible ? 'text' : 'password'} // Toggle type based on state
        required={required} 
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10" // Add padding-right for icon
      />
      <button
        type="button" // Prevent form submission
        onClick={() => setIsVisible(!isVisible)}
        className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        {isVisible 
          ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> 
          : <EyeIcon className="h-5 w-5 text-gray-500" />
        }
      </button>
    </div>
  );
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false) // State to track mode
  const [error, setError] = useState('') // State for error messages
  const [loading, setLoading] = useState(false) // State for loading indicator
  const searchParams = useSearchParams() // Get search params
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center">{
           isSignUp ? 'Create Account' : 'Welcome Back!'
        }</h1>

        {/* Display URL message (for server errors) */} 
        {urlMessage && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${urlMessage.includes('failed') || urlMessage.includes('match') || urlMessage.includes('authenticate') ? 'text-red-800 bg-red-50' : 'text-blue-800 bg-blue-50'}`} role="alert">
            {urlMessage}
          </div>
        )}
        {/* Display client-side error message */}
        {error && (
             <div className="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-lg" role="alert">
                {error}
            </div>
        )}

        {/* Attach onSubmit handler */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
        </form>

        {/* Toggle button/link */} 
        <div className="text-center text-sm">
          <button 
            onClick={() => { 
                setIsSignUp(!isSignUp); 
                setError(''); // Clear error on mode toggle
            }} 
            className="font-medium text-indigo-600 hover:text-indigo-500"
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