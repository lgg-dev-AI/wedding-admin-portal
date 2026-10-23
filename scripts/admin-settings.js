// ==========================================================================
// PLANNER VISIBILITY & PLAN PACKAGING CONFIGURATION ENGINE
// ==========================================================================

const DEFAULT_COUPLE_PERMISSIONS = {
    planTier: 'custom',
    showDispatch: true,      // Tablero de Envíos WhatsApp
    showSeating: true,       // Acomodo de Mesas
    showCRM: true,           // CRM de Invitados
    showFinance: true,       // Comprobantes & Regalos
    showDayOf: false,        // Minuta Día D
    showBarCalc: false,      // Calculadora de Barra
    showVendors: false,      // Proveedores & Anticipos
    showTravel: true,        // Logística & Hoteles
    showAlbum: true,         // Álbum Colaborativo
    showPlaylist: true       // Playlist para el DJ
};

function getCouplePermissions(weddingId) {
    const state = typeof getWeddingState === 'function' ? getWeddingState(weddingId) : (window.currentData || {});
    if (!state.couplePermissions) {
        state.couplePermissions = Object.assign({}, DEFAULT_COUPLE_PERMISSIONS);
        if (typeof saveWeddingState === 'function') {
            saveWeddingState(weddingId, state);
        }
    }
    return state.couplePermissions;
}

// Plan features matrix: which features are permitted under each tier
const TIER_FEATURES = {
    none: [],
    basic: ['showDispatch', 'showCRM', 'showFinance'], // Essential ($800)
    intermediate: ['showDispatch', 'showSeating', 'showCRM', 'showFinance', 'showTravel', 'showAlbum', 'showPlaylist'], // Signature Pro ($2,000)
    elite: ['showDispatch', 'showSeating', 'showCRM', 'showFinance', 'showTravel', 'showAlbum', 'showPlaylist', 'showDayOf', 'showBarCalc', 'showVendors'] // Atelier Elite ($3,500)
};

function getActiveSubscriptionTier() {
    // If in demo mode or demo trial, NO plan is active! All plans must be chooseable
    if (sessionStorage.getItem('antigravity_demo_mode') === 'true' || 
        sessionStorage.getItem('antigravity_is_demo_trial') === 'true' || 
        sessionStorage.getItem('antigravity_role') === 'demo_planner') {
        return null;
    }

    // Check if logged in as a specific client
    const email = (sessionStorage.getItem('antigravity_user_email') || sessionStorage.getItem('antigravity_logged_user') || '').toLowerCase();
    if (email) {
        const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
        const client = clients.find(c => c.email.toLowerCase() === email);
        if (client) {
            if (client.paymentStatus === 'paid' && client.planTier && !client.isSuspended) {
                return client.planTier;
            }
            return null; // Demo trial or unpaid
        }
    }

    // Check localStorage
    const tier = localStorage.getItem('wedding_subscription_tier');
    if (tier && ['basic', 'intermediate', 'elite'].includes(tier)) {
        return tier;
    }
    return null; // No active plan purchased
}

