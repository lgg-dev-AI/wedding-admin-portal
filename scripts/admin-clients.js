// ==========================================================================
// DEVELOPER CONSOLE & CLIENT PROVISIONING ENGINE (ANTIGRAVITY WEB STUDIO)
// WITH 3-STAGE RECURRING BILLING: 3 WEEKS, 72H, 24H & ACCESS LOCKOUT
// ==========================================================================

const CLIENTS_STORAGE_KEY = 'antigravity_clients_db';
let currentClientFilter = 'all'; // 'all', 'paid', 'reminders', 'suspended'
let clientSearchQuery = '';
let activeClientIdForAction = null;

const INITIAL_CLIENTS_DATA = [
    {
        id: 'client_aura',
        agencyName: 'Aura Weddings & Design',
        plannerName: 'Mariana Garza',
        email: 'mariana.garza@auraweddings.com',
        phone: '+52 81 8990 1122',
        planTier: 'intermediate', // Signature Pro (1-10 bodas)
        maxWeddings: 10,
        monthlyFee: 1500,
        billingCycleDay: 15,
        lastPaymentDate: '2026-09-15',
        nextDueDate: '2026-10-15',
        paymentStatus: 'reminder_3w', // 3 weeks reached (due in ~7 days)
        isSuspended: false,
        suspensionNotice: '',
        tempPassword: 'AURA-7821',
        tempPassUsesLeft: 3,
        hasPermanentPassword: false,
        permanentPassword: '',
        createdAt: '2026-09-15',
        status: 'pending_setup'
    },
    {
        id: 'client_atelier',
        agencyName: 'Atelier Event Architecture',
        plannerName: 'Valeria Sotomayor',
        email: 'valeria.eventos@atelier.mx',
        phone: '+52 55 4433 2211',
        planTier: 'elite', // Atelier Elite (hasta 15 bodas)
        maxWeddings: 15,
        monthlyFee: 2800,
        billingCycleDay: 10,
        lastPaymentDate: '2026-09-10',
        nextDueDate: '2026-10-10',
        paymentStatus: 'due_72h', // Due in 72 hours (3 days)
        isSuspended: false,
        suspensionNotice: '',
        tempPassword: 'ELITE-9904',
        tempPassUsesLeft: 1,
        hasPermanentPassword: false,
        permanentPassword: '',
        createdAt: '2026-09-10',
        status: 'pending_setup'
    },
    {
        id: 'client_boutique',
        agencyName: 'Boutique Weddings México',
        plannerName: 'Camila Rivas',
        email: 'contacto@boutiqueweddings.lat',
        phone: '+52 33 1122 3344',
        planTier: 'basic', // Essential (1-3 bodas)
        maxWeddings: 3,
        monthlyFee: 800,
        billingCycleDay: 8,
        lastPaymentDate: '2026-09-08',
        nextDueDate: '2026-10-08',
        paymentStatus: 'due_24h', // Due in 24 hours
        isSuspended: false,
        suspensionNotice: 'Mañana a las 18:00 hrs',
        tempPassword: 'BOUT-3310',
        tempPassUsesLeft: 0,
        hasPermanentPassword: true,
        permanentPassword: 'Password2026*',
        createdAt: '2026-09-01',
        status: 'active'
    },
    {
        id: 'client_mariana_atelier',
        agencyName: 'Atelier Nupcial México',
        plannerName: 'Mariana Elizondo',
        email: 'mariana@atelier-nupcial.mx',
        phone: '+52 81 1928 3400',
        planTier: 'intermediate', // Signature Pro (1-10 bodas)
        maxWeddings: 10,
        monthlyFee: 1500,
        billingCycleDay: 20,
        lastPaymentDate: '2026-10-20',
        nextDueDate: '2026-11-20',
        paymentStatus: 'paid',
        isSuspended: false,
        suspensionNotice: '',
        tempPassword: 'ATELIER-2027',
        tempPassUsesLeft: 3,
        hasPermanentPassword: true,
        permanentPassword: 'Mariana2027*',
        createdAt: '2026-10-20',
        status: 'active'
    }
];

function getClientsDatabase() {
    try {
        const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(INITIAL_CLIENTS_DATA));
            return INITIAL_CLIENTS_DATA;
        }
        return JSON.parse(raw);
    } catch (e) {
        console.error('Error reading clients database', e);
        return INITIAL_CLIENTS_DATA;
    }
}

function saveClientsDatabase(clients) {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    renderClientsDashboard();
    if (typeof renderDevAnalyticsDashboard === 'function') renderDevAnalyticsDashboard();
}

/**
 * CALCULATES CALENDAR DAYS REMAINING UNTIL NEXT DUE DATE
 * returns > 0 if in the future, 0 if due today, -1 if in grace period day (+24h), < -1 if grace period expired.
 */
