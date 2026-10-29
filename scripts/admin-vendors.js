// ==========================================================================
// VENDORS, MILESTONE PAYMENTS & CONTRACTS CRM ENGINE
// ==========================================================================

const vendorsDataMaster = [
    {
        id: 'v1',
        name: 'Banquete & Catering Les Gourmet',
        category: 'catering',
        contactName: 'Chef Marcel Roux',
        phone: '525511223344',
        email: 'contacto@lesgourmet.mx',
        rfc: 'LGO180422KX9',
        bank: 'BBVA Bancomer',
        clabe: '012180015489623145',
        contractTotal: 340000,
        paidTotal: 238000,
        setupTime: '12:00 hrs',
        powerReq: 'Trifásica 220V / 40kW (Zona de Cocina)',
        notes: 'Requiere acceso a agua potable y área techada para emplatado.',
        dueDate: '2026-11-09',
        milestones: [
            { desc: '30% Anticipo de Firma de Contrato', amount: 102000, dueDate: 'Completado', status: 'paid', paidAt: '2026-05-14', method: 'SPEI' },
            { desc: '40% Degustación de Menú & Prueba de Montaje', amount: 136000, dueDate: 'Completado', status: 'paid', paidAt: '2026-09-28', method: 'SPEI' },
            { desc: '30% Finiquito / Liquidación previa al Día D', amount: 102000, dueDate: '2026-11-09', status: 'pending' }
        ]
    },
    {
        id: 'v2',
        name: 'Audio, Iluminación Robótica & Pista Pixel',
        category: 'av',
        contactName: 'Ing. Fernando Varela',
        phone: '525599887766',
        email: 'fernando@audiopixel.com',
        rfc: 'PIX200815MN2',
        bank: 'Santander',
        clabe: '014180655089761234',
        contractTotal: 145000,
        paidTotal: 72500,
        setupTime: '09:00 hrs',
        powerReq: 'Planta de Luz 60kVA Dedicada con neutro aterrizado',
        notes: 'Estructura truss de 12x12m y 16 cabezas móviles beam.',
        dueDate: '2026-11-23',
        milestones: [
            { desc: '50% Anticipo de Bloqueo de Fecha', amount: 72500, dueDate: 'Completado', status: 'paid', paidAt: '2026-06-10', method: 'SPEI' },
            { desc: '50% Saldo a la Llegada del Camión', amount: 72500, dueDate: '2026-11-23', status: 'pending' }
        ]
    },
    {
        id: 'v3',
        name: 'Diseño Floral de Autor & Ambientación Botánica',
        category: 'floral',
        contactName: 'Arq. Lucía Garza',
        phone: '528144556677',
        email: 'lucia@garzabotanica.com',
        rfc: 'GBO1903117J4',
        bank: 'Banorte',
        clabe: '072180008899223344',
        contractTotal: 180000,
        paidTotal: 120000,
        setupTime: '11:00 hrs',
        powerReq: 'Acceso a agua corriente y cuarto frío climatizado',
        notes: 'Arreglos colgantes en carpa y arco floral de ceremonia.',
        dueDate: '2026-12-10',
        milestones: [
            { desc: '30% Reserva de Flores Importadas Holandesas', amount: 54000, dueDate: 'Completado', status: 'paid', paidAt: '2026-05-20', method: 'SPEI' },
            { desc: '35% Pago Intermedio a 60 días', amount: 66000, dueDate: 'Completado', status: 'paid', paidAt: '2026-10-02', method: 'SPEI' },
            { desc: '35% Liquidación en Montaje Floral', amount: 60000, dueDate: '2026-12-10', status: 'pending' }
        ]
    },
    {
        id: 'v4',
        name: 'Fotografía Editorial & Cinematografía 4K',
        category: 'photo',
        contactName: 'Estudio Santiago Romero',
        phone: '525533445566',
        email: 'santiago@romerofilm.com',
        rfc: 'ROMS880912QW1',
        bank: 'Citibanamex',
        clabe: '002180701234567890',
        contractTotal: 95000,
        paidTotal: 95000,
        setupTime: '13:30 hrs',
        powerReq: 'Mesa técnica para respaldo y estación de carga de baterías',
        notes: 'Incluye 2 cámaras principales, 1 operador de dron y drone permisado.',
        dueDate: '2026-10-08',
        milestones: [
            { desc: '50% Anticipo de Contratación', amount: 47500, dueDate: 'Completado', status: 'paid', paidAt: '2026-04-18', method: 'SPEI' },
            { desc: '50% Liquidación previa al Evento', amount: 47500, dueDate: 'Completado', status: 'paid', paidAt: '2026-10-08', method: 'Transferencia' }
        ]
    },
    {
        id: 'v5',
        name: 'Mariachi Sinfónico & Ensamble Nupcial',
        category: 'av',
        contactName: 'Mtro. José Luis Almonte',
        phone: '525544332211',
        email: 'contacto@mariachisinfonico.mx',
        rfc: 'MAL850614PT1',
        bank: 'BBVA Bancomer',
        clabe: '012180019988776655',
        contractTotal: 28000,
        paidTotal: 14000,
        setupTime: '16:00 hrs',
        powerReq: '2 micrófonos inalámbricos y 1 toma de 110V',
        notes: 'Acompañamiento en salida de templo y coctel de bienvenida.',
        dueDate: '2026-10-30',
        milestones: [
            { desc: '50% Anticipo de Bloqueo de Fecha', amount: 14000, dueDate: 'Completado', status: 'paid', paidAt: '2026-07-12', method: 'SPEI' },
            { desc: '50% Finiquito al término del servicio', amount: 14000, dueDate: '2026-10-30', status: 'pending' }
        ]
    }
];

let activeVendorPaymentId = null;
let currentVendorsSubView = 'timeline';
let currentTimelineFilter = 'all';
let activeReminderData = null;

