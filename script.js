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
    const LC_CONFIG = {
        USERNAME: "Prasham_Jain1318",
        REFRESH_INTERVAL: 30 * 60 * 1000 // 30 minutes
    };

    let leetCodeInitialized = false;
    let lcRefreshInterval = null;

    async function initLeetCodeDashboard(forceRefresh = false) {
        if (leetCodeInitialized && !forceRefresh) return;
        
        const loadingEl = document.getElementById('lc-loading');
        const errorEl = document.getElementById('lc-error');
        const contentEl = document.getElementById('lc-content');
        const refreshBtn = document.getElementById('lc-refresh-btn');
        const lastUpdatedEl = document.getElementById('lc-last-updated');
        
        if (!loadingEl || !errorEl || !contentEl) return;

        if (refreshBtn && !refreshBtn.hasAttribute('data-initialized')) {
            refreshBtn.setAttribute('data-initialized', 'true');
            refreshBtn.addEventListener('click', () => {
                initLeetCodeDashboard(true);
            });
            // Setup auto refresh interval
            if (!lcRefreshInterval) {
                lcRefreshInterval = setInterval(() => initLeetCodeDashboard(true), LC_CONFIG.REFRESH_INTERVAL);
            }
        }

        leetCodeInitialized = true;

        if (forceRefresh) {
            loadingEl.style.display = 'block';
            contentEl.style.display = 'none';
            errorEl.style.display = 'none';
            if (refreshBtn) refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
        }

        try {
            const cacheKey = 'leetcode_stats_cache';
            const cacheTimeKey = 'leetcode_stats_time';
            
            let data = null;
            let updateTime = null;
            const now = Date.now();
            const cachedTime = localStorage.getItem(cacheTimeKey);
            const cachedData = localStorage.getItem(cacheKey);

            if (!forceRefresh && cachedData && cachedTime && (now - parseInt(cachedTime)) < LC_CONFIG.REFRESH_INTERVAL) {
                data = JSON.parse(cachedData);
                updateTime = new Date(parseInt(cachedTime));
            } else {
                const response = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${LC_CONFIG.USERNAME}`);
                if (!response.ok) throw new Error('API Error');
                data = await response.json();
                updateTime = new Date();
                localStorage.setItem(cacheKey, JSON.stringify(data));
                localStorage.setItem(cacheTimeKey, updateTime.getTime().toString());
            }

            // Update Last Updated Text
            if (lastUpdatedEl) {
                const minsAgo = Math.floor((new Date() - updateTime) / 60000);
                lastUpdatedEl.innerHTML = `<i class="far fa-clock"></i> ${minsAgo === 0 ? 'Updated just now' : `Updated ${minsAgo} min${minsAgo === 1 ? '' : 's'} ago`}`;
            }
            if (refreshBtn) refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync';

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
        } catch (error) {
            console.error('Failed to load LeetCode data:', error);
            loadingEl.style.display = 'none';
            errorEl.style.display = 'block';
            contentEl.style.display = 'none';
            const refreshBtn = document.getElementById('lc-refresh-btn');
            if (refreshBtn) refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync Failed';
        }
    }

    
    // === CODEFORCES DASHBOARD LOGIC ===
    let cfInitialized = false;
    async function initCodeforcesDashboard(forceRefresh = false) {
        if (cfInitialized && !forceRefresh) return;
        
        const loadingEl = document.getElementById('cf-loading');
        const errorEl = document.getElementById('cf-error');
        const contentEl = document.getElementById('cf-content');
        const refreshBtn = document.getElementById('cf-refresh-btn');
        const lastUpdatedEl = document.getElementById('cf-last-updated');
        
        if (!loadingEl || !errorEl || !contentEl) return;

        if (refreshBtn && !refreshBtn.hasAttribute('data-initialized')) {
            refreshBtn.setAttribute('data-initialized', 'true');
            refreshBtn.addEventListener('click', () => {
                initCodeforcesDashboard(true);
            });
        }

        cfInitialized = true;

        if (forceRefresh) {
            loadingEl.style.display = 'block';
            contentEl.style.display = 'none';
            errorEl.style.display = 'none';
            if (refreshBtn) refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
        }

        try {
            // Fetch User Info
            const infoRes = await fetch('https://codeforces.com/api/user.info?handles=Prasham_Jain');
            if (!infoRes.ok) throw new Error('API Error');
            const infoData = await infoRes.json();
            const user = infoData.result[0];

            document.getElementById('cf-rating').innerText = user.rating || 0;
            document.getElementById('cf-rank').innerText = user.rank || 'Unrated';
            document.getElementById('cf-max-rating').innerText = user.maxRating || 0;
            document.getElementById('cf-max-rank').innerText = user.maxRank || 'Unrated';

            // Fetch Rating History
            const ratingRes = await fetch('https://codeforces.com/api/user.rating?handle=Prasham_Jain');
            if (!ratingRes.ok) throw new Error('API Error');
            const ratingData = await ratingRes.json();
            const ratings = ratingData.result;

            document.getElementById('cf-contests').innerText = ratings.length;

            // Generate Rating SVG Graph
            if (ratings.length > 0) {
                const graphContainer = document.getElementById('cf-graph-container');
                const width = graphContainer.clientWidth || 800;
                const height = 200;
                const padding = 20;
                
                const minRating = Math.min(...ratings.map(r => r.newRating));
                const maxRating = Math.max(...ratings.map(r => r.newRating));
                const minTime = ratings[0].ratingUpdateTimeSeconds;
                const maxTime = ratings[ratings.length - 1].ratingUpdateTimeSeconds;
                
                const getX = t => padding + ((t - minTime) / (maxTime - minTime || 1)) * (width - padding * 2);
                const getY = r => height - padding - ((r - minRating) / (maxRating - minRating || 1)) * (height - padding * 2);

                let d = `M ${getX(ratings[0].ratingUpdateTimeSeconds)} ${getY(ratings[0].newRating)}`;
                let pointsHtml = '';

                ratings.forEach(r => {
                    const x = getX(r.ratingUpdateTimeSeconds);
                    const y = getY(r.newRating);
                    d += ` L ${x} ${y}`;
                    const dateStr = new Date(r.ratingUpdateTimeSeconds * 1000).toLocaleDateString();
                    pointsHtml += `<circle cx="${x}" cy="${y}" r="4" class="cf-graph-point"><title>${r.contestName}&#10;Rating: ${r.newRating}&#10;Date: ${dateStr}</title></circle>`;
                });

                const areaD = `${d} L ${getX(maxTime)} ${height} L ${getX(minTime)} ${height} Z`;

                graphContainer.innerHTML = `
                    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="cf-gradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
                                <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
                            </linearGradient>
                        </defs>
                        <path d="${areaD}" class="cf-graph-area"/>
                        <path d="${d}" class="cf-graph-line"/>
                        ${pointsHtml}
                    </svg>
                `;
            }

            // Populate Recent Contests
            const recentContainer = document.getElementById('cf-recent-contests');
            recentContainer.innerHTML = '';
            const recent = [...ratings].reverse().slice(0, 5);
            if (recent.length > 0) {
                recent.forEach(r => {
                    const diff = r.newRating - r.oldRating;
                    const color = diff >= 0 ? '#10b981' : '#ef4444';
                    const sign = diff >= 0 ? '+' : '';
                    recentContainer.innerHTML += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <div style="flex: 1; min-width: 0;">
                                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.9rem; margin-bottom: 0.25rem;">${r.contestName}</div>
                                <div style="font-size: 0.75rem; color: #71717a;">Rank: ${r.rank}</div>
                            </div>
                            <div style="color: ${color}; font-weight: 600; font-family: 'Fira Code', monospace; flex-shrink: 0; margin-left: 1rem;">
                                ${sign}${diff}
                            </div>
                        </div>
                    `;
                });
            } else {
                recentContainer.innerHTML = '<div style="color: #71717a; font-size: 0.875rem;">No contests found.</div>';
            }

            if (lastUpdatedEl) lastUpdatedEl.innerHTML = `<i class="far fa-clock"></i> Updated just now`;
            if (refreshBtn) refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync';

            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
            errorEl.style.display = 'none';

        } catch (error) {
            console.error('Codeforces Error:', error);
            loadingEl.style.display = 'none';
            errorEl.style.display = 'block';
            contentEl.style.display = 'none';
            if (refreshBtn) refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync Failed';
        }
    }

    // === CODECHEF DASHBOARD LOGIC (Mock) ===
    function initCodeChefDashboard() {
        // Since no stable public API is available, data is hardcoded and manually updated.
        // The HTML already contains the mock stats. We just display it.
        // No fetching needed.
    }

    // === PROFILE MODAL LOGIC ===
    const profileModal = document.getElementById('profileModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const profileCards = document.querySelectorAll('.profile-card');
    const modalPanes = document.querySelectorAll('.modal-pane');

    function openModal(platform) {
        if (!profileModal) return;
        
        // Hide all panes, show target pane
        modalPanes.forEach(pane => pane.style.display = 'none');
        const targetPane = document.getElementById(`modal-${platform}`);
        if (targetPane) targetPane.style.display = 'block';

        // Show modal container
        profileModal.style.display = 'flex';
        gsap.fromTo(profileModal, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(profileModal.querySelector('.profile-modal-container'), 
            { y: 50, scale: 0.95 }, 
            { y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" }
        );

        document.body.style.overflow = 'hidden'; // prevent scrolling behind modal

        // Initialize corresponding dashboard
        if (platform === 'leetcode') initLeetCodeDashboard();
        if (platform === 'codeforces') initCodeforcesDashboard();
        if (platform === 'codechef') initCodeChefDashboard();
    }

    function closeModal() {
        if (!profileModal) return;
        gsap.to(profileModal, { 
            opacity: 0, 
            duration: 0.3, 
            onComplete: () => {
                profileModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && profileModal && profileModal.style.display === 'flex') {
            closeModal();
        }
    });

    // Add click listeners to cards
    profileCards.forEach(card => {
        card.addEventListener('click', () => {
            const platform = card.getAttribute('data-platform');
            openModal(platform);
        });
    });

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
            const textElements = section.querySelectorAll('.page-title, .page-description, .hero-title, .hero-subtitle, .hero-roles, .hero-description, .about-content p, .about-content h3');
            
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
                    const roles = [
                        "Open Source Contributor",
                        "Full-Stack Developer",
                        "AI & ML Enthusiast",
                        "GSoC Aspirant",
                        "Future Startup Founder",
                        "Problem Solver",
                        "Tech Explorer"
                    ];
                    let tl = gsap.timeline({ repeat: -1 });
                    
                    roles.forEach(role => {
                        tl.to(typewriter, { text: role, duration: 1.5, ease: "none", delay: 0.2 })
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
            else if (sectionId === 'coding') {
                gsap.fromTo('.profile-card',
                    { y: 40, opacity: 0, scale: 0.95 },
                    {
                        y: 0, opacity: 1, scale: 1,
                        duration: 0.6,
                        stagger: 0.15,
                        ease: "back.out(1.2)",
                        scrollTrigger: {
                            trigger: '.profiles-grid',
                            start: "top 85%",
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
