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



    // === Page Loader ===
    const pageLoader = document.getElementById('page-loader');
    
    function removeLoaderAndInit(targetId) {
        if (pageLoader) {
            // Add a small delay for the fake premium loading feel
            setTimeout(() => {
                pageLoader.style.opacity = '0';
                pageLoader.style.visibility = 'hidden';
                
                // Wait for fade transition before starting GSAP
                setTimeout(() => {
                    if (targetId !== 'home' && document.getElementById(targetId)) {
                        navigateToSection(targetId);
                    } else {
                        initAnimationsForSection('home');
                    }
                }, 600);
            }, 1200);
        } else {
            if (targetId !== 'home' && document.getElementById(targetId)) {
                navigateToSection(targetId);
            } else {
                initAnimationsForSection('home');
            }
        }
    }

    // Handle initial routing with Loader
    const initialHash = window.location.hash ? window.location.hash.substring(1) : 'home';
    removeLoaderAndInit(initialHash);

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
    const projectCards = document.querySelectorAll('.project-card');
    const projectCursor = document.querySelector('.project-cursor');
    
    if (projectCards && projectCards.length > 0) {
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
    // === LEETCODE DASHBOARD LOGIC ===
    let leetCodeInitialized = false;
    async function initLeetCodeDashboard() {
        if (leetCodeInitialized) return;
        
        const loadingEl = document.getElementById('lc-loading');
        const errorEl = document.getElementById('lc-error');
        const contentEl = document.getElementById('lc-content');
        if (!loadingEl || !errorEl || !contentEl) return;

        leetCodeInitialized = true;

        try {
            const cacheKey = 'leetcode_stats_cache';
            const cacheTimeKey = 'leetcode_stats_time';
            const cacheExpiry = 60 * 60 * 1000; // 1 hour
            
            let data = null;
            const now = Date.now();
            const cachedTime = localStorage.getItem(cacheTimeKey);
            const cachedData = localStorage.getItem(cacheKey);

            if (cachedData && cachedTime && (now - parseInt(cachedTime)) < cacheExpiry) {
                data = JSON.parse(cachedData);
            } else {
                const response = await fetch('https://leetcode-api-faisalshohag.vercel.app/Prasham_Jain1318');
                if (!response.ok) throw new Error('API Error');
                data = await response.json();
                localStorage.setItem(cacheKey, JSON.stringify(data));
                localStorage.setItem(cacheTimeKey, now.toString());
            }

            // Populate Stats
            document.getElementById('lc-total-solved').innerText = data.totalSolved;
            document.getElementById('lc-ranking').innerText = data.ranking ? data.ranking.toLocaleString() : 'N/A';
            document.getElementById('lc-easy').innerText = data.easySolved;
            document.getElementById('lc-medium').innerText = data.mediumSolved;
            document.getElementById('lc-hard').innerText = data.hardSolved;
            
            const totalSubsObj = data.totalSubmissions.find(s => s.difficulty === "All");
            const totalSubs = totalSubsObj ? totalSubsObj.submissions : 0;
            document.getElementById('lc-total-subs').innerText = totalSubs;

            // Progress bar
            const nextMilestone = data.totalSolved > 500 ? 1000 : 500;
            const progressPct = Math.min((data.totalSolved / nextMilestone) * 100, 100);
            setTimeout(() => {
                const bar = document.getElementById('lc-total-progress');
                if(bar) bar.style.width = `${progressPct}%`;
            }, 500);

            // Populate Recent Submissions
            const recentContainer = document.getElementById('lc-recent-subs');
            recentContainer.innerHTML = '';
            if (data.recentSubmissions && data.recentSubmissions.length > 0) {
                data.recentSubmissions.slice(0, 5).forEach(sub => {
                    const statusClass = sub.statusDisplay === 'Accepted' ? 'lc-status-ac' : 'lc-status-wa';
                    const date = new Date(parseInt(sub.timestamp) * 1000).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
                    recentContainer.innerHTML += `
                        <div class="lc-recent-item" style="gap: 1rem;">
                            <div style="flex: 1; min-width: 0;">
                                <a href="https://leetcode.com/problems/${sub.titleSlug}" target="_blank" class="lc-recent-title" style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${sub.title}</a>
                                <div class="lc-recent-meta" style="margin-top: 0.25rem;">
                                    <span>${date}</span>
                                    <span class="lc-recent-lang">${sub.lang}</span>
                                </div>
                            </div>
                            <div class="lc-recent-status ${statusClass}" style="flex-shrink: 0; white-space: nowrap;">${sub.statusDisplay}</div>
                        </div>
                    `;
                });
            } else {
                recentContainer.innerHTML = '<div style="color: #71717a; font-size: 0.875rem;">No recent submissions found.</div>';
            }

            // Heatmap Generation (Last 365 days)
            const heatmapContainer = document.getElementById('lc-heatmap');
            heatmapContainer.innerHTML = '';
            
            const today = new Date();
            const oneYearAgo = new Date();
            oneYearAgo.setDate(today.getDate() - 364);

            let currentDate = new Date(oneYearAgo);
            let weeksHtml = '';
            let currentWeekHtml = '';
            let dayCount = 0;

            // Align to start of week (Sunday)
            while (currentDate.getDay() !== 0) {
                currentWeekHtml += `<div style="width: 10px; height: 10px;"></div>`;
                currentDate.setDate(currentDate.getDate() + 1);
                dayCount++;
            }

            currentDate = new Date(oneYearAgo);
            let calData = data.submissionCalendar || {};
            
            const daysToGenerate = 365;
            for (let i = 0; i < daysToGenerate; i++) {
                if (dayCount === 0) currentWeekHtml = '<div class="lc-heatmap-week">';
                
                const dateStr = currentDate.toISOString().split('T')[0];
                
                let subs = 0;
                for (let key in calData) {
                    let d = new Date(parseInt(key) * 1000);
                    if (d.toISOString().split('T')[0] === dateStr) {
                        subs += calData[key];
                    }
                }

                let colorVar = '--lc-bg';
                if (subs > 0 && subs < 3) colorVar = '--lc-1';
                else if (subs >= 3 && subs < 6) colorVar = '--lc-2';
                else if (subs >= 6 && subs < 10) colorVar = '--lc-3';
                else if (subs >= 10) colorVar = '--lc-4';

                const displayDate = currentDate.toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
                const tooltipText = subs === 0 ? `No submissions on ${displayDate}` : `${subs} submissions on ${displayDate}`;

                currentWeekHtml += `
                    <div class="lc-heatmap-cell" style="background: var(${colorVar});">
                        <div class="lc-tooltip">${tooltipText}</div>
                    </div>
                `;

                currentDate.setDate(currentDate.getDate() + 1);
                dayCount++;

                if (dayCount === 7) {
                    currentWeekHtml += '</div>';
                    weeksHtml += currentWeekHtml;
                    dayCount = 0;
                }
            }

            if (dayCount > 0) {
                currentWeekHtml += '</div>';
                weeksHtml += currentWeekHtml;
            }

            heatmapContainer.innerHTML = weeksHtml;
            heatmapContainer.scrollLeft = heatmapContainer.scrollWidth; // scroll to the end (today)

            // Show Content
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';

            // Re-trigger scroll animations for the new content
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
                
                // Animate stats
                gsap.fromTo('.lc-stat-value',
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, scrollTrigger: { trigger: '#leetcode-dashboard', start: 'top 80%' }}
                );
            }
        } catch (err) {
            console.error('LeetCode API Error:', err);
            loadingEl.style.display = 'none';
            errorEl.style.display = 'block';
        }
    }

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
                    const roles = ["B.Tech CSE (AI & ML) Student", "Open Source Contributor", "GSoC Aspirant", "Future Startup Founder"];
                    let tl = gsap.timeline({ repeat: -1 });
                    
                    roles.forEach(role => {
                        tl.to(typewriter, { text: role, duration: 1.2, ease: "none", delay: 0.5 })
                          .to(typewriter, { text: "", duration: 0.8, ease: "none", delay: 2 });
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
                
                // Initialize LeetCode Dashboard
                initLeetCodeDashboard();
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
