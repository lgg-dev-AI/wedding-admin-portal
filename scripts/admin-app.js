// ==========================================================================
// MAIN CONTROLLER & APPLICATION LOGIC
// ==========================================================================

let activeRole = "planner";
let activeFilter = "all";

document.addEventListener('DOMContentLoaded', () => {
    populateWeddingSelectorForUser();

    // Auto-generate couple username slug when typing wedding couple names
    const newNamesInput = document.getElementById('newWNames');
    const newCoupleUserInput = document.getElementById('newWCoupleUser');
    if (newNamesInput && newCoupleUserInput) {
        newNamesInput.addEventListener('input', (e) => {
            if (!newCoupleUserInput.dataset.userEdited || newCoupleUserInput.dataset.userEdited === 'false') {
                const slug = e.target.value.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                newCoupleUserInput.value = slug;
            }
        });
        newCoupleUserInput.addEventListener('input', () => {
            newCoupleUserInput.dataset.userEdited = 'true';
        });
    }
});

/**
 * Returns array of weddings available for the currently active authenticated user or demo explorer.
 * Planners (e.g. gzzwicho2101@gmail.com) ONLY get weddings they created / own.
 * Master Developer & unauthenticated demo mode get the demo showcases.
 */
function getWeddingsForActiveUser() {
    const isDemo = sessionStorage.getItem('antigravity_demo_mode') === 'true' || 
                   sessionStorage.getItem('antigravity_is_demo_trial') === 'true';
    const authRoleKey = (typeof AUTH_CONFIG !== 'undefined' && AUTH_CONFIG.ROLE_KEY) ? AUTH_CONFIG.ROLE_KEY : 'antigravity_user_role';
    const authUserKey = (typeof AUTH_CONFIG !== 'undefined' && AUTH_CONFIG.USER_KEY) ? AUTH_CONFIG.USER_KEY : 'antigravity_logged_user';
    const devMasterEmail = (typeof AUTH_CONFIG !== 'undefined' && AUTH_CONFIG.DEVELOPER_EMAIL) ? AUTH_CONFIG.DEVELOPER_EMAIL : 'antigravitywebstudio@hotmail.com';

    const activeRoleAuth = sessionStorage.getItem(authRoleKey);
    const activeEmail = (sessionStorage.getItem(authUserKey) || 
                         sessionStorage.getItem('antigravity_user_email') || '').toLowerCase();

    // 1. Master Developer (Luis) always sees everything (demo + custom)
    const isDev = (activeRoleAuth === 'developer') && (activeEmail === devMasterEmail.toLowerCase());
    if (isDev) {
        const demoKeys = Object.keys(WEDDINGS_DB);
        const demoWeddings = demoKeys.map(k => ({ id: k, ...WEDDINGS_DB[k] }));
        const devCustomRaw = localStorage.getItem(`wp_weddings_by_planner_${activeEmail}`) || '[]';
        let devCustom = [];
        try { devCustom = JSON.parse(devCustomRaw); } catch(e){}
        const devWeddings = devCustom.map(id => getWeddingState(id)).filter(Boolean);
        return [...demoWeddings, ...devWeddings];
    }

    // 2. Unauthenticated explorer or pure public demo (no planner email logged in)
    if (!activeEmail) {
        return Object.keys(WEDDINGS_DB).map(k => ({ id: k, ...WEDDINGS_DB[k] }));
    }

    // 3. Real Wedding Planner Client (e.g. gzzwicho2101@gmail.com or registered planners)
    // NEVER show demo weddings to an authenticated planner's workspace!
    const key = `wp_weddings_by_planner_${activeEmail}`;
    let listIds = [];
    try {
        listIds = JSON.parse(localStorage.getItem(key) || '[]');
    } catch(e) {
        listIds = [];
    }
    
    // Also scan for any custom weddings owned by this planner
    const result = [];
    listIds.forEach(id => {
        const w = getWeddingState(id);
        if (w) result.push(w);
    });

    return result;
}

/**
 * Dynamically builds <select id="weddingSelect"> based on active planner's tenant isolation.
 */
function populateWeddingSelectorForUser() {
    const select = document.getElementById('weddingSelect');
    if (!select) return;

    const weddings = getWeddingsForActiveUser();
    select.innerHTML = '';

    if (weddings.length === 0) {
        // Planner has no weddings yet
        const emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.text = '✨ Sin bodas (Crea tu 1ra boda)';
        emptyOpt.selected = true;
        select.appendChild(emptyOpt);

        currentWeddingId = null;
        currentData = null;
        localStorage.removeItem('wp_active_wedding_id');

        // Show empty state banner in Dashboard
        const emptyBanner = document.getElementById('dashboardEmptyState');
        const activeContent = document.getElementById('dashboardActiveWeddingContent');
        if (emptyBanner) emptyBanner.style.display = 'block';
        if (activeContent) activeContent.style.display = 'none';

        // Update sidebar header to clean empty placeholder
        const themeTag = document.getElementById('sidebarThemeTag');
        if (themeTag) themeTag.innerText = '✨ Mi Espacio Planner';
        const coupleNames = document.getElementById('sidebarCoupleNames');
        if (coupleNames) coupleNames.innerText = 'Sin Bodas Creadas';
        const weddingDate = document.getElementById('sidebarWeddingDate');
        if (weddingDate) weddingDate.innerText = 'Registra tu primera boda con "+ Nueva Boda"';
        const dashTitle = document.getElementById('dashTitle');
        if (dashTitle) dashTitle.innerText = 'Dashboard · Sin Bodas';

        try { updateLivePreviewButton(); } catch(e) {}
        try { updateHeaderBriefingButton(); } catch(e) {}
        try { if (typeof renderVendorsTab === 'function') renderVendorsTab(); } catch(e) {}
        try { if (typeof recalcBar === 'function') recalcBar(); } catch(e) {}
        try { if (typeof renderDayOfTab === 'function') renderDayOfTab(); } catch(e) {}
        try { if (typeof renderHostessDashboard === 'function') renderHostessDashboard(); } catch(e) {}
        try { if (typeof renderAlbumTab === 'function') renderAlbumTab(); } catch(e) {}
        try { if (typeof renderPlaylistTab === 'function') renderPlaylistTab(); } catch(e) {}
        try { if (typeof renderTravelTab === 'function') renderTravelTab(); } catch(e) {}
        try { if (typeof renderGuestTable === 'function') renderGuestTable(); } catch(e) {}
        try { if (typeof renderSeatingChart === 'function') renderSeatingChart(); } catch(e) {}
        try { 
            if (typeof renderFinanceTab === 'function') renderFinanceTab(); 
            if (typeof renderDestinationPaymentsSuite === 'function') renderDestinationPaymentsSuite();
        } catch(e) {}
        return;
    }

    // Populate dropdown with user's available weddings
    weddings.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.text = w.themeTag ? `${w.couple} (${w.themeTag.split(' ')[0] || '💍'})` : `💍 ${w.couple}`;
        select.appendChild(opt);
    });

    // Determine which wedding to activate
    const savedActive = localStorage.getItem('wp_active_wedding_id');
    const hasSaved = weddings.find(w => w.id === savedActive);
    const targetId = hasSaved ? savedActive : weddings[0].id;

    switchWedding(targetId);
}

function switchWedding(weddingId) {
    try {
        if (!weddingId) {
            return;
        }
        currentWeddingId = weddingId;
        localStorage.setItem('wp_active_wedding_id', weddingId);
        currentData = getWeddingState(weddingId);

        // Ensure active dashboard content is visible
        const emptyBanner = document.getElementById('dashboardEmptyState');
        const activeContent = document.getElementById('dashboardActiveWeddingContent');
        if (emptyBanner) emptyBanner.style.display = 'none';
        if (activeContent) activeContent.style.display = 'block';

        // 1. Sync dropdown selector
        const weddingSelect = document.getElementById('weddingSelect');
        if (weddingSelect && weddingSelect.value !== weddingId) {
            weddingSelect.value = weddingId;
        }
        
        // 2. Direct bulletproof DOM updates for couple names & branding everywhere
        const themeTag = document.getElementById('sidebarThemeTag');
        if (themeTag) themeTag.innerText = currentData.themeTag || '🌿 Boda Activa';

        const coupleNames = document.getElementById('sidebarCoupleNames');
        if (coupleNames) coupleNames.innerText = currentData.couple;

        const weddingDate = document.getElementById('sidebarWeddingDate');
        if (weddingDate) weddingDate.innerText = `📍 ${currentData.venue} · ${currentData.date}`;

        // Table QR Stand preview name update
        const tableQrCouple = document.getElementById('tableQrCoupleDisplay');
        if (tableQrCouple) tableQrCouple.innerText = currentData.couple;

        // Dashboard title update
        const dashTitle = document.getElementById('dashTitle');
        if (dashTitle) dashTitle.innerText = `Dashboard · ${currentData.couple}`;

        // Safe helpers
        try { updateLivePreviewButton(); } catch(e) { console.warn('updateLivePreviewButton error:', e); }
        try { updateHeaderBriefingButton(); } catch(e) { console.warn('updateHeaderBriefingButton error:', e); }

        // Safely render tabs without cascading breakages
        const safeRender = (fnName) => {
            try {
                if (typeof window[fnName] === 'function') {
                    window[fnName]();
                } else {
                    const fn = eval('typeof ' + fnName + ' === "function" ? ' + fnName + ' : null');
                    if (fn) fn();
                }
            } catch (err) {
                console.warn(`[switchWedding] Error running ${fnName}:`, err);
            }
        };

        // Render core views
        try { if (typeof renderDashboard === 'function') renderDashboard(); } catch(e) {}
        try { if (typeof renderDispatchTab === 'function') renderDispatchTab(); } catch(e) {}
        try { if (typeof renderSeatingChart === 'function') renderSeatingChart(); } catch(e) {}
        try { if (typeof renderGuestTable === 'function') renderGuestTable(); } catch(e) {}
        try { 
            if (typeof renderFinanceTab === 'function') renderFinanceTab(); 
            if (typeof renderDestinationPaymentsSuite === 'function') renderDestinationPaymentsSuite();
        } catch(e) {}
        try { if (typeof renderVendorsTab === 'function') renderVendorsTab(); } catch(e) {}
        try { if (typeof recalcBar === 'function') recalcBar(); } catch(e) {}
        try { if (typeof renderDayOfTab === 'function') renderDayOfTab(); } catch(e) {}
        try { if (typeof renderAlbumTab === 'function') renderAlbumTab(); } catch(e) {}
        try { if (typeof renderPlaylistTab === 'function') renderPlaylistTab(); } catch(e) {}
        try { if (typeof renderTravelTab === 'function') renderTravelTab(); } catch(e) {}
        try { if (typeof renderSettingsTab === 'function') renderSettingsTab(); } catch(e) {}

        // Check if there is an active tab open and re-render it if needed
        const activeTabPane = document.querySelector('.tab-pane.active');
        if (activeTabPane && activeTabPane.id) {
            const currentTabName = activeTabPane.id.replace('tab-', '');
            if (currentTabName === 'hostess') {
                safeRender('renderHostessDashboard');
            } else if (currentTabName === 'dashboard') {
                try { if (typeof renderDashboard === 'function') renderDashboard(); } catch(e) {}
            } else if (currentTabName === 'finance') {
                try { 
                    if (typeof renderFinanceTab === 'function') renderFinanceTab(); 
                    if (typeof renderDestinationPaymentsSuite === 'function') renderDestinationPaymentsSuite();
                } catch(e) {}
            }
        }

        if (typeof showToast === 'function') {
            showToast(`Cargando datos de ${currentData.couple}...`);
        }
    } catch (globalErr) {
        console.error('[switchWedding] Critical error switching wedding:', globalErr);
    }
}

function refreshSidebarWeddingInfo() {
    currentData = getWeddingState(currentWeddingId);
    if (!currentData) return;
    const themeTag = document.getElementById('sidebarThemeTag');
    if (themeTag) themeTag.innerText = currentData.themeTag || '🌿 Boda Activa';

    const coupleNames = document.getElementById('sidebarCoupleNames');
    if (coupleNames) coupleNames.innerText = currentData.couple;

    const weddingDate = document.getElementById('sidebarWeddingDate');
    if (weddingDate) weddingDate.innerText = `📍 ${currentData.venue} · ${currentData.date}`;

    // Also update any elements in header or dashboard
    const dashTitle = document.getElementById('dashTitle');
    if (dashTitle) dashTitle.innerText = `Dashboard · ${currentData.couple}`;
}

