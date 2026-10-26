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
    if (typeof isDemoModeActive !== 'undefined' && isDemoModeActive) {
        openSpeiUpgradeModal('intermediate');
        return;
    }

    if (typeof getWeddingState === 'function') {
        currentData = getWeddingState(currentWeddingId);
    }
    if (!currentData) {
        if (typeof showToast === 'function') showToast('⚠️ Por favor selecciona o abre una boda primero.', 'warning');
        return;
    }

    const modal = document.getElementById('modalChefReport');
    if (!modal) return;

    // 1. Datos Generales de la Boda
    const coupleName = currentData.couple || 'Pareja Novios';
    const venueName = currentData.venue || 'Recinto del Evento';
    const weddingDate = currentData.date || 'Fecha por Definir';

    const guests = currentData.guests || [];
    const tables = currentData.tables || [];

    const confirmedGuests = guests.filter(g => g.status === 'confirmed');
    const totalConfirmedPax = confirmedGuests.reduce((sum, g) => sum + (g.passes || 1), 0);

    const subTitle = document.getElementById('chefModalSubTitle');
    if (subTitle) {
        subTitle.innerText = `${coupleName} · ${venueName} (${totalConfirmedPax} Comensales Confirmados)`;
    }

    // 2. Conteo de Platos Fuertes y Alertas Médicas
    let countFilet = 0;
    let countSalmon = 0;
    let countSpecial = 0;
    const criticalAllergies = [];

    confirmedGuests.forEach(g => {
        const passes = g.passes || 1;
        const tbl = tables.find(t => t.id === g.tableId);
        const tableName = tbl ? tbl.name : 'Sin Mesa Asignada';

        // Titular
        const m1 = (g.guest1Menu || g.menu || 'filete').toLowerCase();
        if (m1.includes('salmon') || m1.includes('salmón')) countSalmon++;
        else if (m1.includes('risotto') || m1.includes('veg') || m1.includes('esp')) countSpecial++;
        else countFilet++;

        const a1 = (g.guest1Allergies || g.allergies || '').trim();
        if (a1 && a1.toLowerCase() !== 'ninguna') {
            criticalAllergies.push({
                table: tableName,
                name: g.name,
                allergy: a1
            });
        }

        // Acompañante
        if (passes > 1) {
            const m2 = (g.companionMenu || (m1.includes('salmon') ? 'filete' : 'salmon')).toLowerCase();
            if (m2.includes('salmon') || m2.includes('salmón')) countSalmon++;
            else if (m2.includes('risotto') || m2.includes('veg') || m2.includes('esp')) countSpecial++;
            else countFilet++;

            const a2 = (g.companionAllergies || '').trim();
            if (a2 && a2.toLowerCase() !== 'ninguna') {
                criticalAllergies.push({
                    table: tableName,
                    name: g.companion || `Acompañante de ${g.name}`,
                    allergy: a2
                });
            }
        }
    });

    // Render KPIs
    const elFilet = document.getElementById('chefCountFilet');
    const elSalmon = document.getElementById('chefCountSalmon');
    const elSpecial = document.getElementById('chefCountSpecial');
    if (elFilet) elFilet.innerText = countFilet;
    if (elSalmon) elSalmon.innerText = countSalmon;
    if (elSpecial) elSpecial.innerText = countSpecial;

    // Render Alertas Médicas
    const allergiesListEl = document.getElementById('chefAllergiesList');
    if (allergiesListEl) {
        if (criticalAllergies.length === 0) {
            allergiesListEl.innerHTML = '<li style="color:#059669; font-weight:700;">✓ No se han registrado alergias médicas críticas. Menú regular 100% seguro.</li>';
        } else {
            allergiesListEl.innerHTML = criticalAllergies.map(item => `
                <li style="margin-bottom:6px;">
                    <strong style="color:#0f172a;">${item.table}:</strong> ${item.name} — <span style="background:#fee2e2; color:#991b1b; padding:1px 8px; border-radius:4px; font-weight:800; font-size:0.8rem;">⚠️ ${item.allergy}</span>
                </li>
            `).join('');
        }
    }

    // Render Distribución Mesa por Mesa
    const tablesBody = document.getElementById('chefTablesBody');
    if (tablesBody) {
        tablesBody.innerHTML = '';
        if (tables.length === 0) {
            tablesBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:16px; color:#64748b;">No hay mesas creadas aún.</td></tr>';
        } else {
            tables.forEach((t, idx) => {
                const seated = guests.filter(g => g.tableId === t.id && g.status === 'confirmed');
                let tPax = 0;
                let tFilet = 0;
                let tSalmon = 0;
                let tSpec = 0;
                const tNotes = [];

                seated.forEach(g => {
                    const p = g.passes || 1;
                    tPax += p;

                    const m1 = (g.guest1Menu || g.menu || 'filete').toLowerCase();
                    if (m1.includes('salmon') || m1.includes('salmón')) tSalmon++;
                    else if (m1.includes('risotto') || m1.includes('veg') || m1.includes('esp')) tSpec++;
                    else tFilet++;

                    const a1 = (g.guest1Allergies || g.allergies || '').trim();
                    if (a1 && a1.toLowerCase() !== 'ninguna') tNotes.push(`${g.name} (${a1})`);

                    if (p > 1) {
                        const m2 = (g.companionMenu || (m1.includes('salmon') ? 'filete' : 'salmon')).toLowerCase();
                        if (m2.includes('salmon') || m2.includes('salmón')) tSalmon++;
                        else if (m2.includes('risotto') || m2.includes('veg') || m2.includes('esp')) tSpec++;
                        else tFilet++;

                        const a2 = (g.companionAllergies || '').trim();
                        if (a2 && a2.toLowerCase() !== 'ninguna') tNotes.push(`${g.companion || 'Acomp'} (${a2})`);
                    }
                });

                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #e2e8f0';
                tr.innerHTML = `
                    <td style="padding:8px 10px;"><strong>${t.name || ('Mesa ' + (idx + 1))}</strong></td>
                    <td style="padding:8px 10px; text-align:center; font-weight:800; color:#0f172a;">${tPax}</td>
                    <td style="padding:8px 10px; text-align:center; font-weight:700; color:#b45309;">${tFilet}</td>
                    <td style="padding:8px 10px; text-align:center; font-weight:700; color:#0369a1;">${tSalmon}</td>
                    <td style="padding:8px 10px; font-size:0.78rem;">
                        ${tSpec > 0 ? `<strong style="color:#15803d;">${tSpec} especial(es)</strong> ` : ''}
                        ${tNotes.length > 0 ? `<div style="color:#b91c1c; font-weight:700; margin-top:2px;">⚠️ ${tNotes.join(', ')}</div>` : (tSpec === 0 ? '<span style="color:#94a3b8;">Estándar</span>' : '')}
                    </td>
                `;
                tablesBody.appendChild(tr);
            });
        }
    }

    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
    modal.style.zIndex = '999999';
}

