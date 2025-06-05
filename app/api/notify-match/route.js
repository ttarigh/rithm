import { NextResponse } from 'next/server';
import { Resend } from 'resend';
// Import createClient from the Supabase SDK directly for explicit server-side client creation
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const YOUR_APP_NAME = 'Rithm'; // Replace with your actual app name
const YOUR_APP_LINK = 'https://rithm.love'; // Added the missing app link constant
const FROM_EMAIL = 'noreply@tina.zone'; // Corrected to use your domain

// Helper function to create a Supabase admin client (service role)
const getSupabaseAdminClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase URL or Service Role Key is not defined in environment variables.');
    throw new Error('Supabase admin client configuration error.');
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } } // Recommended for server-side/service role clients
  );
};

async function getUserEmail(supabase, userId) {
  try {
    const { data, error } = await supabase
      .rpc('get_user_email_by_id', { p_user_id: userId })
      .single(); // Assuming the function returns a single row or null

    if (error) {
      console.error(`Error calling RPC get_user_email_by_id for user ${userId}:`, error);
      if (error.details) console.error("Supabase RPC error details:", error.details);
      if (error.hint) console.error("Supabase RPC error hint:", error.hint);
      return null;
    }
    // The RPC function returns an array of objects, even if it's a single result, unless .single() is perfect.
    // If .single() works as expected (returning the object or null), data.email is fine.
    // If data is an array: data[0]?.email
    return data?.email; // Access the email field from the returned object

  } catch (rpcError) {
    console.error(`Exception calling RPC for user ${userId}:`, rpcError);
    return null;
  }
}

export async function POST(request) {
  if (!process.env.RESEND_API_KEY) {
    console.error('Resend API key not configured.');
    return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 });
  }

  try {
    const { currentUser, matchedUser } = await request.json();

    if (!currentUser || !currentUser.id || !currentUser.name || !matchedUser || !matchedUser.id || !matchedUser.name) {
      return NextResponse.json({ error: 'Missing user data for notification.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient(); // Get the admin client instance

    const currentUserEmail = await getUserEmail(supabaseAdmin, currentUser.id);
    const matchedUserEmail = await getUserEmail(supabaseAdmin, matchedUser.id);

    let emailsSent = 0;
    let errors = [];

    if (currentUserEmail) {
      try {
        await resend.emails.send({
          from: `${YOUR_APP_NAME} <${FROM_EMAIL}>`,
          to: [currentUserEmail],
          subject: `You have a new match on ${YOUR_APP_NAME}! 🔥`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>Hi ${currentUser.name},</h2>
              <p>Good news! You've matched with <strong>${matchedUser.name}</strong> on ${YOUR_APP_NAME}.</p>
              <p>Why not say hello or check out their profile?</p>
              <p>Happy connecting!</p>
              <p>The ${YOUR_APP_NAME} Team</p>
            </div>
      `,
        });
        emailsSent++;
      } catch (error) {
        console.error(`Error sending email to ${currentUserEmail}:`, error);
        errors.push(`Failed to send email to ${currentUser.name}`);
      }
    }

    if (matchedUserEmail) {
      try {
        await resend.emails.send({
          from: `${YOUR_APP_NAME} <${FROM_EMAIL}>`,
          to: [matchedUserEmail],
          subject: `You have a new match on ${YOUR_APP_NAME}! 🔥`,
          html: `
            <div style="font-family: 'Comic Sans MS', cursive, sans-serif; color: #FF00FF; text-align: center; padding: 20px; background-color:#fff0f6;">
              <div style="max-width: 480px; margin: 0 auto; background: #ffe6f0; border: 2px dashed #FF00FF; border-radius: 20px; padding: 30px;">
                <h2 style="font-size: 24px;">(づ｡◕‿‿◕｡)づ Hi ${matchedUser.name}!</h2>
                <p style="font-size: 16px;">You've just been matched with <strong>${currentUser.name}</strong> on ${YOUR_APP_NAME}! 🎉</p>
                <p style="font-size: 16px;">Curious? Take a peek!</p>
                <a href="${YOUR_APP_LINK}/match/${currentUser.id}"
                  style="display: inline-block; margin-top: 20px; padding: 12px 24px; font-size: 16px; color: #FF00FF; text-decoration: none; border: 2px dashed #FF00FF; border-radius: 12px;">
                  💖 View ${currentUser.name}\'s Profile 💖
                </a>
                <p style="font-size: 12px; margin-top: 30px; color: #b300b3;">
                  May the Rithm be with you! (*＾▽＾)／＼(＾▽＾*)
                  <br>— The ${YOUR_APP_NAME} Team
                </p>
              </div>
            </div>
          `,
        });
        emailsSent++;
      } catch (error) {
        console.error(`Error sending email to ${matchedUserEmail}:`, error);
        errors.push(`Failed to send email to ${matchedUser.name}`);
      }
    }

    if (emailsSent > 0 && errors.length === 0) {
      return NextResponse.json({ message: 'Match notification emails sent successfully.' });
    } else if (emailsSent > 0 && errors.length > 0) {
        return NextResponse.json({ message: `Partially sent emails. Errors: ${errors.join(', ')}` }, { status: 207 }); // Multi-Status
    } else {
      return NextResponse.json({ error: `Failed to send notification emails. Errors: ${errors.join(', ')}` }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in notify-match route:', error);
    // Log the error object itself for more details, especially if it's a custom error from getSupabaseAdminClient
    if (error instanceof Error && error.message === 'Supabase admin client configuration error.') {
        return NextResponse.json({ error: 'Server configuration error for database access.' }, { status: 500 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 