function renderSettingsTab() {
    const activeSubTier = getActiveSubscriptionTier();
    const perms = getCouplePermissions(currentWeddingId);

    // Update preset cards and buttons
    const planNames = { basic: 'Essential', intermediate: 'Signature Pro', elite: 'Atelier Elite' };
    const allTiers = ['basic', 'intermediate', 'elite'];

    allTiers.forEach(tier => {
        const card = document.getElementById(`cardPlan_${tier}`);
        const isCurrentActive = activeSubTier === tier;

        if (card) {
            card.style.border = isCurrentActive ? '2px solid #059669' : '';
            card.style.boxShadow = isCurrentActive ? '0 8px 24px rgba(5, 150, 105, 0.25)' : '';
            card.style.position = 'relative';

            // Existing badge check
            let activeTag = card.querySelector('.active-plan-badge-tag');
            if (isCurrentActive) {
                if (!activeTag) {
                    activeTag = document.createElement('div');
                    activeTag.className = 'active-plan-badge-tag';
                    activeTag.innerHTML = `🌟 PLAN ACTUALMENTE ACTIVO`;
                    activeTag.style.cssText = 'position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#059669; color:#fff; font-size:0.75rem; font-weight:800; padding:4px 12px; border-radius:20px; box-shadow:0 4px 12px rgba(5,150,105,0.4); text-transform:uppercase; letter-spacing:0.5px; z-index:10; white-space:nowrap;';
                    card.appendChild(activeTag);
                }
            } else if (activeTag) {
                if (typeof activeTag.remove === 'function') {
                    activeTag.remove();
                } else if (activeTag.parentNode) {
                    activeTag.parentNode.removeChild(activeTag);
                }
            }
        }

        const btn = document.querySelector(`.plan-preset-btn[data-plan="${tier}"]`);
        if (btn) {
            btn.classList.toggle('active', isCurrentActive);
            if (isCurrentActive) {
                btn.innerText = `✓ Plan Activo (${planNames[tier]})`;
                btn.style.background = '#059669';
                btn.style.color = '#ffffff';
                btn.style.borderColor = '#059669';
            } else {
                btn.innerText = `Elegir Plan ${planNames[tier]}`;
                btn.style.background = '';
                btn.style.color = '';
                btn.style.borderColor = '';
            }
        }
    });

    // Update banner message regarding granular toggles status
    let statusNotice = document.getElementById('granularTogglesStatusNotice');
    if (!statusNotice) {
        const matrixCard = document.querySelector('.section-card .toggles-grid')?.parentElement;
        if (matrixCard) {
            statusNotice = document.createElement('div');
            statusNotice.id = 'granularTogglesStatusNotice';
            statusNotice.style.cssText = 'margin-bottom: 16px; padding: 12px 16px; border-radius: 10px; font-size: 0.88rem; font-weight: 600; display: flex; align-items: center; gap: 10px;';
            matrixCard.insertBefore(statusNotice, matrixCard.querySelector('.toggles-grid'));
        }
    }

    if (statusNotice) {
        if (!activeSubTier) {
            statusNotice.style.background = '#fef2f2';
            statusNotice.style.border = '1px solid #fecaca';
            statusNotice.style.color = '#991b1b';
            statusNotice.innerHTML = `🔒 <span><strong>Sin plan contratado:</strong> Todos los controles están bloqueados. Contrata un plan arriba con Stripe para habilitar la personalización de módulos para la pareja.</span>`;
        } else {
            statusNotice.style.background = '#f0fdf4';
            statusNotice.style.border = '1px solid #bbf7d0';
            statusNotice.style.color = '#166534';
            statusNotice.innerHTML = `🔓 <span><strong>Plan activo: ${planNames[activeSubTier]}</strong>. Puedes personalizar los interruptores incluidos en tu plan. Los módulos de planes superiores permanecen protegidos con candado 🔒.</span>`;
        }
    }

    // Update toggles and apply strict lock
    const fields = [
        'showDispatch', 'showSeating', 'showCRM', 'showFinance',
        'showDayOf', 'showBarCalc', 'showVendors',
        'showTravel', 'showAlbum', 'showPlaylist'
    ];

    const allowedInActiveTier = activeSubTier ? (TIER_FEATURES[activeSubTier] || []) : [];

    fields.forEach(field => {
        const toggleEl = document.getElementById(`toggle_${field}`);
        const row = (toggleEl && typeof toggleEl.closest === 'function') ? toggleEl.closest('.toggle-item-row') : null;

        if (toggleEl) {
            // Check value
            toggleEl.checked = !!perms[field];

            // Can this user toggle this checkbox?
            // ONLY if there is an activeSubTier AND the field is included in that tier
            const isFieldAllowed = activeSubTier && allowedInActiveTier.includes(field);

            toggleEl.disabled = !isFieldAllowed;

            if (row) {
                if (!isFieldAllowed) {
                    row.style.opacity = '0.55';
                    row.style.background = '#f8fafc';
                    row.style.cursor = 'not-allowed';
                    row.setAttribute('title', !activeSubTier ? 'Requiere contratar un plan para configurar visibilidad.' : `Módulo no disponible en tu plan ${planNames[activeSubTier]}. Requiere upgrade.`);
                    
                    // Add lock indicator if missing
                    let lockBadge = row.querySelector('.tier-lock-badge');
                    if (!lockBadge) {
                        lockBadge = document.createElement('span');
                        lockBadge.className = 'tier-lock-badge';
                        lockBadge.style.cssText = 'display:inline-flex; align-items:center; gap:4px; font-size:0.72rem; font-weight:700; color:#dc2626; background:#fee2e2; padding:2px 8px; border-radius:12px; margin-left:8px;';
                        const strongTag = row.querySelector('strong');
                        if (strongTag) {
                            lockBadge.innerHTML = `🔒 Requiere ${getRequiredTierForField(field)}`;
                            strongTag.appendChild(lockBadge);
                        }
                    } else {
                        lockBadge.style.display = 'inline-flex';
                    }
                } else {
                    row.style.opacity = '1';
                    row.style.background = '';
                    row.style.cursor = 'default';
                    if (typeof row.removeAttribute === 'function') row.removeAttribute('title');
                    const lockBadge = row.querySelector('.tier-lock-badge');
                    if (lockBadge) lockBadge.style.display = 'none';
                }
            }
        }
    });
}