function closeChefReportModal() {
    const modal = document.getElementById('modalChefReport');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
    }
}

/**
 * Abre una ventana limpia optimizada para impresión / guardar como PDF
 * con formato ejecutivo para cocina y capitán de banquetes
 */
function printChefExecutiveDossier() {
    if (typeof getWeddingState === 'function') {
        currentData = getWeddingState(currentWeddingId);
    }
    if (!currentData) return;

    const couple = currentData.couple || 'Boda Novios';
    const venue = currentData.venue || 'Recinto Oficial';
    const date = currentData.date || 'Fecha Oficial';
    const guests = currentData.guests || [];
    const tables = currentData.tables || [];
    const planner = currentData.planner || 'Wedding Planner & Coordinación';

    const confirmed = guests.filter(g => g.status === 'confirmed');
    const totalPax = confirmed.reduce((s, g) => s + (g.passes || 1), 0);

    let filet = 0, salmon = 0, special = 0;
    const allergies = [];

    confirmed.forEach(g => {
        const p = g.passes || 1;
        const tbl = tables.find(t => t.id === g.tableId);
        const tName = tbl ? tbl.name : 'Sin Asignar';

        const m1 = (g.guest1Menu || g.menu || 'filete').toLowerCase();
        if (m1.includes('salmon') || m1.includes('salmón')) salmon++;
        else if (m1.includes('risotto') || m1.includes('veg') || m1.includes('esp')) special++;
        else filet++;

        const a1 = (g.guest1Allergies || g.allergies || '').trim();
        if (a1 && a1.toLowerCase() !== 'ninguna') allergies.push({ table: tName, name: g.name, allergy: a1 });

        if (p > 1) {
            const m2 = (g.companionMenu || (m1.includes('salmon') ? 'filete' : 'salmon')).toLowerCase();
            if (m2.includes('salmon') || m2.includes('salmón')) salmon++;
            else if (m2.includes('risotto') || m2.includes('veg') || m2.includes('esp')) special++;
            else filet++;

            const a2 = (g.companionAllergies || '').trim();
            if (a2 && a2.toLowerCase() !== 'ninguna') allergies.push({ table: tName, name: g.companion || 'Acompañante', allergy: a2 });
        }
    });

    const printWin = window.open('', '_blank', 'width=900,height=800');
    if (!printWin) {
        alert('Por favor permite ventanas emergentes para generar la Ficha de Cocina en PDF.');
        return;
    }

    const tableRowsHtml = tables.map((t, idx) => {
        const seated = guests.filter(g => g.tableId === t.id && g.status === 'confirmed');
        let tPax = 0, tFil = 0, tSal = 0, tSp = 0;
        const notes = [];
        seated.forEach(g => {
            const p = g.passes || 1;
            tPax += p;
            const m1 = (g.guest1Menu || g.menu || 'filete').toLowerCase();
            if (m1.includes('salmon') || m1.includes('salmón')) tSal++;
            else if (m1.includes('risotto') || m1.includes('veg') || m1.includes('esp')) tSp++;
            else tFil++;
            const a1 = (g.guest1Allergies || g.allergies || '').trim();
            if (a1 && a1.toLowerCase() !== 'ninguna') notes.push(`${g.name}: ${a1}`);

            if (p > 1) {
                const m2 = (g.companionMenu || (m1.includes('salmon') ? 'filete' : 'salmon')).toLowerCase();
                if (m2.includes('salmon') || m2.includes('salmón')) tSal++;
                else if (m2.includes('risotto') || m2.includes('veg') || m2.includes('esp')) tSp++;
                else tFil++;
                const a2 = (g.companionAllergies || '').trim();
                if (a2 && a2.toLowerCase() !== 'ninguna') notes.push(`${g.companion || 'Acomp'}: ${a2}`);
            }
        });

        return `
            <tr style="border-bottom:1px solid #cbd5e1;">
                <td style="padding:6px 8px; font-weight:700;">${t.name || ('Mesa ' + (idx + 1))}</td>
                <td style="padding:6px 8px; text-align:center; font-weight:800;">${tPax}</td>
                <td style="padding:6px 8px; text-align:center;">${tFil}</td>
                <td style="padding:6px 8px; text-align:center;">${tSal}</td>
                <td style="padding:6px 8px;">
                    ${tSp > 0 ? `<strong>${tSp} esp.</strong> ` : ''}
                    ${notes.length > 0 ? `<span style="color:#b91c1c; font-weight:700;">⚠️ ${notes.join('; ')}</span>` : (tSp === 0 ? '—' : '')}
                </td>
            </tr>
        `;
    }).join('');

    const allergiesRowsHtml = allergies.length === 0
        ? '<div style="color:#15803d; font-weight:700; padding:8px;">✓ No hay restricciones alimentarias médicas reportadas. Menú regular seguro.</div>'
        : allergies.map(a => `
            <div style="margin-bottom:6px; font-size:0.85rem;">
                <strong>${a.table}</strong>: <span style="font-weight:600;">${a.name}</span> — 
                <span style="background:#fee2e2; color:#991b1b; padding:2px 8px; border-radius:4px; font-weight:800;">⚠️ ${a.allergy}</span>
            </div>
        `).join('');

    printWin.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Ficha Técnica de Cocina & Banquetes - ${couple}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 24px; color: #0f172a; margin: 0; }
                h1, h2, h3, h4 { margin: 0; font-family: Georgia, serif; }
                .header { border-bottom: 3px solid #065f46; padding-bottom: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-start; }
                .badge { background: #065f46; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.05em; display: inline-block; margin-bottom: 4px; }
                .kpi-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
                .kpi-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; text-align: center; }
                .kpi-box span { font-size: 0.7rem; color: #64748b; font-weight: 800; text-transform: uppercase; }
                .kpi-box h2 { font-size: 1.4rem; color: #0f172a; margin-top: 4px; }
                .allergy-box { background: #fff1f2; border: 2px solid #fecdd3; border-radius: 8px; padding: 12px; margin-bottom: 20px; }
                .table-dossier { width: 100%; border-collapse: collapse; font-size: 0.8rem; margin-bottom: 24px; }
                .table-dossier th { background: #0f172a; color: #ffffff; padding: 8px; text-align: left; }
                .table-dossier td { padding: 6px 8px; border: 1px solid #cbd5e1; }
                .sign-box { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 36px; padding-top: 20px; border-top: 1px solid #cbd5e1; }
                .sign-line { border-top: 1px solid #0f172a; margin-top: 40px; text-align: center; font-size: 0.8rem; font-weight: 700; padding-top: 4px; }
                @media print {
                    body { padding: 0; font-size: 12pt; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; background:#e0f2fe; padding:10px 16px; border-radius:8px;">
                <span style="font-size:0.85rem; font-weight:700; color:#0369a1;">📄 Vista previa de impresión oficial para Banquetes y Chef Ejecutivo.</span>
                <button onclick="window.print()" style="background:#059669; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:800; cursor:pointer;">🖨️ Mandar a Imprimir / Guardar en PDF</button>
            </div>

            <div class="header">
                <div>
                    <span class="badge">ORDEN DE PRODUCCIÓN DE COCINA & BANQUETES</span>
                    <h1 style="font-size: 1.6rem; color: #065f46;">${couple}</h1>
                    <p style="margin: 4px 0 0; color: #475569; font-size: 0.85rem;"><strong>Coordinación:</strong> ${planner}</p>
                </div>
                <div style="text-align: right; font-size: 0.82rem; color: #334155; line-height: 1.4;">
                    <div><strong>Fecha del Evento:</strong> ${date}</div>
                    <div><strong>Locación / Venue:</strong> ${venue}</div>
                    <div><strong>Comensales Totales:</strong> <strong style="font-size:1.1rem; color:#065f46;">${totalPax} Pax</strong></div>
                    <div><strong>Emisión:</strong> ${new Date().toLocaleDateString('es-MX')} hrs</div>
                </div>
            </div>

            <!-- PRODUCCION TOTAL COCINA -->
            <h3 style="font-size: 0.95rem; margin-bottom: 8px; color: #0f172a;">1. MATRIZ TOTAL DE PRODUCCIÓN DE PLATOS</h3>
            <div class="kpi-strip">
                <div class="kpi-box">
                    <span>🥩 Filete de Res / Carne</span>
                    <h2>${filet}</h2>
                </div>
                <div class="kpi-box">
                    <span>🐟 Salmón / Pescado</span>
                    <h2>${salmon}</h2>
                </div>
                <div class="kpi-box" style="background:#fef3c7;">
                    <span style="color:#92400e;">🍄 Risotto / Veg / Especial</span>
                    <h2 style="color:#b45309;">${special}</h2>
                </div>
                <div class="kpi-box" style="background:#d1fae5;">
                    <span style="color:#065f46;">TOTAL PLATOS</span>
                    <h2 style="color:#047857;">${filet + salmon + special}</h2>
                </div>
            </div>

            <!-- ALERGIAS ROJAS -->
            <div class="allergy-box">
                <div style="font-size: 0.9rem; font-weight: 800; color: #991b1b; margin-bottom: 8px;">
                    ⚠️ 2. PROTOCOLO DE ALERGIAS Y RESTRICCIONES MÉDICAS (EVITAR CONTAMINACIÓN CRUZADA)
                </div>
                ${allergiesRowsHtml}
            </div>

            <!-- DESGLOSE MESA POR MESA -->
            <h3 style="font-size: 0.95rem; margin-bottom: 8px; color: #0f172a;">3. MATRIZ DE SERVICIO Y COMANDAS MESA POR MESA</h3>
            <table class="table-dossier">
                <thead>
                    <tr>
                        <th style="width: 25%;">Mesa</th>
                        <th style="text-align:center; width: 12%;">Pax</th>
                        <th style="text-align:center; width: 12%;">Filete</th>
                        <th style="text-align:center; width: 12%;">Salmón</th>
                        <th>Especiales / Restricciones en Mesa</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRowsHtml}
                </tbody>
            </table>

            <!-- FIRMAS -->
            <div class="sign-box">
                <div>
                    <div class="sign-line">
                        Firma Wedding Planner<br>
                        <small style="color:#64748b; font-weight:normal;">Entrega de comanda y especificaciones</small>
                    </div>
                </div>
                <div>
                    <div class="sign-line">
                        Firma Chef Ejecutivo / Capitán de Servicio<br>
                        <small style="color:#64748b; font-weight:normal;">Recepción conforme de requerimientos y alergias</small>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);

    printWin.document.close();
    printWin.focus();
}

/**
 * Copia el resumen ejecutivo al portapapeles listo para enviar por WhatsApp al Chef
 */
function copyChefReportToWhatsApp() {
    if (typeof getWeddingState === 'function') {
        currentData = getWeddingState(currentWeddingId);
    }
    if (!currentData) return;

    const couple = currentData.couple || 'Boda Novios';
    const venue = currentData.venue || 'Recinto';
    const date = currentData.date || 'Fecha Oficial';
    const guests = currentData.guests || [];
    const tables = currentData.tables || [];

    const confirmed = guests.filter(g => g.status === 'confirmed');
    const totalPax = confirmed.reduce((s, g) => s + (g.passes || 1), 0);

    let filet = 0, salmon = 0, special = 0;
    const allergies = [];

    confirmed.forEach(g => {
        const p = g.passes || 1;
        const tbl = tables.find(t => t.id === g.tableId);
        const tName = tbl ? tbl.name : 'Sin Asignar';

        const m1 = (g.guest1Menu || g.menu || 'filete').toLowerCase();
        if (m1.includes('salmon') || m1.includes('salmón')) salmon++;
        else if (m1.includes('risotto') || m1.includes('veg') || m1.includes('esp')) special++;
        else filet++;

        const a1 = (g.guest1Allergies || g.allergies || '').trim();
        if (a1 && a1.toLowerCase() !== 'ninguna') allergies.push(`${tName}: ${g.name} (${a1})`);

        if (p > 1) {
            const m2 = (g.companionMenu || (m1.includes('salmon') ? 'filete' : 'salmon')).toLowerCase();
            if (m2.includes('salmon') || m2.includes('salmón')) salmon++;
            else if (m2.includes('risotto') || m2.includes('veg') || m2.includes('esp')) special++;
            else filet++;

            const a2 = (g.companionAllergies || '').trim();
            if (a2 && a2.toLowerCase() !== 'ninguna') allergies.push(`${tName}: ${g.companion || 'Acomp'} (${a2})`);
        }
    });

    let waText = `👨‍🍳 *ORDEN DE PRODUCCIÓN DE BANQUETE & COCINA* 🍽️\n\n`;
    waText += `💍 *Boda:* ${couple}\n`;
    waText += `📅 *Fecha:* ${date}\n`;
    waText += `🏰 *Lugar:* ${venue}\n`;
    waText += `👥 *Total Comensales:* ${totalPax} Pax confirmados\n\n`;
    waText += `🥩 *Filete de Res:* ${filet} platos\n`;
    waText += `🐟 *Salmón:* ${salmon} platos\n`;
    waText += `🌱 *Especiales / Veg:* ${special} platos\n`;
    waText += `📊 *Total Platos Fuertes:* ${filet + salmon + special}\n\n`;

    if (allergies.length > 0) {
        waText += `⚠️ *ALERTAS MÉDICAS CRÍTICAS (Evitar contaminación cruzada):*\n`;
        allergies.forEach(a => {
            waText += `• ${a}\n`;
        });
    } else {
        waText += `✓ *Alergias:* No se reportaron alergias médicas.\n`;
    }

    waText += `\n_Generado automáticamente desde Antigravity Wedding OS._`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(waText).then(() => {
            if (typeof showToast === 'function') {
                showToast('✅ ¡Resumen de Cocina copiado al portapapeles para WhatsApp!', 'success');
            }
        }).catch(() => {
            alert('Resumen de cocina:\n\n' + waText);
        });
    } else {
        alert(waText);
    }
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
