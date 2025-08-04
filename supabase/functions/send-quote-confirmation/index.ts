import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend';

// Updated API key
const RESEND_API_KEY = 're_K6QJxter_LSi4HaPoBPexvpAPRpJdm7of';
const resend = new Resend(RESEND_API_KEY);

// Company info
const COMPANY_NAME = "Shawn's Gold Standard";
const OWNER_EMAIL = 'russomike32@gmail.com';
const COMPANY_LOGO = 'https://res.cloudinary.com/dcuwsbzv5/image/upload/v1753977867/shawn_transparent_logo_esebpg.png';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Replace with your domain for production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, email, phone, metalType, itemDescription, imageUrls = [] } = await req.json();

    if (!name || !email) {
      throw new Error('Name and email are required.');
    }

    // Format image previews for emails
    const imageHtml = imageUrls.length > 0 
      ? `
        <div style="margin-top: 20px;">
          <h3 style="color: #444; margin-bottom: 10px;">Uploaded Photos:</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${imageUrls.map(url => `
              <div style="flex: 0 0 calc(33.33% - 10px); max-width: 150px;">
                <a href="${url}" target="_blank" title="Click to view full size">
                  <img src="${url}" alt="Item Photo" style="width: 100%; height: auto; border-radius: 4px; border: 1px solid #ddd; display: block;">
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      ` 
      : '<p style="color: #777;">No photos were uploaded</p>';

    // Customer email template with professional branding
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${COMPANY_LOGO}" alt="${COMPANY_NAME}" style="max-height: 80px;">
        </div>
        
        <div style="background-color: #f7f3e3; border-top: 4px solid #ccad00; padding: 20px; border-radius: 4px;">
          <h1 style="color: #ccad00; font-size: 24px; margin-top: 0;">Thank You for Your Quote Request!</h1>
          <p>Hello ${name},</p>
          <p>We've received your quote request for the following item:</p>
          
          <div style="background-color: #fff; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 3px solid #ccad00;">
            <strong>Item Description:</strong>
            <p>${itemDescription || 'No description provided'}</p>
          </div>
          
          ${imageHtml}
          
          <p style="margin-top: 20px;">Our team will review your request and contact you within 24 hours with a personalized quote.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.shawnsgoldstandard.com" style="background-color: #ccad00; color: white; text-decoration: none; padding: 10px 25px; border-radius: 4px; font-weight: bold;">Visit Our Website</a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
          <p>If you have any questions, please email us at ${OWNER_EMAIL}</p>
          <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    `;
    
    // Owner notification email template
    const ownerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${COMPANY_LOGO}" alt="${COMPANY_NAME}" style="max-height: 80px;">
        </div>
        
        <div style="background-color: #f5f5f5; border-top: 4px solid #ccad00; padding: 20px; border-radius: 4px;">
          <h1 style="color: #333; font-size: 24px; margin-top: 0;">New Quote Request</h1>
          
          <div style="background-color: #fff; padding: 15px; border-radius: 4px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #ccad00;">Customer Information:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Metal Type:</strong> ${metalType}</p>
            <h3 style="color: #ccad00; margin-top: 20px;">Item Details:</h3>
            <p><strong>Description:</strong> ${itemDescription || 'No description provided'}</p>
          </div>
          
          ${imageHtml}
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME} Admin Notification</p>
        </div>
      </div>
    `;

    // Send email to customer
    const customerEmailResult = await resend.emails.send({
      from: `${COMPANY_NAME} <Admin@shawnsgoldstandard.com>`,
      to: [email],
      reply_to: OWNER_EMAIL,
      subject: 'Thank You for Your Quote Request!',
      html: customerEmailHtml,
    });
    
    // Send notification email to owner
    const ownerEmailResult = await resend.emails.send({
      from: `${COMPANY_NAME} Website <Admin@shawnsgoldstandard.com>`,
      to: [OWNER_EMAIL],
      subject: `New Quote Request from ${name}`,
      html: ownerEmailHtml,
    });

    if (customerEmailResult.error || ownerEmailResult.error) {
      console.error({ 
        customerError: customerEmailResult.error,
        ownerError: ownerEmailResult.error 
      });
      return new Response(
        JSON.stringify({
          error: "There was an issue sending emails, but your quote was saved.",
          details: {
            customerError: customerEmailResult.error,
            ownerError: ownerEmailResult.error
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    return new Response(JSON.stringify({ success: true, customerEmailResult, ownerEmailResult }), {
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
