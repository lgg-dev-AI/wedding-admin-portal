// ==========================================================================
// PLANNER VISIBILITY, PRICING & COUPLE SERVICES CONFIGURATION ENGINE
// ==========================================================================

const DEFAULT_COUPLE_PERMISSIONS = {
    planTier: 'custom',
    showDispatch: true,      // Tablero de Envíos WhatsApp
    showSeating: true,       // Acomodo de Mesas 2D
    showCRM: true,           // CRM de Invitados
    showFinance: true,       // Comprobantes & Regalos
    showDayOf: false,        // Minuta Día D
    showBarCalc: false,      // Calculadora de Barra
    showVendors: false,      // Proveedores & Anticipos
    showTravel: true,        // Logística & Hoteles
    showAlbum: true,         // Álbum Colaborativo QR
    showPlaylist: true       // Playlist para el DJ
};

const DEFAULT_COUPLE_PRICING = {
    showDispatch: 1000,
    showSeating: 2500,
    showCRM: 0,
    showFinance: 0,
    showAlbum: 1000,
    showPlaylist: 800,
    showTravel: 1200,
    showDayOf: 1500,
    showBarCalc: 1500,
    showVendors: 1500
};

const MODULE_DISPLAY_NAMES = {
    showDispatch: '📲 Tablero de Envíos WhatsApp',
    showSeating: '🪑 Distribución de Mesas 2D',
    showCRM: '👥 CRM de Invitados & Menú',
    showFinance: '💳 Mesa de Regalos SPEI',
    showAlbum: '📸 Álbum Colaborativo en Vivo (QR)',
    showPlaylist: '🎵 Playlist para el DJ',
    showTravel: '✈️ Logística, Hoteles & Shuttles',
    showDayOf: '⏱️ Cronograma Minuto a Minuto Día D',
    showBarCalc: '🍾 Calculadora de Barra & Descorche',
    showVendors: '🏢 Proveedores & Finanzas Internas'
};

function getCouplePermissions(weddingId) {
    if (!weddingId) return Object.assign({}, DEFAULT_COUPLE_PERMISSIONS);
    const state = typeof getWeddingState === 'function' ? getWeddingState(weddingId) : (window.currentData || {});
    if (!state.couplePermissions) {
        state.couplePermissions = Object.assign({}, DEFAULT_COUPLE_PERMISSIONS);
        if (typeof saveWeddingState === 'function' && weddingId) {
            saveWeddingState(weddingId, state);
        }
    }
    return state.couplePermissions;
}

function getCouplePricing(weddingId) {
    if (!weddingId) return Object.assign({}, DEFAULT_COUPLE_PRICING);
    const state = typeof getWeddingState === 'function' ? getWeddingState(weddingId) : (window.currentData || {});
    if (!state.couplePricing) {
        state.couplePricing = Object.assign({}, DEFAULT_COUPLE_PRICING);
        if (typeof saveWeddingState === 'function' && weddingId) {
            saveWeddingState(weddingId, state);
        }
    }
    return state.couplePricing;
}

function getActiveSubscriptionTier() {
    if (sessionStorage.getItem('antigravity_demo_mode') === 'true' || 
        sessionStorage.getItem('antigravity_is_demo_trial') === 'true' || 
        sessionStorage.getItem('antigravity_role') === 'demo_planner') {
        return null;
    }

    const email = (sessionStorage.getItem('antigravity_user_email') || sessionStorage.getItem('antigravity_logged_user') || '').toLowerCase();
    if (email) {
        const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
        const client = clients.find(c => c.email.toLowerCase() === email);
        if (client) {
            if (client.paymentStatus === 'paid' && client.planTier && !client.isSuspended) {
                return client.planTier;
            }
            return null;
        }
    }

    const tier = localStorage.getItem('wedding_subscription_tier');
    if (tier && ['basic', 'intermediate', 'elite'].includes(tier)) {
        return tier;
    }
    return null;
}