function getActiveVendorsList() {
    const wId = (typeof currentWeddingId !== 'undefined') ? currentWeddingId : null;
    if (!wId) return [];

    const state = (typeof getWeddingState === 'function') ? getWeddingState(wId) : (typeof currentData !== 'undefined' ? currentData : null);
    
    if (state && Array.isArray(state.vendors) && state.vendors.length > 0) {
        return state.vendors;
    }
    
    // Check localStorage fallback for this specific wedding
    const stored = localStorage.getItem(`wedding_vendors_${wId}`);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                if (state) state.vendors = parsed;
                return parsed;
            }
        } catch(e) {}
    }

    // Default for demo wedding 'aura'
    if (wId === 'aura') {
        if (state) state.vendors = [...vendorsDataMaster];
        return vendorsDataMaster;
    }

    return (state && Array.isArray(state.vendors)) ? state.vendors : [];
}

function saveActiveVendorsList(vendors) {
    const wId = (typeof currentWeddingId !== 'undefined') ? currentWeddingId : null;
    if (!wId) return;
    localStorage.setItem(`wedding_vendors_${wId}`, JSON.stringify(vendors));
    
    const state = (typeof getWeddingState === 'function') ? getWeddingState(wId) : (typeof currentData !== 'undefined' ? currentData : null);
    if (state) {
        state.vendors = vendors;
        if (typeof saveWeddingState === 'function') {
            saveWeddingState(wId, state);
        }
    }
}

// ==========================================================================
// SUB-VIEW SWITCHER (TIMELINE VS CARDS)
// ==========================================================================
function switchVendorsSubView(view) {
    currentVendorsSubView = view;
    const btnTimeline = document.getElementById('btnSubViewTimeline');
    const btnCards = document.getElementById('btnSubViewCards');
    const viewTimeline = document.getElementById('vendorTimelineView');
    const viewCards = document.getElementById('vendorCardsView');

    if (btnTimeline) btnTimeline.classList.toggle('active', view === 'timeline');
    if (btnCards) btnCards.classList.toggle('active', view === 'cards');

    if (viewTimeline) viewTimeline.style.display = (view === 'timeline') ? 'block' : 'none';
    if (viewCards) viewCards.style.display = (view === 'cards') ? 'block' : 'none';
}

function setTimelineFilter(filter) {
    currentTimelineFilter = filter;
    document.querySelectorAll('.timeline-filter-pills .filter-pill').forEach(btn => {
        btn.classList.toggle('active', btn.id === `tFilter-${filter}`);
    });
    renderPaymentTimeline();
}

function scrollPaymentTimeline(dir) {
    const wrap = document.getElementById('vendorTimelineTrackWrap');
    if (wrap) {
        wrap.scrollBy({ left: dir * 340, behavior: 'smooth' });
    }
}

// ==========================================================================
// DATE & COUNTDOWN PARSER
// ==========================================================================
function parseMilestoneDateObj(dueDateStr) {
    if (!dueDateStr) return null;
    const lower = String(dueDateStr).toLowerCase().trim();
    if (lower.includes('completado') || lower.includes('pagado')) return null;

    // ISO format: YYYY-MM-DD
    const isoMatch = dueDateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
        return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    }

    // Spanish format: DD Mes YYYY (e.g. "10 Oct 2027", "9 Nov 2026")
    const months = {
        'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
    };
    const parts = lower.split(/[\s,]+/);
    if (parts.length >= 3) {
        const day = parseInt(parts[0]);
        const mKey = parts[1].substring(0, 3);
        const year = parseInt(parts[2]);
        if (!isNaN(day) && months[mKey] !== undefined && !isNaN(year)) {
            return new Date(year, months[mKey], day);
        }
    }

    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 15);
}

function getAllPaymentMilestones(vendors) {
    const list = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    vendors.forEach(v => {
        if (!Array.isArray(v.milestones)) return;
        v.milestones.forEach((m, idx) => {
            const isPaid = m.status === 'paid';
            let dateObj = null;
            let diffDays = 999;
            let urgency = 'future';
            let countdownLabel = '';

            if (isPaid) {
                urgency = 'paid';
                countdownLabel = m.paidAt ? `✓ Pagado (${formatVendorExactDate(m.paidAt)})` : '✓ Liquidado';
            } else {
                dateObj = parseMilestoneDateObj(m.dueDate);
                if (dateObj) {
                    const diffMs = dateObj.getTime() - now.getTime();
                    diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                    if (diffDays < 0) {
                        urgency = 'overdue';
                        countdownLabel = `🚨 Vencido hace ${Math.abs(diffDays)} días`;
                    } else if (diffDays === 0) {
                        urgency = 'urgent-2w';
                        countdownLabel = `⚡ ¡Vence Hoy!`;
                    } else if (diffDays === 1) {
                        urgency = 'urgent-2w';
                        countdownLabel = `⚡ Vence Mañana`;
                    } else if (diffDays <= 7) {
                        urgency = 'urgent-2w';
                        countdownLabel = `🔴 Vence en ${diffDays} días (esta semana)`;
                    } else if (diffDays <= 15) {
                        urgency = 'urgent-2w';
                        countdownLabel = `🔴 Vence en ${diffDays} días (~2 sem)`;
                    } else if (diffDays <= 30) {
                        urgency = 'month-1';
                        countdownLabel = `🟡 Vence en ${diffDays} días (~1 mes)`;
                    } else {
                        urgency = 'future';
                        countdownLabel = `📅 En ${diffDays} días`;
                    }
                } else {
                    countdownLabel = `📅 ${m.dueDate || 'Por programar'}`;
                }
            }

            list.push({
                vendorId: v.id,
                vendorName: v.name,
                vendorCategory: v.category,
                vendorContact: v.contactName || '',
                vendorPhone: v.phone || '',
                vendorBank: v.bank || 'Banco n/d',
                vendorClabe: v.clabe || '',
                milestoneIndex: idx,
                desc: m.desc,
                amount: m.amount || 0,
                dueDate: m.dueDate,
                dateObj: dateObj,
                diffDays: diffDays,
                status: m.status,
                urgency: urgency,
                countdownLabel: countdownLabel,
                paidAt: m.paidAt,
                method: m.method
            });
        });
    });

    // Sort: pending first by closest diffDays, then paid by paidAt
    list.sort((a, b) => {
        if (a.status !== 'paid' && b.status === 'paid') return -1;
        if (a.status === 'paid' && b.status !== 'paid') return 1;
        if (a.status !== 'paid' && b.status !== 'paid') {
            return a.diffDays - b.diffDays;
        }
        return 0;
    });

    return list;
}