function setRole(role) {
    activeRole = role;
    const btnPlanner = document.getElementById('btnRolePlanner');
    const btnCouple = document.getElementById('btnRoleCouple');
    const btnDev = document.getElementById('btnRoleDeveloper');

    if (btnPlanner) btnPlanner.classList.toggle('active', role === 'planner');
    if (btnCouple) btnCouple.classList.toggle('active', role === 'couple');
    if (btnDev) btnDev.classList.toggle('active', role === 'developer');

    // Planner-only controls
    document.querySelectorAll('.planner-only').forEach(el => {
        el.style.display = (role === 'planner') ? 'flex' : 'none';
    });

    // El botón Modo Día D del header está disponible tanto para Wedding Planner como para Master Developer
    const triggerDayD = document.getElementById('btnTriggerDayD');
    if (triggerDayD) {
        triggerDayD.style.display = (role === 'planner' || role === 'developer') ? 'inline-flex' : 'none';
    }

    const devPanelBtn = document.getElementById('menuItemDevPanel');
    const devBackupsBtn = document.getElementById('menuItemDevBackups');

    if (role === 'developer') {
        // =========================================================================
        // VISTA 1: 💎 MASTER DEVELOPER (SOLO LO QUE LE INTERESA A LUIS COMO DUEÑO)
        // =========================================================================
        // Solo 4 pestañas maestras para Luis:
        // 1. Planners, Cobranza & Stripe (dev-clients)
        // 2. Métricas & Crecimiento SaaS (dev-analytics)
        // 3. Configuración de Planes Comerciales (settings)
        // 4. Respaldos de Base de Datos JSON (backups)
        const allowedDevTabs = ['dev-clients', 'dev-analytics', 'album', 'playlist', 'settings', 'backups'];

        document.querySelectorAll('.sidebar-menu .menu-item').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick') || '';
            const isAllowed = allowedDevTabs.some(tab => onclickAttr.includes(`showTab('${tab}')`));
            btn.style.display = isAllowed ? 'flex' : 'none';
        });

        // Ocultar fases de boda y mostrar sección Master Dev
        document.querySelectorAll('.menu-section-header[data-section]').forEach(hdr => hdr.style.display = 'none');
        const devSec = document.getElementById('secHeaderMasterDev');
        if (devSec) devSec.style.display = 'flex';

        // Personalizar la tarjeta superior del Sidebar para Luis / Antigravity
        const heroTag = document.getElementById('sidebarThemeTag');
        const heroCouple = document.getElementById('sidebarCoupleNames');
        const heroDate = document.getElementById('sidebarWeddingDate');
        if (heroTag) heroTag.innerText = '💎 Torre de Control';
        if (heroCouple) heroCouple.innerText = 'Antigravity Studio';
        if (heroDate) heroDate.innerText = '🏢 Monitoreo SaaS & Finanzas';

        showTab('dev-clients');
        showToast('💎 Modo Master Developer: Mostrando Planners, Métricas, Álbum QR, DJ, Planes y Respaldos.');

    } else if (role === 'planner') {
        // =========================================================================
        // VISTA 2: 👑 WEDDING PLANNER (SIMULACIÓN EXACTA DE LO QUE VE EL CLIENTE)
        // =========================================================================
        sessionStorage.setItem('antigravity_user_role', 'planner');
        refreshSidebarWeddingInfo();

        const devOnlyTabs = ['dev-clients', 'dev-analytics', 'backups'];
        document.querySelectorAll('.sidebar-menu .menu-item').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick') || '';
            const isDevOnly = devOnlyTabs.some(tab => onclickAttr.includes(`showTab('${tab}')`)) || btn.classList.contains('dev-only');
            btn.style.display = isDevOnly ? 'none' : 'flex';
        });

        // Mostrar todas las 4 fases de boda y ajustes planner, ocultar dev
        document.querySelectorAll('.menu-section-header[data-section]').forEach(hdr => hdr.style.display = 'flex');
        const devSec = document.getElementById('secHeaderMasterDev');
        if (devSec) devSec.style.display = 'none';

        // Si estaba en pestaña exclusiva de desarrollador, cambiar al dashboard general
        const currentActiveTab = document.querySelector('.tab-pane.active');
        if (currentActiveTab && (currentActiveTab.id === 'tab-dev-clients' || currentActiveTab.id === 'tab-dev-analytics' || currentActiveTab.id === 'tab-backups')) {
            showTab('dashboard');
        } else if (currentActiveTab && currentActiveTab.id) {
            showTab(currentActiveTab.id.replace('tab-', ''));
        }
        showToast('👑 Vista Wedding Planner: Simulando exactamente lo que ve tu cliente planner.');

    } else if (role === 'couple') {
        // =========================================================================
        // VISTA 3: 👰 VISTA NOVIOS (SIMULACIÓN EXACTA DE LO QUE VE LA PAREJA)
        // =========================================================================
        sessionStorage.setItem('antigravity_user_role', 'couple');
        refreshSidebarWeddingInfo();

        if (typeof applyVisibilityToCoupleView === 'function') {
            applyVisibilityToCoupleView();
        }
        document.querySelectorAll('.dev-only').forEach(el => el.style.display = 'none');

        // Mostrar solo fases relevantes para la pareja
        document.querySelectorAll('.menu-section-header').forEach(hdr => {
            const isPlannerOnly = hdr.classList.contains('planner-only');
            const isDevOnly = hdr.classList.contains('dev-only');
            hdr.style.display = (isPlannerOnly || isDevOnly) ? 'none' : 'flex';
        });

        const currentActiveTab = document.querySelector('.tab-pane.active');
        if (currentActiveTab && (currentActiveTab.id === 'tab-dev-clients' || currentActiveTab.id === 'tab-settings' || currentActiveTab.id === 'tab-backups')) {
            showTab('guests');
        } else if (currentActiveTab && currentActiveTab.id) {
            showTab(currentActiveTab.id.replace('tab-', ''));
        }
        showToast('👰 Vista Novios: Simulando exactamente lo que ve la pareja.');
    }

    // Actualizar visibilidad del botón de Formulario según el rol seleccionado y el plan contratado
    updateHeaderBriefingButton();
}

function showTab(tabName) {
    currentData = getWeddingState(currentWeddingId);

    // Blindaje de seguridad para la Vista Novios:
    // La pareja JAMÁS puede entrar a configuración de planes, cobros ni consolas administrativas
    if (activeRole === 'couple' && (tabName === 'settings' || tabName === 'dev-clients' || tabName === 'dev-analytics' || tabName === 'backups')) {
        if (typeof showToast === 'function') {
            showToast('🔒 Esta sección es exclusiva de la administración de tu Wedding Planner.');
        }
        tabName = 'guests';
    }

    // Gatekeeper: Solo aplica para la vista de novios o bodas sin briefing,
    // garantizando que Wedding Planner y Master Developer nunca queden bloqueados de sus herramientas.
    const isBriefingDone = currentData && (currentData.isBriefingCompleted || localStorage.getItem(`briefing_done_${currentWeddingId}`));
    const nonGatedTabs = ['dashboard', 'backups', 'dev-clients', 'dev-analytics', 'hostess', 'settings', 'album', 'playlist'];

    if (activeRole === 'couple' && !nonGatedTabs.includes(tabName) && !isBriefingDone) {
        showToast(`⚠️ Debes completar el Formulario para Invitación Web antes de usar este módulo.`);
        
        // Highlight button with interactive pulse animation
        const btnBriefing = document.querySelector('.btn-briefing-header');
        if (btnBriefing) {
            btnBriefing.classList.remove('pulse-highlight');
            void btnBriefing.offsetWidth; // force browser reflow
            btnBriefing.classList.add('pulse-highlight');
            setTimeout(() => btnBriefing.classList.remove('pulse-highlight'), 3200);
        }
        return;
    }

    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) targetTab.classList.add('active');

    // Reset viewport scroll to top so content starts at the very top without vertical dead spaces
    const viewport = document.querySelector('.app-viewport');
    if (viewport) {
        viewport.scrollTop = 0;
    }

    const btn = Array.from(document.querySelectorAll('.menu-item')).find(b => {
        const attr = b.getAttribute('onclick') || '';
        return attr.includes(`showTab('${tabName}')`);
    });
    if (btn) btn.classList.add('active');

    if (tabName === 'dashboard') renderDashboard();
    if (tabName === 'dispatch') { if (typeof renderDispatchTab === 'function') renderDispatchTab(); }
    if (tabName === 'seating') { if (typeof renderSeatingChart === 'function') renderSeatingChart(); }
    if (tabName === 'dayof') { if (typeof renderDayOfTab === 'function') renderDayOfTab(); }
    if (tabName === 'hostess') { if (typeof renderHostessDashboard === 'function') renderHostessDashboard(); }
    if (tabName === 'barcalc') { if (typeof recalcBar === 'function') recalcBar(); }
    if (tabName === 'vendors') { if (typeof renderVendorsTab === 'function') renderVendorsTab(); }
    if (tabName === 'guests') { if (typeof renderGuestTable === 'function') renderGuestTable(); }
    if (tabName === 'finance') { 
        if (typeof renderFinanceTab === 'function') renderFinanceTab(); 
        if (typeof renderDestinationPaymentsSuite === 'function') renderDestinationPaymentsSuite();
    }
    if (tabName === 'album') { if (typeof renderAlbumTab === 'function') renderAlbumTab(); }
    if (tabName === 'playlist') { if (typeof renderPlaylistTab === 'function') renderPlaylistTab(); }
    if (tabName === 'travel') { if (typeof renderTravelTab === 'function') renderTravelTab(); }
    if (tabName === 'settings') { if (typeof renderSettingsTab === 'function') renderSettingsTab(); }
    if (tabName === 'dev-clients') { if (typeof renderClientsDashboard === 'function') renderClientsDashboard(); }
    if (tabName === 'dev-analytics') { if (typeof renderDevAnalyticsDashboard === 'function') renderDevAnalyticsDashboard(); }
    if (tabName === 'backups') { if (typeof renderBackupsTab === 'function') renderBackupsTab(); }
    if (tabName === 'pdfreports') generateAndPreviewPDF();

    // Auto-close mobile drawer when selecting a module
    closeMobileSidebar();
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('appSidebarDrawer') || document.querySelector('.app-sidebar');
    const backdrop = document.getElementById('mobileSidebarBackdrop');
    if (!sidebar) return;
    const isOpen = sidebar.classList.toggle('mobile-drawer-open');
    if (backdrop) backdrop.classList.toggle('active', isOpen);
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('appSidebarDrawer') || document.querySelector('.app-sidebar');
    const backdrop = document.getElementById('mobileSidebarBackdrop');
    if (sidebar) sidebar.classList.remove('mobile-drawer-open');
    if (backdrop) backdrop.classList.remove('active');
}

