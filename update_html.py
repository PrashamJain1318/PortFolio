import re
import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Navigation item
nav_item_new = '<li><a href="#projects" class="nav-item"><i class="fas fa-briefcase"></i> <span>Projects</span></a></li>\n                    <li><a href="#coding" class="nav-item"><i class="fas fa-laptop-code"></i> <span>Profiles</span></a></li>'
content = content.replace('<li><a href="#projects" class="nav-item"><i class="fas fa-briefcase"></i> <span>Projects</span></a></li>', nav_item_new)

# 2. Extract LeetCode Dashboard
# Using regex to extract the div id="leetcode-dashboard" up to its closing tag.
# Because it's deeply nested, we can just find its start and count div openings/closings,
# or we can use a simpler approach since we know it ends exactly before </section> of experience.
lc_start = content.find('<!-- Dedicated LeetCode Dashboard Section -->')
lc_end = content.find('</section>', lc_start)

# Wait, the leetcode dashboard closes right before `</section>`.
# Let's verify by just extracting from lc_start to just before `</section>`.
leetcode_html = content[lc_start:lc_end].strip()

# Remove leetcode dashboard from content
content = content[:lc_start] + content[lc_end:]

# Modify leetcode dashboard slightly to fit inside the modal
# Remove "margin-top: 4rem; border-top: ..." inline styles which are no longer needed
leetcode_html = leetcode_html.replace('margin-top: 4rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.05);', '')

# 3. Create Coding Profiles Section
coding_section_html = """
                <!-- SECTION: CODING PROFILES -->
                <section id="coding" class="page-section">
                    <h1 class="page-title">Coding Profiles</h1>
                    <p class="page-description">My competitive programming and problem-solving journey.</p>
                    
                    <div class="profiles-grid">
                        <!-- LeetCode Card -->
                        <div class="profile-card" data-platform="leetcode">
                            <div class="profile-card-inner">
                                <div class="profile-logo" style="color: #f59e0b;"><i class="fas fa-code"></i></div>
                                <h3>LeetCode</h3>
                                <p class="profile-username">@Prasham_Jain1318</p>
                                <p class="profile-desc">Problem solving & competitive programming</p>
                                <div class="profile-action">View Dashboard <i class="fas fa-arrow-right"></i></div>
                            </div>
                            <div class="profile-glow" style="background: rgba(245, 158, 11, 0.2);"></div>
                        </div>

                        <!-- Codeforces Card -->
                        <div class="profile-card" data-platform="codeforces">
                            <div class="profile-card-inner">
                                <div class="profile-logo" style="color: #3b82f6;"><i class="fas fa-chart-bar"></i></div>
                                <h3>Codeforces</h3>
                                <p class="profile-username">@Prasham_Jain</p>
                                <p class="profile-desc">Competitive programming contests & algorithmic challenges</p>
                                <div class="profile-action">View Dashboard <i class="fas fa-arrow-right"></i></div>
                            </div>
                            <div class="profile-glow" style="background: rgba(59, 130, 246, 0.2);"></div>
                        </div>

                        <!-- CodeChef Card -->
                        <div class="profile-card" data-platform="codechef">
                            <div class="profile-card-inner">
                                <div class="profile-logo" style="color: #8b5cf6;"><i class="fas fa-utensils"></i></div>
                                <h3>CodeChef</h3>
                                <p class="profile-username">@prasham_jain</p>
                                <p class="profile-desc">Monthly cook-offs, lunchtimes, and long challenges</p>
                                <div class="profile-action">View Dashboard <i class="fas fa-arrow-right"></i></div>
                            </div>
                            <div class="profile-glow" style="background: rgba(139, 92, 246, 0.2);"></div>
                        </div>
                    </div>
                </section>
"""

# Insert coding_section before experience section
exp_start = content.find('<section id="experience"')
content = content[:exp_start] + coding_section_html + "\n" + content[exp_start:]

