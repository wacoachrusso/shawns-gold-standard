const { Resend } = require('resend');

exports.handler = async function(event, context) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = JSON.parse(event.body);

    // Email to Shawn (Admin)
    const shawnEmail = {
        from: 'Quote Form <noreply@shawnsgoldstandard.com>',
        to: ['russomike32@gmail.com'],
        subject: `New Quote Request from ${body.name}`,
        html: `
            <h1>New Quote Request</h1>
            <p><strong>Name:</strong> ${body.name}</p>
            <p><strong>Email:</strong> ${body.email}</p>
            <p><strong>Phone:</strong> ${body.phone}</p>
            <p><strong>Metal Type:</strong> ${body.metal_type}</p>
            <p><strong>Description:</strong></p>
            <p>${body.description}</p>
            <hr>
            <h3>Uploaded Images:</h3>
            ${body.image_urls.map(url => `<a href="${url}">${url}</a>`).join('<br>')}
        `
    };

    // Email to the User (Confirmation)
    const userEmail = {
        from: 'Shawn\'s Gold Standard <noreply@shawnsgoldstandard.com>',
        to: [body.email],
        subject: 'We\'ve Received Your Quote Request!',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <img src="https://res.cloudinary.com/dcuwsbzv5/image/upload/v1753977867/shawn_transparent_logo_esebpg.png" alt="Shawn's Gold Standard Logo" style="max-width: 150px; margin-bottom: 20px;">
                    <h1 style="color: #1a2a40;">Thank You, ${body.name}!</h1>
                    <p>We have successfully received your quote request. Thank you for trusting Shawn's Gold Standard.</p>
                    <p>Our team will carefully review the details and photos you provided. We will get back to you with a competitive, no-obligation quote within 48 hours.</p>
                    <p>If you have any immediate questions, please don't hesitate to contact us.</p>
                    <br>
                    <p>Sincerely,</p>
                    <p><strong>The Team at Shawn's Gold Standard</strong></p>
                    <a href="https://shawnsgoldstandard.com">shawnsgoldstandard.com</a>
                </div>
            </div>
        `
    };

    try {
        // Send both emails in parallel
        const [shawnResponse, userResponse] = await Promise.all([
            resend.emails.send(shawnEmail),
            resend.emails.send(userEmail)
        ]);

        if (shawnResponse.error) {
            console.error('Error sending email to Shawn:', shawnResponse.error);
            // Decide if you want to return an error to the user if this fails
        }

        if (userResponse.error) {
            console.error('Error sending confirmation email to user:', userResponse.error);
            // This error is less critical for the user-facing experience
        }

        // If at least the email to Shawn was successful, return success
        if (!shawnResponse.error) {
            return { statusCode: 200, body: JSON.stringify({ message: 'Emails sent successfully' }) };
        } else {
            return { statusCode: 500, body: JSON.stringify({ error: 'Failed to send primary email' }) };
        }

    } catch (error) {
        console.error('General error sending emails:', error);
        return { statusCode: 500, body: JSON.stringify(error) };
    }
};
