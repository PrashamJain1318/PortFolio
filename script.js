document.addEventListener('DOMContentLoaded', () => {
    let gsapCtx; // Global GSAP context for the current section
    let gsapPluginsRegistered = false;

    function registerAvailableGsapPlugins() {
        if (gsapPluginsRegistered || typeof gsap === 'undefined') return;

        const pluginNames = [
            'Draggable',
            'DrawSVGPlugin',
            'EaselPlugin',
            'Flip',
            'GSDevTools',
            'InertiaPlugin',
            'MotionPathHelper',
            'MotionPathPlugin',
            'MorphSVGPlugin',
            'Observer',
            'Physics2DPlugin',
            'PhysicsPropsPlugin',
            'PixiPlugin',
            'ScrambleTextPlugin',
            'ScrollTrigger',
            'ScrollSmoother',
            'ScrollToPlugin',
            'SplitText',
            'TextPlugin',
            'RoughEase',
            'ExpoScaleEase',
            'SlowMo',
            'CustomEase',
            'CustomBounce',
            'CustomWiggle'
        ];

        const availablePlugins = pluginNames
            .map(name => window[name])
            .filter(Boolean);

        if (availablePlugins.length > 0) {
            gsap.registerPlugin(...availablePlugins);
        }

        gsapPluginsRegistered = true;
    }
    // === Mobile Sidebar Logic ===
    const openMenuBtn = document.getElementById('openMenuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    }

    openMenuBtn.addEventListener('click', toggleSidebar);
    closeMenuBtn.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);

    // === SPA Navigation Logic ===
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const pageSections = document.querySelectorAll('.page-section');

    function navigateToSection(targetId) {
        // Remove active class from all sections
        pageSections.forEach(section => {
            section.classList.remove('active');
        });

        // Add active class to target section
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update active class on nav items
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${targetId}`) {
                item.classList.add('active');
            }
        });

        // Scroll to top of content
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Close sidebar on mobile after clicking a link
        if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
            toggleSidebar();
        }

        // Initialize GSAP Animations for the new section
        setTimeout(() => {
            initAnimationsForSection(targetId);
        }, 50); // slight delay to allow display:block to render
    }

    // Handle clicks on sidebar links
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').substring(1);
            navigateToSection(targetId);
            // Update URL hash without jumping
            history.pushState(null, null, `#${targetId}`);
        });
    });

    // Handle internal links like "See My Projects"
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (!anchor.classList.contains('nav-item')) {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                if (document.getElementById(targetId)) {
                    navigateToSection(targetId);
                    history.pushState(null, null, `#${targetId}`);
                }
            });
        }
    });

    // Handle initial load with hash
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        if (document.getElementById(targetId)) {
            navigateToSection(targetId);
        } else {
            initAnimationsForSection('home');
        }
    } else {
        initAnimationsForSection('home');
    }

    // === Contact Form Logic ===
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerHTML;
            
            // Set loading state
            submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            const formData = {
                name: contactForm.name.value,
                email: contactForm.email.value,
                subject: contactForm.subject.value,
                message: contactForm.message.value
            };

            try {
                const response = await fetch('http://localhost:3000/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Success state
                    submitBtn.innerHTML = 'Sent Successfully! <i class="fas fa-check"></i>';
                    submitBtn.style.backgroundColor = '#3b82f6'; // blue-500
                    submitBtn.style.color = '#fff';
                    contactForm.reset();
                    
                    // Reset button after 3 seconds
                    setTimeout(() => {
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.style.backgroundColor = '';
                        submitBtn.style.color = '';
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    throw new Error(result.error || 'Failed to send message');
                }
            } catch (error) {
                console.error('Submission error:', error);
                submitBtn.innerHTML = 'Error Sending <i class="fas fa-times"></i>';
                submitBtn.style.backgroundColor = '#ef4444'; // red-500
                submitBtn.style.color = '#fff';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.color = '';
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }

    // === Global Mouse Interactions ===
    const cursorGlow = document.getElementById('cursorGlow');
    
    document.addEventListener('mousemove', (e) => {
        // Update Cursor Glow
        if (cursorGlow) {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
            if (cursorGlow.style.opacity === '0' || cursorGlow.style.opacity === '') {
                cursorGlow.style.opacity = '1';
            }
        }
    });

    // Magnetic Buttons
    const magneticElements = document.querySelectorAll('.follow-btn, .btn-visit, .btn-github, .see-projects');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(el, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.4,
                ease: 'power2.out'
            });
        });
        
        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });

    // === Project Card 3D Tilt Logic ===
    if (projectCards.length > 0) {
        projectCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate rotation based on cursor position relative to card center
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -8; // Max 8 deg
                const rotateY = ((x - centerX) / centerX) * 8;
                
                gsap.to(card, {
                    rotationX: rotateX,
                    rotationY: rotateY,
                    x: (x - centerX) * 0.05,
                    y: (y - centerY) * 0.05,
                    scale: 1.02,
                    transformPerspective: 1000,
                    ease: 'power2.out',
                    duration: 0.4
                });
                
                // Optional: move the image slightly for parallax
                const img = card.querySelector('.project-image');
                if (img) {
                    gsap.to(img, {
                        x: (x - centerX) * 0.05,
                        y: (y - centerY) * 0.05,
                        scale: 1.05,
                        duration: 0.4,
                        ease: 'power2.out'
                    });
                }
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationX: 0,
                    rotationY: 0,
                    x: 0,
                    y: 0,
                    scale: 1,
                    ease: 'power2.out',
                    duration: 0.7
                });
                
                const img = card.querySelector('.project-image');
                if (img) {
                    gsap.to(img, {
                        x: 0,
                        y: 0,
                        scale: 1,
                        duration: 0.7,
                        ease: 'power2.out'
                    });
                }
            });

            // Keep the original tooltip logic but we only need mouseenter/mouseleave to toggle class
            card.addEventListener('mouseenter', () => {
                const projectName = card.getAttribute('data-project');
                if (projectName && projectCursor) {
                    projectCursor.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 0.6rem;">
                            <img src="https://port-folio-mu-five-64.vercel.app/Hexagon.png" alt="logo" class="cursor-icon">
                            <div style="display: flex; flex-direction: column;">
                                <span>${projectName}</span>
                                <span style="font-size: 0.65rem; color: #a1a1aa; font-weight: 400; margin-top: 2px;">View Project &rarr;</span>
                            </div>
                        </div>
                    `;
                    projectCursor.classList.add('active');
                }
            });
            card.addEventListener('mouseleave', () => {
                if (projectCursor) projectCursor.classList.remove('active');
            });
        });
        
        // Tooltip follows mouse globally, but only visible on hover (handled by active class)
        if (projectCursor) {
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            
            if (!isTouchDevice) {
                document.addEventListener('mousemove', (e) => {
                    // Get viewport boundaries to prevent overflow
                    let x = e.clientX;
                    let y = e.clientY;
                    
                    const cursorRect = projectCursor.getBoundingClientRect();
                    const halfWidth = (cursorRect.width || 200) / 2;
                    
                    if (x + halfWidth > window.innerWidth - 10) x = window.innerWidth - halfWidth - 10;
                    if (x - halfWidth < 10) x = halfWidth + 10;
                    if (y < 80) y = 80; // prevent going too high above the cursor
                    
                    gsap.to(projectCursor, {
                        left: x,
                        top: y,
                        duration: 0.4,
                        ease: "power3.out"
                    });
                });
            } else {
                // Disable custom cursor on touch devices
                projectCursor.style.display = 'none';
            }
        }
    }

    // === GSAP Animations ===
    function initAnimationsForSection(sectionId) {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        registerAvailableGsapPlugins();
        
        if (gsapCtx) {
            gsapCtx.revert(); // Clean up previous section's animations
        }

        const section = document.getElementById(sectionId);
        if (!section) return;

        gsapCtx = gsap.context(() => {
            // General text reveal for headings and paragraphs
            const textElements = section.querySelectorAll('.page-title, .page-description, .hero-title, .hero-subtitle, .hero-description, .about-content p, .about-content h3');
            
            textElements.forEach(el => {
                gsap.fromTo(el, 
                    { y: 30, opacity: 0 },
                    { 
                        y: 0, 
                        opacity: 1, 
                        duration: 0.8, 
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 85%",
                            toggleActions: "play none none none",
                            once: true
                        }
                    }
                );
            });

            // Section specific animations
            if (sectionId === 'home') {
                gsap.fromTo('.connect-banner', 
                    { scale: 0.9, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)", delay: 0.4 }
                );
                gsap.fromTo('.featured-work', 
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: '.featured-work', start: "top 85%", once: true }}
                );
                
                // Typewriter effect
                const typewriter = document.getElementById('typewriter');
                if (typewriter) {
                    typewriter.innerText = "";
                    gsap.to(typewriter, {
                        text: "full-stack AI Builder",
                        duration: 1.5,
                        delay: 0.8,
                        ease: "none"
                    });
                }
            }
            else if (sectionId === 'projects') {
                gsap.fromTo('.project-card', 
                    { y: 60, opacity: 0 },
                    { 
                        y: 0, 
                        opacity: 1, 
                        duration: 0.6, 
                        stagger: 0.15,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: '.projects-grid',
                            start: "top 80%",
                            once: true
                        }
                    }
                );
            }
            else if (sectionId === 'experience') {
                const timelineItems = section.querySelectorAll('.timeline-item');
                timelineItems.forEach((item, i) => {
                    const direction = i % 2 === 0 ? -50 : 50; 
                    gsap.fromTo(item,
                        { x: direction, opacity: 0 },
                        {
                            x: 0,
                            opacity: 1,
                            duration: 0.8,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: item,
                                start: "top 85%",
                                once: true
                            }
                        }
                    );
                });
                gsap.fromTo('.timeline-dot',
                    { scale: 0 },
                    { scale: 1, duration: 0.5, stagger: 0.2, scrollTrigger: { trigger: '.timeline-container', start: "top 85%", once: true } }
                );

                // Timeline Line Growth Animation
                timelineItems.forEach(item => {
                    gsap.to(item, {
                        "--progress": "100%",
                        ease: "none",
                        scrollTrigger: {
                            trigger: item,
                            start: "top 50%",
                            end: "bottom 50%",
                            scrub: 1
                        }
                    });
                });

                // Stat Counters Animation
                const counters = document.querySelectorAll('.stat-counter');
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    const suffix = counter.getAttribute('data-suffix') || '';
                    gsap.to(counter, {
                        innerHTML: target,
                        duration: 2,
                        snap: { innerHTML: 1 },
                        ease: "power2.out",
                        onUpdate: function() {
                            counter.innerHTML = Math.round(this.targets()[0].innerHTML) + suffix;
                        },
                        scrollTrigger: {
                            trigger: counter,
                            start: "top 90%",
                            once: true
                        }
                    });
                    counter.innerHTML = "0" + suffix;
                });
            }
            else if (sectionId === 'tools') {
                gsap.fromTo('.shovel-card',
                    { y: 40, opacity: 0, scale: 0.9 },
                    {
                        y: 0, opacity: 1, scale: 1,
                        duration: 0.5,
                        stagger: 0.05,
                        ease: "back.out(1.2)",
                        scrollTrigger: {
                            trigger: '.shovels-grid',
                            start: "top 85%",
                            once: true
                        }
                    }
                );
            }
            else if (sectionId === 'about') {
                gsap.fromTo('.skill-card',
                    { y: 30, opacity: 0 },
                    {
                        y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out",
                        scrollTrigger: {
                            trigger: '.skills-grid',
                            start: "top 85%",
                            once: true
                        }
                    }
                );
            }
            else if (sectionId === 'contact') {
                gsap.fromTo('.contact-card',
                    { x: -30, opacity: 0 },
                    {
                        x: 0, opacity: 1, duration: 0.6, stagger: 0.2, ease: "power2.out",
                        scrollTrigger: {
                            trigger: '.contact-methods',
                            start: "top 85%",
                            once: true
                        }
                    }
                );
                gsap.fromTo('.contact-form .form-group',
                    { y: 20, opacity: 0 },
                    {
                        y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out",
                        scrollTrigger: {
                            trigger: '.contact-form',
                            start: "top 85%",
                            once: true
                        }
                    }
                );
            }

            // Footer Animation (applies to all sections since footer is global, but we can animate it when visible)
            gsap.fromTo('.footer-links span', 
                { y: 20, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.6, 
                    stagger: 0.2, 
                    ease: "power2.out", 
                    scrollTrigger: { 
                        trigger: '.footer', 
                        start: "top 95%", 
                        once: true 
                    }
                }
            );

            // Tell ScrollTrigger to recalculate
            ScrollTrigger.refresh();
            
        }, section);
    }
});
