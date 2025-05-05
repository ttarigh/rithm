'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import ExploreScreenshotUpload from '@/components/ExploreScreenshotUpload'

// Define options for gender and preferences
const GENDER_OPTIONS = ['Female', 'Male', 'Other']
const PREFERENCE_OPTIONS = ['Female', 'Male', 'Other']

export default function AccountForm({ user }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [fullname, setFullname] = useState(null)
  const [age, setAge] = useState(null)
  const [gender, setGender] = useState('') // Default to empty string for select
  const [datingPreference, setDatingPreference] = useState([]) // Store as array
  const [instagramHandle, setInstagramHandle] = useState(null)
  const [exploreScreenshotUrl, setExploreScreenshotUrl] = useState(null)

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, age, gender, dating_preference, instagram_handle, explore_screenshot_url`)
        .eq('id', user?.id)
        .single()

      if (error && status !== 406) {
        if (status === 406) {
          console.log('No profile found, user might need to create one.')
        } else {
          throw error
        }
      }

      if (data) {
        setFullname(data.full_name)
        setAge(data.age)
        setGender(data.gender || '') // Ensure it's a string
        // Parse comma-separated string from DB into array for state
        setDatingPreference(data.dating_preference ? data.dating_preference.split(',') : [])
        setInstagramHandle(data.instagram_handle)
        setExploreScreenshotUrl(data.explore_screenshot_url)
      }
    } catch (error) {
      alert('Error loading user data!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    getProfile()
  }, [user, getProfile])

  // Handle changes to dating preference checkboxes
  const handlePreferenceChange = (event) => {
    const { value, checked } = event.target
    setDatingPreference(prev => {
      if (checked) {
        return [...prev, value] // Add preference
      } else {
        return prev.filter(p => p !== value) // Remove preference
      }
    })
  }

  async function updateProfile() {
    try {
      setLoading(true)

      // Validate age
      if (age !== null && (isNaN(age) || age < 18)) {
        alert('Age must be a number and at least 18.')
        setLoading(false)
        return
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user?.id,
        full_name: fullname,
        age: age, // Already parsed in onChange
        gender: gender,
        // Convert array state back to comma-separated string for DB
        dating_preference: datingPreference.join(','),
        instagram_handle: instagramHandle,
        explore_screenshot_url: exploreScreenshotUrl,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      alert('Profile updated!')
    } catch (error) {
      alert('Error updating the data!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-widget space-y-4"> {/* Add spacing */}
      <ExploreScreenshotUpload
        uid={user?.id}
        url={exploreScreenshotUrl}
        size={200}
        onUpload={(url) => {
          setExploreScreenshotUrl(url)
        }}
      />

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input id="email" type="text" value={user?.email} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100" />
      </div>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          id="fullName"
          type="text"
          value={fullname || ''}
          onChange={(e) => setFullname(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age (Must be 18+)</label>
        <input
          id="age"
          type="number"
          min="18" // Add min attribute
          value={age === null ? '' : age} // Handle null for empty input
          onChange={(e) => setAge(e.target.value === '' ? null : parseInt(e.target.value, 10))} // Ensure base 10, handle empty string
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="" disabled>Select your gender</option>
          {GENDER_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Dating Preference (Select all that apply)</label>
        <div className="mt-2 space-y-2">
          {PREFERENCE_OPTIONS.map(option => (
            <div key={option} className="flex items-center">
              <input
                id={`preference-${option}`}
                name="datingPreference"
                type="checkbox"
                value={option}
                checked={datingPreference.includes(option)}
                onChange={handlePreferenceChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={`preference-${option}`} className="ml-2 block text-sm text-gray-900">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="instagramHandle" className="block text-sm font-medium text-gray-700">Instagram Handle</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
            @
          </span>
          <input
            id="instagramHandle"
            type="text"
            placeholder="yourhandle"
            value={instagramHandle || ''}
            onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ''))} // Remove leading @ if typed
            className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="pt-4"> {/* Add padding top */}
        <button
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          onClick={() => updateProfile()}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update Profile'}
        </button>
      </div>
      <div className="pt-4">
        <button
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => window.location.href = '/swipe'}
        >
          Back to Swiping
        </button>
      </div>
      <div>
        <form action="/auth/signout" method="post">
          <button className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}