function getRequiredTierForField(field) {
    if (TIER_FEATURES.basic.includes(field)) return 'Plan Essential';
    if (TIER_FEATURES.intermediate.includes(field)) return 'Plan Signature Pro';
    return 'Plan Atelier Elite';
}

function applyPlanPreset(planName, evt) {
    if (evt && evt.stopPropagation) evt.stopPropagation();
    
    // Open checkout directly for the chosen plan
    if (typeof openStripeCheckoutModal === 'function') {
        openStripeCheckoutModal(planName);
    }
}

function updateIndividualPermission(key, value) {
    const activeSubTier = getActiveSubscriptionTier();
    const planNames = { basic: 'Essential', intermediate: 'Signature Pro', elite: 'Atelier Elite' };

    if (!activeSubTier) {
        showToast(`🔒 No puedes modificar este permiso. Primero debes contratar un plan.`);
        renderSettingsTab();
        return;
    }

    const allowed = TIER_FEATURES[activeSubTier] || [];
    if (!allowed.includes(key)) {
        showToast(`🔒 Este módulo no está incluido en tu Plan ${planNames[activeSubTier]}. Realiza un upgrade para habilitarlo.`);
        renderSettingsTab();
        return;
    }

    const perms = getCouplePermissions(currentWeddingId);
    perms[key] = value;
    perms.planTier = 'custom';
    currentData.couplePermissions = perms;
    saveWeddingState(currentWeddingId, currentData);
    renderSettingsTab();
    applyVisibilityToCoupleView();
    showToast(`⚙️ Permiso actualizado para Vista Novios.`);
}

function applyVisibilityToCoupleView() {
    if (activeRole !== 'couple') return;
    const perms = getCouplePermissions(currentWeddingId);

    // Map of tab names to permission keys
    const tabMap = {
        'dispatch': perms.showDispatch,
        'seating': perms.showSeating,
        'guests': perms.showCRM,
        'finance': perms.showFinance,
        'dayof': perms.showDayOf,
        'barcalc': perms.showBarCalc,
        'vendors': perms.showVendors,
        'travel': perms.showTravel,
        'album': perms.showAlbum,
        'playlist': perms.showPlaylist
    };

    document.querySelectorAll('.sidebar-menu .menu-item').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick') || '';
        for (const [tabKey, isAllowed] of Object.entries(tabMap)) {
            if (onclickAttr.includes(`showTab('${tabKey}')`)) {
                btn.style.display = isAllowed ? 'flex' : 'none';
            }
        }
        // Always hide settings and developer panel from couple
        if (onclickAttr.includes(`showTab('settings')`) || onclickAttr.includes(`dev-clients`) || btn.id === 'menuItemDevPanel' || btn.classList.contains('dev-only')) {
            btn.style.display = 'none';
        }
    });
}