# 4. Create Modal Overlay
modal_overlay_html = f"""
    <!-- Coding Profiles Modal Overlay -->
    <div class="profile-modal-overlay" id="profileModal">
        <div class="profile-modal-backdrop" id="modalBackdrop"></div>
        <div class="profile-modal-container">
            <button class="modal-close-btn" id="modalCloseBtn"><i class="fas fa-times"></i></button>
            <div class="modal-content-wrapper">
                
                <!-- LeetCode Modal Content -->
                <div class="modal-pane" id="modal-leetcode">
                    {leetcode_html}
                </div>

                <!-- Codeforces Modal Content -->
                <div class="modal-pane" id="modal-codeforces" style="display: none;">
                    <div class="exp-header" style="margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                        <div style="display: flex; align-items: center; gap: 1rem; min-width: 0;">
                            <div class="exp-icon" style="color: #3b82f6; border: none; background: rgba(59, 130, 246, 0.1); width: 3rem; height: 3rem; display: flex; justify-content: center; align-items: center; border-radius: 50%; flex-shrink: 0;"><i class="fas fa-chart-bar"></i></div>
                            <div style="min-width: 0;">
                                <h3 class="exp-title" style="font-size: 1.5rem; margin: 0; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Codeforces Activity</h3>
                                <h4 class="exp-subtitle" style="margin: 0; color: #71717a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Prasham_Jain</h4>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.8rem; color: #71717a;">
                            <span id="cf-last-updated" style="display: flex; align-items: center; gap: 0.3rem;"><i class="far fa-clock"></i> Not synced</span>
                            <button id="cf-refresh-btn" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); padding: 0.4rem 0.8rem; border-radius: 0.5rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; transition: all 0.2s; font-size: 0.8rem; font-weight: 500;">
                                <i class="fas fa-sync-alt"></i> Sync
                            </button>
                        </div>
                    </div>

                    <div id="cf-loading" style="text-align: center; padding: 2rem; color: #71717a;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3b82f6; margin-bottom: 1rem;"></i>
                        <p>Fetching latest Codeforces stats...</p>
                    </div>

                    <div id="cf-error" style="display: none; text-align: center; padding: 2rem; color: #ef4444; background: rgba(239, 68, 68, 0.1); border-radius: 0.75rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Failed to load Codeforces data. Please try again later.</p>
                    </div>

                    <div id="cf-content" style="display: none; width: 100%; max-width: 100%;">
                        <!-- Stats Grid -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                            <div class="lc-stat-card">
                                <div class="lc-stat-title">Current Rating</div>
                                <div class="lc-stat-value" id="cf-rating" style="color: #3b82f6;">0</div>
                                <div class="lc-stat-sub">Rank: <span id="cf-rank" style="text-transform: capitalize;">-</span></div>
                            </div>
                            <div class="lc-stat-card">
                                <div class="lc-stat-title">Max Rating</div>
                                <div class="lc-stat-value" id="cf-max-rating" style="color: #10b981;">0</div>
                                <div class="lc-stat-sub">Max Rank: <span id="cf-max-rank" style="text-transform: capitalize;">-</span></div>
                            </div>
                            <div class="lc-stat-card">
                                <div class="lc-stat-title">Contests</div>
                                <div class="lc-stat-value" id="cf-contests">0</div>
                                <div class="lc-stat-sub">Participated</div>
                            </div>
                        </div>

                        <!-- Rating Graph -->
                        <div style="background: #18181b; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem;">
                            <div style="color: #3b82f6; font-weight: 600; font-size: 0.875rem; margin-bottom: 1rem;">Rating History</div>
                            <div id="cf-graph-container" style="width: 100%; height: 200px; position: relative;">
                                <!-- SVG Graph injected via JS -->
                            </div>
                        </div>

                        <!-- Recent Contests -->
                        <div style="background: #18181b; border-radius: 0.75rem; padding: 1.5rem;">
                            <div style="color: #3b82f6; font-weight: 600; font-size: 0.875rem; margin-bottom: 1rem;">Recent Contests</div>
                            <div id="cf-recent-contests" style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <!-- Contests injected via JS -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CodeChef Modal Content -->
                <div class="modal-pane" id="modal-codechef" style="display: none;">
                    <div class="exp-header" style="margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                        <div style="display: flex; align-items: center; gap: 1rem; min-width: 0;">
                            <div class="exp-icon" style="color: #8b5cf6; border: none; background: rgba(139, 92, 246, 0.1); width: 3rem; height: 3rem; display: flex; justify-content: center; align-items: center; border-radius: 50%; flex-shrink: 0;"><i class="fas fa-utensils"></i></div>
                            <div style="min-width: 0;">
                                <h3 class="exp-title" style="font-size: 1.5rem; margin: 0; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">CodeChef Activity</h3>
                                <h4 class="exp-subtitle" style="margin: 0; color: #71717a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">prasham_jain</h4>
                            </div>
                        </div>
                    </div>

                    <div id="cc-content" style="width: 100%; max-width: 100%;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                            <div class="lc-stat-card">
                                <div class="lc-stat-title">Current Rating</div>
                                <div class="lc-stat-value" id="cc-rating" style="color: #8b5cf6;">1400</div>
                                <div class="lc-stat-sub">Stars: <span id="cc-stars">2★</span></div>
                            </div>
                            <div class="lc-stat-card">
                                <div class="lc-stat-title">Highest Rating</div>
                                <div class="lc-stat-value" id="cc-max-rating" style="color: #10b981;">1400</div>
                                <div class="lc-stat-sub">Achieved</div>
                            </div>
                            <div class="lc-stat-card">
                                <div class="lc-stat-title">Global Rank</div>
                                <div class="lc-stat-value" id="cc-global-rank">N/A</div>
                                <div class="lc-stat-sub">Active Users</div>
                            </div>
                        </div>
                        
                        <div style="background: #18181b; border-radius: 0.75rem; padding: 2rem; text-align: center; color: #71717a;">
                            <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 1rem; color: #8b5cf6;"></i>
                            <p>CodeChef data is currently maintained manually due to public API limitations.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
"""

scripts_start = content.rfind('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js">')
content = content[:scripts_start] + modal_overlay_html + "\n" + content[scripts_start:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated index.html successfully.")
