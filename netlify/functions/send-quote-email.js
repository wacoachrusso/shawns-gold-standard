const { Resend } = require('resend');

exports.handler = async function(event, context) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = JSON.parse(event.body);

    try {
        const { data, error } = await resend.emails.send({
            from: 'Quote Form <noreply@shawnsgoldstandard.com>',
            to: ['YOUR_EMAIL_HERE@example.com'], // IMPORTANT: Replace with Shawn's actual email
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
        });

        if (error) {
            return { statusCode: 400, body: JSON.stringify(error) };
        }

        return { statusCode: 200, body: JSON.stringify(data) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }
};