function renderDashboard() {
    currentData = getWeddingState(currentWeddingId);
    if (!currentData) return;
    
    const guests = currentData.guests || [];
    const confirmedGuests = guests.filter(g => g.status === 'confirmed');
    const declinedGuests = guests.filter(g => g.status === 'declined');
    const pendingGuests = guests.filter(g => g.status !== 'confirmed' && g.status !== 'declined');

    const totalPasses = confirmedGuests.reduce((sum, g) => sum + (g.passes || 1), 0);
    const target = currentData.targetGuests || 180;
    const rsvpPercent = Math.min(100, Math.round((totalPasses / target) * 100));

    // Update Dashboard Title to clearly show the active couple
    const dashTitleEl = document.getElementById('dashTitle');
    if (dashTitleEl) {
        dashTitleEl.innerText = `Dashboard · ${currentData.couple}`;
    }

    // 1. Countdown & Critical Deadlines
    const weddingDateStr = currentData.date || '24 de Octubre, 2027';
    const venueStr = currentData.venue || 'Finca Bell Recó · Mallorca';
    const dateLocEl = document.getElementById('dashWeddingDateLocation');
    if (dateLocEl) dateLocEl.innerText = `${weddingDateStr} • ${venueStr}`;

    const countTextEl = document.getElementById('dashCountdownText');
    if (countTextEl) {
        // Calculate days to wedding dynamically
        try {
            const now = new Date();
            let targetDate = null;
            // Parse Spanish format e.g. "24 de Octubre, 2027" or ISO "2027-10-24"
            if (weddingDateStr.includes('-')) {
                targetDate = new Date(weddingDateStr);
            } else {
                const monthMap = {
                    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
                    'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
                };
                const match = weddingDateStr.match(/(\d{1,2})\s+de\s+([a-zA-ZáéíóúÁÉÍÓÚ]+),?\s+(\d{4})/i);
                if (match) {
                    const day = parseInt(match[1], 10);
                    const monthName = match[2].toLowerCase();
                    const year = parseInt(match[3], 10);
                    const monthIndex = monthMap[monthName] !== undefined ? monthMap[monthName] : 9;
                    targetDate = new Date(year, monthIndex, day, 16, 30, 0);
                }
            }
            if (!targetDate || isNaN(targetDate.getTime())) {
                targetDate = new Date('2027-10-24T16:30:00');
            }
            const diffDays = Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));
            countTextEl.innerText = `Faltan ${diffDays} días para la Boda`;
        } catch (e) {
            countTextEl.innerText = `Faltan 375 días para la Boda`;
        }
    }

    const confirmedBadge = document.getElementById('dashConfirmedPaxBadge');
    if (confirmedBadge) confirmedBadge.innerText = `${totalPasses} de ${target} pax (${rsvpPercent}%)`;

    // 2. Attendance & Sub-Pills
    const statConfirmed = document.getElementById('statConfirmedPasses');
    if (statConfirmed) statConfirmed.innerText = totalPasses;

    const statRsvpProgress = document.getElementById('statRsvpProgressBar');
    if (statRsvpProgress) statRsvpProgress.style.width = `${rsvpPercent}%`;

    const pillConf = document.getElementById('statPillConfirmed');
    if (pillConf) pillConf.innerText = `✓ ${totalPasses} Asisten`;

    const pillDecl = document.getElementById('statPillDeclined');
    if (pillDecl) pillDecl.innerText = `✕ ${declinedGuests.length} Declinaron`;

    const pillPend = document.getElementById('statPillPending');
    if (pillPend) pillPend.innerText = `⏳ ${pendingGuests.length} Pendientes`;

    // 3. Tables & Seating
    const tables = currentData.tables || [];
    const totalTables = tables.length;
    let totalSeatedPax = 0;
    tables.forEach(t => {
        const seated = guests.filter(g => g.tableId === t.id);
        totalSeatedPax += seated.reduce((s, g) => s + (g.passes || 1), 0);
    });
    const unseatedPax = Math.max(0, totalPasses - totalSeatedPax);

    const statTables = document.getElementById('statTablesFilled');
    if (statTables) statTables.innerText = `${totalSeatedPax} / ${totalPasses} pax`;

    const tablesProgress = document.getElementById('statTablesProgressBar');
    if (tablesProgress) {
        const seatedPct = totalPasses > 0 ? Math.min(100, Math.round((totalSeatedPax / totalPasses) * 100)) : 0;
        tablesProgress.style.width = `${seatedPct}%`;
    }

    const statTablesHint = document.getElementById('statTablesHint');
    if (statTablesHint) {
        statTablesHint.innerHTML = `${totalSeatedPax} comensales sentados · <strong style="color:${unseatedPax > 0 ? '#f59e0b' : '#10b981'};">${unseatedPax} por ubicar</strong>`;
    }

    // 4. Vendors & Budget
    const vendors = (typeof getActiveVendorsList === 'function') ? getActiveVendorsList() : (currentData.vendors || []);
    let totalContracted = 0;
    let totalPaid = 0;
    vendors.forEach(v => {
        totalContracted += (v.contractTotal || 0);
        totalPaid += (v.paidTotal || 0);
    });
    
    const budgetCap = currentData.budget || 850000;
    const pendingBudget = Math.max(0, totalContracted - totalPaid);
    const paidPct = totalContracted > 0 ? Math.min(100, Math.round((totalPaid / totalContracted) * 100)) : 0;

    const statBudget = document.getElementById('statBudgetSummary');
    if (statBudget) {
        statBudget.innerText = totalContracted > 0 ? `$${totalContracted.toLocaleString('es-MX')}` : `$0`;
    }

    const statBudgetBar = document.getElementById('statBudgetProgressBar');
    if (statBudgetBar) statBudgetBar.style.width = `${paidPct}%`;

    const statBudgetHint = document.getElementById('statBudgetHint');
    if (statBudgetHint) {
        if (totalContracted > 0) {
            statBudgetHint.innerHTML = `Pagado: $${totalPaid.toLocaleString('es-MX')} · <strong style="color:${pendingBudget > 0 ? '#ef4444' : '#10b981'};">Pendiente: $${pendingBudget.toLocaleString('es-MX')}</strong>`;
        } else {
            statBudgetHint.innerHTML = `Presupuesto: $${budgetCap.toLocaleString('es-MX')} · <a href="javascript:void(0)" onclick="showTab('vendors')" style="color:#0284c7; font-weight:600; text-decoration:underline;">+ Registrar Contratos</a>`;
        }
    }

    // 5. Financial Vouchers (Gifts & HoneyMoon) or Destination Lodging Payments
    const isDest = !!currentData.isDestination;
    const card4Title = document.querySelector('#statTotalRaised')?.closest('.metric-card')?.querySelector('.metric-header span:first-child');
    const vouchers = currentData.vouchers || [];
    const approved = vouchers.filter(v => v.status === 'approved');
    const pendingVouchers = vouchers.filter(v => v.status === 'pending');
    const totalRaised = approved.reduce((sum, v) => sum + v.amount, 0);

    const statRaised = document.getElementById('statTotalRaised');
    const statVouchersHint = document.getElementById('statVouchersPendingHint');

    if (isDest) {
        if (card4Title) card4Title.innerHTML = '🏖️ Pagos de Estancia (Hotel/Resort)';
        const costPerPerson = Number(currentData.guestCost) || 20000;
        let destCollected = 0;
        let destProjected = 0;
        confirmedGuests.forEach(g => {
            const passes = g.passes || 1;
            const required = passes * costPerPerson;
            destProjected += required;
            const paid = Number(g.destinationPaid) || (passes > 1 ? 20000 : 10000);
            destCollected += Math.min(required, paid);
        });
        if (statRaised) statRaised.innerText = `$${destCollected.toLocaleString('es-MX')} MXN`;
        if (statVouchersHint) {
            statVouchersHint.innerHTML = `Meta: $${destProjected.toLocaleString('es-MX')} · <strong style="color:#059669;">Cobrado en CLABE SPEI</strong>`;
        }
    } else {
        if (card4Title) card4Title.innerHTML = 'Fondo Recaudado (Luna de Miel)';
        if (statRaised) statRaised.innerText = `$${totalRaised.toLocaleString('es-MX')} MXN`;
        if (statVouchersHint) {
            statVouchersHint.innerText = `${pendingVouchers.length} comprobante${pendingVouchers.length === 1 ? '' : 's'} pendiente${pendingVouchers.length === 1 ? '' : 's'} de validación`;
        }
    }

    // 6. Shuttles & Transport
    let shuttleCount = 0;
    guests.forEach(g => {
        if (g.shuttle && !g.shuttle.toLowerCase().includes('no') && !g.shuttle.toLowerCase().includes('propio')) {
            shuttleCount += (g.passes || 1);
        }
    });
    if (shuttleCount === 0) shuttleCount = 48; // Baseline mockup
    const elShuttle = document.getElementById('statShuttleCount');
    if (elShuttle) elShuttle.innerText = `${shuttleCount} pax`;

    // 7. Allergies & Medical Restrictions
    let celiac = 0, seafood = 0, nuts = 0, vegan = 0;
    guests.forEach(g => {
        const all = (g.allergies || '').toLowerCase();
        if (all.includes('cel') || all.includes('gluten')) celiac++;
        if (all.includes('marisco') || all.includes('camar')) seafood++;
        if (all.includes('nuez') || all.includes('nueces') || all.includes('secos')) nuts++;
        if (all.includes('veg')) vegan++;
    });
    const totalAllergies = celiac + seafood + nuts + vegan || 8;
    const statAllCount = document.getElementById('statAllergiesCount');
    if (statAllCount) statAllCount.innerText = `${totalAllergies} alertas`;

    const statAllSummary = document.getElementById('statAllergiesSummary');
    if (statAllSummary) {
        statAllSummary.innerText = `${celiac || 2} Celíacos · ${seafood || 3} Mariscos · ${nuts || 1} Nueces · ${vegan || 2} Veganos`;
    }

    // 8. Catering Count
    let filete = 0, salmon = 0, risotto = 0;
    confirmedGuests.forEach(g => {
        const passes = g.passes || 1;
        const m1 = (g.guest1Menu || g.menu || '').toLowerCase();
        if (m1.includes('salmon') || m1.includes('salmón')) salmon++;
        else if (m1.includes('risotto') || m1.includes('veg')) risotto++;
        else filete++;

        if (passes > 1) {
            const m2 = (g.companionMenu || (m1.includes('salmon') ? 'filete' : 'salmon')).toLowerCase();
            if (m2.includes('salmon') || m2.includes('salmón')) salmon++;
            else if (m2.includes('risotto') || m2.includes('veg')) risotto++;
            else filete++;
        }
    });

    const elFilete = document.getElementById('countFilete');
    const elSalmon = document.getElementById('countSalmon');
    const elRisotto = document.getElementById('countRisotto');

    if (elFilete) elFilete.innerText = filete;
    if (elSalmon) elSalmon.innerText = salmon;
    if (elRisotto) elRisotto.innerText = risotto;

    // 9. Update Dispatch badge in Sidebar
    const pendingDispatch = guests.filter(g => !g.dispatchStatus || g.dispatchStatus !== 'sent').length;
    const badgeDispatch = document.getElementById('statDispatchPendingBadge');
    if (badgeDispatch) badgeDispatch.innerText = `${pendingDispatch} por mandar`;

    // 10. Dynamic Operational Triage Quick-Action Cards
    const elActionUnsentTitle = document.getElementById('quickActionUnsentTitle');
    const elActionUnsentSub = document.getElementById('quickActionUnsentSubtitle');
    if (elActionUnsentTitle) elActionUnsentTitle.innerText = `${pendingDispatch} Invitados sin Enviar`;
    if (elActionUnsentSub) elActionUnsentSub.innerText = pendingDispatch === 0 ? '¡Invitaciones enviadas al 100%!' : 'Faltan de mandar invitación por WhatsApp';

    const elActionUnseatedTitle = document.getElementById('quickActionUnseatedTitle');
    const elActionUnseatedSub = document.getElementById('quickActionUnseatedSubtitle');
    if (elActionUnseatedTitle) elActionUnseatedTitle.innerText = `${unseatedPax} Confirmados sin Mesa`;
    if (elActionUnseatedSub) elActionUnseatedSub.innerText = unseatedPax === 0 ? 'Todos los comensales tienen mesa asignada' : 'Asisten pero no tienen silla en plano 2D';

    const elActionVouchersTitle = document.getElementById('quickActionVouchersTitle');
    const elActionVouchersSub = document.getElementById('quickActionVouchersSubtitle');
    if (elActionVouchersTitle) elActionVouchersTitle.innerText = `${pendingVouchers.length} Comprobantes SPEI`;
    if (elActionVouchersSub) elActionVouchersSub.innerText = pendingVouchers.length === 0 ? 'Sin transferencias por revisar' : 'Transferencias bancarias por verificar';
}

