import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend';

// Resend API setup (reusing the same key as quote function)
const RESEND_API_KEY = 're_K6QJxter_LSi4HaPoBPexvpAPRpJdm7of';
const resend = new Resend(RESEND_API_KEY);

// Company/owner info
const COMPANY_NAME = "Shawn's Gold Standard";
const OWNER_EMAIL = 'russomike32@gmail.com';
const COMPANY_LOGO = 'https://res.cloudinary.com/dcuwsbzv5/image/upload/v1753977867/shawn_transparent_logo_esebpg.png';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Replace with your domain in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      throw new Error('Name, email, and message are required.');
    }

    const ownerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${COMPANY_LOGO}" alt="${COMPANY_NAME}" style="max-height: 80px;">
        </div>
        <div style="background-color: #f5f5f5; border-top: 4px solid #ccad00; padding: 20px; border-radius: 4px;">
          <h1 style="color: #333; font-size: 22px; margin-top: 0;">New Contact Form Submission</h1>
          <div style="background-color: #fff; padding: 15px; border-radius: 4px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin-top: 10px;"><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME} Admin Notification</p>
        </div>
      </div>
    `;

    const ownerEmailResult = await resend.emails.send({
      from: `${COMPANY_NAME} Website <Admin@shawnsgoldstandard.com>`,
      to: [OWNER_EMAIL],
      reply_to: email,
      subject: `New Contact Message from ${name}`,
      html: ownerEmailHtml,
    });

    console.log('Contact owner email result:', JSON.stringify(ownerEmailResult));

    if (ownerEmailResult.error) {
      return new Response(
        JSON.stringify({ success: false, error: ownerEmailResult.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
