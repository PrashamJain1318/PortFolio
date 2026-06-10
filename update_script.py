import sys

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert new dashboard logic before initAnimationsForSection
new_logic = """
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

"""

func_index = content.find('function initAnimationsForSection')
content = content[:func_index] + new_logic + content[func_index:]

# 2. Add coding section animations
anim_logic = """
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
            }"""

exp_block = content.find("else if (sectionId === 'experience')")
content = content[:exp_block] + anim_logic.strip() + "\n            " + content[exp_block:]

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("script.js updated successfully")
