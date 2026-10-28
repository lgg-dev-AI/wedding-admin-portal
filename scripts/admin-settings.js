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
    if (tier && ['intermediate', 'elite', 'single_wedding'].includes(tier)) {
        return tier;
    }
    return null;
}


let currentBillingCycleMode = 'monthly';

function setBillingCycleMode(mode) {
    currentBillingCycleMode = mode;
    const btnMonthly = document.getElementById('btnBillingCycle_monthly');
    const btnAnnual = document.getElementById('btnBillingCycle_annual');
    const priceInter = document.getElementById('priceDisplay_intermediate');
    const priceElite = document.getElementById('priceDisplay_elite');
    const btnStripeInter = document.getElementById('btnStripe_intermediate');
    const btnStripeElite = document.getElementById('btnStripe_elite');

    if (mode === 'annual') {
        if (btnMonthly) {
            btnMonthly.style.background = 'transparent';
            btnMonthly.style.color = '#475569';
            btnMonthly.style.boxShadow = 'none';
        }
        if (btnAnnual) {
            btnAnnual.style.background = '#0f172a';
            btnAnnual.style.color = '#ffffff';
            btnAnnual.style.boxShadow = '0 2px 8px rgba(15,23,42,0.25)';
        }

        if (priceInter) {
            priceInter.innerHTML = '<span style="text-decoration:line-through; font-size:0.95rem; color:#94a3b8; font-weight:normal; margin-right:6px;">$23,880</span>$19,900 <small style="font-size:0.8rem; color:#059669; font-weight:800;">MXN / año (Ahorra $3,980)</small>';
        }
        if (priceElite) {
            priceElite.innerHTML = '<span style="text-decoration:line-through; font-size:0.95rem; color:#94a3b8; font-weight:normal; margin-right:6px;">$39,480</span>$32,900 <small style="font-size:0.8rem; color:#059669; font-weight:800;">MXN / año (Ahorra $6,580)</small>';
        }

        if (btnStripeInter) {
            btnStripeInter.innerHTML = '✨ Pagar $19,900 MXN / Año (2 Meses Gratis)';
            btnStripeInter.setAttribute('onclick', "openStripeCheckoutModal('intermediate', 'annual'); event.stopPropagation();");
        }
        if (btnStripeElite) {
            btnStripeElite.innerHTML = '👑 Pagar $32,900 MXN / Año (2 Meses Gratis)';
            btnStripeElite.setAttribute('onclick', "openStripeCheckoutModal('elite', 'annual'); event.stopPropagation();");
        }
    } else {
        if (btnMonthly) {
            btnMonthly.style.background = '#0f172a';
            btnMonthly.style.color = '#ffffff';
            btnMonthly.style.boxShadow = '0 2px 8px rgba(15,23,42,0.25)';
        }
        if (btnAnnual) {
            btnAnnual.style.background = 'transparent';
            btnAnnual.style.color = '#475569';
            btnAnnual.style.boxShadow = 'none';
        }

        if (priceInter) {
            priceInter.innerHTML = '$1,990 <small style="font-size:0.8rem; color:#64748b;">MXN / mes</small>';
        }
        if (priceElite) {
            priceElite.innerHTML = '$3,290 <small style="font-size:0.8rem; color:#64748b;">MXN / mes</small>';
        }

        if (btnStripeInter) {
            btnStripeInter.innerHTML = '💳 Pagar $1,990 MXN (Stripe)';
            btnStripeInter.setAttribute('onclick', "openStripeCheckoutModal('intermediate', 'monthly'); event.stopPropagation();");
        }
        if (btnStripeElite) {
            btnStripeElite.innerHTML = '💳 Pagar con Stripe ($3,290)';
            btnStripeElite.setAttribute('onclick', "openStripeCheckoutModal('elite', 'monthly'); event.stopPropagation();");
        }
    }
}