// ==========================================================================
// RENDER PAYMENT TIMELINE & CALENDAR
// ==========================================================================
function renderPaymentTimeline() {
    const track = document.getElementById('vendorTimelineTrack');
    const banner = document.getElementById('vendorNextPaymentBanner');
    const badgePending = document.getElementById('badgePendingPaymentMilestones');
    if (!track) return;

    const vendors = getActiveVendorsList();
    const allMilestones = getAllPaymentMilestones(vendors);

    const pendingMilestones = allMilestones.filter(m => m.status !== 'paid');
    if (badgePending) {
        badgePending.innerText = `${pendingMilestones.length} próximos`;
    }

    // Critical Next Payment Alert Banner
    if (banner) {
        const closest = pendingMilestones[0];
        if (closest) {
            banner.style.display = 'flex';
            banner.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-size:1.8rem; flex-shrink:0;">⏰</span>
                    <div>
                        <strong style="color:#b45309; font-size:0.92rem; display:block;">
                            Próximo Vencimiento Crítico: ${closest.vendorName}
                        </strong>
                        <span style="color:#78350f; font-size:0.82rem;">
                            $${closest.amount.toLocaleString('es-MX')} MXN (${closest.desc}) · <strong>${closest.countdownLabel}</strong> (${formatVendorExactDate(closest.dueDate)})
                        </span>
                    </div>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="btn-action primary" onclick="openPaymentReminderModal('${closest.vendorId}', ${closest.milestoneIndex}, '2w')" style="background:#25d366; border-color:#25d366; color:#ffffff; font-weight:700; font-size:0.8rem; padding:8px 14px;">
                        💬 Recordar en WhatsApp
                    </button>
                    <button class="btn-action secondary" onclick="openPaymentModal('${closest.vendorId}')" style="font-size:0.8rem; padding:8px 14px;">
                        💳 Abonar Saldo
                    </button>
                </div>
            `;
        } else {
            banner.style.display = 'none';
        }
    }

    // Filter milestones
    let filtered = allMilestones;
    if (currentTimelineFilter === 'urgent-2w') {
        filtered = allMilestones.filter(m => m.urgency === 'urgent-2w' || m.urgency === 'overdue');
    } else if (currentTimelineFilter === 'month-1') {
        filtered = allMilestones.filter(m => m.urgency === 'urgent-2w' || m.urgency === 'overdue' || m.urgency === 'month-1');
    } else if (currentTimelineFilter === 'pending') {
        filtered = allMilestones.filter(m => m.status !== 'paid');
    } else if (currentTimelineFilter === 'paid') {
        filtered = allMilestones.filter(m => m.status === 'paid');
    }

    if (filtered.length === 0) {
        track.innerHTML = `
            <div style="text-align:center; padding:2.5rem 1rem; width:100%; color:#64748b; font-size:0.88rem;">
                <div style="font-size:2rem; margin-bottom:6px;">✨</div>
                <strong>No hay vencimientos de pagos en este filtro.</strong>
                <p style="margin-top:4px; font-size:0.8rem;">Selecciona "Todos los Pagos" para ver el cronograma completo.</p>
            </div>
        `;
        return;
    }

    track.innerHTML = filtered.map(item => {
        const isPaid = item.status === 'paid';
        const prettyDate = formatVendorExactDate(item.dueDate || item.paidAt);
        const cardClass = `timeline-node-card is-${item.urgency}`;

        return `
            <div class="${cardClass}">
                <div>
                    <!-- TIMELINE HEADER BADGE -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span class="timeline-urgency-badge ${item.urgency}">
                            ${item.countdownLabel}
                        </span>
                        <span class="badge-tag uppercase ${item.vendorCategory}" style="font-size:0.68rem; margin:0;">
                            ${getVendorCategoryLabel(item.vendorCategory)}
                        </span>
                    </div>

                    <!-- VENDOR NAME & CONCEPT -->
                    <h4 style="font-size:0.96rem; font-weight:800; color:#0f172a; margin:0 0 4px; line-height:1.3;">
                        ${item.vendorName}
                    </h4>
                    <p style="font-size:0.78rem; color:#475569; margin:0 0 10px; line-height:1.4;">
                        📑 <strong>${item.desc}</strong>
                    </p>

                    <!-- AMOUNT -->
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 12px; margin-bottom:12px;">
                        <span style="font-size:0.7rem; color:#64748b; font-weight:700; text-transform:uppercase; display:block;">Monto a Liquidar:</span>
                        <div class="timeline-card-amount">$${item.amount.toLocaleString('es-MX')} <span style="font-size:0.75rem; color:#64748b; font-weight:600;">MXN</span></div>
                        <div style="font-size:0.72rem; color:#0f172a; margin-top:2px;">
                            📅 Fecha programada: <strong>${prettyDate}</strong>
                        </div>
                    </div>

                    <!-- BANK & CLABE SNIPPET -->
                    <div style="font-size:0.74rem; color:#475569; margin-bottom:12px; background:#ffffff; border:1px dashed #cbd5e1; border-radius:6px; padding:6px 10px;">
                        <div>🏦 ${item.vendorBank}</div>
                        ${item.vendorClabe ? `
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:3px;">
                                <span style="font-family:monospace; font-weight:700; color:#0f172a;">${item.vendorClabe}</span>
                                <button type="button" class="btn-copy-mini" onclick="copyClabe('${item.vendorClabe}')" title="Copiar CLABE">📋</button>
                            </div>
                        ` : '<div style="color:#94a3b8; font-style:italic;">Sin CLABE registrada</div>'}
                    </div>
                </div>

                <!-- ACTIONS -->
                <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
                    ${!isPaid ? `
                        <button type="button" class="btn-action primary" onclick="openPaymentReminderModal('${item.vendorId}', ${item.milestoneIndex}, '${item.urgency === 'urgent-2w' ? '2w' : '1m'}')" style="width:100%; justify-content:center; background:#25d366; border-color:#25d366; color:#ffffff; font-weight:700; font-size:0.78rem; padding:7px;">
                            💬 Recordatorio WhatsApp
                        </button>
                        <button type="button" class="btn-action secondary" onclick="openPaymentModal('${item.vendorId}')" style="width:100%; justify-content:center; font-size:0.78rem; padding:6px;">
                            💳 Abonar / Liquidar
                        </button>
                    ` : `
                        <div style="text-align:center; padding:6px; background:#dcfce7; border-radius:6px; color:#15803d; font-size:0.75rem; font-weight:700;">
                            ✓ Hito Cubierto al 100%
                        </div>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================================================
// WHATSAPP PAYMENT REMINDER MODAL ENGINE (1-CLIC)
// ==========================================================================
function openPaymentReminderModal(vendorId, milestoneIndex, noticeType) {
    const vendors = getActiveVendorsList();
    const v = vendors.find(item => item.id === vendorId);
    if (!v || !v.milestones || !v.milestones[milestoneIndex]) return;

    const m = v.milestones[milestoneIndex];
    const coupleName = (typeof currentData !== 'undefined' && currentData.couple) ? currentData.couple : 'Novios';

    activeReminderData = {
        vendorId: v.id,
        vendorName: v.name,
        contactName: v.contactName || '',
        vendorPhone: v.phone || '',
        vendorBank: v.bank || 'Banco por definir',
        vendorClabe: v.clabe || 'Consultar con Wedding Planner',
        milestoneIndex: milestoneIndex,
        concept: m.desc,
        amount: m.amount || 0,
        dueDate: m.dueDate,
        formattedDate: formatVendorExactDate(m.dueDate),
        couple: coupleName,
        recipient: 'novios',
        noticeType: noticeType || '2w'
    };

    const noviosLabel = document.getElementById('recipientNoviosNames');
    if (noviosLabel) noviosLabel.innerText = `${coupleName} (fondear)`;
    const vendorLabel = document.getElementById('recipientVendorName');
    if (vendorLabel) vendorLabel.innerText = `${v.name}`;

    setReminderRecipient('novios');
    setReminderNotice(noticeType || '2w');

    const modal = document.getElementById('modalVendorPaymentReminder');
    if (modal) modal.classList.add('active');
}

function setReminderRecipient(recipient) {
    if (!activeReminderData) return;
    activeReminderData.recipient = recipient;

    const btnNovios = document.getElementById('btnChoiceNovios');
    const btnVendor = document.getElementById('btnChoiceVendor');
    if (btnNovios) btnNovios.classList.toggle('active', recipient === 'novios');
    if (btnVendor) btnVendor.classList.toggle('active', recipient === 'vendor');

    const phoneInput = document.getElementById('reminderPhoneInput');
    if (phoneInput) {
        if (recipient === 'vendor') {
            phoneInput.value = activeReminderData.vendorPhone || '';
        } else {
            phoneInput.value = (typeof currentData !== 'undefined' && currentData.couplePhone) ? currentData.couplePhone : '';
        }
    }

    rebuildReminderMessage();
}

function setReminderNotice(notice) {
    if (!activeReminderData) return;
    activeReminderData.noticeType = notice;

    ['2w', '1m', 'urgent', 'custom'].forEach(n => {
        const pill = document.getElementById(`pillNotice${n === '2w' ? '2W' : n === '1m' ? '1M' : n === 'urgent' ? 'Urgent' : 'Custom'}`);
        if (pill) pill.classList.toggle('active', notice === n);
    });

    rebuildReminderMessage();
}

function rebuildReminderMessage() {
    if (!activeReminderData) return;

    let daysText = 'en las próximas semanas';
    let urgencyIntro = 'Les comparto su próximo vencimiento de pago programado:';

    if (activeReminderData.noticeType === '2w') {
        daysText = 'en 2 semanas (~15 días)';
        urgencyIntro = 'Les recuerdo con tiempo que en 2 semanas vence el siguiente pago:';
    } else if (activeReminderData.noticeType === '1m') {
        daysText = 'en 1 mes (~30 días)';
        urgencyIntro = 'Les comparto la proyección de pagos para el próximo mes:';
    } else if (activeReminderData.noticeType === 'urgent') {
        daysText = '¡esta misma semana!';
        urgencyIntro = '⚠️ Les recordamos de manera urgente que el siguiente pago vence esta semana:';
    }

    let msg = '';
    if (activeReminderData.recipient === 'novios') {
        msg = `💍 *Recordatorio de Pago · Boda ${activeReminderData.couple}*\n` +
              `Hola chicos! Les saluda su Wedding Planner 📋\n\n` +
              `${urgencyIntro}\n\n` +
              `🏢 *Proveedor:* ${activeReminderData.vendorName}\n` +
              `📑 *Concepto:* ${activeReminderData.concept}\n` +
              `💰 *Monto a liquidar:* $${activeReminderData.amount.toLocaleString('es-MX')} MXN\n` +
              `📅 *Fecha límite:* ${activeReminderData.formattedDate} (${daysText})\n\n` +
              `🏦 *Datos para Transferencia / SPEI:*\n` +
              `• Banco: ${activeReminderData.vendorBank}\n` +
              `• CLABE: ${activeReminderData.vendorClabe}\n` +
              `• Beneficiario: ${activeReminderData.vendorName}\n\n` +
              `Por favor ayúdenme compartiéndome su comprobante en cuanto realicen la transferencia para conciliarlo en PaseBoda. ¡Muchas gracias! ✨`;
    } else {
        msg = `🏢 *Coordinación de Pagos · Boda ${activeReminderData.couple}*\n` +
              `Hola ${activeReminderData.contactName || activeReminderData.vendorName}! Te saluda la coordinación de Wedding Planner de la boda de ${activeReminderData.couple} 💍\n\n` +
              `Te escribimos para dar seguimiento a tu próximo pago programado:\n\n` +
              `📑 *Concepto:* ${activeReminderData.concept}\n` +
              `💰 *Monto:* $${activeReminderData.amount.toLocaleString('es-MX')} MXN\n` +
              `📅 *Fecha de Vencimiento:* ${activeReminderData.formattedDate} (${daysText})\n` +
              `🏦 *Cuenta destino registrada:* ${activeReminderData.vendorBank} (CLABE: ${activeReminderData.vendorClabe})\n\n` +
              `Estamos preparando la dispersión para la fecha programada. Si requieres enviar factura previa o confirmar algún dato, avísanos con gusto por aquí. ¡Saludos cordiales! 📋`;
    }

    const textArea = document.getElementById('reminderMessageText');
    const bubble = document.getElementById('reminderBubblePreview');
    if (textArea) textArea.value = msg;
    if (bubble) bubble.innerText = msg;
}

function syncReminderTextFromArea() {
    const textArea = document.getElementById('reminderMessageText');
    const bubble = document.getElementById('reminderBubblePreview');
    if (textArea && bubble) {
        bubble.innerText = textArea.value;
    }
}

function updateReminderWhatsAppLink() {
    // Dynamic refresh if needed
}

function closePaymentReminderModal() {
    activeReminderData = null;
    const modal = document.getElementById('modalVendorPaymentReminder');
    if (modal) modal.classList.remove('active');
}

function sendReminderWhatsApp() {
    const phoneInput = document.getElementById('reminderPhoneInput');
    const textArea = document.getElementById('reminderMessageText');
    const phone = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';
    const text = textArea ? textArea.value : '';

    if (!text.trim()) {
        alert('Por favor redacta el mensaje a enviar.');
        return;
    }

    const encodedText = encodeURIComponent(text);
    const url = phone ? `https://wa.me/${phone}?text=${encodedText}` : `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(url, '_blank');
    if (typeof showToast === 'function') {
        showToast('💬 Abriendo WhatsApp con el recordatorio listo...');
    }
    closePaymentReminderModal();
}

function copyReminderText() {
    const textArea = document.getElementById('reminderMessageText');
    if (!textArea) return;
    navigator.clipboard.writeText(textArea.value).then(() => {
        if (typeof showToast === 'function') {
            showToast('📋 Mensaje de recordatorio copiado al portapapeles.');
        }
    }).catch(() => {
        textArea.select();
        document.execCommand('copy');
        if (typeof showToast === 'function') {
            showToast('📋 Mensaje copiado.');
        }
    });
}

// ==========================================================================
// RENDER VENDORS TAB MASTER
// ==========================================================================
function renderVendorsTab() {
    const vendors = getActiveVendorsList();

    // Render count badge in subview pill
    const countCards = document.getElementById('countVendorCards');
    if (countCards) countCards.innerText = vendors.length;

    // Render payment timeline
    renderPaymentTimeline();

    // Render cards view
    renderVendorCards(vendors);
}

function renderVendorCards(vendors) {
    const list = document.getElementById('vendorsCardsList');
    if (!list) return;

    let totalContracted = 0;
    let totalPaid = 0;

    if (vendors.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding:3rem 1rem; background:#ffffff; border:1px dashed #cbd5e1; border-radius:12px; grid-column:1/-1;">
                <div style="font-size:2.5rem; margin-bottom:0.5rem;">🏢</div>
                <h4 style="font-size:1.1rem; color:#0f172a; margin-bottom:0.25rem;">No hay proveedores registrados aún</h4>
                <p style="color:#64748b; font-size:0.85rem; margin-bottom:1rem;">Registra los contratos de banquete, música, fotografía y decoración para monitorear sus anticipos.</p>
                <button class="btn-action primary" onclick="openNewVendorModal()">+ Registrar Primer Proveedor</button>
            </div>
        `;
        updateVendorSummaryStats(0, 0);
        return;
    }

    list.innerHTML = vendors.map(v => {
        totalContracted += (v.contractTotal || 0);
        totalPaid += (v.paidTotal || 0);
        const pendingAmount = Math.max(0, (v.contractTotal || 0) - (v.paidTotal || 0));
        const pct = Math.min(100, Math.round(((v.paidTotal || 0) / ((v.contractTotal || 1))) * 100));
        const isFullyPaid = pct >= 100;

        return `
            <div class="vendor-full-card">
                <div class="vendor-header-row">
                    <div>
                        <span class="badge-tag uppercase ${v.category}">${getVendorCategoryLabel(v.category)}</span>
                        <h3 class="vendor-name">${v.name}</h3>
                        <div class="vendor-contact-links">
                            <span>👤 <strong>${v.contactName || 'Sin contacto'}</strong></span>
                            ${v.phone ? `
                                <a href="javascript:void(0)" onclick="openWhatsAppVendor('${v.phone}', '${encodeURIComponent(v.name)}', ${pendingAmount})" class="vendor-wa-link" title="Enviar WhatsApp Directo">
                                    💬 +${v.phone}
                                </a>
                            ` : ''}
                            ${v.email ? `<span style="color:#64748b;">✉️ ${v.email}</span>` : ''}
                        </div>
                    </div>
                    <div class="vendor-financial-summary">
                        <span class="text-xs text-muted">Monto Contratado</span>
                        <div class="vendor-total-amount">$${v.contractTotal.toLocaleString('es-MX')} MXN</div>
                        <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:4px;">
                            <span class="badge-status ${isFullyPaid ? 'success' : 'warning'}">
                                ${isFullyPaid ? '✓ Liquidado 100%' : `${pct}% Cubierto`}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- PROGRESS BAR -->
                <div class="vendor-progress-container mt-2 mb-2">
                    <div class="vendor-progress-track">
                        <div class="vendor-progress-fill ${isFullyPaid ? 'full' : ''}" style="width: ${pct}%;"></div>
                    </div>
                    <div class="vendor-progress-labels">
                        <span style="color:#10b981; font-weight:700;">Pagado: $${v.paidTotal.toLocaleString('es-MX')} MXN</span>
                        <span style="color:${pendingAmount > 0 ? '#d97706' : '#64748b'}; font-weight:700;">Saldo Pendiente: $${pendingAmount.toLocaleString('es-MX')} MXN</span>
                    </div>
                </div>

                <!-- BANKING & CLABE INFO -->
                <div class="vendor-bank-row">
                    <div class="bank-pill">
                        🏦 <strong>${v.bank || 'Banco No Asignado'}</strong>
                        <span class="clabe-code">${v.clabe || 'Sin CLABE'}</span>
                        ${v.clabe ? `<button class="btn-copy-mini" onclick="copyClabe('${v.clabe}')" title="Copiar CLABE Interbancaria">📋 Copiar</button>` : ''}
                    </div>
                    ${v.rfc ? `<div class="rfc-pill"><strong>RFC:</strong> ${v.rfc}</div>` : ''}
                </div>

                <!-- TECHNICAL DOSSIER -->
                <div class="vendor-tech-specs">
                    <span>⚡ <strong>Energía / Requisitos:</strong> ${v.powerReq || 'Estándar 110V'}</span>
                    <span>⏰ <strong>Llegada & Montaje:</strong> ${v.setupTime || 'Por confirmar'}</span>
                </div>

                <!-- MILESTONES BREAKDOWN -->
                <div class="milestones-timeline-box mt-3">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                        <h5 class="milestones-title">Cronograma de Anticipos & Pagos:</h5>
                        <button class="btn-sm-action" onclick="openPaymentModal('${v.id}')">➕ Abonar / Liquidar Saldo</button>
                    </div>
                    <div class="milestones-grid">
                        ${v.milestones.map((m, mIdx) => {
                            const isPaid = m.status === 'paid';
                            let dateHtml = '';
                            if (isPaid && m.paidAt) {
                                const relBadge = formatVendorPaymentRelative(m.paidAt);
                                const prettyDate = formatVendorExactDate(m.paidAt);
                                dateHtml = `
                                    <div class="ms-paid-meta">
                                        <div class="ms-paid-date">✓ Pagado: <strong>${prettyDate}</strong></div>
                                        <div class="ms-paid-badges">
                                            <span class="ms-badge-rel">${relBadge}</span>
                                            ${m.method ? `<span class="ms-badge-method">${m.method.toUpperCase()}</span>` : ''}
                                        </div>
                                    </div>
                                `;
                            } else {
                                dateHtml = `
                                    <div class="ms-date">📅 Vence: ${formatVendorExactDate(m.dueDate)}</div>
                                    <button type="button" class="btn-action primary" onclick="openPaymentReminderModal('${v.id}', ${mIdx}, '2w')" style="margin-top:6px; font-size:0.7rem; padding:4px 8px; background:#25d366; border-color:#25d366; color:#ffffff; font-weight:700; width:100%; justify-content:center;">
                                        💬 Recordatorio WhatsApp
                                    </button>
                                `;
                            }

                            return `
                                <div class="milestone-pill ${m.status}">
                                    <div class="ms-desc">${m.desc}</div>
                                    <div class="ms-amount">$${m.amount.toLocaleString('es-MX')} MXN</div>
                                    ${dateHtml}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="vendor-footer-actions mt-3">
                    <div style="font-size:0.75rem; color:#64748b;">
                        📝 ${v.notes || 'Sin especificaciones adicionales.'}
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-icon-action" onclick="openEditVendorModal('${v.id}')" title="Editar Proveedor">✏️ Editar</button>
                        <button class="btn-icon-action danger" onclick="deleteVendor('${v.id}')" title="Eliminar Proveedor">🗑️ Eliminar</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    updateVendorSummaryStats(totalContracted, totalPaid);
}

function updateVendorSummaryStats(contracted, paid) {
    const statContracted = document.getElementById('statVendorsContracted');
    const statPaid = document.getElementById('statVendorsPaid');
    const statPending = document.getElementById('statVendorsPending');

    if (statContracted) statContracted.innerText = `$${contracted.toLocaleString('es-MX')} MXN`;
    if (statPaid) statPaid.innerText = `$${paid.toLocaleString('es-MX')} MXN`;
    if (statPending) statPending.innerText = `$${Math.max(0, contracted - paid).toLocaleString('es-MX')} MXN`;
}

function getVendorCategoryLabel(cat) {
    const map = {
        catering: '🍽️ Catering & Banquete',
        av: '🔊 Audio, DJ & Luces',
        floral: '💐 Florería & Diseño',
        photo: '📸 Foto & Video',
        venue: '🏰 Venue / Locación',
        makeup: '💄 Makeup & Styling',
        pastry: '🎂 Repostería Fina',
        show: '🎆 Show & Pirotecnia',
        other: '📦 Proveedor General'
    };
    return map[cat] || cat;
}

// Copy CLABE to clipboard
function copyClabe(clabe) {
    if (!clabe) return;
    navigator.clipboard.writeText(clabe).then(() => {
        if (typeof showToast === 'function') {
            showToast(`📋 CLABE ${clabe} copiada al portapapeles.`);
        } else {
            alert(`CLABE copiada: ${clabe}`);
        }
    });
}

// WhatsApp direct chat
function openWhatsAppVendor(phone, vendorName, pendingAmount) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let msg = `Hola! Te contacto de la coordinación de la boda de Sofía & Alejandro respecto al servicio de ${decodeURIComponent(vendorName)}. `;
    if (pendingAmount > 0) {
        msg += `Te confirmamos que tenemos programado tu próximo anticipo por $${pendingAmount.toLocaleString('es-MX')} MXN. ¿Nos podrías confirmar tu cuenta bancaria y horario de llegada?`;
    } else {
        msg += `Te confirmamos que tu contrato está 100% liquidado. Por favor confírmanos tu horario de montaje y requerimientos técnicos en recinto. Gracias!`;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

// ==========================================================================
// CREATE & EDIT VENDOR MODALS
// ==========================================================================
function openNewVendorModal() {
    if (typeof activeRole !== 'undefined' && activeRole === 'couple') {
        showToast('🔒 Acción exclusiva de tu Wedding Planner.');
        return;
    }
    document.getElementById('newVendorCat').value = 'catering';
    document.getElementById('newVendorName').value = '';
    document.getElementById('newVendorContact').value = '';
    document.getElementById('newVendorPhone').value = '';
    document.getElementById('newVendorEmail').value = '';
    document.getElementById('newVendorRfc').value = '';
    document.getElementById('newVendorBank').value = 'BBVA Bancomer';
    document.getElementById('newVendorClabe').value = '';
    document.getElementById('newVendorContract').value = '50000';
    document.getElementById('newVendorDeposit').value = '15000';
    document.getElementById('newVendorSetupTime').value = '10:00 hrs';
    document.getElementById('newVendorPower').value = '110V Estándar';
    document.getElementById('newVendorNotes').value = '';

    const m = document.getElementById('modalNewVendor');
    if (m) m.classList.add('active');
}

function closeNewVendorModal() {
    const m = document.getElementById('modalNewVendor');
    if (m) m.classList.remove('active');
}

function saveNewVendor() {
    const category = document.getElementById('newVendorCat').value;
    const name = document.getElementById('newVendorName').value.trim();
    const rawPhone = document.getElementById('newVendorPhone').value.trim();
    const countryCode = document.getElementById('newVendorCountryCode') ? document.getElementById('newVendorCountryCode').value : '+52';
    const phone = rawPhone ? `${countryCode} ${rawPhone.replace(/\D/g, '')}` : '';
    const email = document.getElementById('newVendorEmail').value.trim();
    const rfc = document.getElementById('newVendorRfc').value.trim();
    const bank = document.getElementById('newVendorBank').value.trim();
    const clabe = document.getElementById('newVendorClabe').value.trim();
    const contractTotal = parseFloat(document.getElementById('newVendorContract').value) || 0;
    const initialDeposit = parseFloat(document.getElementById('newVendorDeposit').value) || 0;
    const setupTime = document.getElementById('newVendorSetupTime').value.trim();
    const powerReq = document.getElementById('newVendorPower').value.trim();
    const notes = document.getElementById('newVendorNotes').value.trim();

    if (!name) {
        alert('Por favor especifica el nombre o razón social del proveedor.');
        return;
    }

    const pending = Math.max(0, contractTotal - initialDeposit);
    const milestones = [];

    if (initialDeposit > 0) {
        milestones.push({
            desc: 'Anticipo Inicial de Contratación',
            amount: initialDeposit,
            dueDate: 'Completado',
            status: 'paid'
        });
    }

    if (pending > 0) {
        milestones.push({
            desc: 'Saldo Restante / Liquidación',
            amount: pending,
            dueDate: 'Previo al Evento',
            status: 'pending'
        });
    }

    const newVendor = {
        id: 'v_' + Date.now(),
        name: name,
        category: category,
        contactName: contactName,
        phone: phone,
        email: email,
        rfc: rfc,
        bank: bank,
        clabe: clabe,
        contractTotal: contractTotal,
        paidTotal: initialDeposit,
        setupTime: setupTime,
        powerReq: powerReq,
        notes: notes,
        milestones: milestones
    };

    const currentVendors = getActiveVendorsList();
    currentVendors.push(newVendor);
    saveActiveVendorsList(currentVendors);

    closeNewVendorModal();
    renderVendorsTab();
    if (typeof showToast === 'function') {
        showToast(`🏢 Proveedor "${name}" registrado exitosamente.`);
    }
}

// Edit Vendor
let editingVendorId = null;

function openEditVendorModal(id) {
    const vendors = getActiveVendorsList();
    const v = vendors.find(item => item.id === id);
    if (!v) return;

    editingVendorId = id;
    document.getElementById('editVendorCat').value = v.category;
    document.getElementById('editVendorName').value = v.name;
    document.getElementById('editVendorContact').value = v.contactName || '';

    const countryCodeSelect = document.getElementById('editVendorCountryCode');
    const phoneInput = document.getElementById('editVendorPhone');
    let phoneStr = (v.phone || '').trim();
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

    document.getElementById('editVendorEmail').value = v.email || '';
    document.getElementById('editVendorRfc').value = v.rfc || '';
    document.getElementById('editVendorBank').value = v.bank || '';
    document.getElementById('editVendorClabe').value = v.clabe || '';
    document.getElementById('editVendorContract').value = v.contractTotal;
    document.getElementById('editVendorSetupTime').value = v.setupTime || '';
    document.getElementById('editVendorPower').value = v.powerReq || '';
    document.getElementById('editVendorNotes').value = v.notes || '';

    const m = document.getElementById('modalEditVendor');
    if (m) m.classList.add('active');
}

function closeEditVendorModal() {
    editingVendorId = null;
    const m = document.getElementById('modalEditVendor');
    if (m) m.classList.remove('active');
}

function saveEditVendor() {
    if (!editingVendorId) return;
    const vendors = getActiveVendorsList();
    const v = vendors.find(item => item.id === editingVendorId);
    if (!v) return;

    v.category = document.getElementById('editVendorCat').value;
    v.name = document.getElementById('editVendorName').value.trim() || v.name;
    v.contactName = document.getElementById('editVendorContact').value.trim();
    const rawPhone = document.getElementById('editVendorPhone').value.trim();
    const countryCode = document.getElementById('editVendorCountryCode') ? document.getElementById('editVendorCountryCode').value : '+52';
    v.phone = rawPhone ? `${countryCode} ${rawPhone.replace(/\D/g, '')}` : '';
    v.email = document.getElementById('editVendorEmail').value.trim();
    v.rfc = document.getElementById('editVendorRfc').value.trim();
    v.bank = document.getElementById('editVendorBank').value.trim();
    v.clabe = document.getElementById('editVendorClabe').value.trim();
    v.contractTotal = parseFloat(document.getElementById('editVendorContract').value) || v.contractTotal;
    v.setupTime = document.getElementById('editVendorSetupTime').value.trim();
    v.powerReq = document.getElementById('editVendorPower').value.trim();
    v.notes = document.getElementById('editVendorNotes').value.trim();

    saveActiveVendorsList(vendors);
    closeEditVendorModal();
    renderVendorsTab();
    if (typeof showToast === 'function') {
        showToast(`✓ Datos del proveedor "${v.name}" actualizados.`);
    }
}

function deleteVendor(id) {
    const vendors = getActiveVendorsList();
    const idx = vendors.findIndex(item => item.id === id);
    if (idx === -1) return;

    const name = vendors[idx].name;
    if (confirm(`¿Estás seguro de eliminar al proveedor "${name}" y todos sus hitos de pago?`)) {
        vendors.splice(idx, 1);
        saveActiveVendorsList(vendors);
        renderVendorsTab();
        if (typeof showToast === 'function') {
            showToast(`🗑️ Proveedor "${name}" eliminado.`);
        }
    }
}

// ==========================================================================
// REGISTER VENDOR PAYMENT MODAL & DATE HELPERS
// ==========================================================================
function formatVendorExactDate(dateStr) {
    if (!dateStr) return 'Fecha n/d';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
        return dateStr;
    }
}

function formatVendorPaymentRelative(dateStr) {
    if (!dateStr) return 'Fecha n/d';
    try {
        const parts = dateStr.split('-');
        let target;
        if (parts.length === 3) {
            target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
            target = new Date(dateStr);
        }
        if (isNaN(target.getTime())) return 'Registrado';

        const now = new Date();
        const diffMs = now.getTime() - target.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 'Hoy / Reciente';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `hace ${diffDays} días`;
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return weeks === 1 ? 'hace 1 semana' : `hace ${weeks} semanas`;
        }
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return months === 1 ? 'hace 1 mes' : `hace ${months} meses`;
        }
        const years = Math.floor(diffDays / 365);
        return years === 1 ? 'hace 1 año' : `hace ${years} años`;
    } catch (e) {
        return 'Registrado';
    }
}

function openPaymentModal(vendorId) {
    const vendors = getActiveVendorsList();
    const v = vendors.find(item => item.id === vendorId);
    if (!v) return;

    activeVendorPaymentId = vendorId;
    const pending = Math.max(0, (v.contractTotal || 0) - (v.paidTotal || 0));

    document.getElementById('payVendorNameDisplay').innerText = v.name;
    document.getElementById('payVendorTotalDisplay').innerText = `$${(v.contractTotal || 0).toLocaleString('es-MX')} MXN`;
    document.getElementById('payVendorPaidDisplay').innerText = `$${(v.paidTotal || 0).toLocaleString('es-MX')} MXN`;
    document.getElementById('payVendorPendingDisplay').innerText = `$${pending.toLocaleString('es-MX')} MXN`;

    document.getElementById('payVendorAmount').value = pending > 0 ? pending : 0;
    document.getElementById('payVendorDesc').value = pending > 0 ? 'Liquidación Total del Saldo' : 'Abono Extra';
    document.getElementById('payVendorMethod').value = 'spei';

    const dateInput = document.getElementById('payVendorDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    const m = document.getElementById('modalVendorPayment');
    if (m) m.classList.add('active');
}

function closePaymentModal() {
    activeVendorPaymentId = null;
    const m = document.getElementById('modalVendorPayment');
    if (m) m.classList.remove('active');
}

function saveVendorPayment() {
    if (!activeVendorPaymentId) return;
    const vendors = getActiveVendorsList();
    const v = vendors.find(item => item.id === activeVendorPaymentId);
    if (!v) return;

    const amount = parseFloat(document.getElementById('payVendorAmount').value) || 0;
    const desc = document.getElementById('payVendorDesc').value.trim() || 'Abono Registrado';
    const method = document.getElementById('payVendorMethod').value || 'spei';
    const dateInput = document.getElementById('payVendorDate');
    const paymentDate = (dateInput && dateInput.value) ? dateInput.value : new Date().toISOString().split('T')[0];

    if (amount <= 0) {
        alert('Por favor ingresa un monto mayor a 0 para el abono.');
        return;
    }

    v.paidTotal = (v.paidTotal || 0) + amount;
    if (!Array.isArray(v.milestones)) v.milestones = [];
    v.milestones.push({
        desc: desc,
        amount: amount,
        dueDate: `Pagado`,
        status: 'paid',
        paidAt: paymentDate,
        method: method
    });

    saveActiveVendorsList(vendors);
    closePaymentModal();
    renderVendorsTab();
    if (typeof showToast === 'function') {
        showToast(`💳 Abono por $${amount.toLocaleString('es-MX')} MXN registrado para "${v.name}".`);
    }
}
