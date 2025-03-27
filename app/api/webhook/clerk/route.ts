import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  // Get the Clerk webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return NextResponse.json(
      { error: 'Webhook secret missing' },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the payload
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Error verifying webhook' },
      { status: 400 }
    );
  }

  // Handle the event
  const eventType = evt.type;

  switch (eventType) {
    case 'user.created': {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const primaryEmail = email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        console.error('User created without email', id);
        return NextResponse.json(
          { error: 'User created without email' },
          { status: 400 }
        );
      }

      try {
        // Insert user into Supabase users table
        const { error } = await supabaseAdmin.from('users').insert({
          id,
          email: primaryEmail,
          full_name: `${first_name || ''} ${last_name || ''}`.trim(),
        });

        if (error) {
          console.error('Error inserting user into Supabase:', error);
          return NextResponse.json(
            { error: 'Error syncing to database' },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Error in user.created webhook:', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    }

    case 'user.updated': {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const primaryEmail = email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        console.error('User updated without email', id);
        return NextResponse.json(
          { error: 'User updated without email' },
          { status: 400 }
        );
      }

      try {
        // Update user in Supabase users table
        const { error } = await supabaseAdmin.from('users').update({
          email: primaryEmail,
          full_name: `${first_name || ''} ${last_name || ''}`.trim(),
        }).eq('id', id);

        if (error) {
          console.error('Error updating user in Supabase:', error);
          return NextResponse.json(
            { error: 'Error syncing to database' },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Error in user.updated webhook:', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    }

    case 'user.deleted': {
      const { id } = evt.data;

      try {
        // Delete user from Supabase users table
        const { error } = await supabaseAdmin.from('users').delete().eq('id', id);

        if (error) {
          console.error('Error deleting user from Supabase:', error);
          return NextResponse.json(
            { error: 'Error syncing to database' },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Error in user.deleted webhook:', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    }

    default:
      // Unhandled or irrelevant event
      return NextResponse.json({ success: true });
  }
} 