function renderSettingsTab() {
    const activeSubTier = getActiveSubscriptionTier();
    const planNames = { basic: 'Essential', intermediate: 'Signature Pro', elite: 'Atelier Elite' };
    const allTiers = ['basic', 'intermediate', 'elite'];

    // 1. Antigravity SaaS Subscription Preset Cards
    allTiers.forEach(tier => {
        const card = document.getElementById(`cardPlan_${tier}`);
        const isCurrentActive = activeSubTier === tier;

        if (card) {
            card.style.border = isCurrentActive ? '2px solid #059669' : '';
            card.style.boxShadow = isCurrentActive ? '0 8px 24px rgba(5, 150, 105, 0.25)' : '';
            card.style.position = 'relative';

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

    // 2. Sync Active Wedding Name in Header & Credentials Card
    const activeWeddingBadge = document.getElementById('settingsActiveWeddingName');
    if (activeWeddingBadge) {
        if (currentData && currentData.couple) {
            activeWeddingBadge.innerText = currentData.couple;
        } else {
            activeWeddingBadge.innerText = 'Sin Boda Creada (Crea una boda en "+ Nueva Boda")';
        }
    }

    const userInput = document.getElementById('settingsWCoupleUser');
    if (userInput) {
        userInput.value = (currentData && currentData.coupleUser) ? currentData.coupleUser : (currentWeddingId === 'aura' ? 'sofia-y-alejandro' : '');
    }
    const passInput = document.getElementById('settingsWCouplePass');
    if (passInput) {
        passInput.value = (currentData && currentData.couplePass) ? currentData.couplePass : (currentWeddingId === 'aura' ? 'boda2027' : '');
    }

    // 3. Update Granular Toggles & Pricing Inputs per Wedding
    const perms = getCouplePermissions(currentWeddingId);
    const pricing = getCouplePricing(currentWeddingId);

    const fields = [
        'showDispatch', 'showSeating', 'showCRM', 'showFinance',
        'showAlbum', 'showPlaylist', 'showTravel',
        'showDayOf', 'showBarCalc', 'showVendors'
    ];

    fields.forEach(field => {
        // Toggle Switch
        const toggleEl = document.getElementById(`toggle_${field}`);
        if (toggleEl) {
            toggleEl.checked = !!perms[field];
        }

        // Pricing Input
        const priceInput = document.getElementById(`pricing_${field}`);
        if (priceInput) {
            priceInput.value = (pricing[field] !== undefined) ? pricing[field] : (DEFAULT_COUPLE_PRICING[field] || 0);
        }
    });

    // 4. Calculate total quotation
    calculateAndRenderServicesTotal();
}

function calculateAndRenderServicesTotal() {
    const perms = getCouplePermissions(currentWeddingId);
    const pricing = getCouplePricing(currentWeddingId);

    let total = 0;
    let activeCount = 0;

    const fields = [
        'showDispatch', 'showSeating', 'showCRM', 'showFinance',
        'showAlbum', 'showPlaylist', 'showTravel',
        'showDayOf', 'showBarCalc', 'showVendors'
    ];

    fields.forEach(f => {
        if (perms[f]) {
            activeCount++;
            const cost = parseInt(pricing[f], 10) || 0;
            total += cost;
        }
    });

    const totalEl = document.getElementById('coupleServicesTotalPrice');
    if (totalEl) {
        totalEl.innerText = `$${total.toLocaleString('es-MX')} MXN`;
    }

    const countEl = document.getElementById('coupleServicesActiveCount');
    if (countEl) {
        countEl.innerText = `${activeCount} módulos activos para la pareja`;
    }
}

function applyPlanPreset(planName, evt) {
    if (evt && evt.stopPropagation) evt.stopPropagation();
    if (typeof openStripeCheckoutModal === 'function') {
        openStripeCheckoutModal(planName);
    }
}

function updateIndividualPermission(key, value) {
    if (!currentWeddingId) {
        showToast(`⚠️ Selecciona o crea una boda primero para configurar su portal.`);
        renderSettingsTab();
        return;
    }

    const state = typeof getWeddingState === 'function' ? getWeddingState(currentWeddingId) : (window.currentData || {});
    if (!state.couplePermissions) {
        state.couplePermissions = Object.assign({}, DEFAULT_COUPLE_PERMISSIONS);
    }
    state.couplePermissions[key] = value;
    state.couplePermissions.planTier = 'custom';

    if (typeof saveWeddingState === 'function') {
        saveWeddingState(currentWeddingId, state);
    }
    window.currentData = state;

    calculateAndRenderServicesTotal();
    if (typeof applyVisibilityToCoupleView === 'function') {
        applyVisibilityToCoupleView();
    }
    showToast(`⚙️ ${MODULE_DISPLAY_NAMES[key] || key}: ${value ? 'Habilitado' : 'Desactivado'} para la pareja.`);
}

function updateIndividualPricing(key, amount) {
    if (!currentWeddingId) return;

    const state = typeof getWeddingState === 'function' ? getWeddingState(currentWeddingId) : (window.currentData || {});
    if (!state.couplePricing) {
        state.couplePricing = Object.assign({}, DEFAULT_COUPLE_PRICING);
    }

    const cleanNum = Math.max(0, parseInt(amount, 10) || 0);
    state.couplePricing[key] = cleanNum;

    if (typeof saveWeddingState === 'function') {
        saveWeddingState(currentWeddingId, state);
    }
    window.currentData = state;

    calculateAndRenderServicesTotal();
}

function copyServicesQuotationForWhatsApp() {
    if (!currentWeddingId || !window.currentData) {
        showToast('⚠️ No hay boda seleccionada para generar la propuesta.');
        return;
    }

    const perms = getCouplePermissions(currentWeddingId);
    const pricing = getCouplePricing(currentWeddingId);
    const coupleName = window.currentData.couple || 'Pareja';

    let total = 0;
    let itemsText = '';

    const fields = [
        'showDispatch', 'showSeating', 'showCRM', 'showFinance',
        'showAlbum', 'showPlaylist', 'showTravel',
        'showDayOf', 'showBarCalc', 'showVendors'
    ];

    fields.forEach(key => {
        if (perms[key]) {
            const cost = parseInt(pricing[key], 10) || 0;
            total += cost;
            const costStr = cost === 0 ? '✓ Incluido en honorarios' : `$${cost.toLocaleString('es-MX')} MXN`;
            itemsText += `  • ${MODULE_DISPLAY_NAMES[key] || key}: ${costStr}\n`;
        }
    });

    const msg = `💍 *PROPUESTA DE SERVICIOS DIGITALES & PORTAL DE NOVIOS*\n\n` +
        `¡Hola ${coupleName}! Les comparto los accesos y herramientas digitales personalizadas incluidas para su boda:\n\n` +
        itemsText + `\n` +
        `💰 *Inversión Total Servicios Digitales:* $${total.toLocaleString('es-MX')} MXN\n\n` +
        `🔐 Su portal incluye acceso privado 24/7 desde computadora y celular con credenciales exclusivas.\n` +
        `¡Quedo a su disposición para cualquier ajuste! ✨`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).then(() => {
            showToast('📲 ¡Propuesta copiada al portapapeles! Lista para pegar en WhatsApp.');
        }).catch(() => {
            prompt('Copia tu propuesta aquí:', msg);
        });
    } else {
        prompt('Copia tu propuesta aquí:', msg);
    }
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
        // Always hide settings, developer panel and backups from couple
        if (onclickAttr.includes(`showTab('settings')`) || 
            onclickAttr.includes(`dev-clients`) || 
            onclickAttr.includes(`dev-analytics`) || 
            onclickAttr.includes(`backups`) || 
            btn.id === 'menuItemDevPanel' || 
            btn.classList.contains('dev-only') ||
            btn.classList.contains('planner-only')) {
            btn.style.display = 'none';
        }
    });

    // Also hide planner-only section headers
    document.querySelectorAll('.menu-section-header').forEach(hdr => {
        if (hdr.classList.contains('planner-only') || hdr.classList.contains('dev-only') || hdr.getAttribute('data-section') === 'settings') {
            hdr.style.display = 'none';
        }
    });
}