// GUEST CRM TABLE
function renderGuestTable() {
    currentData = getWeddingState(currentWeddingId);
    const tbody = document.getElementById('guestsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const countAll = document.getElementById('countAll');
    const countConf = document.getElementById('countConf');
    const countPend = document.getElementById('countPend');
    const countDecl = document.getElementById('countDecl');

    if (!currentData || !currentData.guests) {
        if (countAll) countAll.innerText = '0';
        if (countConf) countConf.innerText = '0';
        if (countPend) countPend.innerText = '0';
        if (countDecl) countDecl.innerText = '0';
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:3rem 1rem; color:#64748b;">
                    <div style="font-size:2rem; margin-bottom:8px;">👥</div>
                    <strong style="color:#0f172a; font-size:1rem; display:block;">No hay lista de invitados</strong>
                    <span style="font-size:0.85rem;">Crea o selecciona una boda para comenzar a registrar o importar comensales.</span>
                </td>
            </tr>
        `;
        return;
    }

    if (countAll) countAll.innerText = currentData.guests.length;
    if (countConf) countConf.innerText = currentData.guests.filter(g => g.status === 'confirmed').length;
    if (countPend) countPend.innerText = currentData.guests.filter(g => g.status === 'pending').length;
    if (countDecl) countDecl.innerText = currentData.guests.filter(g => g.status === 'declined').length;

    let filtered = [...(currentData.guests || [])];
    if (activeFilter !== 'all') {
        filtered = filtered.filter(g => g.status === activeFilter);
    }

    // A-Z / Z-A Sorting Engine
    if (activeGuestSort === 'az') {
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' }));
    } else if (activeGuestSort === 'za') {
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || '', 'es', { sensitivity: 'base' }));
    } else if (activeGuestSort === 'passes') {
        filtered.sort((a, b) => (b.passes || 1) - (a.passes || 1));
    }

    const isDestinationWedding = !!currentData.isDestination;
    const thDestPay = document.getElementById('thGuestDestinationPay');
    if (thDestPay) {
        thDestPay.style.display = isDestinationWedding ? 'table-cell' : 'none';
    }

    filtered.forEach(g => {
        const table = (currentData.tables || []).find(t => t.id === g.tableId);
        const tableName = table ? table.name : '<span style="color:#d97706; font-weight:600;">Sin Asignar</span>';
        const isCouple = (g.passes || 1) > 1;

        // Destination Wedding Payment Math
        let destPayHtml = '';
        if (isDestinationWedding) {
            const guestCostPerPerson = currentData.guestCost || 20000;
            const totalRequired = (g.passes || 1) * guestCostPerPerson;
            const paid = g.destinationPaid || (g.status === 'confirmed' ? (g.passes > 1 ? 20000 : 10000) : 0);
            const remaining = Math.max(0, totalRequired - paid);
            const pct = Math.min(100, Math.round((paid / totalRequired) * 100));
            const isLiquidated = paid >= totalRequired;

            destPayHtml = `
                <td style="min-width:130px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; margin-bottom:2px;">
                        <strong style="color:${isLiquidated ? '#15803d' : '#b45309'}; font-weight:800;">$${paid.toLocaleString('es-MX')}</strong>
                        <span style="color:#64748b; font-size:0.7rem;">/ $${totalRequired.toLocaleString('es-MX')}</span>
                    </div>
                    <div style="background:#e2e8f0; height:5px; border-radius:99px; overflow:hidden; margin-bottom:3px;">
                        <div style="background:${isLiquidated ? '#10b981' : '#f59e0b'}; width:${pct}%; height:100%;"></div>
                    </div>
                    <span style="font-size:0.68rem; font-weight:700; color:${isLiquidated ? '#15803d' : remaining > 0 ? '#b91c1c' : '#64748b'};">
                        ${isLiquidated ? '✓ 100% Liquidado' : `Resta: $${remaining.toLocaleString('es-MX')} (${pct}%)`}
                    </span>
                </td>
            `;
        }

        // Titular Preferences
        const titularMenu = g.guest1Menu || g.menu || 'filete';
        const titularAllergy = g.guest1Allergies || g.allergies || '';
        const hasTitularAllergy = titularAllergy && titularAllergy.toLowerCase() !== 'ninguna' && titularAllergy.trim() !== '';

        // Companion Preferences
        const compName = g.companion || 'Acompañante';
        const compMenu = g.companionMenu || (titularMenu === 'salmon' ? 'filete' : 'salmon');
        const compAllergy = g.companionAllergies || '';
        const hasCompAllergy = compAllergy && compAllergy.toLowerCase() !== 'ninguna' && compAllergy.trim() !== '';

        // Menu Column HTML
        let menuHtml = '';
        if (isCouple) {
            menuHtml = `
                <div style="display:flex; flex-direction:column; gap:4px; font-size:0.8rem;">
                    <div><span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">1. Titular:</span> ${getMenuLabel(titularMenu)}</div>
                    <div><span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">2. Acompañante:</span> ${getMenuLabel(compMenu)}</div>
                </div>
            `;
        } else {
            menuHtml = `<div style="font-size:0.83rem; font-weight:600;">${getMenuLabel(titularMenu)}</div>`;
        }

        // Allergies Column HTML
        let allergyHtml = '';
        if (isCouple) {
            const part1 = hasTitularAllergy ? `<div><span style="font-size:0.68rem; font-weight:700; color:#64748b;">1:</span> <span style="background:#fee2e2; color:#991b1b; padding:1px 6px; border-radius:4px; font-weight:700; font-size:0.72rem;">⚠️ ${titularAllergy}</span></div>` : `<div><span style="font-size:0.68rem; font-weight:700; color:#64748b;">1:</span> <span style="color:#94a3b8; font-size:0.72rem;">Sin alergias</span></div>`;
            const part2 = hasCompAllergy ? `<div><span style="font-size:0.68rem; font-weight:700; color:#64748b;">2:</span> <span style="background:#fef3c7; color:#92400e; padding:1px 6px; border-radius:4px; font-weight:700; font-size:0.72rem;">⚠️ ${compAllergy}</span></div>` : `<div><span style="font-size:0.68rem; font-weight:700; color:#64748b;">2:</span> <span style="color:#94a3b8; font-size:0.72rem;">Sin alergias</span></div>`;
            allergyHtml = `<div style="display:flex; flex-direction:column; gap:4px;">${part1}${part2}</div>`;
        } else {
            allergyHtml = hasTitularAllergy ? `<span style="background:#fee2e2; color:#991b1b; padding:2px 6px; border-radius:4px; font-weight:700; font-size:0.75rem;">⚠️ ${titularAllergy}</span>` : '<span style="color:#94a3b8; font-size:0.75rem;">—</span>';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${g.name}</strong></td>
            <td><div>${g.phone}</div><small style="color:#64748b;">${g.email || '—'}</small></td>
            <td>
                <span style="font-weight:700; color:#0f172a;">${g.passes} pase(s)</span>
                ${isCouple ? `<div style="font-size:0.78rem; color:#475569; font-weight:600; margin-top:2px; display:flex; align-items:center; gap:4px;">👤 <span>${compName}</span></div>` : ''}
            </td>
            <td>${menuHtml}</td>
            <td>${allergyHtml}</td>
            <td>${tableName}</td>
            ${isDestinationWedding ? destPayHtml : ''}
            <td>
                <span class="status-badge ${g.status}">
                    ${g.status === 'confirmed' ? '✓ Confirmado' : g.status === 'pending' ? '⏳ Pendiente' : '✕ Declinado'}
                </span>
            </td>
            <td style="white-space:nowrap;">
                <button class="btn-action secondary" style="padding:4px 8px; font-size:0.75rem; margin-right:4px;" onclick="editGuest('${g.id}')">Editar</button>
                <button type="button" class="btn-sm-action" style="background:#25d366; color:#ffffff; border:none; padding:4px 8px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;" onclick="quickSendGuestWhatsApp('${g.id}')" title="Enviar invitación o recordatorio por WhatsApp">
                    📲 WhatsApp
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

let activeGuestSort = 'az'; // Default alphabetical A-Z

function setGuestSort(sortKey) {
    activeGuestSort = sortKey;
    const sortSelect = document.getElementById('guestSortOrder');
    if (sortSelect) sortSelect.value = sortKey;

    const btnIcon = document.getElementById('iconSortAZ');
    if (btnIcon) {
        if (sortKey === 'az') btnIcon.innerText = '⬇️ A-Z';
        else if (sortKey === 'za') btnIcon.innerText = '⬆️ Z-A';
        else btnIcon.innerText = '🔤 Orden';
    }

    renderGuestTable();
    showToast(`🔤 Lista ordenada: ${sortKey === 'az' ? 'A a la Z' : sortKey === 'za' ? 'Z a la A' : 'Por registro'}`);
}

function toggleQuickAZSort() {
    if (activeGuestSort === 'az') {
        setGuestSort('za');
    } else {
        setGuestSort('az');
    }
}

function setGuestFilter(filter) {
    activeFilter = filter;
    document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    renderGuestTable();
}

function filterGuestTable() {
    const q = document.getElementById('guestSearchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#guestsTableBody tr');
    rows.forEach(r => {
        r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none';
    });
}

// MODALS
function showQuickAddModal() {
    document.getElementById('formGuest').reset();
    document.getElementById('editGuestId').value = '';
    document.getElementById('modalGuestTitle').innerText = 'Agregar Nuevo Invitado';
    document.getElementById('groupCompanion').style.display = 'none';
    const compDietary = document.getElementById('groupCompanionDietary');
    if (compDietary) compDietary.style.display = 'none';
    document.getElementById('modalGuest').classList.add('show');
}

function editGuest(id) {
    const g = currentData.guests.find(item => item.id === id);
    if (!g) return;
    document.getElementById('editGuestId').value = g.id;
    document.getElementById('guestName').value = g.name;

    // Parse country code and local number
    const countryCodeSelect = document.getElementById('guestCountryCode');
    const phoneInput = document.getElementById('guestPhone');
    let phoneStr = (g.phone || '').trim();

    if (countryCodeSelect && phoneInput) {
        const supportedCodes = ['+52', '+1', '+34', '+57', '+54', '+56', '+51', '+593', '+502', '+506', '+507'];
        let matched = false;
        for (const code of supportedCodes) {
            if (phoneStr.startsWith(code)) {
                countryCodeSelect.value = code;
                phoneInput.value = phoneStr.replace(code, '').trim();
                matched = true;
                break;
            }
        }
        if (!matched) {
            countryCodeSelect.value = '+52';
            phoneInput.value = phoneStr.replace(/^\+52\s*/, '');
        }
    } else if (phoneInput) {
        phoneInput.value = phoneStr;
    }

    document.getElementById('guestEmail').value = g.email || '';
    document.getElementById('guestPasses').value = g.passes;
    document.getElementById('guestCompanion').value = g.companion || '';
    document.getElementById('guestMenu').value = g.menu;
    document.getElementById('guestAllergies').value = g.allergies || '';

    const compMenuEl = document.getElementById('companionMenu');
    if (compMenuEl) compMenuEl.value = g.companionMenu || (g.menu === 'salmon' ? 'filete' : 'salmon');
    const compAllergiesEl = document.getElementById('companionAllergies');
    if (compAllergiesEl) compAllergiesEl.value = g.companionAllergies || '';

    toggleCompanionInput(g.passes);
    document.getElementById('modalGuestTitle').innerText = 'Editar Invitado';
    document.getElementById('modalGuest').classList.add('show');
}

function toggleCompanionInput(val) {
    const isCouple = val === '2' || val === 2;
    const compGroup = document.getElementById('groupCompanion');
    const compDietary = document.getElementById('groupCompanionDietary');
    if (compGroup) compGroup.style.display = isCouple ? 'block' : 'none';
    if (compDietary) compDietary.style.display = isCouple ? 'block' : 'none';
}

function normalizeMexicanPhone(raw, countryCode = '+52') {
    if (!raw) return '';
    let digits = raw.replace(/\D/g, '');
    if (countryCode === '+52') {
        if (digits.length === 10) {
            return `+52 ${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
        }
        if (digits.length === 12 && digits.startsWith('52')) {
            let ten = digits.slice(2);
            return `+52 ${ten.slice(0, 2)} ${ten.slice(2, 6)} ${ten.slice(6)}`;
        }
        return `+52 ${digits}`;
    }
    return `${countryCode} ${digits}`;
}

function saveGuestForm(e) {
    e.preventDefault();
    const id = document.getElementById('editGuestId').value;
    const name = (document.getElementById('guestName').value || '').trim();
    const rawPhone = (document.getElementById('guestPhone').value || '').trim();
    const countryCode = document.getElementById('guestCountryCode') ? document.getElementById('guestCountryCode').value : '+52';
    const phone = normalizeMexicanPhone(rawPhone, countryCode);
    const email = (document.getElementById('guestEmail').value || '').trim();
    const passes = parseInt(document.getElementById('guestPasses').value);
    const companion = passes === 2 ? (document.getElementById('guestCompanion').value || '').trim() : '';
    const menu = document.getElementById('guestMenu').value;
    const allergies = document.getElementById('guestAllergies').value;

    // VALIDACIÓN 1: Nombre completo con nombre y apellido (mínimo 2 palabras y 7 caracteres)
    const nameWords = name.split(/\s+/).filter(w => w.length > 0);
    if (name.length < 7 || nameWords.length < 2) {
        alert('⚠️ Por favor ingresa el NOMBRE COMPLETO del invitado titular (nombre y apellido, mín. 7 caracteres).\nEjemplo: "Lic. Laura Garza" o "Carlos Martínez".');
        document.getElementById('guestName').focus();
        return;
    }

    // VALIDACIÓN 2: Teléfono WhatsApp válido (mínimo 10 dígitos)
    const digitsOnly = rawPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
        alert('⚠️ Por favor ingresa un número de teléfono de WhatsApp válido (mínimo 10 dígitos).');
        document.getElementById('guestPhone').focus();
        return;
    }

    // VALIDACIÓN 3: Verificación estricta de NO duplicidad de número de WhatsApp
    if (!currentData.guests) currentData.guests = [];
    const targetDigits = (countryCode + digitsOnly).replace(/\D/g, '');
    const duplicateGuest = currentData.guests.find(item => {
        if (id && item.id === id) return false; // si estamos editando el mismo invitado, permitir
        const existingDigits = (item.phone || '').replace(/\D/g, '');
        return existingDigits && (existingDigits === targetDigits || (existingDigits.endsWith(digitsOnly) && digitsOnly.length >= 10));
    });

    if (duplicateGuest) {
        alert(`🚫 ATENCIÓN: El número de WhatsApp (${phone}) ya está registrado para el invitado:\n\n👉 "${duplicateGuest.name}"\n\nNo es posible registrar dos familias con el mismo número para evitar envíos duplicados o triples.`);
        document.getElementById('guestPhone').focus();
        return;
    }

    // VALIDACIÓN 4: Si son 2 pases, validar que el acompañante también tenga nombre
    if (passes === 2 && companion.length < 3) {
        alert('⚠️ Por favor indica el nombre o parentesco del acompañante (Invitado 2).');
        document.getElementById('guestCompanion').focus();
        return;
    }

    const companionMenu = passes === 2 ? (document.getElementById('companionMenu')?.value || 'filete') : null;
    const companionAllergies = passes === 2 ? (document.getElementById('companionAllergies')?.value || 'Ninguna') : null;

    if (id) {
        const g = currentData.guests.find(item => item.id === id);
        if (g) {
            Object.assign(g, { 
                name, phone, email, passes, companion, menu, allergies,
                guest1Menu: menu,
                guest1Allergies: allergies,
                companionMenu,
                companionAllergies
            });
        }
    } else {
        const newGuest = {
            id: 'g_' + Date.now(),
            name, phone, email, passes, companion, menu, allergies,
            guest1Menu: menu,
            guest1Allergies: allergies,
            companionMenu,
            companionAllergies,
            status: 'confirmed',
            tableId: null,
            dispatchStatus: 'pending'
        };
        currentData.guests.push(newGuest);
    }

    saveWeddingState(currentWeddingId, currentData);
    closeModal('modalGuest');
    renderGuestTable();
    if (typeof renderDispatchTab === 'function') renderDispatchTab();
    if (typeof renderSeatingChart === 'function') renderSeatingChart();
    renderDashboard();
    showToast(`Invitado guardado con éxito.`);
}

function addNewTableModal() {
    document.getElementById('formTable').reset();
    document.getElementById('modalTable').classList.add('show');
}

function saveTableForm(e) {
    e.preventDefault();
    const name = document.getElementById('tableName').value;
    const shape = document.getElementById('tableShape').value;
    const capacity = parseInt(document.getElementById('tableCapacity').value);

    const newTable = {
        id: 't_' + Date.now(),
        name, shape, capacity,
        guests: []
    };
    currentData.tables.push(newTable);
    saveWeddingState(currentWeddingId, currentData);
    closeModal('modalTable');
    renderSeatingChart();
    renderDashboard();
    showToast(`✅ Mesa "${name}" agregada.`);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    if (toast) {
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    }
}

function updateLivePreviewButton() {
    const btn = document.getElementById('btnLivePreview');
    if (!btn) return;

    const data = getWeddingState(currentWeddingId);
    const hasLiveUrl = data && data.liveUrl && data.liveUrl.trim().length > 0;

    if (hasLiveUrl) {
        btn.href = data.liveUrl;
        btn.target = "_blank";
        btn.classList.remove('disabled');
        btn.removeAttribute('onclick');
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.style.pointerEvents = 'auto';
        btn.title = `Abrir invitación digital interactiva de ${data.couple}`;
        btn.innerHTML = `<span>Ver Invitación Web</span> ↗`;
        if (typeof btn.removeAttribute === 'function') {
            btn.removeAttribute('href');
            btn.removeAttribute('target');
        }
        btn.classList.add('disabled');
        btn.style.opacity = '0.65';
        btn.style.cursor = 'not-allowed';
        btn.style.pointerEvents = 'auto';
        btn.title = `🔒 Esta boda aún no cuenta con invitación web activa. Requiere contratar un plan oficial.`;
        btn.setAttribute('onclick', 'showNoInviteNotice(event)');
        btn.innerHTML = `<span>🔒 Sin Invitación Web</span>`;
    }
}

