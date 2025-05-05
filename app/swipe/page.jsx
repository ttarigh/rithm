import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SwipeFeed from './SwipeFeed' // Import the client component

export default async function SwipePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  // If there's an error fetching the user or no user is logged in, redirect to login
  if (error || !data?.user) {
    redirect('/login') // Adjust the redirect path if your login page is different
  }

  // If user is logged in, render the SwipeFeed component (which is a Client Component)
  // Pass the user object to it
  return <SwipeFeed user={data.user} />
} 