function renderSettingsTab() {
    const activeSubTier = getActiveSubscriptionTier();
    const planNames = { intermediate: 'Signature Pro', elite: 'Atelier Elite' };
    const allTiers = ['intermediate', 'elite'];
    const isCanceling = localStorage.getItem('wedding_subscription_status') === 'canceling';
    const subDates = (isCanceling && typeof getSubscriptionDates === 'function') ? getSubscriptionDates() : null;

    // AVISO DE CANCELACIÓN / DESACTIVACIÓN PROGRAMADA
    const noticeBanner = document.getElementById('subscriptionCancellationNoticeBanner');
    const noticeText = document.getElementById('subscriptionCancellationNoticeText');
    if (noticeBanner) {
        if (isCanceling && activeSubTier) {
            noticeBanner.style.display = 'block';
            if (noticeText && subDates) {
                noticeText.innerHTML = `Tu plan <strong>${planNames[activeSubTier] || 'Premium'}</strong> fue desactivado y no renovará automáticamente. <strong>Mantienes acceso total a todas las herramientas hasta el ${subDates.periodEndDate}</strong> sin ningún cobro futuro.`;
            }
        } else {
            noticeBanner.style.display = 'none';
        }
    }

    // 1. Antigravity SaaS Subscription Preset Cards
    allTiers.forEach(tier => {
        const card = document.getElementById(`cardPlan_${tier}`);
        const isCurrentActive = activeSubTier === tier;
        const deactivateBtn = document.getElementById(`btnDeactivate_${tier}`);

        // Controlar visibilidad del 3er botón: Desactivar mi plan
        if (deactivateBtn) {
            if (isCurrentActive) {
                deactivateBtn.style.display = 'block';
                if (isCanceling) {
                    deactivateBtn.innerText = '🔄 Conservar / Reactivar Plan';
                    deactivateBtn.style.background = '#ecfdf5';
                    deactivateBtn.style.color = '#059669';
                    deactivateBtn.style.borderColor = '#10b981';
                } else {
                    deactivateBtn.innerText = '🛑 Desactivar mi plan';
                    deactivateBtn.style.background = '#fef2f2';
                    deactivateBtn.style.color = '#dc2626';
                    deactivateBtn.style.borderColor = '#fca5a5';
                }
            } else {
                deactivateBtn.style.display = 'none';
            }
        }

        if (card) {
            if (isCurrentActive) {
                if (isCanceling) {
                    card.style.border = '2px solid #f97316';
                    card.style.boxShadow = '0 8px 24px rgba(249, 115, 22, 0.25)';
                } else {
                    card.style.border = '2px solid #059669';
                    card.style.boxShadow = '0 8px 24px rgba(5, 150, 105, 0.25)';
                }
            } else {
                card.style.border = '';
                card.style.boxShadow = '';
            }
            card.style.position = 'relative';

            let activeTag = card.querySelector('.active-plan-badge-tag');
            if (isCurrentActive) {
                if (!activeTag) {
                    activeTag = document.createElement('div');
                    activeTag.className = 'active-plan-badge-tag';
                    card.appendChild(activeTag);
                }
                if (isCanceling && subDates) {
                    activeTag.innerHTML = `⏳ CANCELACIÓN PROGRAMADA · Activo hasta el ${subDates.periodEndDate}`;
                    activeTag.style.cssText = 'position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#ea580c; color:#fff; font-size:0.72rem; font-weight:800; padding:4px 12px; border-radius:20px; box-shadow:0 4px 12px rgba(234,88,12,0.4); text-transform:uppercase; letter-spacing:0.5px; z-index:10; white-space:nowrap;';
                } else {
                    const isAnnualSub = localStorage.getItem('wedding_subscription_cycle') === 'year' || localStorage.getItem('wedding_subscription_cycle') === 'annual';
                    activeTag.innerHTML = isAnnualSub ? '🌟 PLAN ANUAL ACTIVO (12 MESES)' : '🌟 PLAN ACTUALMENTE ACTIVO';
                    activeTag.style.cssText = 'position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#059669; color:#fff; font-size:0.75rem; font-weight:800; padding:4px 12px; border-radius:20px; box-shadow:0 4px 12px rgba(5,150,105,0.4); text-transform:uppercase; letter-spacing:0.5px; z-index:10; white-space:nowrap;';
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
                btn.style.background = isCanceling ? '#ea580c' : '#059669';
                btn.style.color = '#ffffff';
                btn.style.borderColor = isCanceling ? '#ea580c' : '#059669';
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

// ==========================================================================
// WEDDING PLANNER SUBSCRIPTION CANCELLATION & BILLING CYCLE ENGINE
// ==========================================================================

function getSubscriptionDates() {
    const email = (sessionStorage.getItem('antigravity_user_email') || sessionStorage.getItem('antigravity_logged_user') || '').toLowerCase();
    const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
    const client = clients.find(c => c.email && c.email.toLowerCase() === email);

    let startDateStr = localStorage.getItem('wedding_subscription_start_date');
    if (client && client.lastPaymentDate) {
        startDateStr = client.lastPaymentDate;
    } else if (client && client.createdAt) {
        startDateStr = client.createdAt;
    } else if (!startDateStr) {
        startDateStr = new Date().toISOString().split('T')[0];
    }

    const startDate = new Date(startDateStr + 'T00:00:00');
    const today = new Date();

    // The subscription renews monthly on the same day-of-month as startDate
    const billingDay = startDate.getDate() || today.getDate();
    
    // Find the next recurrence of billingDay
    let periodEnd = new Date(today.getFullYear(), today.getMonth(), billingDay);
    if (periodEnd <= today) {
        periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, billingDay);
    }

    const formatDate = (d) => d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

    return {
        contractDate: formatDate(startDate),
        contractDateIso: startDateStr,
        cancellationDate: formatDate(today),
        cancellationDateIso: today.toISOString().split('T')[0],
        periodEndDate: formatDate(periodEnd),
        periodEndDateIso: periodEnd.toISOString().split('T')[0]
    };
}

let pendingDeactivationTier = null;

function openDeactivatePlanModal(tier) {
    const activeSubTier = getActiveSubscriptionTier();
    const isCanceling = localStorage.getItem('wedding_subscription_status') === 'canceling';
    
    // Si ya está en cancelación programada, permitir reactivar directamente
    if (isCanceling) {
        resumeActiveSubscriptionPlan();
        return;
    }

    if (!activeSubTier || (activeSubTier !== tier && activeSubTier !== 'elite' && activeSubTier !== 'intermediate')) {
        showToast('⚠️ No tienes este plan activo actualmente.');
        return;
    }

    pendingDeactivationTier = tier;
    const planNames = { intermediate: 'Signature Pro', elite: 'Atelier Elite' };
    const selectedPlanName = planNames[tier] || 'Signature Pro';

    const modal = document.getElementById('modalDeactivatePlan');
    if (!modal) return;

    // Obtener detalles de la planner y agencia
    const email = (sessionStorage.getItem('antigravity_user_email') || sessionStorage.getItem('antigravity_logged_user') || '').toLowerCase();
    const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
    const client = clients.find(c => c.email && c.email.toLowerCase() === email);

    let plannerName = sessionStorage.getItem('antigravity_reg_planner') || (client ? client.plannerName : '') || '';
    if (!plannerName || plannerName === 'admin' || plannerName === 'Wedding Planner') {
        const agency = sessionStorage.getItem('antigravity_agency_name') || (client ? client.agencyName : '');
        plannerName = agency || 'Wedding Planner';
    }

    const dates = getSubscriptionDates();

    // Llenar campos dinámicos en el modal
    const titleEl = document.getElementById('deactivateModalPlanTitle');
    if (titleEl) titleEl.innerText = `Desactivar mi Plan ${selectedPlanName}`;

    const plannerNameEl = document.getElementById('deactivatePlannerNamePlaceholder');
    if (plannerNameEl) plannerNameEl.innerText = plannerName;

    const planNameEl = document.getElementById('deactivatePlanNamePlaceholder');
    if (planNameEl) planNameEl.innerText = selectedPlanName;

    const periodEndDisplay = document.getElementById('deactivatePeriodEndDateDisplay');
    if (periodEndDisplay) periodEndDisplay.innerText = dates.periodEndDate;

    const serviceUntilDisplay = document.getElementById('deactivateServiceUntilDisplay');
    if (serviceUntilDisplay) serviceUntilDisplay.innerText = dates.periodEndDate;

    const contractDateDisplay = document.getElementById('deactivateContractDateDisplay');
    if (contractDateDisplay) contractDateDisplay.innerText = dates.contractDate;

    const requestDateDisplay = document.getElementById('deactivateRequestDateDisplay');
    if (requestDateDisplay) requestDateDisplay.innerText = dates.cancellationDate;

    const feedbackTextarea = document.getElementById('deactivateFeedbackReason');
    if (feedbackTextarea) feedbackTextarea.value = '';

    const chk = document.getElementById('chkConfirmDeactivation');
    if (chk) chk.checked = false;

    const submitBtn = document.getElementById('btnConfirmDeactivateSubmit');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
        submitBtn.innerHTML = '<span>🛑 Desactivar mi Plan</span>';
    }

    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeDeactivatePlanModal() {
    const modal = document.getElementById('modalDeactivatePlan');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    pendingDeactivationTier = null;
}

function onToggleDeactivationAgreement() {
    const chk = document.getElementById('chkConfirmDeactivation');
    const submitBtn = document.getElementById('btnConfirmDeactivateSubmit');
    if (!submitBtn) return;

    if (chk && chk.checked) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
    } else {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
    }
}

async function confirmPlanDeactivation() {
    const chk = document.getElementById('chkConfirmDeactivation');
    if (!chk || !chk.checked) {
        showToast('⚠️ Debes marcar la casilla de confirmación para continuar.');
        return;
    }

    const tier = pendingDeactivationTier || getActiveSubscriptionTier() || 'intermediate';
    const planNames = { intermediate: 'Signature Pro', elite: 'Atelier Elite' };
    const planName = planNames[tier] || 'Signature Pro';

    const submitBtn = document.getElementById('btnConfirmDeactivateSubmit');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳ Procesando desactivación...</span>';
    }

    const dates = getSubscriptionDates();
    const reason = document.getElementById('deactivateFeedbackReason')?.value.trim() || 'No especificó motivo de cancelación.';

    const email = (sessionStorage.getItem('antigravity_user_email') || sessionStorage.getItem('antigravity_logged_user') || 'planner@wedding.com').toLowerCase();
    const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
    const client = clients.find(c => c.email && c.email.toLowerCase() === email);

    const agencyName = sessionStorage.getItem('antigravity_agency_name') || (client ? client.agencyName : 'Agencia Wedding Planner');
    let plannerName = sessionStorage.getItem('antigravity_reg_planner') || (client ? client.plannerName : agencyName);

    const deactivationPayload = {
        plannerName: plannerName,
        plannerEmail: email,
        agencyName: agencyName,
        planTier: tier,
        planName: planName,
        contractDate: dates.contractDate,
        cancellationDate: dates.cancellationDate,
        periodEndDate: dates.periodEndDate,
        reason: reason
    };

    // 1. Notificar vía API Serverless a Master Developer (Luis) por email
    try {
        await fetch('/api/cancel-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deactivationPayload)
        });
    } catch (e) {
        console.warn('Error al llamar /api/cancel-subscription:', e);
    }

    // 2. Notificar vía Telegram instantáneamente
    if (typeof sendTelegramPlanDeactivationAlert === 'function') {
        try {
            await sendTelegramPlanDeactivationAlert(deactivationPayload);
        } catch (e) {
            console.warn('Error enviando alerta de Telegram:', e);
        }
    }

    // 3. Persistir estado de cancelación programada
    localStorage.setItem('wedding_subscription_status', 'canceling');
    localStorage.setItem('wedding_subscription_cancelled_at', dates.cancellationDateIso);
    localStorage.setItem('wedding_subscription_period_end', dates.periodEndDate);
    localStorage.setItem('wedding_subscription_period_end_iso', dates.periodEndDateIso);
    localStorage.setItem('wedding_subscription_cancel_reason', reason);

    if (client) {
        client.subscriptionStatus = 'canceling';
        client.cancellationReason = reason;
        client.periodEndDate = dates.periodEndDateIso;
        if (typeof saveClientsDatabase === 'function') {
            saveClientsDatabase(clients);
        }
    }

    closeDeactivatePlanModal();

    showToast(`🛑 Suscripción desactivada. Continuarás disfrutando de tu ${planName} hasta el ${dates.periodEndDate}.`);

    renderSettingsTab();
}

function resumeActiveSubscriptionPlan() {
    const tier = getActiveSubscriptionTier() || 'intermediate';
    const planNames = { intermediate: 'Signature Pro', elite: 'Atelier Elite' };
    const planName = planNames[tier] || 'Signature Pro';

    if (!confirm(`¿Deseas reactivar y mantener tu suscripción al Plan ${planName}?`)) {
        return;
    }

    localStorage.setItem('wedding_subscription_status', 'active');
    localStorage.removeItem('wedding_subscription_cancelled_at');
    localStorage.removeItem('wedding_subscription_cancel_reason');

    const email = (sessionStorage.getItem('antigravity_user_email') || sessionStorage.getItem('antigravity_logged_user') || '').toLowerCase();
    const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
    const client = clients.find(c => c.email && c.email.toLowerCase() === email);

    if (client) {
        client.subscriptionStatus = 'active';
        client.cancellationReason = '';
        if (typeof saveClientsDatabase === 'function') {
            saveClientsDatabase(clients);
        }
    }

    showToast(`🎉 ¡Excelente! Tu plan ${planName} ha sido reactivado y continuará activo.`);
    renderSettingsTab();
}