function showNoInviteNotice(e) {
    if (e) e.preventDefault();
    const data = getWeddingState(currentWeddingId);
    const couple = data ? data.couple : 'esta boda';
    alert(`🔒 Invitación Web No Disponible\n\nLa boda "${couple}" aún no cuenta con una invitación digital interactiva publicada.\n\nPara generar y publicar su invitación web interactiva personalizada, debes contratar un plan oficial (Essential, Signature Pro o Atelier Elite) en "Configuración de Planes".`);
}

function updateHeaderBriefingButton() {
    const btnBriefing = document.querySelector('.btn-briefing-header') || document.getElementById('btnHeaderBriefing');
    if (!btnBriefing) return;

    // Regla de Oro solicitada:
    // 1. SOLO deben poder verlo la Wedding Planner o los Novios (NUNCA en vista Developer ni en otros roles).
    const isPlannerOrCouple = (activeRole === 'planner' || activeRole === 'couple');
    if (!isPlannerOrCouple) {
        btnBriefing.style.display = 'none';
        return;
    }

    // 2. SOLO si tienen un plan contratado y configurado (no demo, no prueba gratuita sin pagar).
    const activeTier = typeof getActiveSubscriptionTier === 'function' ? getActiveSubscriptionTier() : null;
    const hasPaidTier = !!activeTier && ['basic', 'intermediate', 'elite'].includes(activeTier);

    if (hasPaidTier) {
        btnBriefing.style.display = 'inline-flex';
    } else {
        btnBriefing.style.display = 'none';
    }
}

function showNewWeddingModal() {
    const isDemo = sessionStorage.getItem('antigravity_demo_mode') === 'true' || 
                   sessionStorage.getItem('antigravity_is_demo_trial') === 'true';

    if (isDemo) {
        const demoWeddingsCreated = parseInt(sessionStorage.getItem('antigravity_demo_weddings_count') || '0', 10);
        if (demoWeddingsCreated >= 1) {
            alert(`🔒 Límite de Boda en Modo Demo\n\nEn la prueba gratuita puedes registrar hasta 1 boda de prueba para explorar las herramientas.\n\nPara gestionar bodas simultáneas con invitaciones web activas, contrata tu plan oficial en "Configuración de Planes".`);
            return;
        }
    }

    document.getElementById('formNewWedding').reset();

    // Adapt Modalidad de Confirmación based on Plan Tier:
    // - Basic (Essential): ONLY Web Landing Editorial + Correo
    // - Pro (Signature Pro) / Elite (Atelier Elite): ONLY WhatsApp Interactivo + Web Landing
    const activeTier = typeof getActiveSubscriptionTier === 'function' ? getActiveSubscriptionTier() : (localStorage.getItem('wedding_subscription_tier') || 'basic');
    const rsvpSelect = document.getElementById('newWRsvp');
    if (rsvpSelect) {
        if (activeTier === 'basic') {
            rsvpSelect.innerHTML = `
                <option value="web" selected>🌐 Web Landing Editorial + Correo Electrónico (Plan Essential)</option>
                <option value="email">✉️ Concierge Privado por Correo</option>
                <option value="whatsapp_locked" disabled style="color:#94a3b8; background:#f1f5f9;">🔒 WhatsApp Interactivo (Requiere Signature Pro / Elite)</option>
            `;
            rsvpSelect.value = 'web';
        } else {
            rsvpSelect.innerHTML = `
                <option value="whatsapp_web" selected>📲 WhatsApp Interactivo + Web Landing (Plan ${activeTier === 'elite' ? 'Atelier Elite' : 'Signature Pro'})</option>
                <option value="web">🌐 Web Landing Editorial + Correo</option>
            `;
            rsvpSelect.value = 'whatsapp_web';
        }
    }

    document.getElementById('modalNewWedding').classList.add('show');
}

function saveNewWeddingForm(e) {
    e.preventDefault();
    const names = document.getElementById('newWNames').value;
    const date = document.getElementById('newWDate').value;
    const venue = document.getElementById('newWVenue').value;
    const rsvpMode = document.getElementById('newWRsvp').value;
    const width = parseFloat(document.getElementById('newWWidth').value) || 40;
    const length = parseFloat(document.getElementById('newWLength').value) || 60;
    const guests = parseInt(document.getElementById('newWGuests').value) || 180;
    const budget = parseFloat(document.getElementById('newWBudget').value) || 850000;

    const isDemo = sessionStorage.getItem('antigravity_demo_mode') === 'true' || 
                   sessionStorage.getItem('antigravity_is_demo_trial') === 'true';

    if (isDemo) {
        sessionStorage.setItem('antigravity_demo_weddings_count', '1');
    }

    const newId = 'w_' + Date.now();
    const newWeddingData = {
        couple: names,
        themeTag: "💍 Boda Personalizada",
        date: date,
        venue: venue,
        liveUrl: "", // ¡Sin invitación web activa hasta contratar y publicar!
        targetGuests: guests,
        budget: budget,
        couplePermissions: {
            planTier: (typeof getActiveSubscriptionTier === 'function' ? getActiveSubscriptionTier() : null) || localStorage.getItem('wedding_subscription_tier') || 'basic',
            showDispatch: true,
            showSeating: true,
            showCRM: true,
            showFinance: true,
            showDayOf: false,
            showBarCalc: false,
            showVendors: false,
            showMarketing: false,
            showTravel: true,
            showAlbum: true,
            showPlaylist: true
        },
        guests: [
            { id: "g1", name: "Novia & Novio", phone: "+52 55 0000 0000", passes: 2, menu: "filete", allergies: "Ninguna", tableId: "t1", status: "confirmed", dispatchStatus: "sent" }
        ],
        tables: [
            { id: "t1", name: "Mesa 1 - Mesa de Honor", shape: "rect", capacity: 8 },
            { id: "t2", name: "Mesa 2 - Familia", shape: "round", capacity: 10 },
            { id: "t3", name: "Mesa 3 - Amigos", shape: "round", capacity: 10 }
        ],
        vouchers: [],
        vendors: [],
        coupleUser: (document.getElementById('newWCoupleUser')?.value.trim().toLowerCase()) || 
                    (names.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) || 
                    ('novios-' + Date.now().toString().slice(-4)),
        couplePass: (document.getElementById('newWCouplePass')?.value.trim()) || 'boda2027'
    };

    const authUserKey = (typeof AUTH_CONFIG !== 'undefined' && AUTH_CONFIG.USER_KEY) ? AUTH_CONFIG.USER_KEY : 'antigravity_logged_user';
    const activeUserEmail = (sessionStorage.getItem(authUserKey) || 
                             sessionStorage.getItem('antigravity_user_email') || '').toLowerCase();
    if (activeUserEmail) {
        newWeddingData.plannerEmail = activeUserEmail;
        const key = `wp_weddings_by_planner_${activeUserEmail}`;
        let listIds = [];
        try {
            listIds = JSON.parse(localStorage.getItem(key) || '[]');
        } catch(e) {
            listIds = [];
        }
        if (!listIds.includes(newId)) {
            listIds.push(newId);
            localStorage.setItem(key, JSON.stringify(listIds));
        }
    }

    saveWeddingState(newId, newWeddingData);

    if (typeof floorPlanState !== 'undefined') {
        floorPlanState.venueWidth = width;
        floorPlanState.venueLength = length;
    }

    closeModal('modalNewWedding');
    populateWeddingSelectorForUser();
    switchWedding(newId);
    showToast(`🎉 ¡Boda "${names}" creada y activada con éxito!`);

    if (!isDemo) {
        setTimeout(() => {
            if (confirm(`🎉 ¡Boda "${names}" creada con éxito!\n\n¿Deseas abrir el Formulario de Briefing para la Invitación Web con estos datos precargados ahora?`)) {
                openActiveWeddingBriefing();
            }
        }, 400);
    }
}

function openActiveWeddingBriefing() {
    const data = getWeddingState(currentWeddingId);
    const params = new URLSearchParams();
    if (data) {
        if (data.couple) params.set('couple', data.couple);
        if (data.date) {
            // If date is "24 de Octubre, 2027", pass it or extract YYYY-MM-DD
            params.set('date', data.date);
        }
        if (data.venue) params.set('venue', data.venue);
        if (data.themeTag) {
            const tag = data.themeTag.toLowerCase();
            if (tag.includes('botánico') || tag.includes('botanical')) params.set('theme', 'botanical');
            else if (tag.includes('black') || tag.includes('minimal')) params.set('theme', 'blacktie');
            else if (tag.includes('riviera') || tag.includes('playa')) params.set('theme', 'beach');
            else if (tag.includes('hacienda') || tag.includes('rústico')) params.set('theme', 'hacienda');
            else if (tag.includes('cathedral') || tag.includes('royal')) params.set('theme', 'cathedral');
            else if (tag.includes('glow') || tag.includes('dark')) params.set('theme', 'modernglow');
        }
    }
    const activeTier = typeof getActiveSubscriptionTier === 'function' ? getActiveSubscriptionTier() : (localStorage.getItem('wedding_subscription_tier') || 'intermediate');
    params.set('plan', activeTier || 'basic');
    const url = `onboarding.html?${params.toString()}`;
    window.open(url, '_blank');
}

// ==========================================================================
// PUNTO 1: EDICIÓN DE METADATOS DE BODA ACTIVA DIRECTO DESDE DASHBOARD
// ==========================================================================
function toggleDestinationWeddingFields(checked) {
    const wrap = document.getElementById('destinationFieldsWrap');
    if (wrap) {
        wrap.style.display = checked ? 'flex' : 'none';
    }
}

function validateClabeInput(val) {
    val = (val || '').replace(/\D/g, '');
    const clabeInput = document.getElementById('editWClabe');
    if (clabeInput && clabeInput.value !== val) {
        clabeInput.value = val;
    }
    const badge = document.getElementById('clabeBadgeValidation');
    const feedback = document.getElementById('clabeFeedbackMsg');
    if (!badge || !feedback) return;

    if (!val) {
        badge.style.display = 'none';
        feedback.innerHTML = '';
        return;
    }

    const bankCodes = {
        '002': 'Banamex',
        '012': 'BBVA México',
        '014': 'Santander',
        '021': 'HSBC',
        '044': 'Scotiabank',
        '072': 'Banorte',
        '127': 'Banco Azteca',
        '137': 'BanCoppel'
    };

    badge.style.display = 'inline-block';
    if (val.length === 18) {
        const prefix = val.substring(0, 3);
        const bankName = bankCodes[prefix] || 'Banco Registrado (SPEI)';
        badge.style.background = '#dcfce7';
        badge.style.color = '#15803d';
        badge.innerText = `✓ CLABE VÁLIDA · ${bankName}`;
        feedback.innerHTML = `<span style="color:#16a34a; font-weight:700;">✓ Estructura SPEI de 18 dígitos correcta. Banco emisor: <strong>${bankName}</strong>.</span>`;
        const bankInput = document.getElementById('editWBankName');
        if (bankInput && !bankInput.value.trim() && bankCodes[prefix]) {
            bankInput.value = bankCodes[prefix];
        }
    } else {
        badge.style.background = '#fee2e2';
        badge.style.color = '#b91c1c';
        badge.innerText = `⚠️ ${val.length}/18 dígitos`;
        feedback.innerHTML = `<span style="color:#dc2626;">Faltan ${18 - val.length} dígitos para completar los 18 reglamentarios de SPEI México.</span>`;
    }
}

function copyCoupleCredentialsForWhatsApp() {
    const coupleUser = (document.getElementById('editWCoupleUser') ? document.getElementById('editWCoupleUser').value.trim() : '') || 'sofia-y-alejandro';
    const couplePass = (document.getElementById('editWCouplePass') ? document.getElementById('editWCouplePass').value.trim() : '') || 'boda2027';
    const coupleNames = (document.getElementById('editWCouple') ? document.getElementById('editWCouple').value.trim() : '') || 'Novios';

    const text = `👰🤵 *¡Hola ${coupleNames}!* Les compartimos sus accesos directos al panel exclusivo de su boda:\n\n🔗 *Portal:* https://wedding-admin-portal.vercel.app\n👤 *Usuario:* ${coupleUser}\n🔑 *Contraseña:* ${couplePass}\n\nDesde aquí podrán consultar en tiempo real quién ha confirmado, el menú elegido y los avances de su gran día. ✨`;

    navigator.clipboard.writeText(text).then(() => {
        showToast('📲 ¡Credenciales copiadas al portapapeles!');
    }).catch(() => {
        showToast('✅ Credenciales listas: ' + coupleUser + ' / ' + couplePass);
    });

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
}

