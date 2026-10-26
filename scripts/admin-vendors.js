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
        dueDate: '2027-10-10',
        milestones: [
            { desc: '30% Anticipo de Firma de Contrato', amount: 102000, dueDate: 'Completado', status: 'paid', paidAt: '2026-05-14', method: 'SPEI' },
            { desc: '40% Degustación de Menú & Prueba de Montaje', amount: 136000, dueDate: 'Completado', status: 'paid', paidAt: '2026-09-28', method: 'SPEI' },
            { desc: '30% Finiquito / Liquidación previa al Día D', amount: 102000, dueDate: '10 Oct 2027', status: 'pending' }
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
        dueDate: '2027-10-24',
        milestones: [
            { desc: '50% Anticipo de Bloqueo de Fecha', amount: 72500, dueDate: 'Completado', status: 'paid', paidAt: '2026-06-10', method: 'SPEI' },
            { desc: '50% Saldo a la Llegada del Camión', amount: 72500, dueDate: '24 Oct 2027 (Día D)', status: 'pending' }
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
        dueDate: '2027-10-22',
        milestones: [
            { desc: '30% Reserva de Flores Importadas Holandesas', amount: 54000, dueDate: 'Completado', status: 'paid', paidAt: '2026-05-20', method: 'SPEI' },
            { desc: '35% Pago Intermedio a 60 días', amount: 66000, dueDate: 'Completado', status: 'paid', paidAt: '2026-10-02', method: 'SPEI' },
            { desc: '35% Liquidación en Montaje Floral', amount: 60000, dueDate: '22 Oct 2027', status: 'pending' }
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
        dueDate: '2027-09-15',
        milestones: [
            { desc: '50% Anticipo de Contratación', amount: 47500, dueDate: 'Completado', status: 'paid', paidAt: '2026-04-18', method: 'SPEI' },
            { desc: '50% Liquidación 30 días antes del Evento', amount: 47500, dueDate: 'Completado', status: 'paid', paidAt: '2026-10-08', method: 'Transferencia' }
        ]
    }
];

let activeVendorPaymentId = null;

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

    // Default for demo wedding 'aura' only
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

function renderVendorsTab() {
    const list = document.getElementById('vendorsCardsList');
    if (!list) return;

    let totalContracted = 0;
    let totalPaid = 0;

    const vendors = getActiveVendorsList();

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
                        ${v.milestones.map(m => {
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
                                dateHtml = `<div class="ms-date">📅 Vence: ${m.dueDate}</div>`;
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