function getDaysUntilDueDate(dueDateStr) {
    if (!dueDateStr) return 999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = dueDateStr.split('-');
    if (parts.length !== 3) return 999;
    const dueDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * AUTOMATIC GRACE PERIOD & LOCKOUT ENGINE
 * Example:
 * If nextDueDate is 30th October:
 * - Oct 30 (daysLeft = 0): Due Date (due_24h)
 * - Oct 31 (daysLeft = -1): Grace Period (+24h grace window, status: grace_period)
 * - Nov 01 (daysLeft = -2): Grace EXPIRED -> AUTOMATIC LOCKOUT (isSuspended = true, status: overdue)
 */
function evaluateAndApplyClientGracePeriods() {
    try {
        const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
        if (!raw) return;
        const clients = JSON.parse(raw);
        let hasChanges = false;

        clients.forEach(c => {
            if (!c.nextDueDate) return;
            const daysLeft = getDaysUntilDueDate(c.nextDueDate);

            if (c.isSuspended) {
                // Keep suspended until manual authorized payment
                return;
            }

            if (c.paymentStatus === 'paid') {
                // If payment was already authorized for this cycle and daysLeft > 7, keep paid
                if (daysLeft > 7) return;
            }

            if (daysLeft < -1) {
                // Grace period (+24h) is strictly OVER -> AUTO-LOCK TRIGGERED
                c.isSuspended = true;
                c.paymentStatus = 'overdue';
                c.suspensionNotice = `Bloqueado automáticamente el ${new Date().toLocaleDateString('es-MX')} (Periodo de gracia de 24h vencido tras corte del ${c.nextDueDate})`;
                hasChanges = true;
            } else if (daysLeft === -1) {
                // Grace Period Day (+24h grace active)
                if (c.paymentStatus !== 'grace_period') {
                    c.paymentStatus = 'grace_period';
                    c.suspensionNotice = `Periodo de gracia de 24h activo. Bloqueo automático programado al vencer hoy.`;
                    hasChanges = true;
                }
            } else if (daysLeft === 0 || daysLeft === 1) {
                if (c.paymentStatus !== 'due_24h' && c.paymentStatus !== 'paid') {
                    c.paymentStatus = 'due_24h';
                    hasChanges = true;
                }
            } else if (daysLeft <= 3 && daysLeft > 1) {
                if (c.paymentStatus !== 'due_72h' && c.paymentStatus !== 'paid') {
                    c.paymentStatus = 'due_72h';
                    hasChanges = true;
                }
            } else if (daysLeft <= 7 && daysLeft > 3) {
                if (c.paymentStatus !== 'reminder_3w' && c.paymentStatus !== 'paid') {
                    c.paymentStatus = 'reminder_3w';
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
        }
    } catch (e) {
        console.error('Error in evaluateAndApplyClientGracePeriods', e);
    }
}

function generateRandomTempPass(prefix = 'WP') {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix.toUpperCase()}-${randomNum}`;
}

function filterClientsByTab(filterType, btnEl) {
    currentClientFilter = filterType;
    document.querySelectorAll('.dev-filter-pill').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    renderClientsDashboard();
}

function searchClients(query) {
    clientSearchQuery = (query || '').toLowerCase().trim();
    renderClientsDashboard();
}

function getInitials(name) {
    if (!name) return 'WP';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function checkSupabaseCapacityThreshold(allClients) {
    const totalActiveWeddings = allClients.reduce((acc, c) => acc + (c.isSuspended ? 0 : (c.maxWeddings || 3)), 0);
    const bannerContainer = document.getElementById('devCapacityBanner');
    if (!bannerContainer) return;

    if (totalActiveWeddings >= 30) {
        bannerContainer.style.display = 'block';
        const pct = Math.min(100, Math.round((totalActiveWeddings / 40) * 100));
        bannerContainer.innerHTML = `
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%); border: 2px solid #ef4444; border-radius: 14px; padding: 18px 22px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.12);">
                <div style="flex: 1; min-width: 280px;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                        <span style="font-size:1.3rem;">🚨</span>
                        <strong style="color: #991b1b; font-size: 1.05rem;">ALERTA DE CAPACIDAD SUPABASE: ${totalActiveWeddings} de 40 Bodas Activas (${pct}%)</strong>
                        <span style="background:#ef4444; color:#fff; font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:12px;">Meta de Escala 75%+</span>
                    </div>
                    <p style="margin: 0; color: #7f1d1d; font-size: 0.86rem; line-height: 1.45;">
                        Has superado el umbral seguro de <strong>30 bodas simultáneas</strong> en el Free Tier de Supabase. Para garantizar cero desconexiones en salones de eventos y WebSockets sin límite, prepara la activación del <strong>Plan Pro de Supabase ($25 USD / mes)</strong> antes de llegar a la boda #40.
                    </p>
                </div>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <a href="mailto:antigravitywebstudio@hotmail.com?subject=Alerta%20de%20Capacidad%20Supabase%20-%20Meta%20Alcanzada%20(${totalActiveWeddings}%20Bodas)&body=Hola%20Luis,%0A%0AWedding%20Planner%20OS%20ha%20alcanzado%20la%20meta%20de%20escala%20con%20${totalActiveWeddings}%20bodas%20activas%20en%20paralelo.%0A%0ARecomendaci%C3%B3n:%20Es%20momento%20de%20activar%20el%20Plan%20Pro%20de%20Supabase%20($25%20USD)%20en%20dashboard.supabase.com%20para%20mantener%20el%20100%%20de%20disponibilidad%20en%20eventos.%0A%0AFecha%20de%20Notificaci%C3%B3n:%20${new Date().toLocaleDateString('es-MX')}" class="btn-action primary" style="background: #ef4444; border-color: #ef4444; font-size: 0.82rem; text-decoration: none; display:inline-flex; align-items:center; gap:6px;">
                        <span>✉️ Enviar Aviso a mi Correo</span>
                    </a>
                    <a href="https://supabase.com/pricing" target="_blank" class="btn-action secondary" style="font-size: 0.82rem; text-decoration: none; border: 1px solid #cbd5e1; background: #ffffff;">
                        <span>Ver Supabase Pro ($25)</span>
                    </a>
                </div>
            </div>
        `;
    } else {
        bannerContainer.style.display = 'none';
    }
}

function renderClientsDashboard() {
    evaluateAndApplyClientGracePeriods();
    const allClients = getClientsDatabase();
    checkSupabaseCapacityThreshold(allClients);
    renderDevPaymentsTable();

    const tbody = document.getElementById('devClientsTableBody');
    if (!tbody) return;

    // Calculate Summary Stats
    const totalClients = allClients.length;
    const pendingPayment = allClients.filter(c => c.paymentStatus === 'reminder_3w' || c.paymentStatus === 'due_72h' || c.paymentStatus === 'due_24h' || c.paymentStatus === 'grace_period' || c.paymentStatus === 'overdue').length;
    const suspendedCount = allClients.filter(c => c.isSuspended).length;
    const totalMonthlyRevenue = allClients.filter(c => !c.isSuspended).reduce((sum, c) => sum + (c.monthlyFee || 0), 0);

    const statTotalEl = document.getElementById('devStatTotalClients');
    const statPendingEl = document.getElementById('devStatPendingSetup');
    const statActiveEl = document.getElementById('devStatActiveClients');
    const statWeddingsEl = document.getElementById('devStatTotalWeddings');

    if (statTotalEl) statTotalEl.innerText = totalClients;
    if (statPendingEl) statPendingEl.innerText = pendingPayment;
    if (statActiveEl) statActiveEl.innerText = suspendedCount;
    if (statWeddingsEl) statWeddingsEl.innerText = `$${totalMonthlyRevenue.toLocaleString('es-MX')} MXN`;

    // Filter list
    let filtered = allClients;
    if (currentClientFilter === 'paid') {
        filtered = filtered.filter(c => c.paymentStatus === 'paid' && !c.isSuspended);
    } else if (currentClientFilter === 'reminders') {
        filtered = filtered.filter(c => c.paymentStatus === 'reminder_3w' || c.paymentStatus === 'due_72h' || c.paymentStatus === 'due_24h' || c.paymentStatus === 'grace_period');
    } else if (currentClientFilter === 'suspended') {
        filtered = filtered.filter(c => c.isSuspended);
    }

    if (clientSearchQuery) {
        filtered = filtered.filter(c => 
            c.agencyName.toLowerCase().includes(clientSearchQuery) ||
            c.plannerName.toLowerCase().includes(clientSearchQuery) ||
            c.email.toLowerCase().includes(clientSearchQuery) ||
            (c.phone && c.phone.includes(clientSearchQuery))
        );
    }

    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:40px 20px; color:#64748b;">
                    <div style="font-size:2rem; margin-bottom:8px;">🔍</div>
                    <strong style="color:#0f172a; font-size:1rem; display:block;">No se encontraron planners en este filtro</strong>
                    <p style="font-size:0.85rem; color:#94a3b8; margin-top:4px;">Prueba seleccionando otro filtro o da de alta un nuevo cliente.</p>
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(c => {
        const tr = document.createElement('tr');
        tr.className = `dev-client-row ${c.isSuspended ? 'row-suspended' : ''}`;
        
        let planBadge = '<span class="badge-plan-tier basic">🥉 Essential · 1-3</span>';
        if (c.planTier === 'intermediate') planBadge = '<span class="badge-plan-tier intermediate">🥈 Signature · 1-10</span>';
        if (c.planTier === 'elite') planBadge = '<span class="badge-plan-tier elite">🥇 Atelier · 1-15</span>';

        // Payment status badge with 3-stage cadence & Grace Period
        let billingBadge = '';
        if (c.isSuspended) {
            billingBadge = `<span class="badge-billing-status suspended" title="${c.suspensionNotice || 'Bloqueado por falta de pago'}"><i class="status-dot red"></i> 🔒 Bloqueo Automático (${c.nextDueDate})</span>`;
        } else if (c.paymentStatus === 'paid') {
            billingBadge = `<span class="badge-billing-status paid"><i class="status-dot green"></i> Al Corriente (${c.nextDueDate})</span>`;
        } else if (c.paymentStatus === 'grace_period') {
            billingBadge = `<span class="badge-billing-status grace-period" title="Día de gracia (+24h): Bloqueo automático mañana a las 00:00"><i class="status-dot purple" style="background:#a855f7; box-shadow:0 0 6px #a855f7;"></i> ⏳ Tiempo de Gracia (+24h)</span>`;
        } else if (c.paymentStatus === 'reminder_3w') {
            billingBadge = `<span class="badge-billing-status reminder"><i class="status-dot amber"></i> 🔔 Rec. 3 Semanas (${c.nextDueDate})</span>`;
        } else if (c.paymentStatus === 'due_72h') {
            billingBadge = `<span class="badge-billing-status due-72h"><i class="status-dot indigo"></i> ⏰ Vence en 72h (${c.nextDueDate})</span>`;
        } else if (c.paymentStatus === 'due_24h') {
            billingBadge = `<span class="badge-billing-status due-soon"><i class="status-dot orange"></i> ⚠️ Vence en 24h (${c.nextDueDate})</span>`;
        } else {
            billingBadge = `<span class="badge-billing-status overdue"><i class="status-dot red"></i> 🔴 Vencido (${c.nextDueDate})</span>`;
        }

        const initials = getInitials(c.agencyName);
        const lockBtnLabel = c.isSuspended ? '🔓 Desbloquear' : '🔒 Bloquear';
        const lockBtnClass = c.isSuspended ? 'success' : 'danger';

        tr.innerHTML = `
            <td>
                <div class="d-flex align-center gap-3">
                    <div class="dev-agency-avatar ${c.isSuspended ? 'avatar-suspended' : ''}" title="${c.agencyName}">${initials}</div>
                    <div>
                        <strong class="dev-agency-title">${c.agencyName}</strong>
                        <div class="dev-planner-subtitle">👤 ${c.plannerName}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="dev-contact-cell">
                    <span class="dev-email-text">${c.email}</span>
                    <a href="https://wa.me/${(c.phone || '').replace(/[^0-9]/g, '')}" target="_blank" class="dev-phone-link">
                        <span class="wa-icon-dot">🟢</span> ${c.phone || 'Sin WhatsApp'}
                    </a>
                </div>
            </td>
            <td>
                <div style="display:flex; flex-direction:column; gap:2px;">
                    ${planBadge}
                    <strong style="color:#0f172a; font-size:0.8rem; margin-top:2px;">$${(c.monthlyFee || 0).toLocaleString('es-MX')} MXN/mes</strong>
                </div>
            </td>
            <td>${billingBadge}</td>
            <td>
                <div class="temp-pass-chip" onclick="copyTextToClipboard('${c.tempPassword}', 'Clave copiada')" title="${c.hasPermanentPassword ? 'Contraseña definitiva activa' : 'Clave temporal'}">
                    <code>${c.hasPermanentPassword ? '••••••••' : (c.tempPassword || 'N/A')}</code>
                    <span class="text-xs" style="color:#94a3b8; margin-left:4px;">${c.hasPermanentPassword ? '(Definitiva)' : `(${c.tempPassUsesLeft}/3)`}</span>
                </div>
            </td>
            <td>
                <div class="dev-actions-btn-group">
                    <button class="btn-dev-action-mini authorize" onclick="openAuthorizePaymentModal('${c.id}')" title="Autorizar pago de mensualidad y renovar 30 días">
                        <span>✅ Autorizar</span>
                    </button>
                    <button class="btn-dev-action-mini" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a;" onclick="sendLoyaltyUpgradeOffer('${c.id}')" title="Enviar Oferta de Lealtad (3 Meses): 15% Signature Pro / 20% Atelier Elite">
                        <span>🎁 Lealtad</span>
                    </button>
                    <button class="btn-dev-action-mini reminder" onclick="sendWeek3Reminder('${c.id}')" title="1ra Alerta: Recordatorio a las 3 semanas (7 días antes)">
                        <span>📧 3 Sem</span>
                    </button>
                    <button class="btn-dev-action-mini warning-72h" onclick="send72hPreLockWarning('${c.id}')" title="2da Alerta: Preventiva 72 horas antes (3 días antes)">
                        <span>⏰ 72h</span>
                    </button>
                    <button class="btn-dev-action-mini warning" onclick="openSuspensionWarningModal('${c.id}')" title="3ra Alerta: Crítica 24 horas antes con hora programada de bloqueo">
                        <span>⚠️ 24h</span>
                    </button>
                    <button class="btn-dev-action-mini ${lockBtnClass}" onclick="toggleClientSuspension('${c.id}')" title="${c.isSuspended ? 'Reactivar acceso' : 'Bloquear acceso por falta de pago'}">
                        <span>${lockBtnLabel}</span>
                    </button>
                    <button class="btn-dev-action-mini neutral" onclick="copyClientWelcomeMessage('${c.id}')" title="Copiar credenciales">
                        <span>📋</span>
                    </button>
                    <button class="btn-dev-action-mini danger" onclick="deleteClientPlanner('${c.id}')" title="Eliminar cliente">
                        <span>🗑️</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function copyTextToClipboard(text, successMsg = 'Copiado al portapapeles') {
    navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') showToast(`📋 ${successMsg}`);
    }).catch(() => {
        prompt('Copia manualmente:', text);
    });
}

// ==========================================================================
// BILLING & SUSPENSION ACTIONS (3-STAGE DUNNING CADENCE)
// ==========================================================================

function openAuthorizePaymentModal(clientId) {
    const clients = getClientsDatabase();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    activeClientIdForAction = clientId;
    const modal = document.getElementById('modalAuthClientPayment');
    if (modal) {
        document.getElementById('authPayAgencyName').innerText = client.agencyName;
        document.getElementById('authPayAmount').value = client.monthlyFee || 2490;
        document.getElementById('authPayDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('authPayMethod').value = 'spei';
        document.getElementById('authPayRef').value = `RENOV-${Date.now().toString().slice(-6)}`;
        
        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        modal.style.zIndex = '999999';
    }
}

function closeAuthorizePaymentModal() {
    const modal = document.getElementById('modalAuthClientPayment');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
    }
    activeClientIdForAction = null;
}

function submitAuthorizePayment(e) {
    if (e) e.preventDefault();
    if (!activeClientIdForAction) return;

    const clients = getClientsDatabase();
    const client = clients.find(c => c.id === activeClientIdForAction);
    if (!client) return;

    const amount = parseFloat(document.getElementById('authPayAmount').value) || client.monthlyFee;
    const method = document.getElementById('authPayMethod').value;
    const ref = document.getElementById('authPayRef').value || 'AUTORIZADO-MANUAL';

    // Calculate next due date (+30 days)
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    const nextDueDateStr = nextDate.toISOString().split('T')[0];

    client.lastPaymentDate = new Date().toISOString().split('T')[0];
    client.nextDueDate = nextDueDateStr;
    client.paymentStatus = 'paid';
    client.isSuspended = false; // Lift suspension if suspended
    client.suspensionNotice = '';

    saveClientsDatabase(clients);
    closeAuthorizePaymentModal();

    if (typeof showToast === 'function') {
        showToast(`✅ Pago de $${amount.toLocaleString('es-MX')} MXN autorizado para "${client.agencyName}". Acceso renovado hasta ${nextDueDateStr}.`);
    }
}

function toggleClientSuspension(clientId) {
    const clients = getClientsDatabase();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    if (client.isSuspended) {
        // Unsuspend
        client.isSuspended = false;
        client.suspensionNotice = '';
        saveClientsDatabase(clients);
        if (typeof showToast === 'function') {
            showToast(`🔓 Acceso reactivado con éxito para ${client.agencyName}.`);
        }
    } else {
        // Suspend
        const confirmMsg = `¿Deseas BLOQUEAR el acceso inmediatamente a "${client.agencyName}" (${client.email}) por falta de pago?\n\nAl bloquearse, no podrán ingresar a la plataforma hasta que autorices su mensualidad.`;
        if (confirm(confirmMsg)) {
            client.isSuspended = true;
            client.paymentStatus = 'overdue';
            client.suspensionNotice = `Suspendido el ${new Date().toLocaleDateString('es-MX')}`;
            saveClientsDatabase(clients);
            if (typeof showToast === 'function') {
                showToast(`🔒 Acceso BLOQUEADO para ${client.agencyName}.`);
            }
        }
    }
}

// STAGE 1: 3-WEEK REMINDER (7 DAYS BEFORE) - VIA OFFICIAL EMAIL
function sendWeek3Reminder(clientId) {
    const clients = getClientsDatabase();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const emailSubject = `[Antigravity Web Studio] Recordatorio de Facturación Mensual - ${client.agencyName}`;
    const emailBody = `Estimada ${client.plannerName} (${client.agencyName}),

Esperamos que tus eventos y proyectos de boda se encuentren marchando de manera excelente.

Por medio del presente correo institucional, le hacemos un cordial recordatorio de que la mensualidad correspondiente a su plataforma Wedding Planner OS está programada para su renovación el próximo ${client.nextDueDate}.

==================================================
RESUMEN DE FACTURACIÓN
==================================================
• Cliente / Agencia: ${client.agencyName}
• Plan Contratado: ${client.planTier.toUpperCase()} (Capacidad: hasta ${client.maxWeddings} bodas activas)
• Importe Mensual: $${(client.monthlyFee || 0).toLocaleString('es-MX')} MXN
• Fecha Límite de Pago: ${client.nextDueDate}

==================================================
DATOS BANCARIOS PARA TRANSFERENCIA SPEI
==================================================
• Banco: BBVA Bancomer
• Beneficiario: Antigravity Web Studio
• Cuenta CLABE: 012 180 0158 9923 4410
• Concepto / Referencia: ${client.agencyName.substring(0, 18)}

Una vez realizada su transferencia, le solicitamos responder a este correo o enviar su comprobante a antigravitywebstudio@hotmail.com para aplicar la autorización inmediata de su ciclo mensual y mantener la continuidad operativa de sus cuentas sin ninguna interrupción.

Agradecemos de antemano su confianza y preferencia.

Atentamente,
Luis · Antigravity Web Studio
antigravitywebstudio@hotmail.com
Soporte & Facturación Central`;

    client.paymentStatus = 'reminder_3w';
    saveClientsDatabase(clients);

    copyTextToClipboard(emailBody, `Correo de 3 Semanas copiado para ${client.agencyName}`);

    // Trigger Mailto with prefilled executive email
    const mailtoUrl = `mailto:${encodeURIComponent(client.email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;

    if (typeof showToast === 'function') {
        showToast(`📧 Correo de recordatorio preparado para ${client.email} y copiado al portapapeles.`);
    }
}

// STAGE 2: 72-HOUR PREVENTIVE ALERT (3 DAYS BEFORE) - VIA OFFICIAL EMAIL
function send72hPreLockWarning(clientId) {
    const clients = getClientsDatabase();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const emailSubject = `[Aviso Preventivo 72h] Renovación de Servicio Wedding Planner OS - ${client.agencyName}`;
    const emailBody = `Estimada ${client.plannerName} (${client.agencyName}),

Le notificamos que restan únicamente 72 HORAS (3 días hábiles) para la fecha límite de pago de su suscripción a Wedding Planner OS (${client.nextDueDate}).

==================================================
DETALLE DE ESTADO
==================================================
• Agencia: ${client.agencyName}
• Monto a Renovar: $${(client.monthlyFee || 0).toLocaleString('es-MX')} MXN
• Fecha de Corte: ${client.nextDueDate}
• Estado Actual: Pendiente de Autorización

==================================================
IMPORTANTE: CONTINUIDAD DEL SERVICIO
==================================================
Mantener su mensualidad autorizada en tiempo y forma evita cualquier interrupción en:
1. Acceso a su panel de control y minutas de boda.
2. Visualización e interactividad de las invitaciones web de sus parejas.
3. Recepción en tiempo real de confirmaciones de asistencia (RSVP) y acomodo de mesas.

==================================================
DATOS DE TRANSFERENCIA SPEI
==================================================
• Banco: BBVA Bancomer
• Beneficiario: Antigravity Web Studio
• Cuenta CLABE: 012 180 0158 9923 4410
• Concepto: Renovación ${client.agencyName.substring(0, 15)}

Favor de remitir su comprobante a este correo (antigravitywebstudio@hotmail.com) para autorizar su cuenta a la brevedad.

Atentamente,
Departamento de Facturación & Operaciones
Antigravity Web Studio`;

    client.paymentStatus = 'due_72h';
    saveClientsDatabase(clients);

    copyTextToClipboard(emailBody, `Alerta de 72 Horas copiada para ${client.agencyName}`);

    // Trigger Mailto with prefilled executive email
    const mailtoUrl = `mailto:${encodeURIComponent(client.email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;

    if (typeof showToast === 'function') {
        showToast(`⏰ Correo preventivo 72h preparado para ${client.email} y copiado al portapapeles.`);
    }
}

// LOYALTY & UPGRADE OFFER ENGINE (3+ MONTHS TENURE: 15% SIGNATURE PRO / 20% ATELIER ELITE)
function sendLoyaltyUpgradeOffer(clientId) {
    const clients = getClientsDatabase();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const currentTier = client.planTier || 'basic';
    const planNames = { basic: 'Plan Essential ($800 MXN)', intermediate: 'Plan Signature Pro ($1,500 MXN)', elite: 'Plan Atelier Elite ($2,800 MXN)' };

    let upgradeOfferName = '';
    let discountPct = 0;
    let promoPrice = 0;
    let benefitsList = '';

    if (currentTier === 'basic') {
        // Essential -> Signature Pro (15% OFF = $1,275 MXN) or Atelier Elite (20% OFF = $2,240 MXN)
        upgradeOfferName = 'Plan Signature Pro (15% OFF) o Plan Atelier Elite (20% OFF)';
        discountPct = 15;
        benefitsList = `
OPCIÓN A) PLAN SIGNATURE PRO (1 a 10 Bodas · Hasta 100 Invitados c/u)
• Precio de lista regular: $1,500 MXN / mes
• TU PRECIO ESPECIAL DE LEALTAD (15% OFF): $1,275 MXN / mes (Ahorras $225 MXN al mes)
• Módulos desbloqueados: Acomodo de Mesas 2D Interactivo con Sillas, WhatsApp Masivo con Blindaje Antispam, Álbum Colaborativo QR en Vivo y Playlist para el DJ.

OPCIÓN B) PLAN ATELIER ELITE (Hasta 15 Bodas · Invitados Ilimitados · Marca Blanca)
• Precio de lista regular: $2,800 MXN / mes
• TU PRECIO ESPECIAL DE LEALTAD (20% OFF): $2,240 MXN / mes (Ahorras $560 MXN al mes)
• Módulos desbloqueados: Toda la suite ilimitada + Minuta Día D para Staff, Calculadora de Barra & Descorche, Check-in QR Hostess en Puerta y Dominio con Marca Blanca.`;
    } else if (currentTier === 'intermediate') {
        // Signature Pro -> Atelier Elite (10% OFF = $2,520 MXN)
        upgradeOfferName = 'Plan Atelier Elite (10% OFF)';
        discountPct = 10;
        benefitsList = `
PLAN ATELIER ELITE (Hasta 15 Bodas · Invitados Ilimitados · Marca Blanca)
• Precio de lista regular: $2,800 MXN / mes
• TU PRECIO ESPECIAL DE LEALTAD (10% OFF): $2,520 MXN / mes (Ahorras $280 MXN al mes)
• Módulos desbloqueados: Toda la suite ilimitada + Minuta Día D para Staff, Calculadora de Barra e Inventario de Botellas, Check-in QR Hostess en Puerta y Personalización con Marca Blanca.`;
    } else {
        alert(`${client.agencyName} ya cuenta con el Plan Atelier Elite (Suite Máxima).`);
        return;
    }

    const emailSubject = `🎁 ¡Reconocimiento de Lealtad (3 Meses)! Descuento Especial de Upgrade para ${client.agencyName}`;
    const emailBody = `¡Hola ${client.plannerName}!

Queremos agradecerte sinceramente por formar parte de Antigravity Wedding OS durante más de 3 meses. Tu confianza y preferencia como wedding planner profesional hacen posible que sigamos innovando y brindándote la mejor tecnología para tus bodas.

Como muestra de nuestro agradecimiento por tu lealtad y compromiso continuo, hemos preparado un beneficio exclusivo y permanente para tu agencia:

==================================================
🌟 DESCUENTO EXCLUSIVO DE UPGRADE POR LEALTAD
==================================================
Actualmente tu cuenta opera bajo: ${planNames[currentTier] || currentTier}.

Si deseas escalar tu capacidad de bodas y desbloquear herramientas de alto impacto logístico para tus eventos de la próxima temporada, tienes acceso a precios preferenciales:
${benefitsList}

==================================================
CÓMO ACTIVAR TU BENEFICIO
==================================================
1. Responde a este correo indicando a qué plan deseas ascender.
2. O ingresa directamente a tu panel en "Configuración de Planes", donde tu cuenta ya tiene el beneficio reconocido.
3. El descuento preferencial se mantendrá fijo mientras continúes con tu suscripción activa.

Cualquier duda técnica o demostración personalizada de los nuevos módulos, estoy personalmente a tus órdenes.

¡Gracias de nuevo por crear bodas extraordinarias con nosotros!

Atentamente,
Luis · Fundador & Master Developer
Antigravity Web Studio
antigravitywebstudio@hotmail.com
WhatsApp Directo Soporte VIP`;

    copyTextToClipboard(emailBody, `Oferta de Lealtad copiada para ${client.agencyName}`);

    const mailtoUrl = `mailto:${encodeURIComponent(client.email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;

    if (typeof showToast === 'function') {
        showToast(`🎁 Oferta de Lealtad (15%-20% OFF) preparada para ${client.email} y copiada al portapapeles.`);
    }
}

// STAGE 3: 24-HOUR CRITICAL WARNING WITH SCHEDULED CUTOFF TIME - VIA OFFICIAL EMAIL
function openSuspensionWarningModal(clientId) {
    const clients = getClientsDatabase();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    activeClientIdForAction = clientId;
    const modal = document.getElementById('modalWarnClientSuspension');
    if (modal) {
        document.getElementById('warnClientAgencyName').innerText = client.agencyName;
        document.getElementById('warnClientEmail').innerText = client.email;
        document.getElementById('warnCutoffTime').value = '18:00';
        
        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        modal.style.zIndex = '999999';
    }
}

function closeSuspensionWarningModal() {
    const modal = document.getElementById('modalWarnClientSuspension');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
    }
    activeClientIdForAction = null;
}

function submitSendSuspensionWarning(e) {
    if (e) e.preventDefault();
    if (!activeClientIdForAction) return;

    const clients = getClientsDatabase();
    const client = clients.find(c => c.id === activeClientIdForAction);
    if (!client) return;

    const cutoffTime = document.getElementById('warnCutoffTime').value || '18:00';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

    const emailSubject = `[URGENTE 24H] Notificación de Suspensión Programada de Acceso - ${client.agencyName}`;
    const emailBody = `URGENTE: AVISO FORMAL DE SUSPENSIÓN PROGRAMADA POR FALTA DE PAGO

Estimada ${client.plannerName} (${client.agencyName}),

Le notificamos que el periodo regular de facturación para su cuenta de Wedding Planner OS por el monto de $${(client.monthlyFee || 0).toLocaleString('es-MX')} MXN (${client.nextDueDate}) ha concluido sin confirmación de pago.

==================================================
TIEMPO DE GRACIA Y BLOQUEO AUTOMÁTICO
==================================================
Como cortesía operativa, el sistema otorga un TIEMPO DE GRACIA DE 24 HORAS adicionales (hasta mañana ${tomorrowFormatted.toUpperCase()} a las ${cutoffTime} hrs).

Si el comprobante correspondiente no es remitido y validado antes de esta hora límite, el sistema ejecutará de forma AUTOMÁTICA el BLOQUEO TOTAL de acceso a su panel de administración y la suspensión temporal de las invitaciones interactivas de sus parejas.

==================================================
DATOS PARA TRANSFERENCIA SPEI INMEDIATA
==================================================
• Banco: BBVA Bancomer
• Beneficiario: Antigravity Web Studio
• Cuenta CLABE: 012 180 0158 9923 4410
• Concepto: Pago Urgente ${client.agencyName.substring(0, 14)}

Favor de responder con su comprobante de pago a antigravitywebstudio@hotmail.com antes del corte de gracia para mantener su servicio ininterrumpido.

Atentamente,
Dirección de Infraestructura y Finanzas
Antigravity Web Studio`;

    client.paymentStatus = 'due_24h';
    client.suspensionNotice = `Tiempo de gracia activo: Bloqueo automático mañana a las ${cutoffTime} hrs`;
    saveClientsDatabase(clients);
    closeSuspensionWarningModal();

    copyTextToClipboard(emailBody, `Aviso de 24h copiado para ${client.agencyName}`);

    // Trigger Mailto with prefilled executive email
    const mailtoUrl = `mailto:${encodeURIComponent(client.email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;

    if (typeof showToast === 'function') {
        showToast(`⚠️ Correo urgente de suspensión (24h) preparado para ${client.email}.`);
    }
}

// ==========================================================================
// NEW CLIENT PROVISIONING
// ==========================================================================

function openNewClientModal() {
    const modal = document.getElementById('modalDevNewClient');
    if (modal) {
        document.getElementById('devClientAgency').value = '';
        document.getElementById('devClientPlanner').value = '';
        document.getElementById('devClientEmail').value = '';
        document.getElementById('devClientPhone').value = '';
        document.getElementById('devClientPlan').value = 'intermediate';
        document.getElementById('devClientFee').value = '1500';
        document.getElementById('devClientTempPass').value = generateRandomTempPass('WP');
        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        modal.style.zIndex = '999999';
    }
}

function updateFeeByPlan(planTier) {
    const feeInput = document.getElementById('devClientFee');
    if (!feeInput) return;
    if (planTier === 'basic') feeInput.value = '800';
    if (planTier === 'intermediate') feeInput.value = '2000';
    if (planTier === 'elite') feeInput.value = '3500';
}

function closeNewClientModal() {
    const modal = document.getElementById('modalDevNewClient');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
    }
}

function saveNewClientPlanner(e) {
    if (e) e.preventDefault();
    const agencyName = document.getElementById('devClientAgency').value.trim();
    const plannerName = document.getElementById('devClientPlanner').value.trim();
    const email = document.getElementById('devClientEmail').value.trim().toLowerCase();
    const rawDevPhone = document.getElementById('devClientPhone').value.trim();
    const devCountryCode = document.getElementById('devClientCountryCode') ? document.getElementById('devClientCountryCode').value : '+52';
    const phone = rawDevPhone ? `${devCountryCode} ${rawDevPhone.replace(/\D/g, '')}` : '';
    const planTier = document.getElementById('devClientPlan').value;
    const monthlyFee = parseFloat(document.getElementById('devClientFee').value) || 2000;
    const initialPassword = document.getElementById('devClientTempPass').value.trim() || 'Password2026*';

    if (!agencyName || !email) {
        alert('Por favor completa el nombre de la agencia y el correo electrónico.');
        return;
    }

    const clients = getClientsDatabase();
    if (clients.some(c => c.email === email)) {
        alert('Ya existe un cliente registrado con ese correo electrónico.');
        return;
    }

    let maxWeddings = 3;
    if (planTier === 'intermediate') maxWeddings = 10;
    if (planTier === 'elite') maxWeddings = 15;

    // Set next due date to +30 days
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    const nextDueDateStr = nextDate.toISOString().split('T')[0];

    const newClient = {
        id: 'client_' + Date.now(),
        agencyName,
        plannerName: plannerName || agencyName,
        email,
        phone,
        planTier,
        maxWeddings,
        monthlyFee,
        billingCycleDay: new Date().getDate(),
        lastPaymentDate: new Date().toISOString().split('T')[0],
        nextDueDate: nextDueDateStr,
        paymentStatus: 'paid',
        isSuspended: false,
        suspensionNotice: '',
        tempPassword: initialPassword,
        tempPassUsesLeft: 999,
        hasPermanentPassword: true,
        permanentPassword: initialPassword,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active'
    };

    clients.unshift(newClient);
    saveClientsDatabase(clients);
    closeNewClientModal();

    if (typeof showToast === 'function') {
        showToast(`🎉 Cliente "${agencyName}" aprovisionado (Plan: ${planTier}, $${monthlyFee} MXN/mes). Contraseña guardada.`);
    }
}

function deleteClientPlanner(clientId) {
    const clients = getClientsDatabase();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    if (confirm(`¿Estás seguro de eliminar el acceso para la agencia "${client.agencyName}" (${client.email})?`)) {
        const filtered = clients.filter(c => c.id !== clientId);
        saveClientsDatabase(filtered);
        if (typeof showToast === 'function') {
            showToast(`🗑️ Cliente eliminado del sistema.`);
        }
    }
}

function getWelcomeMessageTemplate(client) {
    return `¡Hola ${client.plannerName}! 🥂 Te damos la bienvenida a tu portal oficial de *Wedding Planner OS* por *Antigravity Web Studio*.

✨ *Tus Credenciales de Acceso Maestro:*
🌐 Portal: https://wedding-admin-portal.vercel.app
📧 Usuario / Correo: ${client.email}
🔑 Contraseña Temporal de Primer Acceso: *${client.tempPassword}* (Válida para 3 usos iniciales)
💳 Mensualidad Activa: $${(client.monthlyFee || 0).toLocaleString('es-MX')} MXN/mes

🛡️ *Paso de Seguridad Obligatorio:*
Por políticas de privacidad, en tu primer ingreso haz clic en *"¿Olvidaste tu contraseña?"* en la pantalla de inicio para crear tu contraseña permanente y personalizada.

Estamos a tus órdenes para la configuración de tus bodas y temáticas web.`;
}

function copyClientWelcomeMessage(clientId) {
    const clients = getClientsDatabase();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const text = getWelcomeMessageTemplate(client);
    copyTextToClipboard(text, `Mensaje y credenciales copiadas para ${client.agencyName}`);
}

// ==========================================================================
// LIBRO DE INGRESOS & HISTORIAL DE TRANSACCIONES STRIPE / SPEI
// ==========================================================================

function getPaymentsHistory() {
    let history = localStorage.getItem('wedding_payments_history');
    if (!history) {
        const initial = [
            {
                id: 'STRIPE-882104',
                date: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
                agencyName: 'Aura Weddings & Design',
                email: 'mariana.garza@auraweddings.com',
                planTier: 'intermediate',
                planName: 'Plan Signature Pro (1-10 Bodas)',
                amount: 2000,
                currency: 'MXN',
                method: 'Stripe Tarjeta (Nu Bank / Akala)',
                status: 'succeeded',
                stripeUrl: 'https://dashboard.stripe.com/payments'
            },
            {
                id: 'SPEI-992140',
                date: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
                agencyName: 'Atelier Event Architecture',
                email: 'valeria.eventos@atelier.mx',
                planTier: 'elite',
                planName: 'Plan Atelier Elite (1-15 Bodas)',
                amount: 3500,
                currency: 'MXN',
                method: 'SPEI Transferencia',
                status: 'succeeded',
                stripeUrl: ''
            }
        ];
        localStorage.setItem('wedding_payments_history', JSON.stringify(initial));
        return initial;
    }
    try {
        return JSON.parse(history);
    } catch (e) {
        return [];
    }
}

function recordPaymentInHistory(payment) {
    const list = getPaymentsHistory();
    list.unshift(payment);
    localStorage.setItem('wedding_payments_history', JSON.stringify(list));
    renderDevPaymentsTable();
}

function renderDevPaymentsTable() {
    const tbody = document.getElementById('devPaymentsTableBody');
    if (!tbody) return;

    const payments = getPaymentsHistory();
    tbody.innerHTML = '';

    if (payments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#64748b;">No hay transacciones registradas aún.</td></tr>`;
        return;
    }

    payments.forEach(p => {
        const tr = document.createElement('tr');
        const formattedDate = new Date(p.date).toLocaleString('es-MX', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const isStripe = (p.method || '').includes('Stripe');

        tr.innerHTML = `
            <td><strong style="color:#0f172a;">${formattedDate}</strong></td>
            <td>
                <div style="font-weight:600; color:#0f172a;">${p.agencyName}</div>
                <div style="font-size:0.75rem; color:#64748b;">${p.email}</div>
            </td>
            <td><span class="badge-tag" style="background:#e0e7ff; color:#3730a3; font-size:0.72rem;">${p.planName || p.planTier}</span></td>
            <td><strong style="color:#059669; font-size:0.95rem;">$${Number(p.amount).toLocaleString('es-MX')} ${p.currency || 'MXN'}</strong></td>
            <td>
                <span style="font-size:0.8rem; display:inline-flex; align-items:center; gap:4px;">
                    ${isStripe ? '💳' : '🏦'} ${p.method}
                </span>
            </td>
            <td>
                <code style="background:#f1f5f9; padding:3px 6px; border-radius:4px; font-size:0.75rem; color:#334155; font-family:monospace;">${p.id}</code>
            </td>
            <td>
                <span style="background:#dcfce7; color:#15803d; font-weight:700; font-size:0.75rem; padding:3px 8px; border-radius:12px;">✓ Aprobado</span>
            </td>
            <td style="text-align:right;">
                ${isStripe ? 
                    `<a href="https://dashboard.stripe.com/payments" target="_blank" class="btn-action secondary" style="font-size:0.72rem; padding:4px 8px; text-decoration:none;">🔗 Ver en Stripe</a>` :
                    `<button class="btn-action secondary" style="font-size:0.72rem; padding:4px 8px;" onclick="showToast('📄 Comprobante bancario validado')">📄 Comprobante</button>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Auto render if on dev tab
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderClientsDashboard, 200);
    setTimeout(renderDevAnalyticsDashboard, 250);
});

// ==========================================================================
// SAAS METRICS, ANALYTICS & GROWTH ENGINE (MASTER DEVELOPER TOWER)
// ==========================================================================

let devAnalyticsPeriod = 'all'; // 'all', 'last_30', 'this_year'

function filterDevAnalyticsByPeriod(period, btn) {
    devAnalyticsPeriod = period;
    const parent = btn ? btn.parentElement : null;
    if (parent) {
        parent.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        if (btn) btn.classList.add('active');
    }
    renderDevAnalyticsDashboard();
}

function renderDevAnalyticsDashboard() {
    const totalEl = document.getElementById('analyticsTotalAgencies');
    if (!totalEl) return;

    let clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
    
    // Apply period filtering
    const now = new Date();
    if (devAnalyticsPeriod === 'last_30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        clients = clients.filter(c => {
            const d = new Date(c.createdAt || '2026-09-01');
            return d >= thirtyDaysAgo;
        });
    } else if (devAnalyticsPeriod === 'this_year') {
        clients = clients.filter(c => {
            const d = new Date(c.createdAt || '2026-09-01');
            return d.getFullYear() === 2026;
        });
    }

    // 1. KPI Cards
    const totalAgencies = clients.length;
    const activeAgencies = clients.filter(c => !c.isSuspended).length;
    const suspendedAgencies = clients.filter(c => c.isSuspended).length;
    
    totalEl.innerText = totalAgencies;
    const subEl = document.getElementById('analyticsAgenciesSub');
    if (subEl) {
        subEl.innerText = `${activeAgencies} activas · ${suspendedAgencies} suspendidas`;
    }

    // MRR (Monthly Recurring Revenue)
    const mrr = clients
        .filter(c => !c.isSuspended)
        .reduce((sum, c) => sum + (Number(c.monthlyFee) || (c.planTier === 'elite' ? 2800 : c.planTier === 'basic' ? 800 : 1500)), 0);
    
    const revEl = document.getElementById('analyticsMonthlyRevenue');
    if (revEl) revEl.innerText = `$${mrr.toLocaleString('es-MX')} MXN`;

    // Capacity (managed weddings)
    const totalWeddings = clients.reduce((sum, c) => sum + (Number(c.maxWeddings) || (c.planTier === 'elite' ? 15 : c.planTier === 'basic' ? 3 : 10)), 0);
    const weddingsEl = document.getElementById('analyticsTotalManagedWeddings');
    if (weddingsEl) weddingsEl.innerText = `${totalWeddings} bodas`;

    // Plan count
    let planCounts = { basic: 0, intermediate: 0, elite: 0 };
    clients.forEach(c => {
        if (c.planTier === 'basic') planCounts.basic++;
        else if (c.planTier === 'elite') planCounts.elite++;
        else planCounts.intermediate++;
    });

    let topPlanKey = 'intermediate';
    let maxCount = -1;
    for (const [k, v] of Object.entries(planCounts)) {
        if (v > maxCount) {
            maxCount = v;
            topPlanKey = k;
        }
    }

    const planNames = {
        basic: 'Essential ($800)',
        intermediate: 'Signature Pro ($1,500)',
        elite: 'Atelier Elite ($2,800)'
    };
    const topPlanEl = document.getElementById('analyticsTopPlan');
    if (topPlanEl) topPlanEl.innerText = planNames[topPlanKey] || 'Signature Pro';
    
    const topPlanPctEl = document.getElementById('analyticsTopPlanPct');
    if (topPlanPctEl) {
        const pct = totalAgencies > 0 ? Math.round((maxCount / totalAgencies) * 100) : 0;
        topPlanPctEl.innerText = `${maxCount} agencias (${pct}%)`;
    }

    // 2. Plan Distribution Progress Bars
    const distContainer = document.getElementById('analyticsPlanDistributionList');
    if (distContainer) {
        const tiers = [
            { key: 'basic', name: '🥉 Plan Essential ($800 MXN · 1-3 Bodas)', price: 800, color: '#3b82f6', count: planCounts.basic },
            { key: 'intermediate', name: '🥈 Plan Signature Pro ($2,000 MXN · 1-10 Bodas)', price: 2000, color: '#6366f1', count: planCounts.intermediate },
            { key: 'elite', name: '👑 Plan Atelier Elite ($3,500 MXN · Hasta 15 Bodas)', price: 3500, color: '#d97706', count: planCounts.elite }
        ];

        distContainer.innerHTML = tiers.map(t => {
            const pct = totalAgencies > 0 ? Math.round((t.count / totalAgencies) * 100) : 0;
            const subtotal = t.count * t.price;
            return `
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:6px;">
                        <span style="font-weight:700; font-size:0.85rem; color:#1e293b;">${t.name}</span>
                        <span style="font-size:0.8rem; font-weight:700; color:${t.color};">${t.count} agencias (${pct}%)</span>
                    </div>
                    <div style="background:#e2e8f0; height:8px; border-radius:6px; overflow:hidden; margin-bottom:6px;">
                        <div style="background:${t.color}; width:${pct}%; height:100%; border-radius:6px; transition:width 0.4s ease;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px; font-size:0.75rem; color:#64748b;">
                        <span>Capacidad: ${t.key === 'basic' ? '1-3' : t.key === 'intermediate' ? '1-10' : 'Hasta 15'} bodas</span>
                        <strong style="color:#0f172a;">$${subtotal.toLocaleString('es-MX')} MXN / mes</strong>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 3. Chronological Registrations Timeline
    const tbody = document.getElementById('analyticsRecentAgenciesBody');
    if (tbody) {
        tbody.innerHTML = '';
        if (clients.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:#64748b;">No hay agencias en este periodo.</td></tr>`;
            return;
        }

        const sorted = [...clients].sort((a, b) => new Date(b.createdAt || '2026-01-01') - new Date(a.createdAt || '2026-01-01'));
        sorted.forEach(c => {
            const tr = document.createElement('tr');
            const d = c.createdAt ? new Date(c.createdAt + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Reciente';
            const tierBadge = c.planTier === 'elite' 
                ? '<span class="badge-tag" style="background:#fef3c7; color:#b45309; font-weight:700;">👑 Atelier Elite</span>'
                : c.planTier === 'basic'
                ? '<span class="badge-tag" style="background:#e0f2fe; color:#0369a1; font-weight:700;">🥉 Essential</span>'
                : '<span class="badge-tag" style="background:#ede9fe; color:#6d28d9; font-weight:700;">🥈 Signature Pro</span>';
            const fee = Number(c.monthlyFee) || (c.planTier === 'elite' ? 2800 : c.planTier === 'basic' ? 800 : 1500);

            tr.innerHTML = `
                <td><strong style="color:#334155;">${d}</strong></td>
                <td>
                    <div style="font-weight:700; color:#0f172a;">${c.agencyName}</div>
                    <div style="font-size:0.75rem; color:#64748b;">${c.plannerName || 'Planner'} · ${c.email}</div>
                </td>
                <td>${tierBadge}</td>
                <td><strong style="color:#059669; font-size:0.9rem;">$${fee.toLocaleString('es-MX')} MXN</strong></td>
            `;
            tbody.appendChild(tr);
        });
    }
}