function saveCoupleCredentialsFromSettings() {
    if (!currentWeddingId || !window.currentData) {
        showToast('⚠️ No hay boda activa seleccionada para guardar credenciales.');
        return;
    }

    const userInput = document.getElementById('settingsWCoupleUser');
    const passInput = document.getElementById('settingsWCouplePass');

    const cleanUser = (userInput ? userInput.value : '').trim().toLowerCase();
    const cleanPass = (passInput ? passInput.value : '').trim();

    if (!cleanUser || !cleanPass) {
        showToast('⚠️ Por favor completa el usuario y la contraseña de los novios.');
        return;
    }

    window.currentData.coupleUser = cleanUser;
    window.currentData.couplePass = cleanPass;

    // Sync with modal inputs if present
    const modalUser = document.getElementById('editWCoupleUser');
    if (modalUser) modalUser.value = cleanUser;
    const modalPass = document.getElementById('editWCouplePass');
    if (modalPass) modalPass.value = cleanPass;

    if (typeof saveWeddingState === 'function') {
        saveWeddingState(currentWeddingId, window.currentData);
    }

    if (typeof WEDDINGS_DB !== 'undefined' && WEDDINGS_DB[currentWeddingId]) {
        WEDDINGS_DB[currentWeddingId].coupleUser = cleanUser;
        WEDDINGS_DB[currentWeddingId].couplePass = cleanPass;
    }

    showToast(`✅ Credenciales guardadas: Usuario "${cleanUser}" / Clave "${cleanPass}"`);
}