function quickSendGuestWhatsApp(guestId) {
    currentData = getWeddingState(currentWeddingId);
    if (!currentData) return;
    const guest = (currentData.guests || []).find(g => g.id === guestId);
    if (!guest) return;

    const phoneClean = (guest.phone || '').replace(/\D/g, '');
    const coupleName = currentData.couple || 'Los Novios';
    const webUrl = `https://wedding-admin-portal.vercel.app?portal=${guest.id}`;
    
    let msg = `Hola *${guest.name}* ✨\n\nTe saludamos con mucho cariño. Acompaña a *${coupleName}* en su boda consultando los detalles de tu asistencia, hospedaje y registro aquí:\n\n🔗 *Tu enlace personalizado:* ${webUrl}\n\n¡Esperamos verte y celebrar juntos!`;
    const encoded = encodeURIComponent(msg);
    const waUrl = phoneClean.length >= 10 ? `https://api.whatsapp.com/send?phone=${phoneClean}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
}

function openEditActiveWeddingModal() {
    currentData = getWeddingState(currentWeddingId);
    if (!currentData) return;

    const modal = document.getElementById('modalEditWeddingGeneral');
    if (!modal) return;

    document.getElementById('editWCouple').value = currentData.couple || '';
    const dateInput = document.getElementById('editWDate');
    if (dateInput) {
        dateInput.value = currentData.date || '';
        dateInput.oninput = () => updateAutoDeadlineFromDate(dateInput.value);
    }
    document.getElementById('editWVenue').value = currentData.venue || '';
    document.getElementById('editWTargetGuests').value = currentData.targetGuests || 180;
    document.getElementById('editWThemeTag').value = currentData.themeTag || '';
    document.getElementById('editWPlannerNote').value = currentData.plannerNote || '';

    // Destination Wedding Fields
    const isDest = !!currentData.isDestination;
    const chkDest = document.getElementById('editWIsDestination');
    if (chkDest) chkDest.checked = isDest;
    toggleDestinationWeddingFields(isDest);

    const guestCostInput = document.getElementById('editWGuestCost');
    if (guestCostInput) guestCostInput.value = currentData.guestCost !== undefined ? currentData.guestCost : 20000;

    // Automatic 3-Month Prior Deadline Calculation helper
    updateAutoDeadlineFromDate(currentData.date || '24 de Octubre, 2027');

    const bankInput = document.getElementById('editWBankName');
    if (bankInput) bankInput.value = currentData.bankName || 'BBVA México';

    const beneficiaryInput = document.getElementById('editWBeneficiary');
    if (beneficiaryInput) beneficiaryInput.value = currentData.beneficiary || 'Mariana Garza / Aura Weddings';

    const clabeInput = document.getElementById('editWClabe');
    if (clabeInput) {
        clabeInput.value = currentData.clabe || '012180015899234410';
        validateClabeInput(clabeInput.value);
    }

    const chkLegal = document.getElementById('chkClabeLegalResponsibility');
    if (chkLegal) {
        chkLegal.checked = !!currentData.clabe;
        handleClabeCertificationToggle(chkLegal.checked);
    }

    // Couple Access Credentials
    const coupleUserInput = document.getElementById('editWCoupleUser');
    if (coupleUserInput) coupleUserInput.value = currentData.coupleUser || 'sofia-y-alejandro';

    const couplePassInput = document.getElementById('editWCouplePass');
    if (couplePassInput) couplePassInput.value = currentData.couplePass || 'boda2027';

    modal.classList.add('active');
    modal.style.display = 'flex';
}

function updateAutoDeadlineFromDate(dateStr) {
    const deadlineInput = document.getElementById('editWDeadlineMonth');
    if (!deadlineInput) return;

    try {
        const monthMap = {
            'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
            'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
        };
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        const match = (dateStr || '').match(/(\d{1,2})\s+de\s+([a-zA-ZáéíóúÁÉÍÓÚ]+),?\s+(\d{4})/i);
        if (match) {
            const day = parseInt(match[1], 10);
            const mName = match[2].toLowerCase();
            const year = parseInt(match[3], 10);
            const mIndex = monthMap[mName] !== undefined ? monthMap[mName] : 9;
            
            const wDate = new Date(year, mIndex, day);
            // Restar exactamente 90 días (aprox 3 meses antes)
            wDate.setMonth(wDate.getMonth() - 3);
            
            const calcDay = wDate.getDate();
            const calcMonth = monthNames[wDate.getMonth()];
            const calcYear = wDate.getFullYear();
            
            deadlineInput.value = `${calcDay} de ${calcMonth}, ${calcYear}`;
            return;
        }
    } catch (e) {
        console.warn('Error calculating auto deadline:', e);
    }
    deadlineInput.value = '24 de Julio, 2027';
}

function handleClabeCertificationToggle(isChecked) {
    const bankInput = document.getElementById('editWBankName');
    const benInput = document.getElementById('editWBeneficiary');
    const clabeInput = document.getElementById('editWClabe');
    const unlockBtn = document.getElementById('btnUnlockClabeFields');

    if (bankInput) bankInput.disabled = isChecked;
    if (benInput) benInput.disabled = isChecked;
    if (clabeInput) clabeInput.disabled = isChecked;
    if (unlockBtn) unlockBtn.style.display = isChecked ? 'inline-flex' : 'none';
}

function unlockClabeFieldsForPlanner() {
    const chk = document.getElementById('chkClabeLegalResponsibility');
    if (chk) chk.checked = false;
    handleClabeCertificationToggle(false);
    showToast('🔓 Campos bancarios habilitados para edición.');
}

function closeEditActiveWeddingModal() {
    const modal = document.getElementById('modalEditWeddingGeneral');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function saveEditActiveWeddingForm(e) {
    e.preventDefault();
    currentData = getWeddingState(currentWeddingId);
    if (!currentData) return;

    const isDest = document.getElementById('editWIsDestination') ? document.getElementById('editWIsDestination').checked : false;
    const clabeVal = document.getElementById('editWClabe') ? document.getElementById('editWClabe').value.trim() : '';
    const chkLegal = document.getElementById('chkClabeLegalResponsibility');

    if (isDest && clabeVal && chkLegal && !chkLegal.checked) {
        alert('⚠️ Debes aceptar la Certificación de Titularidad y Deslinde Legal de CLABE antes de guardar.');
        return;
    }

    currentData.couple = document.getElementById('editWCouple').value.trim();
    currentData.date = document.getElementById('editWDate').value.trim();
    currentData.venue = document.getElementById('editWVenue').value.trim();
    currentData.targetGuests = parseInt(document.getElementById('editWTargetGuests').value) || 180;
    currentData.themeTag = document.getElementById('editWThemeTag').value.trim();
    currentData.plannerNote = document.getElementById('editWPlannerNote').value.trim();

    // Destination Wedding
    currentData.isDestination = isDest;
    currentData.guestCost = parseFloat(document.getElementById('editWGuestCost').value) || 20000;
    currentData.deadlineMonth = (document.getElementById('editWDeadlineMonth').value || 'Julio 2027').trim();
    currentData.bankName = (document.getElementById('editWBankName').value || '').trim();
    currentData.beneficiary = (document.getElementById('editWBeneficiary').value || '').trim();
    currentData.clabe = clabeVal;

    // Couple Credentials
    currentData.coupleUser = (document.getElementById('editWCoupleUser').value || '').trim().toLowerCase();
    currentData.couplePass = (document.getElementById('editWCouplePass').value || '').trim();

    // Audit Log for Security & Legal Proof
    if (!currentData.auditLogs) currentData.auditLogs = [];
    currentData.auditLogs.unshift({
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: "Lead Wedding Planner",
        role: "planner",
        action: `Actualización de Boda Destino & CLABE: Destino=${isDest ? 'SÍ' : 'NO'}, CLABE=***${clabeVal.slice(-4)}, Costo=$${currentData.guestCost} MXN, Usuario Novios=${currentData.coupleUser}.`,
        ip: "187.190.24.11"
    });

    if (typeof WEDDINGS_DB !== 'undefined' && WEDDINGS_DB[currentWeddingId]) {
        Object.assign(WEDDINGS_DB[currentWeddingId], currentData);
    }
    saveWeddingState(currentWeddingId, currentData);
    closeEditActiveWeddingModal();

    // Refresh UI
    refreshSidebarWeddingInfo();

    renderDashboard();
    if (typeof renderGuestTable === 'function') renderGuestTable();
    showToast(`✅ Datos y cuentas bancarias de "${currentData.couple}" actualizados correctamente.`);
}

// ==========================================================================
// PUNTO 2: REASIGNACIÓN Y EQUIVALENCIA DE PLATILLOS (RENEGOCIACIÓN DE MENÚ)
// ==========================================================================
function openMenuReassignModal() {
    currentData = getWeddingState(currentWeddingId);
    if (!currentData) return;

    const modal = document.getElementById('modalMenuReassign');
    if (!modal) return;

    // Populate select with existing menu items in wedding
    const selectOld = document.getElementById('reassignOldMenu');
    const existingMenus = [...new Set((currentData.guests || []).map(g => g.menu).filter(Boolean))];
    
    selectOld.innerHTML = existingMenus.map(m => `<option value="${m}">${m.toUpperCase()}</option>`).join('');
    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeMenuReassignModal() {
    const modal = document.getElementById('modalMenuReassign');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function saveMenuReassignForm(e) {
    e.preventDefault();
    currentData = getWeddingState(currentWeddingId);
    if (!currentData) return;

    const oldMenu = document.getElementById('reassignOldMenu').value;
    const newMenu = document.getElementById('reassignNewMenu').value.trim();

    if (!newMenu) {
        showToast("⚠️ Por favor escribe el nuevo nombre del platillo.");
        return;
    }

    let affectedCount = 0;
    (currentData.guests || []).forEach(g => {
        if (g.menu && g.menu.toLowerCase() === oldMenu.toLowerCase()) {
            g.menu = newMenu;
            affectedCount++;
        }
    });

    if (!currentData.auditLogs) currentData.auditLogs = [];
    currentData.auditLogs.unshift({
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: "Lead Wedding Planner",
        role: "planner",
        action: `Reasignación de Menú: Platillo "${oldMenu}" renombrado a "${newMenu}" (${affectedCount} invitados actualizados).`,
        ip: "127.0.0.1"
    });

    saveWeddingState(currentWeddingId, currentData);
    closeMenuReassignModal();
    renderDashboard();
    if (typeof renderGuestTable === 'function') renderGuestTable();
    showToast(`🍽️ ¡Menú reasignado! ${affectedCount} comensales pasaron de "${oldMenu}" a "${newMenu}".`);
}

// ==========================================================================
// PUNTO 4: FLUJO DE CANCELACIÓN / DESCONFIRMACIÓN DE ASISTENCIA (RSVP)
// ==========================================================================
let pendingDeclineGuestId = null;

function openDeclineRsvpModal(guestId) {
    pendingDeclineGuestId = guestId;
    const modal = document.getElementById('modalDeclineRsvpConfirm');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeDeclineRsvpModal() {
    pendingDeclineGuestId = null;
    const modal = document.getElementById('modalDeclineRsvpConfirm');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function confirmDeclineRsvp() {
    if (!pendingDeclineGuestId) return;
    currentData = getWeddingState(currentWeddingId);
    const guest = (currentData.guests || []).find(g => g.id === pendingDeclineGuestId);
    if (guest) {
        guest.status = 'declined';
        guest.tableId = null; // Libera su asiento en la mesa
        if (!currentData.auditLogs) currentData.auditLogs = [];
        currentData.auditLogs.unshift({
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: guest.name,
            role: "guest",
            action: `Cancelación de Asistencia (RSVP): El invitado canceló su lugar. Pases liberados: ${guest.passes}.`,
            ip: "127.0.0.1"
        });
        saveWeddingState(currentWeddingId, currentData);
        closeDeclineRsvpModal();
        renderDashboard();
        if (typeof renderGuestTable === 'function') renderGuestTable();
        if (typeof renderDispatchTab === 'function') renderDispatchTab();
        showToast(`⚠️ Asistencia cancelada para "${guest.name}". Pases y mesa liberados.`);
    }
}

// ==========================================================================
// LOGÍSTICA & VUELOS FORÁNEOS (DESTINOS FUERA DE NUEVO LEÓN)
// ==========================================================================
function openAddFlightModal() {
    const modal = document.getElementById('modalAddFlight');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        const dateInput = document.getElementById('flightDate');
        if (dateInput && !dateInput.value) {
            dateInput.value = '2027-10-23';
        }
    }
}

function closeAddFlightModal() {
    const modal = document.getElementById('modalAddFlight');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function handleSaveFlight(e) {
    e.preventDefault();
    const passenger = document.getElementById('flightPassenger').value.trim();
    const origin = document.getElementById('flightOrigin').value.trim();
    const dest = document.getElementById('flightDest').value.trim();
    const code = document.getElementById('flightCode').value.trim();
    const terminal = document.getElementById('flightTerminal').value.trim() || 'TBD';
    const date = document.getElementById('flightDate').value;
    const time = document.getElementById('flightTime').value;
    const shuttle = document.getElementById('flightShuttle').value;

    const tbody = document.getElementById('flightsTableBody');
    if (tbody) {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #f1f5f9';
        tr.innerHTML = `
            <td style="padding:10px 12px;"><strong>${passenger}</strong><br><small style="color:#64748b;">Huésped Foráneo</small></td>
            <td style="padding:10px 12px;">${origin} ➔ ${dest}</td>
            <td style="padding:10px 12px;"><span style="background:#dbeafe; color:#1e40af; padding:2px 7px; border-radius:4px; font-weight:800; font-size:0.75rem;">${code}</span></td>
            <td style="padding:10px 12px;"><strong>${date}</strong><br><span style="color:#059669; font-weight:700;">${time} hrs</span></td>
            <td style="padding:10px 12px;">${terminal}</td>
            <td style="padding:10px 12px; text-align:center;"><span style="background:#f5f3ff; color:#6d28d9; padding:2px 8px; border-radius:12px; font-weight:700; font-size:0.72rem;">${shuttle}</span></td>
            <td style="padding:10px 12px; text-align:right;">
                <button class="btn-sm-action" style="background:#f1f5f9; color:#0f172a;" onclick="deleteFlightRow(this)">🗑️</button>
            </td>
        `;
        tbody.prepend(tr);
    }

    closeAddFlightModal();
    showToast(`🛫 Vuelo ${code} registrado para "${passenger}".`);
}

function deleteFlightRow(btn) {
    if (confirm('¿Deseas eliminar este registro de vuelo?')) {
        const tr = btn.closest('tr');
        if (tr) tr.remove();
        showToast('🗑️ Registro de vuelo eliminado.');
    }
}

function renderTravelTab() {
    const activeWrap = document.getElementById('travelActiveContent');
    const emptyWrap = document.getElementById('travelEmptyState');
    if (!activeWrap || !emptyWrap) return;

    if (!currentWeddingId) {
        activeWrap.style.display = 'none';
        emptyWrap.style.display = 'block';
        return;
    }

    if (currentWeddingId === 'aura') {
        activeWrap.style.display = 'block';
        emptyWrap.style.display = 'none';
        return;
    }

    const customFlights = localStorage.getItem(`wedding_flights_${currentWeddingId}`);
    if (customFlights) {
        try {
            const list = JSON.parse(customFlights);
            if (Array.isArray(list) && list.length > 0) {
                activeWrap.style.display = 'block';
                emptyWrap.style.display = 'none';
                return;
            }
        } catch(e) {}
    }

    activeWrap.style.display = 'none';
    emptyWrap.style.display = 'block';
}

// =============================================================================
// FEATURE 1: 📲 1-CLICK RESUMEN PARA NOVIOS (WHATSAPP FORMATTED REPORT)
// =============================================================================
function copyCoupleWhatsAppSummary() {
    const data = (typeof getWeddingState === 'function') ? getWeddingState(currentWeddingId) : currentData;
    if (!data) {
        showToast('⚠️ No hay datos disponibles para la boda activa.');
        return;
    }

    const couple = data.coupleNames || 'Novios';
    const date = data.date || 'Fecha por definir';
    const loc = data.location || 'Lugar por definir';
    const guests = data.guests || [];

    let totalPasses = 0;
    let confPasses = 0;
    let pendPasses = 0;
    let declPasses = 0;

    let menuRes = 0;
    let menuFish = 0;
    let menuVeg = 0;
    let menuKid = 0;
    const allergiesList = [];
    let seatedCount = 0;

    guests.forEach(g => {
        const p = parseInt(g.passes) || 1;
        totalPasses += p;

        if (g.status === 'confirmed') {
            confPasses += p;
            if (g.tableId) seatedCount += p;

            // Menús
            const m1 = (g.guest1Menu || g.menu || 'filete').toLowerCase();
            if (m1.includes('pesc') || m1.includes('salm')) menuFish++;
            else if (m1.includes('veg') || m1.includes('plant')) menuVeg++;
            else if (m1.includes('inf') || m1.includes('nin')) menuKid++;
            else menuRes++;

            if (p > 1) {
                const m2 = (g.companionMenu || 'salmon').toLowerCase();
                if (m2.includes('pesc') || m2.includes('salm')) menuFish++;
                else if (m2.includes('veg') || m2.includes('plant')) menuVeg++;
                else if (m2.includes('inf') || m2.includes('nin')) menuKid++;
                else menuRes++;
            }

            // Alergias
            const a1 = g.guest1Allergies || g.allergies;
            if (a1 && a1.toLowerCase() !== 'ninguna' && a1.trim() !== '') {
                allergiesList.push(`${g.name}: ${a1}`);
            }
            const a2 = g.companionAllergies;
            if (a2 && a2.toLowerCase() !== 'ninguna' && a2.trim() !== '') {
                allergiesList.push(`${g.companion || 'Acompañante de ' + g.name}: ${a2}`);
            }
        } else if (g.status === 'declined') {
            declPasses += p;
        } else {
            pendPasses += p;
        }
    });

    const confPct = totalPasses > 0 ? Math.round((confPasses / totalPasses) * 100) : 0;
    const seatedPct = confPasses > 0 ? Math.round((seatedCount / confPasses) * 100) : 0;

    let msg = `✨ *RESUMEN EJECUTIVO DE BODA* ✨\n`;
    msg += `💍 *${couple.toUpperCase()}*\n`;
    msg += `📅 ${date} · 📍 ${loc}\n\n`;

    msg += `📊 *ESTADO DE INVITADOS & ASISTENCIA:*\n`;
    msg += `• Total Convocados: *${totalPasses} pases* (${guests.length} familias)\n`;
    msg += `• ✅ *Confirmados:* *${confPasses} pases* (${confPct}%)\n`;
    msg += `• ⏳ *Pendientes:* *${pendPasses} pases*\n`;
    msg += `• ❌ *Declinados:* *${declPasses} pases*\n\n`;

    msg += `🍽️ *SELECCIÓN DE PLATILLOS (CONFIRMADOS):*\n`;
    msg += `• 🥩 Res / Filete: *${menuRes}*\n`;
    msg += `• 🐟 Salmón / Pescado: *${menuFish}*\n`;
    msg += `• 🥗 Vegano / Vegetariano: *${menuVeg}*\n`;
    if (menuKid > 0) msg += `• 👶 Menú Infantil: *${menuKid}*\n`;
    msg += `\n`;

    if (allergiesList.length > 0) {
        msg += `⚠️ *RESTRICCIONES ALIMENTARIAS REPORTADAS (${allergiesList.length}):*\n`;
        allergiesList.slice(0, 6).forEach(a => {
            msg += `  - ${a}\n`;
        });
        if (allergiesList.length > 6) {
            msg += `  - ... y ${allergiesList.length - 6} más en el portal\n`;
        }
        msg += `\n`;
    }

    msg += `🪑 *DISTRIBUCIÓN DE MESAS:*\n`;
    msg += `• Asignados a mesa: *${seatedCount} de ${confPasses} confirmados* (${seatedPct}%)\n\n`;

    msg += `📲 _Generado en tiempo real desde Wedding Planner OS_`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).then(() => {
            showToast('📋 ¡Copiado al portapapeles! Listo para pegar en WhatsApp a los novios.');
        }).catch(() => {
            fallbackCopyText(msg);
        });
    } else {
        fallbackCopyText(msg);
    }
}

function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        showToast('📋 ¡Copiado al portapapeles! Listo para pegar en WhatsApp.');
    } catch(e) {
        prompt('Copia el siguiente resumen para enviarlo a los novios:', text);
    }
    document.body.removeChild(ta);
}

// =============================================================================
// FEATURE 2: ⚡ MODO DÍA D (OPERACIÓN EN VIVO / SÁBADO DE EVENTO)
// =============================================================================
let dayDClockTimer = null;
let activeDayDSubtab = 'timeline';
let activeDayDDayKey = 'day2';

function openDayDModal() {
    const modal = document.getElementById('modalDayD');
    if (!modal) return;

    modal.classList.add('show');
    modal.classList.add('active');

    // Update Header Info
    const data = (typeof getWeddingState === 'function') ? getWeddingState(currentWeddingId) : currentData;
    const coupleEl = document.getElementById('dayDHeaderCouple');
    const dateEl = document.getElementById('dayDHeaderDate');
    if (data) {
        if (coupleEl) coupleEl.innerText = `${data.coupleNames || 'Boda Activa'} · Modo Día D`;
        if (dateEl) dateEl.innerText = `Torre de Operación en Terreno · ${data.location || 'Evento'} · ${data.date || ''}`;
    }

    // Start Live Clock
    updateDayDClock();
    if (dayDClockTimer) clearInterval(dayDClockTimer);
    dayDClockTimer = setInterval(updateDayDClock, 1000);

    // Render current active tab
    renderDayDModal();
}

function closeDayDModal() {
    const modal = document.getElementById('modalDayD');
    if (modal) {
        modal.classList.remove('show');
        modal.classList.remove('active');
    }
    if (dayDClockTimer) {
        clearInterval(dayDClockTimer);
        dayDClockTimer = null;
    }
}

function updateDayDClock() {
    const clockEl = document.getElementById('dayDLiveClock');
    if (!clockEl) return;
    const now = new Date();
    clockEl.innerText = now.toTimeString().split(' ')[0];
}

function switchDayDTab(tabName) {
    activeDayDSubtab = tabName;
    document.querySelectorAll('.day-d-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.day-d-content-pane').forEach(pane => pane.classList.remove('active'));

    if (tabName === 'timeline') {
        const btn = document.getElementById('btnDayDTabTimeline');
        const pane = document.getElementById('dayDViewTimeline');
        if (btn) btn.classList.add('active');
        if (pane) pane.classList.add('active');
        renderDayDTimeline();
    } else if (tabName === 'hostess') {
        const btn = document.getElementById('btnDayDTabHostess');
        const pane = document.getElementById('dayDViewHostess');
        if (btn) btn.classList.add('active');
        if (pane) pane.classList.add('active');
        const searchInput = document.getElementById('dayDHostessSearch');
        if (searchInput) {
            searchInput.focus();
            onDayDSearchInput(searchInput.value);
        }
    } else if (tabName === 'sos') {
        const btn = document.getElementById('btnDayDTabSOS');
        const pane = document.getElementById('dayDViewSOS');
        if (btn) btn.classList.add('active');
        if (pane) pane.classList.add('active');
        renderDayDSOSVendors();
    }
}

function selectDayDDay(dayKey) {
    activeDayDDayKey = dayKey;
    document.querySelectorAll('.btn-day-pill').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btnDayDPill${dayKey.replace('day', '')}`);
    if (btn) btn.classList.add('active');
    renderDayDTimeline();
}

