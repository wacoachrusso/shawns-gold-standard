// Shawn's Gold Standard - Main JavaScript File

document.addEventListener('DOMContentLoaded', () => {
    // Auto-format phone number
    const formatPhoneNumber = (input) => {
        // Strip all non-numeric characters
        let value = input.value.replace(/\D/g, '');
        // Apply formatting: 123-456-7890
        if (value.length > 3 && value.length <= 6) {
            value = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else if (value.length > 6) {
            value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }
        input.value = value;
    };

    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', () => formatPhoneNumber(input));
    });

    // Shrink header on scroll
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Ensure Supabase is available
    if (typeof supabase === 'undefined') {
        console.error('Supabase client is not loaded.');
        return;
    }

    const { createClient } = supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase client initialized.");

    // Handle Hamburger Menu Toggle
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Scroll Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const sectionsToAnimate = document.querySelectorAll('.why-choose-us, .our-process, .testimonials, .final-cta');
    sectionsToAnimate.forEach(section => {
        section.classList.add('hidden');
        observer.observe(section);
    });

    // Handle Quote Form Submission
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.target;
            const submitButton = form.querySelector('button[type="submit"]');
            const formData = new FormData(form);
            const imageInput = document.getElementById('images');
            const files = imageInput.files;
            const imageUrls = [];

            submitButton.disabled = true;

            // 1. Handle Image Uploads to Cloudinary
            if (files.length > 0) {
                submitButton.textContent = 'Uploading Images...';
                for (const file of files) {
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', file);
                    uploadFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                    uploadFormData.append('folder', 'shawn-gold-standard');

                    try {
                        const response = await fetch(CLOUDINARY_URL, {
                            method: 'POST',
                            body: uploadFormData,
                        });

                        if (response.ok) {
                            const data = await response.json();
                            imageUrls.push(data.secure_url);
                        } else {
                            throw new Error(`Image upload failed: ${response.statusText}`);
                        }
                    } catch (error) {
                        console.error('Image upload failed:', error);
                        Toastify({
                            text: "Error uploading images: " + error.message,
                            duration: 5000,
                            close: true,
                            gravity: "top",
                            position: "right",
                            style: {
                                background: "linear-gradient(to right, #ff5f6d, #ffc371)",
                            },
                            stopOnFocus: true,
                        }).showToast();
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit for Quote';
                        return; // Stop the submission process
                    }
                }
            }

            // 2. Submit Form Data to Supabase
            submitButton.textContent = 'Submitting Quote...';
            const submission = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                metal_type: formData.get('metal-type'),
                description: formData.get('description'),
                image_urls: imageUrls
            };

            const { data, error } = await _supabase
                .from('quotes')
                .insert([submission]);

            if (error) {
                console.error('Error submitting quote:', error);
                Toastify({
                    text: "Error: " + error.message,
                    duration: 5000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
                    },
                    stopOnFocus: true,
                }).showToast();
            } else {
                console.log('Quote submitted successfully:', data);

                // 3. Trigger email notification via serverless function
                try {
                    await fetch('/.netlify/functions/send-quote-email', {
                        method: 'POST',
                        body: JSON.stringify(submission)
                    });
                } catch (emailError) {
                    console.error('Failed to send email notification:', emailError);
                    // Don't show an error to the user, just log it for debugging
                }

                Toastify({
                    text: "Your quote request has been sent successfully!",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "linear-gradient(to right, #00b09b, #96c93d)",
                    },
                    stopOnFocus: true,
                    callback: function() {
                        window.location.href = "/";
                    }
                }).showToast();
                quoteForm.reset();
                document.getElementById('image-preview-container').innerHTML = '';
            }

            submitButton.disabled = false;
            submitButton.textContent = 'Submit for Quote';
        });
    }

    // Handle Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.target;
            const submitButton = form.querySelector('button[type="submit"]');
            const formData = new FormData(form);

            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            const submission = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message'),
            };

            const { data, error } = await _supabase
                .from('contacts')
                .insert([submission]);

            if (error) {
                console.error('Error submitting contact form:', error);
                Toastify({
                    text: "Error: " + error.message,
                    duration: 5000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
                    },
                    stopOnFocus: true,
                }).showToast();
            } else {
                console.log('Contact form submitted successfully:', data);
                Toastify({
                    text: "Your message has been sent successfully!",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "linear-gradient(to right, #00b09b, #96c93d)",
                    },
                    stopOnFocus: true,
                    callback: function() {
                        window.location.href = "/";
                    }
                }).showToast();
                contactForm.reset();
            }

            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        });
    }
});
