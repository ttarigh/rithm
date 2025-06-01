'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import ExploreScreenshotUpload from '@/components/ExploreScreenshotUpload'

// Define options for gender and preferences
const GENDER_OPTIONS = ['Man', 'Woman', 'Nonbinary']
const PREFERENCE_OPTIONS = ['Man', 'Woman', 'Nonbinary']

export default function AccountForm({ user }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [fullname, setFullname] = useState(null)
  const [age, setAge] = useState(null)
  const [gender, setGender] = useState('')
  const [datingPreference, setDatingPreference] = useState([])
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
        setGender(data.gender || '')
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

  const handlePreferenceChange = (event) => {
    const { value, checked } = event.target
    setDatingPreference(prev => {
      if (checked) {
        return [...prev, value]
      } else {
        return prev.filter(p => p !== value)
      }
    })
  }

  async function updateProfile() {
    try {
      setLoading(true)

      if (age !== null && (isNaN(age) || age < 18)) {
        alert('Age must be a number and at least 18.')
        setLoading(false)
        return
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user?.id,
        full_name: fullname,
        age: age,
        gender: gender,
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
    <div className="form-widget space-y-6 p-6 max-w-lg mx-auto bg-white ">
      <ExploreScreenshotUpload
        uid={user?.id}
        url={exploreScreenshotUrl}
        size={200}
        onUpload={(url) => {
          setExploreScreenshotUrl(url)
        }}
      />

      <div>
        <label htmlFor="email" className="block text-sm italic text-black">Email</label>
        <input id="email" type="text" value={user?.email} disabled className="mt-1 block w-full border border-dashed border-black p-2 bg-gray-100 focus:outline-none focus:border-[#ff00ff]" />
      </div>
      <div>
        <label htmlFor="fullName" className="block text-sm italic text-black">Name</label>
        <input
          id="fullName"
          type="text"
          value={fullname || ''}
          onChange={(e) => setFullname(e.target.value)}
          className="mt-1 block w-full border border-dashed border-black p-2 focus:outline-none focus:border-[#ff00ff]"
        />
      </div>
      <div>
        <label htmlFor="age" className="block text-sm italic text-black">Age (Must be 18+)</label>
        <input
          id="age"
          type="number"
          min="18"
          value={age === null ? '' : age}
          onChange={(e) => setAge(e.target.value === '' ? null : parseInt(e.target.value, 10))}
          className="mt-1 block w-full border border-dashed border-black p-2 focus:outline-none focus:border-[#ff00ff]"
        />
      </div>
      <div>
        <label htmlFor="gender" className="block text-sm italic text-black">Gender</label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="mt-1 block w-full border border-dashed border-black p-2 bg-white focus:outline-none focus:border-[#ff00ff]"
        >
          <option value="" disabled>Select your gender</option>
          {GENDER_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm italic text-black">Dating Preference (Select all that apply)</label>
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
                className="h-4 w-4 border-black accent-[#ff00ff] focus:ring-0 focus:outline-none"
              />
              <label htmlFor={`preference-${option}`} className="ml-2 block text-sm italic text-black">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="instagramHandle" className="block text-sm italic text-black">Instagram Handle (only shown to matches)</label>
        <div className="mt-1 flex">
          <span className="inline-flex items-center border-l border-t border-b border-dashed border-black bg-transparent px-3 text-black">
            @
          </span>
          <input
            id="instagramHandle"
            type="text"
            placeholder="yourhandle"
            value={instagramHandle || ''}
            onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ''))}
            className="block w-full min-w-0 flex-1 border-r border-t border-b border-dashed border-black p-2 focus:outline-none focus:border-[#ff00ff]"
          />
        </div>
      </div>

      <div className="pt-6 space-y-4">
        <button
          className="w-full flex justify-center py-3 px-4 italic text-black text-sm font-medium bg-[#ff00ff] hover:bg-[#ffc3ff] focus:outline-none disabled:opacity-70"
          onClick={() => updateProfile()}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update Profile'}
        </button>

        <button
          className="w-full flex justify-center py-3 px-4 italic border border-dashed border-black text-black text-sm font-medium bg-transparent hover:bg-[#ffff00] focus:outline-none"
          onClick={() => window.location.href = '/swipe'}
        >
          Back to Swiping
        </button>

        <form action="/auth/signout" method="post" className="w-full">
          <button className="w-full flex justify-center py-3 px-4 italic border border-dashed border-black text-black text-sm font-medium bg-transparent hover:bg-[#ffff00] focus:outline-none" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}