function renderDayDModal() {
    switchDayDTab(activeDayDSubtab);
}

function renderDayDTimeline() {
    const list = document.getElementById('dayDTimelineList');
    const progressPill = document.getElementById('dayDTimelineProgressPill');
    if (!list) return;

    const timelineData = (typeof getActiveTimelineData === 'function') ? getActiveTimelineData() : (typeof timelineDaysData !== 'undefined' ? timelineDaysData : {});
    const dayObj = timelineData[activeDayDDayKey] || { milestones: [] };
    const milestones = dayObj.milestones || [];

    const completedCount = milestones.filter(m => m.status === 'completed').length;
    if (progressPill) {
        progressPill.innerText = `${completedCount} de ${milestones.length} hitos completados (${milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0}%)`;
    }

    if (milestones.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:30px; color:#64748b;">No hay hitos programados para este día.</div>`;
        return;
    }

    list.innerHTML = milestones.map(m => {
        const isCompleted = m.status === 'completed';
        const isInProgress = m.status === 'in_progress';
        const cardClass = isCompleted ? 'completed' : (isInProgress ? 'in_progress' : '');
        const btnClass = isCompleted ? 'btn-completed' : (isInProgress ? 'btn-progress' : 'btn-pending');
        const statusLabel = isCompleted ? '✓ Completado' : (isInProgress ? '⚡ En curso' : '⏳ Pendiente');

        return `
            <div class="day-d-milestone-card ${cardClass}">
                <div style="display:flex; align-items:center; gap:14px; flex:1;">
                    <span class="day-d-ms-time">${m.time || '00:00'}</span>
                    <div>
                        <h4 class="day-d-ms-title">${m.title}</h4>
                        <p class="day-d-ms-lead">👤 Responsable: <strong>${m.lead || 'Coordinador'}</strong>${m.notes ? ` · <span style="color:#0f172a;">${m.notes}</span>` : ''}</p>
                    </div>
                </div>
                <div>
                    <button type="button" class="btn-toggle-milestone ${btnClass}" onclick="toggleDayDMilestone('${activeDayDDayKey}', '${m.id}')" title="Clic para alternar estado del hito">
                        ${statusLabel}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function toggleDayDMilestone(dayKey, milestoneId) {
    const timelineData = (typeof getActiveTimelineData === 'function') ? getActiveTimelineData() : (typeof timelineDaysData !== 'undefined' ? timelineDaysData : {});
    const dayObj = timelineData[dayKey];
    if (!dayObj || !dayObj.milestones) return;

    const m = dayObj.milestones.find(item => item.id === milestoneId);
    if (!m) return;

    if (m.status === 'pending') m.status = 'in_progress';
    else if (m.status === 'in_progress') m.status = 'completed';
    else m.status = 'pending';

    if (typeof saveActiveTimelineData === 'function') {
        saveActiveTimelineData(timelineData);
    }
    renderDayDTimeline();
    if (typeof renderDayOfTab === 'function') renderDayOfTab();
    showToast(`⏱️ Hito actualizado: ${m.title} (${m.status})`);
}

function onDayDSearchInput(query) {
    const container = document.getElementById('dayDGuestResults');
    const summary = document.getElementById('dayDSearchSummary');
    if (!container) return;

    const data = (typeof getWeddingState === 'function') ? getWeddingState(currentWeddingId) : currentData;
    const guests = (data && data.guests) ? data.guests : [];
    const tables = (data && data.tables) ? data.tables : [];

    const q = (query || '').toLowerCase().trim();
    if (!q) {
        container.innerHTML = `
            <div style="text-align:center; padding:36px 16px; background:#ffffff; border:1px dashed #cbd5e1; border-radius:12px; color:#64748b;">
                <div style="font-size:2.5rem; margin-bottom:8px;">🔎</div>
                <strong>Buscador de Asignación en Puerta</strong>
                <p style="margin:4px 0 0; font-size:0.8rem;">Escribe el apellido o nombre de la familia para desplegar su mesa en tamaño gigante.</p>
            </div>
        `;
        if (summary) summary.innerText = `Total de invitados registrados: ${guests.length}`;
        return;
    }

    const matches = guests.filter(g => {
        const nameMatch = (g.name || '').toLowerCase().includes(q);
        const compMatch = (g.companion || '').toLowerCase().includes(q);
        const phoneMatch = (g.phone || '').includes(q);
        return nameMatch || compMatch || phoneMatch;
    });

    if (summary) {
        summary.innerHTML = `Resultados para <strong>"${query}"</strong>: <strong>${matches.length}</strong> invitado(s) encontrado(s).`;
    }

    if (matches.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:30px; background:#ffffff; border:1px dashed #fca5a5; border-radius:12px; color:#991b1b;">
                ⚠️ No se encontró ningún invitado con ese nombre o apellido.
            </div>
        `;
        return;
    }

    container.innerHTML = matches.map(g => {
        const table = tables.find(t => t.id === g.tableId);
        const tableName = table ? table.name.toUpperCase() : 'SIN ASIGNAR';
        const hasAllergy = (g.allergies && g.allergies.toLowerCase() !== 'ninguna' && g.allergies.trim() !== '') ||
                           (g.companionAllergies && g.companionAllergies.toLowerCase() !== 'ninguna');
        const isChecked = !!g.hostessCheckin;

        return `
            <div class="day-d-guest-card" style="${isChecked ? 'background:#f0fdf4; border-color:#86efac;' : ''}">
                <div>
                    <h3 style="font-size:1.25rem; font-weight:800; color:#0f172a; margin:0 0 4px;">${g.name}</h3>
                    <div style="font-size:0.85rem; color:#475569; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        <span style="font-weight:700;">🎫 ${g.passes} pase(s)</span>
                        ${g.companion ? `<span>· Acompañante: <strong>${g.companion}</strong></span>` : ''}
                        <span>· Tel: ${g.phone}</span>
                    </div>
                    ${hasAllergy ? `<div style="margin-top:6px;"><span style="background:#fee2e2; color:#991b1b; padding:2px 8px; border-radius:4px; font-weight:800; font-size:0.75rem;">⚠️ Alergia: ${g.allergies || g.companionAllergies}</span></div>` : ''}
                </div>
                <div style="display:flex; align-items:center; gap:16px;">
                    <div class="day-d-guest-table-badge">
                        ${tableName}
                    </div>
                    <button type="button" class="btn-checkin-guest ${isChecked ? 'checked' : 'not-checked'}" onclick="quickCheckinDayDGuest('${g.id}')">
                        ${isChecked ? '✓ Ingresó' : 'Marcar Llegada'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function clearDayDSearch() {
    const input = document.getElementById('dayDHostessSearch');
    if (input) {
        input.value = '';
        onDayDSearchInput('');
        input.focus();
    }
}

function quickCheckinDayDGuest(guestId) {
    const data = (typeof getWeddingState === 'function') ? getWeddingState(currentWeddingId) : currentData;
    if (!data || !data.guests) return;

    const g = data.guests.find(item => item.id === guestId);
    if (!g) return;

    g.hostessCheckin = !g.hostessCheckin;
    g.checkinTime = g.hostessCheckin ? new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : null;

    saveWeddingState(currentWeddingId, data);

    const input = document.getElementById('dayDHostessSearch');
    onDayDSearchInput(input ? input.value : '');

    if (typeof renderHostessDashboard === 'function') renderHostessDashboard();
    showToast(g.hostessCheckin ? `✅ Acceso confirmado para "${g.name}".` : `↩️ Acceso cancelado para "${g.name}".`);
}

function renderDayDSOSVendors() {
    const container = document.getElementById('dayDSOSGrid');
    if (!container) return;

    const vendors = (typeof getActiveVendorsList === 'function') ? getActiveVendorsList() : [];
    if (vendors.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:30px; grid-column:1/-1; color:#64748b;">No hay proveedores registrados aún.</div>`;
        return;
    }

    container.innerHTML = vendors.map(v => {
        const rawPhone = (v.phone || '').replace(/\D/g, '');
        const cleanPhone = rawPhone.startsWith('52') ? rawPhone : (rawPhone.length === 10 ? `52${rawPhone}` : rawPhone);
        const contactName = v.contactName || 'Responsable';
        const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(contactName)},%20te%20contacto%20desde%20la%20coordinación%20Día%20D%20de%20la%20boda.` : '#';

        return `
            <div class="day-d-sos-card">
                <div class="day-d-sos-header">
                    <span class="day-d-sos-cat">${v.category || 'Proveedor'}</span>
                    <span style="font-size:0.75rem; color:#64748b;">${v.setupTime ? `🕒 ${v.setupTime}` : ''}</span>
                </div>
                <div>
                    <h4 style="margin:0 0 2px; font-size:0.95rem; font-weight:800; color:#0f172a;">${v.name}</h4>
                    <p style="margin:0; font-size:0.78rem; color:#64748b;">Contacto: <strong>${contactName}</strong></p>
                    ${v.powerReq ? `<div style="margin-top:4px; font-size:0.72rem; color:#b45309;">⚡ ${v.powerReq}</div>` : ''}
                </div>
                <div class="day-d-sos-actions">
                    <a href="tel:${cleanPhone}" class="btn-sos-call">
                        📞 Llamar
                    </a>
                    <a href="${waUrl}" target="_blank" class="btn-sos-wa">
                        💬 WhatsApp
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

// =============================================================================
// FEATURE 3: 📥 IMPORTADOR EXCEL / CSV DE INVITADOS
// =============================================================================
let parsedCsvGuestsBuffer = [];

function openImportGuestsModal() {
    parsedCsvGuestsBuffer = [];
    const fileInput = document.getElementById('csvFileInput');
    const pasteInput = document.getElementById('csvPasteText');
    const previewBox = document.getElementById('importCsvPreviewBox');
    const confirmBtn = document.getElementById('btnConfirmImportCsv');

    if (fileInput) fileInput.value = '';
    if (pasteInput) pasteInput.value = '';
    if (previewBox) previewBox.style.display = 'none';
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerText = '🚀 Confirmar e Importar';
    }

    const modal = document.getElementById('modalImportGuests');
    if (modal) modal.classList.add('show');
}

function closeImportGuestsModal() {
    closeModal('modalImportGuests');
}

function downloadGuestCsvTemplate() {
    const csvContent = 
`Nombre Completo,Telefono WhatsApp,Pases,Acompañante,Menu,Alergias,Mesa Opcional
Lic. Roberto Cantú,8115203344,2,Sra. Marcela de Cantú,Filete de Res,Ninguna,Mesa 1
Dr. Fernando Villalobos,5512345678,1,,Salmón Glaseado,Gluten,Mesa 2
Arq. Lucía Garza,8187654321,2,Ing. Pablo Garza,Vegetariano,Nueces,Mesa 1
Ing. Sofía Mendoza,8123456789,1,,Filete de Res,Mariscos,Mesa 3`;

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_invitados_wedding_os.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📥 Plantilla CSV descargada con éxito.');
}

function handleCsvFileSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        processRawCsvText(text);
    };
    reader.readAsText(file, 'UTF-8');
}

function handleCsvPasteInput(text) {
    if (!text || !text.trim()) {
        const previewBox = document.getElementById('importCsvPreviewBox');
        const confirmBtn = document.getElementById('btnConfirmImportCsv');
        if (previewBox) previewBox.style.display = 'none';
        if (confirmBtn) confirmBtn.disabled = true;
        parsedCsvGuestsBuffer = [];
        return;
    }
    processRawCsvText(text);
}

function processRawCsvText(rawText) {
    parsedCsvGuestsBuffer = parseGuestCsv(rawText);
    renderCsvImportPreview();
}

function parseGuestCsv(rawText) {
    if (!rawText || !rawText.trim()) return [];
    
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];

    // Detect delimiter: tab (\t), semicolon (;) or comma (,)
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

    const parseLine = (line) => {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' || char === "'") {
                inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
                result.push(cur.trim().replace(/^["']|["']$/g, ''));
                cur = '';
            } else {
                cur += char;
            }
        }
        result.push(cur.trim().replace(/^["']|["']$/g, ''));
        return result;
    };

    const headerTokens = parseLine(lines[0]).map(h => h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    const isHeaderRow = headerTokens.some(h => 
        h.includes('nombre') || h.includes('name') || 
        h.includes('telefono') || h.includes('phone') || h.includes('celular') ||
        h.includes('pase') || h.includes('invitado')
    );

    let colMap = { name: 0, phone: 1, passes: 2, companion: 3, menu: 4, allergies: 5, table: 6 };

    let startIndex = 0;
    if (isHeaderRow) {
        startIndex = 1;
        headerTokens.forEach((col, idx) => {
            if (col.includes('nom') || col.includes('invitado') || col.includes('name')) colMap.name = idx;
            else if (col.includes('tel') || col.includes('cel') || col.includes('phone') || col.includes('movil')) colMap.phone = idx;
            else if (col.includes('pas') || col.includes('lug') || col.includes('cant') || col.includes('ticket')) colMap.passes = idx;
            else if (col.includes('acomp') || col.includes('pareja') || col.includes('guest2')) colMap.companion = idx;
            else if (col.includes('men') || col.includes('plat') || col.includes('comid')) colMap.menu = idx;
            else if (col.includes('aler') || col.includes('restri') || col.includes('dieta')) colMap.allergies = idx;
            else if (col.includes('mes') || col.includes('tabl')) colMap.table = idx;
        });
    }

    const parsedGuests = [];
    for (let i = startIndex; i < lines.length; i++) {
        const row = parseLine(lines[i]);
        if (row.length === 0 || !row[colMap.name]) continue;

        const name = (row[colMap.name] || '').trim();
        if (name.length < 2) continue;

        const rawPhone = (row[colMap.phone] || '').replace(/[^\d+]/g, '');
        const passesRaw = parseInt(row[colMap.passes]);
        const passes = (!isNaN(passesRaw) && passesRaw >= 1) ? Math.min(passesRaw, 10) : 1;
        const companion = (row[colMap.companion] || '').trim();
        const rawMenu = (row[colMap.menu] || '').toLowerCase();
        let menu = 'filete';
        if (rawMenu.includes('pesc') || rawMenu.includes('salm')) menu = 'salmon';
        else if (rawMenu.includes('veg') || rawMenu.includes('plant')) menu = 'vegano';
        else if (rawMenu.includes('inf') || rawMenu.includes('nin')) menu = 'infantil';

        const allergies = (row[colMap.allergies] || '').trim();
        const table = (row[colMap.table] || '').trim();

        parsedGuests.push({
            name,
            phone: rawPhone || '8100000000',
            passes,
            companion: passes > 1 ? (companion || 'Acompañante') : '',
            menu,
            allergies: allergies || 'Ninguna',
            table
        });
    }

    return parsedGuests;
}

function renderCsvImportPreview() {
    const previewBox = document.getElementById('importCsvPreviewBox');
    const countBadge = document.getElementById('importCsvCountBadge');
    const tbody = document.getElementById('importCsvPreviewTbody');
    const confirmBtn = document.getElementById('btnConfirmImportCsv');

    if (!previewBox || !tbody || !confirmBtn) return;

    if (parsedCsvGuestsBuffer.length === 0) {
        previewBox.style.display = 'none';
        confirmBtn.disabled = true;
        confirmBtn.innerText = '🚀 Confirmar e Importar';
        return;
    }

    previewBox.style.display = 'block';
    if (countBadge) countBadge.innerText = `✓ ${parsedCsvGuestsBuffer.length} invitados detectados listos para importar`;
    confirmBtn.disabled = false;
    confirmBtn.innerText = `🚀 Importar ${parsedCsvGuestsBuffer.length} Invitados`;

    // Render first 8 rows preview
    const previewRows = parsedCsvGuestsBuffer.slice(0, 8);
    tbody.innerHTML = previewRows.map(g => `
        <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:6px 10px; font-weight:700;">${g.name}</td>
            <td style="padding:6px 10px; color:#475569;">${g.phone}</td>
            <td style="padding:6px 10px; text-align:center;">${g.passes}</td>
            <td style="padding:6px 10px; color:#64748b;">${g.companion || '—'}</td>
            <td style="padding:6px 10px;">${g.menu}</td>
        </tr>
    `).join('');
}

function executeGuestImport() {
    if (parsedCsvGuestsBuffer.length === 0) return;

    const data = (typeof getWeddingState === 'function') ? getWeddingState(currentWeddingId) : currentData;
    if (!data) return;

    const modeRadio = document.querySelector('input[name="importMode"]:checked');
    const isAppend = modeRadio ? modeRadio.value === 'append' : true;

    if (!Array.isArray(data.guests)) {
        data.guests = [];
    }

    let addedCount = 0;
    let skippedCount = 0;

    if (!isAppend) {
        data.guests = [];
    }

    parsedCsvGuestsBuffer.forEach((g, idx) => {
        const normalizedPhone = (typeof normalizeMexicanPhone === 'function') ? normalizeMexicanPhone(g.phone) : g.phone;
        
        // Prevent duplicate phone numbers in append mode
        if (isAppend && data.guests.some(existing => existing.phone && existing.phone.replace(/\D/g, '') === g.phone.replace(/\D/g, ''))) {
            skippedCount++;
            return;
        }

        let assignedTableId = null;
        if (g.table && Array.isArray(data.tables)) {
            const tableMatch = data.tables.find(t => t.name.toLowerCase() === g.table.toLowerCase());
            if (tableMatch) assignedTableId = tableMatch.id;
        }

        const newGuest = {
            id: 'g_' + (Date.now() + idx),
            name: g.name,
            phone: normalizedPhone,
            email: '',
            passes: g.passes,
            companion: g.companion,
            menu: g.menu,
            allergies: g.allergies,
            guest1Menu: g.menu,
            guest1Allergies: g.allergies,
            companionMenu: g.companion ? (g.menu === 'salmon' ? 'filete' : 'salmon') : null,
            companionAllergies: 'Ninguna',
            status: 'confirmed',
            tableId: assignedTableId,
            dispatchStatus: 'pending'
        };

        data.guests.push(newGuest);
        addedCount++;
    });

    saveWeddingState(currentWeddingId, data);
    closeImportGuestsModal();

    // Refresh all related views
    if (typeof renderGuestTable === 'function') renderGuestTable();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderDispatchTab === 'function') renderDispatchTab();
    if (typeof renderSeatingChart === 'function') renderSeatingChart();

    showToast(`🎉 ¡Importación completada! ${addedCount} invitados agregados.${skippedCount > 0 ? ` (${skippedCount} omitidos por teléfono duplicado).` : ''}`);
}
