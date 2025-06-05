'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Consider returning a more specific error message to the page
    console.error('Login error:', error.message)
    return redirect('/login?message=Could not authenticate user')
  }

  // Login successful. Redirect to root; middleware will handle the rest.
  return redirect('/') 
}

export async function signup(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const passwordVerify = formData.get('passwordVerify') // Get the verification password
  const supabase = await createClient()

  // --- Password Verification --- 
  if (password !== passwordVerify) {
    console.error('Sign up error: Passwords do not match')
    return redirect('/login?message=Passwords do not match')
  }
  // --- End Verification --- 

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // emailRedirectTo: 'http://localhost:3000/auth/callback', // Keep if email verification is enabled
    },
  })

  if (error) {
    console.error('Sign up error:', error.message)
    // Check for specific errors like "User already registered"
    let message = 'Could not sign up user';
    if (error.message.includes('User already registered')) {
        message = 'This email address is already registered. Try logging in.';
    } else {
        // You could parse other specific errors here
        message = `Sign up failed: ${error.message}`; 
    }
    return redirect(`/login?message=${encodeURIComponent(message)}`);
  }

  // Sign up successful.
  // If email verification is OFF: Middleware will redirect to /signup-steps on next load.
  // If email verification is ON: User needs to verify email first.
  // Redirecting to login page with info message covers both cases for now.
  const successMessage = "Signup successful! Check your spam folder, and move it to inbox to click the link.";
  return redirect(`/login?message=${encodeURIComponent(successMessage)}`);
}