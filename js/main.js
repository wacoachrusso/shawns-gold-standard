document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase client globally within the listener
    let _supabase;
    if (typeof supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined') {
        const { createClient } = supabase;
        _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase client initialized.");
    } else {
        console.error('Supabase client or credentials are not loaded. Some features may not work.');
    }

    // Auto-format phone number
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    if (phoneInputs.length > 0) {
        const formatPhoneNumber = (input) => {
            let value = input.value.replace(/\D/g, '');
            if (value.length > 3 && value.length <= 6) {
                value = `${value.slice(0, 3)}-${value.slice(3)}`;
            } else if (value.length > 6) {
                value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
            input.value = value;
        };
        phoneInputs.forEach(input => {
            input.addEventListener('input', () => formatPhoneNumber(input));
        });
    }

    // Preloader Logic
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.style.display = 'none';
        });
    }

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

    // Handle Hamburger Menu Toggle
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburgerMenu.classList.toggle('active');
        });
    }

    // Testimonial Slider
    const testimonialSlider = document.querySelector('.testimonial-slider-container');
    if (testimonialSlider) {
        const sliderContainer = testimonialSlider.querySelector('.testimonial-grid');
        const slides = sliderContainer.querySelectorAll('.testimonial-card');
        const nextBtn = testimonialSlider.querySelector('.next-btn');
        const prevBtn = testimonialSlider.querySelector('.prev-btn');

        if (sliderContainer && slides.length > 0) {
            let currentIndex = 0;
            let slideInterval;

            const showSlide = (index) => {
                sliderContainer.style.transform = `translateX(-${index * 100}%)`;
            };
            const nextSlide = () => {
                currentIndex = (currentIndex + 1) % slides.length;
                showSlide(currentIndex);
            };
            const prevSlide = () => {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                showSlide(currentIndex);
            };
            const startSlider = () => {
                slideInterval = setInterval(nextSlide, 5000);
            };
            const stopSlider = () => {
                clearInterval(slideInterval);
            };

            if (nextBtn) {
                nextBtn.addEventListener('click', () => { nextSlide(); stopSlider(); startSlider(); });
            }
            if (prevBtn) {
                prevBtn.addEventListener('click', () => { prevSlide(); stopSlider(); startSlider(); });
            }
            
            testimonialSlider.addEventListener('mouseenter', stopSlider);
            testimonialSlider.addEventListener('mouseleave', startSlider);
            startSlider();
        }
    }

    // Scroll Animations
    const sectionsToAnimate = document.querySelectorAll('.fade-in-section');
    if (sectionsToAnimate.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        sectionsToAnimate.forEach(section => {
            section.classList.add('hidden');
            observer.observe(section);
        });
    }

    // --- QUOTE FORM LOGIC ---
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        const successModal = document.getElementById('success-modal');
        const closeButton = document.querySelector('.close-button');
        const returnButton = document.getElementById('return-home-button');
        const userEmailSpan = document.getElementById('user-email-span');
        const fileInput = document.getElementById('photo-upload');
        const imagePreviewContainer = document.getElementById('photo-previews');
        const selectFilesBtn = document.querySelector('.btn-gold-full');

        if (closeButton && successModal) {
            closeButton.addEventListener('click', () => {
                successModal.style.display = 'none';
            });
        }

        // Keep track of selected files
        let selectedFiles = [];
        
        const updateImagePreviews = () => {
            if (!imagePreviewContainer || !fileInput) return;
            
            // Add new files to our selection
            const newFiles = Array.from(fileInput.files);
            newFiles.forEach(file => {
                // Check if we already have this file (by name and size)
                const isDuplicate = selectedFiles.some(f => 
                    f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
                );
                
                if (!isDuplicate) {
                    selectedFiles.push(file);
                }
            });
            
            // Limit to maximum 3 files
            if (selectedFiles.length > 3) {
                selectedFiles = selectedFiles.slice(0, 3);
                Toastify({
                    text: "Maximum 3 photos allowed. Only the first 3 will be used.",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "center",
                    style: { background: "#e74c3c" }
                }).showToast();
            }
            
            // Clear container and display all selected files
            imagePreviewContainer.innerHTML = '';
            
            selectedFiles.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.createElement('div');
                    preview.classList.add('image-preview-item');
                    preview.innerHTML = `
                        <div class="thumbnail-container">
                            <img src="${e.target.result}" alt="${file.name}">
                            <button type="button" class="remove-image-btn" data-index="${index}">&times;</button>
                        </div>
                        <p class="filename">${file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}</p>
                    `;
                    imagePreviewContainer.appendChild(preview);
                };
                reader.readAsDataURL(file);
            });
            
            // Create a new FileList to replace the input's files
            updateFileInput();
        };
        
        // Update the file input with our selected files
        const updateFileInput = () => {
            // We can't directly modify FileList, so we need to create a DataTransfer
            const dt = new DataTransfer();
            selectedFiles.forEach(file => dt.items.add(file));
            fileInput.files = dt.files;
        };

        // Only add change event listener since the label already triggers the file input
        if (fileInput) {
            fileInput.addEventListener('change', updateImagePreviews);
        }
        
        // Add 'Remove' button functionality
        if (imagePreviewContainer) {
            imagePreviewContainer.addEventListener('click', (e) => {
                if (e.target && e.target.classList.contains('remove-image-btn')) {
                    const index = parseInt(e.target.dataset.index);
                    
                    // Remove the file from our tracking array
                    selectedFiles = selectedFiles.filter((_, i) => i !== index);
                    
                    // Update the previews with our modified array
                    updateFileInput();
                    
                    // Refresh all the previews
                    imagePreviewContainer.innerHTML = '';
                    selectedFiles.forEach((file, i) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const preview = document.createElement('div');
                            preview.classList.add('image-preview-item');
                            preview.innerHTML = `
                                <div class="thumbnail-container">
                                    <img src="${e.target.result}" alt="${file.name}">
                                    <button type="button" class="remove-image-btn" data-index="${i}">&times;</button>
                                </div>
                                <p class="filename">${file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}</p>
                            `;
                            imagePreviewContainer.appendChild(preview);
                        };
                        reader.readAsDataURL(file);
                    });
                }
            });
        }

        quoteForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.target;
            const submitButton = form.querySelector('button[type="submit"]');
            const name = document.getElementById('full-name').value.trim();
            const emailValue = document.getElementById('email').value.trim();
            const metalType = document.getElementById('metal-type').value;

            if (!name || !emailValue || !metalType) {
                Toastify({ text: "Please fill out all required fields (Name, Email, Metal Type).", duration: 3000, close: true, gravity: "top", position: "center", style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } }).showToast();
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            try {
                const imageUrls = [];
                const cloudName = 'dcuwsbzv5';
                const uploadPreset = 'shawn-gold-uploads';
                const imageFiles = fileInput.files;

                for (const file of imageFiles) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', uploadPreset);
                    formData.append('folder', 'shawn-quotes');
                    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
                    if (!response.ok) throw new Error('Image upload failed.');
                    const data = await response.json();
                    imageUrls.push(data.secure_url);
                }

                const quoteData = {
                    name,
                    email: emailValue,
                    phone: document.getElementById('phone').value,
                    metalType: metalType,
                    itemDescription: document.getElementById('item-description').value,
                    imageUrls: imageUrls
                };

                if (!_supabase) throw new Error('Supabase client not initialized.');
                const { error: functionError } = await _supabase.functions.invoke('send-quote-confirmation', { body: quoteData });
                if (functionError) throw new Error(`Function Error: ${functionError.message}`);

                if (userEmailSpan) userEmailSpan.textContent = emailValue;
                if (successModal) successModal.style.display = 'flex';
                if (returnButton) returnButton.addEventListener('click', () => { window.location.href = '/'; });
                
                setTimeout(() => { window.location.href = '/'; }, 3000);

                form.reset();
                if (imagePreviewContainer) imagePreviewContainer.innerHTML = '';

            } catch (error) {
                console.error('Submission failed:', error);
                Toastify({ text: `An error occurred: ${error.message}`, duration: 5000, close: true, gravity: "top", position: "center", style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } }).showToast();
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit for Quote';
            }
        });
    }

    // --- CONTACT FORM LOGIC ---
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

            if (!_supabase) {
                console.error('Supabase client not initialized. Cannot submit contact form.');
                Toastify({ text: "Error: Could not connect to the server.", duration: 5000, style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } }).showToast();
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
                return;
            }

            const { data, error } = await _supabase.from('contacts').insert([submission]);

            if (error) {
                console.error('Error submitting contact form:', error);
                Toastify({ text: "Error: " + error.message, duration: 5000, close: true, gravity: "top", position: "right", style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } }).showToast();
            } else {
                console.log('Contact form submitted successfully:', data);
                // Invoke Edge Function to notify owner
                try {
                    if (!_supabase) throw new Error('Supabase client not initialized.');
                    const { error: contactFnError } = await _supabase.functions.invoke('send-contact-notification', { body: submission });
                    if (contactFnError) {
                        console.error('Owner contact notification failed:', contactFnError);
                        Toastify({
                            text: "Heads up: Your message was saved, but owner notification failed.",
                            duration: 5000,
                            close: true,
                            gravity: "top",
                            position: "right",
                            style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" }
                        }).showToast();
                    }
                } catch (fnErr) {
                    console.error('Invoking contact notification failed:', fnErr);
                    Toastify({
                        text: "Heads up: Your message was saved, but sending notification failed.",
                        duration: 5000,
                        close: true,
                        gravity: "top",
                        position: "right",
                        style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" }
                    }).showToast();
                }

                Toastify({ text: "Your message has been sent successfully!", duration: 3000, close: true, gravity: "top", position: "right", style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }, callback: () => { window.location.href = "/"; } }).showToast();
                contactForm.reset();
            }

            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        });
    }

    // --- PWA INSTALL BUTTON LOGIC ---
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installBtn.style.display = 'block';
        });

        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                installBtn.style.display = 'none';
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                deferredPrompt = null;
            }
        });

        window.addEventListener('appinstalled', () => {
            installBtn.style.display = 'none';
            deferredPrompt = null;
            console.log('PWA was installed');
        });
    }
});
