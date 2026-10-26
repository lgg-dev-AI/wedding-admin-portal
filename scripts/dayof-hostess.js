// ==========================================================================
// DAY-OF HOSTESS CHECK-IN, CHEF ALLERGIES & RUN OF SHOW ENGINE
// WITH INTERACTIVE DEMO SANDBOX & PLAN GATING ($800 / $2,000 / $3,500 MXN)
// ==========================================================================

const HOSTESS_GUESTS_KEY = 'wedding_dayof_guests_db';
let isDemoModeActive = false;
let currentHostessFilter = 'all';

const INITIAL_DAYOF_GUESTS = [
    { id: 'g_1', name: 'Lic. Roberto Garza & Sra.', passes: 2, table: 'Mesa 1 (Presidencia)', menu: 'Filete de Res', allergy: 'Ninguna', checkedIn: true, checkInTime: '18:45' },
    { id: 'g_2', name: 'Dra. Ana Cecilia Morales', passes: 1, table: 'Mesa 2 (Familia Novia)', menu: 'Salmón Glaseado', allergy: '⚠️ Alergia severa a mariscos', checkedIn: true, checkInTime: '18:52' },
    { id: 'g_3', name: 'Ing. Fernando Sotomayor & Familia', passes: 4, table: 'Mesa 3 (Amigos Monterrey)', menu: 'Filete de Res (3) / Veggie (1)', allergy: '🌱 1 Menú Vegano Estricto', checkedIn: true, checkInTime: '19:05' },
    { id: 'g_4', name: 'Arq. Sofía Benavides & Acompañante', passes: 2, table: 'Mesa 4 (Damas de Honor)', menu: 'Salmón Glaseado', allergy: '🌾 Celíaco (Sin Gluten)', checkedIn: false, checkInTime: null },
    { id: 'g_5', name: 'Mauricio Villarreal & Esposa', passes: 2, table: 'Mesa 5 (Familia Novio)', menu: 'Filete de Res', allergy: 'Ninguna', checkedIn: true, checkInTime: '19:12' },
    { id: 'g_6', name: 'Valeria Elizondo & Pareja', passes: 2, table: 'Mesa 6 (Amigos Universidad)', menu: 'Filete de Res (1) / Salmón (1)', allergy: '⚠️ Alergia a nueces y cacahuate', checkedIn: false, checkInTime: null },
    { id: 'g_7', name: 'Dr. Alejandro Treviño', passes: 2, table: 'Mesa 7 (Familia)', menu: 'Filete de Res', allergy: 'Ninguna', checkedIn: true, checkInTime: '19:18' },
    { id: 'g_8', name: 'Camila Cantú & Invitado', passes: 2, table: 'Mesa 8 (Amigos CDMX)', menu: 'Salmón Glaseado', allergy: '🥛 Intolerante a la lactosa', checkedIn: false, checkInTime: null },
    { id: 'g_9', name: 'Gerardo Santos & Sra.', passes: 2, table: 'Mesa 9 (Socios)', menu: 'Filete de Res', allergy: 'Ninguna', checkedIn: true, checkInTime: '19:22' },
    { id: 'g_10', name: 'Mariana Junco', passes: 1, table: 'Mesa 10 (Mesa Joven)', menu: 'Menú Vegetariano', allergy: '🌱 Vegetariano', checkedIn: true, checkInTime: '19:25' }
];

function getHostessGuests() {
    const wId = (typeof currentWeddingId !== 'undefined') ? currentWeddingId : null;
    if (!wId) return [];

    const key = `${HOSTESS_GUESTS_KEY}_${wId}`;
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            return JSON.parse(raw);
        }
        
        // Dynamically build from active wedding's confirmed guests
        const state = (typeof getWeddingState === 'function') ? getWeddingState(wId) : null;
        if (state && Array.isArray(state.guests) && state.guests.length > 0) {
            const tablesMap = {};
            (state.tables || []).forEach(t => { tablesMap[t.id] = t.name; });

            const confirmed = state.guests.filter(g => g.status === 'confirmed');
            if (confirmed.length > 0) {
                const builtList = confirmed.map((g, idx) => {
                    const tableName = tablesMap[g.tableId] || (g.tableId ? `Mesa ${g.tableId}` : 'Sin mesa asignada');
                    const m1 = g.guest1Menu || g.menu || 'Filete';
                    const a1 = g.guest1Allergies || g.allergies || 'Ninguna';
                    return {
                        id: g.id || `g_${idx + 1}`,
                        name: g.companion ? `${g.name} & ${g.companion}` : g.name,
                        passes: g.passes || 1,
                        table: tableName,
                        menu: m1,
                        allergy: a1 && a1.toLowerCase() !== 'ninguna' ? a1 : 'Ninguna',
                        checkedIn: false,
                        checkInTime: null
                    };
                });

                localStorage.setItem(key, JSON.stringify(builtList));
                return builtList;
            }
        }

        // Fallback for demo wedding 'aura' only
        if (wId === 'aura') {
            localStorage.setItem(key, JSON.stringify(INITIAL_DAYOF_GUESTS));
            return INITIAL_DAYOF_GUESTS;
        }

        return [];
    } catch (e) {
        return (wId === 'aura') ? INITIAL_DAYOF_GUESTS : [];
    }
}

