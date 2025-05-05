import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MatchesClient from './MatchesClient' // We will create this next

export default async function MatchesPage() {
  const supabase = await createClient() // Ensure await is used

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch matches using the database function
  const { data: matches, error: matchesError } = await supabase
    .rpc('get_matches', { current_user_id: user.id })

  if (matchesError) {
    console.error("Error fetching matches:", matchesError)
    // Handle error appropriately - maybe show an error message component
    // For now, we'll pass an empty array, but ideally show feedback
    return <MatchesClient matches={[]} error="Could not load matches." />
  }

  console.log("Fetched Matches:", matches);

  // Pass the fetched matches to the client component
  return <MatchesClient matches={matches || []} />
} 