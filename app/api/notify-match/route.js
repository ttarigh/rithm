import { NextResponse } from 'next/server';
import { Resend } from 'resend';
// Import createClient from the Supabase SDK directly for explicit server-side client creation
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const YOUR_APP_NAME = 'Rithm.love'; // Updated to be more specific
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

// Helper function to generate the Kawaii HTML email body
const createMatchEmailHTML = (recipientName, matchedUserName) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>🎉 You've Got Rithm! 🎉</title>
  <style>
    /* Basic reset for email client compatibility */
    body, div, p, h2 { margin: 0; padding: 0; }
  </style>
</head>
<body style="background-color:#fff0f6; font-family: 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive, sans-serif; color: #d63384; text-align: center; padding: 20px; margin: 0;">
  <div style="max-width: 480px; margin: 20px auto; background: #ffe6f0; border: 2px dashed #ff99cc; border-radius: 20px; padding: 20px 30px 30px 30px;">
    <h2 style="font-size: 26px; color: #ff00ff; margin-top:0; margin-bottom: 10px;">🎉 OMG Match Alert! 🎉</h2>
    <p style="font-size: 24px; margin-bottom: 15px; line-height: 1;">(づ｡◕‿‿◕｡)づ</p>
    <p style="font-size: 18px; margin-bottom: 10px;">Hey ${recipientName}!</p>
    <p style="font-size: 16px; line-height: 1.5;">
      You and <strong>${matchedUserName}</strong> totally ~vibed~ and are now a match on ${YOUR_APP_NAME}! 💖
    </p>
    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
      What are you waiting for?! Maybe send a wave or just check out their profile? 💬👀
    </p>
    <a href="https://rithm.love/matches"
       style="display: inline-block; margin-top: 10px; margin-bottom: 25px; padding: 14px 28px; font-size: 18px; background-color: #ff66b2; color: white; text-decoration: none; border-radius: 12px; box-shadow: 0 4px #cc528f; font-weight: bold;">
       ✨ See your matches! ✨
    </a>
    <p style="font-size: 14px; color: #b30059; line-height: 1.4;">
      Go get 'em, superstar! 🌟<br/>
      The ${YOUR_APP_NAME} Team (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
    </p>
  </div>
</body>
</html>
`;
};

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
          subject: `(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ You've Got Rithm! New Match with ${matchedUser.name}!`,
          html: createMatchEmailHTML(currentUser.name, matchedUser.name),
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
          subject: `(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ You've Got Rithm! New Match with ${currentUser.name}!`,
          html: createMatchEmailHTML(matchedUser.name, currentUser.name),
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