function saveHostessGuests(guests) {
    const wId = (typeof currentWeddingId !== 'undefined') ? currentWeddingId : null;
    if (!wId) return;
    const key = `${HOSTESS_GUESTS_KEY}_${wId}`;
    localStorage.setItem(key, JSON.stringify(guests));
    renderHostessDashboard();
}

function setHostessFilter(mode) {
    currentHostessFilter = mode;
    
    // Update pills UI
    const pills = {
        'all': 'filterPillAll',
        'in_salon': 'filterPillInSalon',
        'pending': 'filterPillPending',
        'allergies': 'filterPillAllergies'
    };
    
    Object.keys(pills).forEach(key => {
        const el = document.getElementById(pills[key]);
        if (el) {
            if (key === mode) el.classList.add('active');
            else el.classList.remove('active');
        }
    });
    
    renderHostessDashboard();
}

function renderHostessDashboard() {
    const guests = getHostessGuests();
    const searchInput = document.getElementById('hostessSearchInput');
    const tableSelect = document.getElementById('hostessTableSelect');
    
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const selectedTable = (tableSelect ? tableSelect.value : '').toLowerCase().trim();

    const tbody = document.getElementById('hostessGuestsTableBody');
    if (!tbody) return;

    // Global Metrics Calculation
    const totalPases = guests.reduce((sum, g) => sum + g.passes, 0);
    const checkedInGuests = guests.filter(g => g.checkedIn);
    const checkedInPases = checkedInGuests.reduce((sum, g) => sum + g.passes, 0);
    const pendingGuests = guests.filter(g => !g.checkedIn);
    const pendingPases = totalPases - checkedInPases;
    const percentage = totalPases > 0 ? Math.round((checkedInPases / totalPases) * 100) : 0;
    
    const allergyGuests = guests.filter(g => g.allergy && g.allergy !== 'Ninguna');
    const allergiesInSalon = checkedInGuests.filter(g => g.allergy && g.allergy !== 'Ninguna').length;

    // Update KPI UI Elements
    const kpiInSalon = document.getElementById('hostessKpiInSalon');
    const kpiPercent = document.getElementById('hostessKpiPercent');
    const kpiInSalonSub = document.getElementById('hostessKpiInSalonSub');
    const progressBar = document.getElementById('hostessProgressBar');
    
    if (kpiInSalon) kpiInSalon.innerHTML = `${checkedInPases} / ${totalPases} <span class="hostess-kpi-percent">(${percentage}%)</span>`;
    if (kpiInSalonSub) kpiInSalonSub.innerText = `${checkedInPases} pases validados en puerta`;
    if (progressBar) progressBar.style.width = `${percentage}%`;

    const kpiPending = document.getElementById('hostessKpiPending');
    const kpiPendingFamilies = document.getElementById('hostessKpiPendingFamilies');
    if (kpiPending) kpiPending.innerText = `${pendingPases} Pases`;
    if (kpiPendingFamilies) kpiPendingFamilies.innerText = `${pendingGuests.length} familias por llegar`;

    const kpiAllergies = document.getElementById('hostessKpiAllergies');
    if (kpiAllergies) kpiAllergies.innerText = `${allergiesInSalon} en Salón (${allergyGuests.length} total)`;

    // Update Pill Counters
    const pillAll = document.getElementById('pillCountAll');
    const pillInSalon = document.getElementById('pillCountInSalon');
    const pillPending = document.getElementById('pillCountPending');
    const pillAllergies = document.getElementById('pillCountAllergies');

    if (pillAll) pillAll.innerText = guests.length;
    if (pillInSalon) pillInSalon.innerText = checkedInGuests.length;
    if (pillPending) pillPending.innerText = pendingGuests.length;
    if (pillAllergies) pillAllergies.innerText = allergyGuests.length;

    // Apply Filter Mode + Search + Table selection
    const filtered = guests.filter(g => {
        // Mode filter
        if (currentHostessFilter === 'in_salon' && !g.checkedIn) return false;
        if (currentHostessFilter === 'pending' && g.checkedIn) return false;
        if (currentHostessFilter === 'allergies' && (!g.allergy || g.allergy === 'Ninguna')) return false;

        // Table selector filter
        if (selectedTable && !g.table.toLowerCase().includes(selectedTable)) return false;

        // Search text query
        if (query) {
            const matchName = g.name.toLowerCase().includes(query);
            const matchTable = g.table.toLowerCase().includes(query);
            const matchAllergy = g.allergy.toLowerCase().includes(query);
            const matchMenu = g.menu.toLowerCase().includes(query);
            if (!matchName && !matchTable && !matchAllergy && !matchMenu) return false;
        }

        return true;
    });

    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:45px 20px; color:#64748b;">
                    <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
                    <strong style="color:#1e293b; font-size:1rem; display:block;">No se encontraron invitados</strong>
                    <span style="font-size:0.85rem;">Prueba cambiando el filtro rápido o término de búsqueda.</span>
                </td>
            </tr>`;
        return;
    }

    filtered.forEach(g => {
        const tr = document.createElement('tr');
        tr.className = g.checkedIn ? 'guest-checked-in' : '';

        const hasAllergy = g.allergy && g.allergy !== 'Ninguna';
        const allergyBadge = hasAllergy ? `<span class="badge-allergy-alert">${g.allergy}</span>` : `<span style="color:#94a3b8; font-size:0.78rem; font-weight:500;">✓ Sin restricciones</span>`;

        // Menu icon mapping
        let menuIcon = '🍽️';
        if (g.menu.toLowerCase().includes('res') || g.menu.toLowerCase().includes('filete')) menuIcon = '🥩';
        else if (g.menu.toLowerCase().includes('salmón') || g.menu.toLowerCase().includes('pescado')) menuIcon = '🐟';
        else if (g.menu.toLowerCase().includes('veggie') || g.menu.toLowerCase().includes('vegano') || g.menu.toLowerCase().includes('vegetariano')) menuIcon = '🥗';

        tr.innerHTML = `
            <td style="padding: 14px 16px;">
                <strong style="color:#0f172a; font-size:0.94rem; display:block; font-weight:700;">${g.name}</strong>
                <div style="display:flex; align-items:center; gap:6px; margin-top:3px;">
                    <span style="font-size:0.75rem; color:#64748b;">Pases asignados:</span>
                    <span style="background:#f1f5f9; color:#0f172a; font-weight:800; font-size:0.72rem; padding:1px 6px; border-radius:4px; border:1px solid #e2e8f0;">${g.passes} pax</span>
                </div>
            </td>
            <td style="padding: 14px 16px;">
                <span class="badge-table-assigned">📍 ${g.table}</span>
            </td>
            <td style="padding: 14px 16px;">
                <span style="font-size:0.84rem; font-weight:600; color:#334155; display:inline-flex; align-items:center; gap:5px;">
                    ${menuIcon} ${g.menu}
                </span>
            </td>
            <td style="padding: 14px 16px;">${allergyBadge}</td>
            <td style="padding: 14px 16px;">
                ${g.checkedIn ? 
                    `<span class="badge-status-in"><span class="status-pulse-dot" style="background:#10b981;"></span> En Salón (${g.checkInTime})</span>` : 
                    `<span class="badge-status-pending"><span style="width:7px; height:7px; border-radius:50%; background:#ea580c; display:inline-block;"></span> En Camino</span>`
                }
            </td>
            <td style="text-align: right; padding: 14px 16px;">
                <button class="btn-checkin-action ${g.checkedIn ? 'undo' : 'confirm'}" onclick="toggleHostessCheckIn('${g.id}')">
                    <span>${g.checkedIn ? '↩ Revertir' : '✨ Validar Entrada'}</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleHostessCheckIn(guestId) {
    const guests = getHostessGuests();
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;

    const now = new Date();
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const staffName = localStorage.getItem('hostess_staff_name') || 'Hostess Puerta Principal';

    if (guest.checkedIn) {
        guest.checkedIn = false;
        guest.checkInTime = null;
        recordHostessAudit(staffName, `↩ Reversión de acceso: ${guest.name}`, guest.table, timeFormatted);
        if (typeof showToast === 'function') showToast(`↩ Check-in revertido por ${staffName} para "${guest.name}".`);
    } else {
        guest.checkedIn = true;
        guest.checkInTime = timeFormatted;
        guest.checkedInBy = staffName;
        recordHostessAudit(staffName, `✓ Acceso validado: ${guest.name} (${guest.passes} pax)`, guest.table, timeFormatted);
        if (typeof showToast === 'function') showToast(`🎉 [${staffName}] ¡Check-In registrado! ${guest.name} ➔ ${guest.table}`);
    }

    saveHostessGuests(guests);
}

function recordHostessAudit(author, action, table, time) {
    try {
        let trail = JSON.parse(localStorage.getItem('hostess_audit_trail') || '[]');
        trail.unshift({ author, action, table, time, timestamp: new Date().toISOString() });
        if (trail.length > 60) trail = trail.slice(0, 60);
        localStorage.setItem('hostess_audit_trail', JSON.stringify(trail));
    } catch(e) {}
}

function openHostessAuditModal() {
    let trail = [];
    try { trail = JSON.parse(localStorage.getItem('hostess_audit_trail') || '[]'); } catch(e) {}

    const modal = document.getElementById('modalHostessAuditTrail');
    const container = document.getElementById('hostessAuditTrailList');
    if (!modal || !container) return;

    if (trail.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:30px; color:#64748b;">No hay registros de accesos todavía en esta recepción.</div>`;
    } else {
        container.innerHTML = trail.map(item => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border-bottom:1px solid #f1f5f9; font-size:0.83rem;">
                <div>
                    <strong style="color:#0f172a; display:block;">${item.action}</strong>
                    <span style="color:#64748b; font-size:0.75rem;">Operador: <strong>${item.author}</strong> · ${item.table}</span>
                </div>
                <span style="background:#f1f5f9; color:#334155; font-weight:700; font-size:0.75rem; padding:2px 8px; border-radius:12px;">${item.time} hrs</span>
            </div>
        `).join('');
    }

    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeHostessAuditModal() {
    const modal = document.getElementById('modalHostessAuditTrail');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function searchHostessGuests() {
    renderHostessDashboard();
}

function simulateQrCameraScan() {
    const guests = getHostessGuests();
    const pendingGuests = guests.filter(g => !g.checkedIn);
    
    if (pendingGuests.length === 0) {
        if (typeof showToast === 'function') showToast(`✨ ¡Todos los invitados ya ingresaron al evento!`);
        return;
    }

    const randomGuest = pendingGuests[0];
    toggleHostessCheckIn(randomGuest.id);

    const modal = document.getElementById('modalQrScanFeedback');
    if (modal) {
        document.getElementById('qrScanGuestName').innerText = randomGuest.name;
        document.getElementById('qrScanGuestTable').innerText = randomGuest.table;
        document.getElementById('qrScanGuestPasses').innerText = `${randomGuest.passes} Personas`;
        document.getElementById('qrScanGuestAllergy').innerText = randomGuest.allergy || 'Sin restricciones';
        
        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        modal.style.zIndex = '999999';

        setTimeout(() => {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }, 3200);
    }
}

// ==========================================================================
// REPORTES EJECUTIVOS PARA EL GRAN DÍA (CHEF BANQUETES & MINUTA RUN OF SHOW)
// ==========================================================================

function openChefReportModal() {
    if (isDemoModeActive) {
        // Gated for Signature Pro
        openSpeiUpgradeModal('intermediate');
        return;
    }
    const modal = document.getElementById('modalChefReport');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        modal.style.zIndex = '999999';
    }
}

function closeChefReportModal() {
    const modal = document.getElementById('modalChefReport');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function printChefReport() {
    window.print();
}

function openVendorsRunOfShowModal() {
    if (isDemoModeActive) {
        openSpeiUpgradeModal('intermediate');
        return;
    }
    const modal = document.getElementById('modalVendorsRunOfShow');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        modal.style.zIndex = '999999';
    }
}

function closeVendorsRunOfShowModal() {
    const modal = document.getElementById('modalVendorsRunOfShow');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function printVendorsRunOfShow() {
    window.print();
}

// ==========================================================================
// SPEI PAYMENT & COMPROBANTE SUBMISSION MODAL ($800 / $2,000 / $3,500)
// ==========================================================================

function openSpeiUpgradeModal(selectedTier = 'intermediate') {
    const modal = document.getElementById('modalSpeiUpgrade');
    if (!modal) return;

    selectUpgradePlan(selectedTier);

    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
    modal.style.zIndex = '999999';
}

function closeSpeiUpgradeModal() {
    const modal = document.getElementById('modalSpeiUpgrade');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function selectUpgradePlan(tier) {
    window.currentSelectedUpgradeTier = tier;
    const cards = document.querySelectorAll('.spei-plan-card');
    cards.forEach(c => c.classList.remove('active'));

    const targetCard = document.getElementById(`speiCard_${tier}`);
    if (targetCard) targetCard.classList.add('active');

    let amount = 1990;
    let planName = 'Signature Pro (1-10 Bodas · Invitaciones Web)';
    if (tier === 'elite') {
        amount = 3290;
        planName = 'Atelier Elite (1-15 Bodas · Marca Blanca Total)';
    }

    const amountEl = document.getElementById('speiSelectedAmount');
    const planNameEl = document.getElementById('speiSelectedPlanName');
    const conceptEl = document.getElementById('speiConceptText');

    if (amountEl) amountEl.innerText = `$${amount.toLocaleString('es-MX')} MXN/mes`;
    if (planNameEl) planNameEl.innerText = planName;
    if (conceptEl) conceptEl.innerText = `Plan ${tier.toUpperCase()} ${Date.now().toString().slice(-4)}`;
}

function submitUploadSpeiProof(e) {
    if (e) e.preventDefault();
    const agency = document.getElementById('speiProofAgencyName').value || 'Agencia Planner';
    const email = document.getElementById('speiProofEmail').value || 'contacto@agencia.com';
    const fileInput = document.getElementById('speiProofFileInput');

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert('Por favor selecciona la captura o PDF de tu transferencia SPEI.');
        return;
    }

    closeSpeiUpgradeModal();
    if (typeof showToast === 'function') {
        showToast(`✅ Comprobante SPEI enviado para validación por Antigravity Web Studio. Te notificaremos a ${email}.`);
    }
}

function sendSpeiProofByWhatsApp() {
    const amount = document.getElementById('speiSelectedAmount')?.innerText || '$2,000 MXN';
    const plan = document.getElementById('speiSelectedPlanName')?.innerText || 'Signature Pro';
    const msg = `¡Hola Luis! 🥂 Acabo de realizar mi transferencia SPEI de ${amount} para activar el *${plan}* en Wedding Planner OS. Adjunto mi comprobante en este chat para autorización.`;
    window.open(`https://wa.me/528189901122?text=${encodeURIComponent(msg)}`, '_blank');
}

// ==========================================================================
// INTERACTIVE DEMO SANDBOX ENGINE
// ==========================================================================

function enterInteractiveDemoMode() {
    isDemoModeActive = true;
    sessionStorage.setItem('antigravity_demo_mode', 'true');
    sessionStorage.setItem('antigravity_role', 'demo_planner');
    sessionStorage.setItem('antigravity_user', 'demo@antigravitystudio.mx');

    const loginOverlay = document.getElementById('loginGatekeeperOverlay');
    if (loginOverlay) loginOverlay.style.display = 'none';
    document.body.classList.remove('auth-locked');

    const demoBanner = document.getElementById('demoFloatingBanner');
    if (demoBanner) demoBanner.style.display = 'flex';

    if (typeof applyRoleVisibility === 'function') applyRoleVisibility();
    if (typeof setRole === 'function') setRole('planner');

    if (typeof showToast === 'function') {
        showToast(`🎭 Modo Demo Interactivo Activado · Explora la plataforma como Wedding Planner.`);
    }

    if (typeof showTab === 'function') showTab('hostess');
    renderHostessDashboard();
}

function exitDemoMode() {
    isDemoModeActive = false;
    sessionStorage.removeItem('antigravity_demo_mode');
    sessionStorage.removeItem('antigravity_role');
    sessionStorage.removeItem('antigravity_user');

    const demoBanner = document.getElementById('demoFloatingBanner');
    if (demoBanner) demoBanner.style.display = 'none';

    window.location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('antigravity_demo_mode') === 'true') {
        isDemoModeActive = true;
        const demoBanner = document.getElementById('demoFloatingBanner');
        if (demoBanner) demoBanner.style.display = 'flex';
    }
    setTimeout(renderHostessDashboard, 300);
});
