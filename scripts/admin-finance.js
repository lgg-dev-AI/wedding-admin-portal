// ==========================================================================
// LUXURY FINANCE, HONEYMOON REGISTRY & SPEI AUDITOR ENGINE (PRO SUITE)
// UX / Financial Analyst / IT Architecture Edition
// ==========================================================================

let activeFinanceFilter = 'all'; // 'all' | 'pending' | 'approved'
let currentFinanceSearch = '';

/**
 * Main render function for Tab 4: Mesa de Regalos & Validación Bancaria
 */
function renderFinanceTab() {
    if (typeof activeRole !== 'undefined' && activeRole === 'couple') {
        if (typeof activeFinanceSubtab !== 'undefined' && activeFinanceSubtab === 'destination') {
            switchFinanceSubtab('gifts');
        }
    }
    currentData = getWeddingState(currentWeddingId);
    if (!currentData) {
        const setZero = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        setZero('badgePendingVouchers', '0 por validar');
        setZero('pendingVouchersCount', '0');
        setZero('countPillAll', '0');
        setZero('countPillPending', '0');
        setZero('countPillApproved', '0');
        setZero('approvedTotalAmount', '$0 MXN');
        setZero('approvedCount', '0 donaciones');
        setZero('averageDonation', '$0 MXN');
        setZero('financeCollectedHero', '$0 MXN');
        setZero('financeGoalHero', '$0 MXN');
        setZero('financeGoalPercentBadge', '0% Alcanzado');
        setZero('financeGoalRemaining', 'Sin meta activa');
        setZero('financeGoalAveragePax', 'Promedio: $0 MXN');
        const progressBar = document.getElementById('financeGoalProgressBar');
        if (progressBar) progressBar.style.width = '0%';
        const pendingList = document.getElementById('pendingVouchersList');
        const approvedList = document.getElementById('approvedVouchersList');
        if (pendingList) pendingList.innerHTML = '<div style="text-align:center; padding:2rem 1rem; color:#64748b; background:#f8fafc; border-radius:10px;">No hay boda seleccionada</div>';
        if (approvedList) approvedList.innerHTML = '<div style="text-align:center; padding:2rem 1rem; color:#64748b; background:#f8fafc; border-radius:10px;">No hay boda seleccionada</div>';
        return;
    }

    // Ensure vouchers array exists
    if (!Array.isArray(currentData.vouchers)) {
        currentData.vouchers = [];
    }

    const vouchers = currentData.vouchers;
    const pending = vouchers.filter(v => v.status === 'pending');
    const approved = vouchers.filter(v => v.status === 'approved');

    // Update Header Badges & Pill Counts
    const badgePending = document.getElementById('badgePendingVouchers');
    const pendingCountSpan = document.getElementById('pendingVouchersCount');
    if (badgePending) badgePending.innerText = `${pending.length} por validar`;
    if (pendingCountSpan) pendingCountSpan.innerText = pending.length;

    const countAllSpan = document.getElementById('countPillAll');
    const countPendingSpan = document.getElementById('countPillPending');
    const countApprovedSpan = document.getElementById('countPillApproved');
    if (countAllSpan) countAllSpan.innerText = vouchers.length;
    if (countPendingSpan) countPendingSpan.innerText = pending.length;
    if (countApprovedSpan) countApprovedSpan.innerText = approved.length;

    // Financial KPI Calculations
    const totalApproved = approved.reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
    const avg = approved.length > 0 ? Math.round(totalApproved / approved.length) : 0;

    const approvedTotalEl = document.getElementById('approvedTotalAmount');
    const approvedCountEl = document.getElementById('approvedCount');
    const avgDonationEl = document.getElementById('averageDonation');
    if (approvedTotalEl) approvedTotalEl.innerText = `$${totalApproved.toLocaleString('es-MX')} MXN`;
    if (approvedCountEl) approvedCountEl.innerText = `${approved.length} donaciones`;
    if (avgDonationEl) avgDonationEl.innerText = `$${avg.toLocaleString('es-MX')} MXN`;

    // Honeymoon Financial Target Progress Bar
    const honeymoonGoal = currentData.honeymoonGoal || 150000;
    const percentAchieved = Math.min(100, Math.round((totalApproved / honeymoonGoal) * 100));
    const remaining = Math.max(0, honeymoonGoal - totalApproved);

    const collectedHero = document.getElementById('financeCollectedHero');
    const goalHero = document.getElementById('financeGoalHero');
    const percentBadge = document.getElementById('financeGoalPercentBadge');
    const progressBar = document.getElementById('financeGoalProgressBar');
    const remainingEl = document.getElementById('financeGoalRemaining');
    const avgPaxEl = document.getElementById('financeGoalAveragePax');

    if (collectedHero) collectedHero.innerText = `$${totalApproved.toLocaleString('es-MX')} MXN`;
    if (goalHero) goalHero.innerText = `$${honeymoonGoal.toLocaleString('es-MX')} MXN`;
    if (percentBadge) percentBadge.innerText = `${percentAchieved}% Alcanzado`;
    if (progressBar) progressBar.style.width = `${percentAchieved}%`;
    if (remainingEl) remainingEl.innerText = remaining > 0 ? `Faltan $${remaining.toLocaleString('es-MX')} MXN para completar la meta` : `🎉 ¡Meta 100% completada!`;
    if (avgPaxEl) avgPaxEl.innerText = `Promedio por aportación: $${avg.toLocaleString('es-MX')} MXN`;

    // Filter by Search Query
    const searchLower = (currentFinanceSearch || '').toLowerCase().trim();
    const filterMatches = (v) => {
        if (!searchLower) return true;
        const donor = (v.donor || '').toLowerCase();
        const concept = (v.concept || '').toLowerCase();
        const folio = (v.folio || v.id || '').toLowerCase();
        const bank = (v.bank || '').toLowerCase();
        return donor.includes(searchLower) || concept.includes(searchLower) || folio.includes(searchLower) || bank.includes(searchLower);
    };

    const pendingFiltered = pending.filter(filterMatches);
    const approvedFiltered = approved.filter(filterMatches);

    // Apply Filter Pill States (Show/Hide columns if requested or filter lists)
    const pendingList = document.getElementById('pendingVouchersList');
    const approvedList = document.getElementById('approvedVouchersList');

    if (pendingList) {
        pendingList.innerHTML = '';
        if (activeFinanceFilter === 'approved') {
            pendingList.innerHTML = '<div class="empty-state-card" style="padding:15px; font-size:0.82rem; color:#64748b;">Filtro activo: solo confirmados</div>';
        } else if (pendingFiltered.length === 0) {
            pendingList.innerHTML = `
                <div class="empty-state-card" style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:24px; text-align:center; color:#166534;">
                    <div style="font-size:2rem; margin-bottom:6px;">🎉</div>
                    <strong style="display:block; font-size:0.95rem;">¡Bandeja de comprobantes al día!</strong>
                    <span style="font-size:0.8rem; color:#15803d;">No hay comprobantes pendientes por auditar en este momento.</span>
                </div>
            `;
        } else {
            pendingFiltered.forEach(v => {
                const card = document.createElement('div');
                card.className = 'voucher-luxury-card pending';
                card.innerHTML = `
                    <div class="voucher-card-top">
                        <div class="voucher-donor-info">
                            <span class="voucher-donor-tag">⏳ REQUIERE VALIDACIÓN BANCARIA</span>
                            <h4 class="voucher-donor-name">${escapeHtml(v.donor)}</h4>
                            <div class="voucher-concept-pill">🎁 ${escapeHtml(v.concept || 'Mesa de Regalos')}</div>
                            <div style="font-size:0.75rem; color:#64748b; margin-top:6px; display:flex; gap:12px; flex-wrap:wrap;">
                                <span>📅 ${escapeHtml(v.date || 'Reciente')}</span>
                                <span>🏦 ${escapeHtml(v.bank || 'SPEI Bancario')}</span>
                                ${v.folio ? `<span>🔖 Folio: <code>${escapeHtml(v.folio)}</code></span>` : ''}
                            </div>
                            ${v.message ? `<p style="font-size:0.76rem; font-style:italic; color:#475569; margin:6px 0 0; background:#f8fafc; padding:6px 10px; border-radius:6px; border-left:3px solid #cbd5e1;">"${escapeHtml(v.message)}"</p>` : ''}
                        </div>
                        <div class="voucher-amount-display">
                            <span class="voucher-currency">MXN</span>
                            <div class="voucher-amount-number">$${(Number(v.amount) || 0).toLocaleString('es-MX')}</div>
                        </div>
                    </div>

                    <div class="voucher-proof-row" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                        <button type="button" class="btn-view-proof" onclick="openProofViewerModal('${v.id}')" style="background:none; border:none; cursor:pointer; padding:0;">
                            <span>📄 Auditar Comprobante / Voucher SPEI</span> 🔍
                        </button>
                        ${v.phone ? `<span style="font-size:0.72rem; color:#64748b;">📱 ${escapeHtml(v.phone)}</span>` : ''}
                    </div>

                    <div class="voucher-actions-row">
                        <button class="btn-voucher-approve" onclick="approveVoucher('${v.id}')" title="Confirmar recepción de fondos">
                            <span>✓ Validar &amp; Conciliar Fondos</span>
                        </button>
                        <button class="btn-voucher-reject" onclick="rejectVoucher('${v.id}')" title="Rechazar y remover de la bandeja">
                            <span>✕ Rechazar</span>
                        </button>
                    </div>
                `;
                pendingList.appendChild(card);
            });
        }
    }

    if (approvedList) {
        approvedList.innerHTML = '';
        if (activeFinanceFilter === 'pending') {
            approvedList.innerHTML = '<div class="empty-state-card" style="padding:15px; font-size:0.82rem; color:#64748b;">Filtro activo: solo pendientes</div>';
        } else if (approvedFiltered.length === 0) {
            approvedList.innerHTML = '<div class="empty-state-card" style="padding:20px; text-align:center; color:#64748b; font-size:0.85rem;">No se encontraron aportaciones aprobadas con el criterio de búsqueda.</div>';
        } else {
            approvedFiltered.forEach(v => {
                const card = document.createElement('div');
                card.className = 'voucher-luxury-card approved';
                card.innerHTML = `
                    <div class="voucher-card-top">
                        <div class="voucher-donor-info">
                            <span class="voucher-donor-tag" style="color:#10b981;">✓ FONDOS ACREDITADOS EN BANCO</span>
                            <h4 class="voucher-donor-name">${escapeHtml(v.donor)}</h4>
                            <div class="voucher-concept-pill">🎁 ${escapeHtml(v.concept || 'Mesa de Regalos')} · ${escapeHtml(v.date || '')}</div>
                            <div style="font-size:0.75rem; color:#64748b; margin-top:4px;">
                                <span>🏦 ${escapeHtml(v.bank || 'SPEI')}</span>
                                ${v.folio ? ` · Folio: <code>${escapeHtml(v.folio)}</code>` : ''}
                            </div>
                            ${v.message ? `<p style="font-size:0.76rem; font-style:italic; color:#475569; margin:6px 0 0; background:#f0fdf4; padding:6px 10px; border-radius:6px; border-left:3px solid #10b981;">"${escapeHtml(v.message)}"</p>` : ''}
                        </div>
                        <div class="voucher-amount-display">
                            <div class="voucher-amount-number" style="color:#10b981;">+$${(Number(v.amount) || 0).toLocaleString('es-MX')}</div>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:10px; padding-top:10px; border-top:1px solid #f1f5f9;">
                        <div class="voucher-approved-status" style="margin:0; padding:4px 8px; font-size:0.72rem;">
                            <span>✓ Conciliado en Contabilidad</span>
                        </div>
                        <div style="display:flex; gap:6px;">
                            <button type="button" class="btn-voucher-whatsapp" onclick="sendThankYouWhatsApp('${v.id}')" title="Enviar mensaje de agradecimiento personalizado por WhatsApp">
                                💬 Agradecer por WhatsApp
                            </button>
                            <button type="button" onclick="openProofViewerModal('${v.id}')" style="background:#f8fafc; border:1px solid #cbd5e1; padding:6px 10px; border-radius:6px; font-size:0.75rem; cursor:pointer; font-weight:600; color:#475569;">
                                🔍 Ver Voucher
                            </button>
                        </div>
                    </div>
                `;
                approvedList.appendChild(card);
            });
        }
    }
}

/**
 * Filter Pill Switching
 */
function setFinanceFilter(filter) {
    activeFinanceFilter = filter;
    document.querySelectorAll('.finance-filter-pill').forEach(btn => btn.classList.remove('active'));
    if (filter === 'all') {
        const el = document.getElementById('filterPillAll');
        if (el) el.classList.add('active');
    } else if (filter === 'pending') {
        const el = document.getElementById('filterPillPending');
        if (el) el.classList.add('active');
    } else if (filter === 'approved') {
        const el = document.getElementById('filterPillApproved');
        if (el) el.classList.add('active');
    }
    renderFinanceTab();
}

/**
 * Search Input Handler
 */
function handleFinanceSearch(query) {
    currentFinanceSearch = query;
    renderFinanceTab();
}

/**
 * Open Modal: Simular Depósito de Prueba
 */
/**
 * Open Modal: Registrar Regalo / Depósito
 */
function showSimulateVoucherModal() {
    currentData = getWeddingState(currentWeddingId);
    const modal = document.getElementById('modalSimulateVoucher');
    if (!modal) {
        alert('Modal de registro no disponible.');
        return;
    }

    // Populate guest dropdown with ONLY CONFIRMED guests (status === 'confirmed')
    const guestSelect = document.getElementById('simVoucherGuestSelect');
    if (guestSelect) {
        guestSelect.innerHTML = '<option value="">-- Seleccionar invitado que confirmó asistencia --</option>';
        const allGuests = currentData.guests || [];
        const confirmedGuests = allGuests.filter(g => g.status === 'confirmed');

        // Sort alphabetically
        confirmedGuests.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        confirmedGuests.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.id;
            opt.dataset.name = g.name;
            opt.dataset.phone = g.phone || '';
            const companionInfo = g.companion ? ` + ${g.companion}` : '';
            opt.innerText = `${g.name}${companionInfo} (${g.passes} pax${g.tableId ? ' · Mesa ' + g.tableId : ''})`;
            guestSelect.appendChild(opt);
        });

        // If no confirmed guests yet, show informative fallback
        if (confirmedGuests.length === 0) {
            const opt = document.createElement('option');
            opt.value = "";
            opt.disabled = true;
            opt.innerText = "(No hay invitados con asistencia confirmada aún)";
            guestSelect.appendChild(opt);
        }
    }

    // Reset default form inputs
    const amountInput = document.getElementById('simVoucherAmount');
    const folioInput = document.getElementById('simVoucherFolio');
    const messageInput = document.getElementById('simVoucherMessage');

    if (amountInput) amountInput.value = '3500';
    if (folioInput) folioInput.value = 'SPEI-' + Math.floor(100000 + Math.random() * 900000);
    if (messageInput) messageInput.value = '¡Muchísimas felicidades en su boda! Que disfruten mucho la luna de miel.';

    modal.classList.add('show');
    modal.classList.add('active');
}

function closeSimulateVoucherModal() {
    const modal = document.getElementById('modalSimulateVoucher');
    if (modal) {
        modal.classList.remove('show');
        modal.classList.remove('active');
    }
}

/**
 * Handle form submit for registered gift/voucher
 */
function handleSimulateVoucherSubmit(e) {
    e.preventDefault();
    currentData = getWeddingState(currentWeddingId);

    const guestSelect = document.getElementById('simVoucherGuestSelect');
    const selectedGuestId = guestSelect?.value;
    
    if (!selectedGuestId) {
        alert('Por favor selecciona un invitado confirmado de la lista.');
        return;
    }

    const guest = (currentData.guests || []).find(g => g.id === selectedGuestId);
    const donor = guest ? (guest.name + (guest.companion ? ` & ${guest.companion}` : '')) : 'Invitado Confirmado';
    const phone = guest ? (guest.phone || '') : '';

    const amount = Number(document.getElementById('simVoucherAmount')?.value) || 1000;
    const bank = document.getElementById('simVoucherBank')?.value || 'Transferencia SPEI (Interbancaria)';
    const concept = document.getElementById('simVoucherConcept')?.value || 'Fondo de Luna de Miel';
    const folio = (document.getElementById('simVoucherFolio')?.value || ('SPEI-' + Math.floor(100000 + Math.random() * 900000))).trim();
    const message = (document.getElementById('simVoucherMessage')?.value || '').trim();

    const initialStatusRadio = document.querySelector('input[name="simVoucherInitialStatus"]:checked');
    const status = initialStatusRadio ? initialStatusRadio.value : 'pending';

    const sampleImages = [
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400",
        "https://images.unsplash.com/photo-1554224154-26032ffc0d07?q=80&w=400",
        "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=400"
    ];
    const proofImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];

    const now = new Date();
    const dateFormatted = `${now.getDate()} ${['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][now.getMonth()]} ${now.getFullYear()}`;

    const newVoucher = {
        id: 'v_' + Date.now(),
        donor,
        phone,
        amount,
        bank,
        concept,
        folio,
        message,
        status,
        date: dateFormatted,
        proofImg
    };

    if (!Array.isArray(currentData.vouchers)) {
        currentData.vouchers = [];
    }

    currentData.vouchers.unshift(newVoucher);
    saveWeddingState(currentWeddingId, currentData);

    closeSimulateVoucherModal();
    renderFinanceTab();
    if (typeof renderDashboard === 'function') renderDashboard();

    showToast(`✅ Regalo de $${amount.toLocaleString('es-MX')} MXN registrado para ${donor}.`);
}

/**
 * Open Proof Lightbox Viewer Modal
 */
function openProofViewerModal(voucherId) {
    currentData = getWeddingState(currentWeddingId);
    const voucher = (currentData.vouchers || []).find(v => v.id === voucherId);
    if (!voucher) return;

    const modal = document.getElementById('modalViewProofViewer');
    const detailsCard = document.getElementById('proofViewerDetailsCard');
    const imgEl = document.getElementById('proofViewerImg');
    const footerActions = document.getElementById('proofViewerFooterActions');

    if (!modal) return;

    if (imgEl) {
        imgEl.src = voucher.proofImg || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400';
    }

    if (detailsCard) {
        const isApproved = voucher.status === 'approved';
        detailsCard.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <div>
                    <span style="font-size:0.75rem; font-weight:800; color:${isApproved ? '#10b981' : '#d97706'}; letter-spacing:0.05em; text-transform:uppercase;">
                        ${isApproved ? '✓ FONDOS CONCILIADOS' : '⏳ PENDIENTE DE VALIDACIÓN'}
                    </span>
                    <h3 style="margin:2px 0 0; font-size:1.25rem; color:#0f172a; font-weight:800;">${escapeHtml(voucher.donor)}</h3>
                    <p style="margin:2px 0 0; font-size:0.8rem; color:#64748b;">${escapeHtml(voucher.concept || 'Mesa de Regalos')} · ${escapeHtml(voucher.date || '')}</p>
                </div>
                <div style="text-align:right;">
                    <span style="font-size:0.7rem; color:#64748b; font-weight:700;">MONTO VERIFICABLE</span>
                    <div style="font-size:1.5rem; font-weight:900; color:#0f172a;">$${(Number(voucher.amount) || 0).toLocaleString('es-MX')} MXN</div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; background:#f8fafc; padding:10px 14px; border-radius:8px; font-size:0.78rem; border:1px solid #e2e8f0;">
                <div><strong>Banco Emisor:</strong> ${escapeHtml(voucher.bank || 'SPEI Bancario')}</div>
                <div><strong>Clave de Rastreo:</strong> <code>${escapeHtml(voucher.folio || voucher.id)}</code></div>
                <div><strong>Contacto:</strong> ${voucher.phone ? escapeHtml(voucher.phone) : 'Sin teléfono'}</div>
                <div><strong>Estado en Banco:</strong> ${isApproved ? '<span style="color:#10b981; font-weight:700;">Acreditado</span>' : '<span style="color:#d97706; font-weight:700;">Por Auditar</span>'}</div>
            </div>

            ${voucher.message ? `
                <div style="margin-top:10px; padding:10px 12px; background:#fffbeb; border:1px solid #fef3c7; border-radius:8px; font-size:0.8rem; color:#92400e;">
                    <strong>Dedicatoria del Donante:</strong> "${escapeHtml(voucher.message)}"
                </div>
            ` : ''}
        `;
    }

    if (footerActions) {
        if (voucher.status === 'pending') {
            footerActions.innerHTML = `
                <button type="button" class="btn-action secondary" onclick="closeProofViewerModal()">Cerrar</button>
                <div style="display:flex; gap:8px;">
                    <button type="button" class="btn-voucher-reject" onclick="rejectVoucher('${voucher.id}'); closeProofViewerModal();">✕ Rechazar Comprobante</button>
                    <button type="button" class="btn-voucher-approve" onclick="approveVoucher('${voucher.id}'); closeProofViewerModal();" style="padding:10px 18px;">✓ Validar &amp; Conciliar Fondos</button>
                </div>
            `;
        } else {
            footerActions.innerHTML = `
                <button type="button" class="btn-action secondary" onclick="closeProofViewerModal()">Cerrar</button>
                <div style="display:flex; gap:8px;">
                    <button type="button" class="btn-voucher-whatsapp" onclick="sendThankYouWhatsApp('${voucher.id}')">💬 Agradecer por WhatsApp</button>
                    <a href="${voucher.proofImg}" target="_blank" class="btn-action primary" style="text-decoration:none; display:inline-flex; align-items:center; gap:6px; background:#0f172a; border-color:#0f172a;">Descargar Imagen Original ↗</a>
                </div>
            `;
        }
    }

    modal.classList.add('show');
    modal.classList.add('active');
}

function closeProofViewerModal() {
    const modal = document.getElementById('modalViewProofViewer');
    if (modal) {
        modal.classList.remove('show');
        modal.classList.remove('active');
    }
}

/**
 * Approve a voucher and synchronize accounting + CRM
 */
function approveVoucher(voucherId) {
    currentData = getWeddingState(currentWeddingId);
    const v = (currentData.vouchers || []).find(item => item.id === voucherId);
    if (!v) return;

    v.status = 'approved';
    saveWeddingState(currentWeddingId, currentData);

    renderFinanceTab();
    if (typeof renderDashboard === 'function') renderDashboard();

    showToast(`🎉 ¡Depósito de $${(Number(v.amount) || 0).toLocaleString('es-MX')} MXN de ${v.donor} APROBADO y conciliado en banco!`);
}

/**
 * Reject / remove a voucher
 */
function rejectVoucher(voucherId) {
    currentData = getWeddingState(currentWeddingId);
    const v = (currentData.vouchers || []).find(item => item.id === voucherId);
    if (!v) return;

    if (confirm(`¿Estás segura de rechazar el comprobante bancario de ${v.donor} por $${v.amount.toLocaleString('es-MX')} MXN?\n\nEsta acción no se puede deshacer.`)) {
        currentData.vouchers = currentData.vouchers.filter(item => item.id !== voucherId);
        saveWeddingState(currentWeddingId, currentData);

        renderFinanceTab();
        if (typeof renderDashboard === 'function') renderDashboard();

        showToast(`Comprobante de ${v.donor} rechazado.`);
    }
}

/**
 * Send customized WhatsApp Thank-You message to donor
 */
function sendThankYouWhatsApp(voucherId) {
    currentData = getWeddingState(currentWeddingId);
    const v = (currentData.vouchers || []).find(item => item.id === voucherId);
    if (!v) return;

    const coupleNames = currentData.coupleNames || 'Los Novios';
    const amountStr = `$${(Number(v.amount) || 0).toLocaleString('es-MX')} MXN`;
    const conceptStr = v.concept || 'nuestro Fondo de Luna de Miel';

    const text = `¡Hola ${v.donor}! ✨\n\nQueremos darte las gracias de todo corazón por tu increíble detalle y aportación de ${amountStr} para ${conceptStr}.\n\nTu cariño y apoyo significan muchísimo para nosotros en esta nueva etapa que estamos comenzando. ¡Nos vemos muy pronto para celebrar juntos!\n\nCon mucho cariño,\n${coupleNames} 💍🤍`;

    // Clean phone number or prompt
    let cleanPhone = (v.phone || '').replace(/\D/g, '');
    if (!cleanPhone) {
        const inputPhone = prompt(`Por favor ingresa el número de WhatsApp con clave de país de ${v.donor} (ej. 5218112345678):`);
        if (!inputPhone) return;
        cleanPhone = inputPhone.replace(/\D/g, '');
        v.phone = inputPhone;
        saveWeddingState(currentWeddingId, currentData);
    }

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    showToast(`Abriendo WhatsApp para agradecer a ${v.donor}...`);
}

/**
 * Export vouchers ledger to Excel / CSV format
 */
function exportVouchersToCSV() {
    currentData = getWeddingState(currentWeddingId);
    const vouchers = currentData.vouchers || [];

    if (vouchers.length === 0) {
        alert('No hay comprobantes o aportaciones registradas para exportar.');
        return;
    }

    const headers = [
        'ID Comprobante',
        'Donante / Invitado',
        'Teléfono',
        'Monto ($ MXN)',
        'Concepto / Mesa de Regalos',
        'Banco Emisor',
        'Folio / CEP Banxico',
        'Fecha',
        'Estado Contable',
        'Mensaje'
    ];

    const escapeCSV = (str) => {
        if (str === null || str === undefined) return '""';
        const s = String(str).replace(/"/g, '""');
        return `"${s}"`;
    };

    const rows = vouchers.map(v => [
        escapeCSV(v.id),
        escapeCSV(v.donor),
        escapeCSV(v.phone || ''),
        v.amount || 0,
        escapeCSV(v.concept || 'Mesa de Regalos'),
        escapeCSV(v.bank || 'SPEI'),
        escapeCSV(v.folio || v.id),
        escapeCSV(v.date || ''),
        escapeCSV(v.status === 'approved' ? 'Aprobado / Conciliado' : 'Pendiente Auditoría'),
        escapeCSV(v.message || '')
    ]);

    const csvContent = '\uFEFF' + [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const safeTitle = (currentData.coupleNames || 'Boda').replace(/[^a-zA-Z0-9]/g, '_');
    link.setAttribute('href', url);
    link.setAttribute('download', `Corte_Mesa_Regalos_${safeTitle}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('📊 Archivo CSV descargado con éxito.');
}

/**
 * Helper to copy CLABE to clipboard
 */
function copyClabeToClipboard(clabe) {
    const textToCopy = clabe || '012180015482938472';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('📋 ¡CLABE copiada al portapapeles! Lista para pegar en la app de tu banco.');
        }).catch(() => {
            fallbackCopyText(textToCopy);
        });
    } else {
        fallbackCopyText(textToCopy);
    }
}

function fallbackCopyText(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast('📋 ¡CLABE copiada al portapapeles!');
}

/**
 * Share bank transfer details via WhatsApp
 */
function shareBankDetailsWhatsApp() {
    currentData = getWeddingState(currentWeddingId);
    const coupleNames = currentData?.coupleNames || 'Sofía & Alejandro';
    const text = `¡Hola! 💍 Con mucho cariño les compartimos los datos de nuestra cuenta para la Mesa de Regalos / Luna de Miel de ${coupleNames}:\n\n🏦 Banco: BBVA México\nBeneficiarios: ${coupleNames}\n💳 CLABE: 012 180 0154829384 72\n💡 Concepto sugerido: Tu nombre o familia (para saber a quién agradecerle de corazón)\n\n¡Muchas gracias por su cariño y por acompañarnos! ✨`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
}

/**
 * Helper to escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ==========================================================================
// FASE 2: DESTINATION WEDDING REVENUE & TAX BREAKDOWN (SAT / HACIENDA)
// ==========================================================================
let activeFinanceSubtab = 'gifts';

function switchFinanceSubtab(tabName) {
    if (typeof activeRole !== 'undefined' && activeRole === 'couple' && tabName === 'destination') {
        if (typeof showToast === 'function') {
            showToast('🔒 Esta sección contable y fiscal es exclusiva de tu Wedding Planner.');
        }
        tabName = 'gifts';
    }
    activeFinanceSubtab = tabName;
    const viewGifts = document.getElementById('subviewFinanceGifts');
    const viewDest = document.getElementById('subviewFinanceDestination');
    const btnGifts = document.getElementById('btnSubtabGifts');
    const btnDest = document.getElementById('btnSubtabDestination');

    if (tabName === 'destination') {
        if (viewGifts) viewGifts.style.display = 'none';
        if (viewDest) viewDest.style.display = 'block';
        if (btnGifts) {
            btnGifts.style.background = '#ffffff';
            btnGifts.style.color = '#0f172a';
            btnGifts.style.border = '1px solid #cbd5e1';
        }
        if (btnDest) {
            btnDest.style.background = '#0f172a';
            btnDest.style.color = '#ffffff';
            btnDest.style.border = 'none';
        }
        renderDestinationPaymentsSuite();
    } else {
        if (viewGifts) viewGifts.style.display = 'block';
        if (viewDest) viewDest.style.display = 'none';
        if (btnGifts) {
            btnGifts.style.background = '#0f172a';
            btnGifts.style.color = '#ffffff';
            btnGifts.style.border = 'none';
        }
        if (btnDest) {
            btnDest.style.background = '#ffffff';
            btnDest.style.color = '#0f172a';
            btnDest.style.border = '1px solid #cbd5e1';
        }
    }
}

function renderDestinationPaymentsSuite() {
    currentData = getWeddingState(currentWeddingId);
    if (!currentData) {
        const destTbody = document.getElementById('destPaymentsTableBody');
        if (destTbody) {
            destTbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#64748b;">No hay boda seleccionada</td></tr>';
        }
        const setZero = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        setZero('destTotalPax', '0');
        setZero('destTotalProjected', '$0 MXN');
        setZero('destTotalCollected', '$0 MXN');
        setZero('destTotalPending', '$0 MXN');
        setZero('destComplianceRate', '0%');
        return;
    }

    // Toggle Planner Fiscal View vs Couple Clean View
    const isCouple = (typeof activeRole !== 'undefined' && activeRole === 'couple');
    const plannerFiscalSec = document.getElementById('destPlannerFiscalSection');
    const coupleBannerSec = document.getElementById('destCoupleBannerSection');
    if (plannerFiscalSec) plannerFiscalSec.style.display = isCouple ? 'none' : 'block';
    if (coupleBannerSec) coupleBannerSec.style.display = isCouple ? 'block' : 'none';

    // Subtab button label update for couple
    const btnDest = document.getElementById('btnSubtabDestination');
    if (btnDest) {
        btnDest.innerHTML = isCouple 
            ? '🏖️ Bitácora de Estancia de Invitados' 
            : '🏖️ Control de Pagos de Estancia & Hacienda/SAT';
    }

    const guests = currentData.guests || [];
    const costPerPerson = Number(currentData.guestCost) || 20000;
    const confirmedGuests = guests.filter(g => g.status === 'confirmed');

    // 1. Calculate totals
    let totalPax = 0;
    let totalProjected = 0;
    let totalCollected = 0;

    confirmedGuests.forEach(g => {
        const passes = g.passes || 1;
        totalPax += passes;
        const required = passes * costPerPerson;
        totalProjected += required;

        const paid = Number(g.destinationPaid) || (g.passes > 1 ? 20000 : 10000);
        totalCollected += Math.min(required, paid);
    });

    const totalPending = Math.max(0, totalProjected - totalCollected);
    const collectedPct = totalProjected > 0 ? Math.min(100, Math.round((totalCollected / totalProjected) * 100)) : 0;

    // 2. Financial & Tax Breakdown Formula (SAT / Hacienda)
    // Supuesto de mercado para Bodas Destino:
    // - Costo directo del Resort/Hospedaje: 82.5% del paquete (Gasto por cuenta de terceros)
    // - Fee de Coordinación de la Wedding Planner: 17.5% del paquete (Ingreso acumulable de la Agencia)
    // - Proyección Fiscal: IVA Trasladado (16% sobre Fee) + ISR Estimado (ej. 2.5% RESICO o 10% régimen gral) = aprox ~20% sobre Fee
    const resortShare = 0.825;
    const plannerShare = 0.175;

    const estimatedResortCost = Math.round(totalProjected * resortShare);
    const estimatedPlannerFee = Math.round(totalProjected * plannerShare);
    const estimatedSatTaxes = Math.round(estimatedPlannerFee * 0.185); // IVA 16% + ISR estimado sobre la ganancia

    // 3. Update DOM KPIs
    const elProj = document.getElementById('kpiDestTotalProjected');
    const elPaxHint = document.getElementById('kpiDestPaxHint');
    const elResort = document.getElementById('kpiDestResortCost');
    const elFee = document.getElementById('kpiDestPlannerFee');
    const elSat = document.getElementById('kpiDestSatTaxes');

    if (elProj) elProj.innerText = `$${totalProjected.toLocaleString('es-MX')} MXN`;
    if (elPaxHint) elPaxHint.innerText = `${totalPax} pases confirmados · $${costPerPerson.toLocaleString('es-MX')} c/u`;
    if (elResort) elResort.innerText = `$${estimatedResortCost.toLocaleString('es-MX')} MXN`;
    if (elFee) elFee.innerText = `$${estimatedPlannerFee.toLocaleString('es-MX')} MXN`;
    if (elSat) elSat.innerText = `$${estimatedSatTaxes.toLocaleString('es-MX')} MXN`;

    // 4. Progress bar updates
    const elBar = document.getElementById('destPaymentProgressBar');
    const elBadge = document.getElementById('destPaymentProgressBadge');
    const elProgText = document.getElementById('destPaymentProgressText');
    const elSummaryCollected = document.getElementById('destPaymentCollectedSummary');
    const elSummaryPending = document.getElementById('destPaymentPendingSummary');

    if (elBar) elBar.style.width = `${collectedPct}%`;
    if (elBadge) elBadge.innerText = `${collectedPct}% Cobrado`;
    if (elProgText) elProgText.innerText = `Límite de Liquidación: ${currentData.deadlineMonth || 'Julio 2027'}`;
    if (elSummaryCollected) elSummaryCollected.innerHTML = `Cobrado: <strong style="color:#059669;">$${totalCollected.toLocaleString('es-MX')} MXN</strong>`;
    if (elSummaryPending) elSummaryPending.innerHTML = `Por cobrar: <strong style="color:#b91c1c;">$${totalPending.toLocaleString('es-MX')} MXN</strong>`;

    // 5. Render Table Rows
    const tbody = document.getElementById('destPaymentsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (confirmedGuests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:#64748b;">No hay invitados confirmados aún en esta boda.</td></tr>`;
        return;
    }

    confirmedGuests.forEach(g => {
        const passes = g.passes || 1;
        const required = passes * costPerPerson;
        const paid = Number(g.destinationPaid) || (passes > 1 ? 20000 : 10000);
        const remaining = Math.max(0, required - paid);
        const pct = Math.min(100, Math.round((paid / required) * 100));
        const isLiquidated = paid >= required;

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #f1f5f9';
        tr.innerHTML = `
            <td style="padding:12px 14px;">
                <strong>${escapeHtml(g.name)}</strong>
                ${passes > 1 && g.companion ? `<div style="font-size:0.75rem; color:#64748b;">👤 ${escapeHtml(g.companion)}</div>` : ''}
            </td>
            <td style="padding:12px 14px;"><span style="font-weight:700;">${passes} pax</span></td>
            <td style="padding:12px 14px;"><strong style="color:#0f172a;">$${required.toLocaleString('es-MX')}</strong></td>
            <td style="padding:12px 14px;"><span style="font-weight:800; color:#059669;">$${paid.toLocaleString('es-MX')}</span></td>
            <td style="padding:12px 14px;"><span style="font-weight:700; color:${remaining > 0 ? '#dc2626' : '#16a34a'};">$${remaining.toLocaleString('es-MX')}</span></td>
            <td style="padding:12px 14px; min-width:110px;">
                <div style="background:#e2e8f0; height:6px; border-radius:99px; overflow:hidden; margin-bottom:3px;">
                    <div style="background:${isLiquidated ? '#10b981' : '#f59e0b'}; width:${pct}%; height:100%;"></div>
                </div>
                <small style="font-weight:700; font-size:0.7rem; color:${isLiquidated ? '#15803d' : '#b45309'};">${pct}% (${isLiquidated ? 'Liquidado' : 'Abonando'})</small>
            </td>
            <td style="padding:12px 14px;">
                <span style="background:#eff6ff; color:#1d4ed8; padding:3px 8px; border-radius:6px; font-size:0.72rem; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                    📄 Recibo SPEI #${g.id.replace('g', '00')}
                </span>
            </td>
            <td style="padding:12px 14px; text-align:right; white-space:nowrap;">
                <button type="button" class="btn-sm-action" style="background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; padding:4px 9px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer; margin-right:4px;" onclick="openGuestPaymentPortalModal('${g.id}')" title="Ver portal como el invitado">
                    👁️ Ver Portal
                </button>
                ${typeof activeRole !== 'undefined' && activeRole === 'couple' ? `
                <button type="button" class="btn-sm-action" style="background:#0f172a; color:#fff; border:none; padding:4px 9px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer;" onclick="quickAddAbono('${g.id}', ${costPerPerson})" title="Registrar abono manual a nombre del invitado">
                    + Abonar
                </button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openSimulateDestinationPaymentModal(guestId) {
    currentData = getWeddingState(currentWeddingId);
    if (!currentData) return;

    const modal = document.getElementById('modalSimulateDestPayment');
    const select = document.getElementById('destPayGuestSelect');
    if (!modal || !select) return;

    const confirmedGuests = (currentData.guests || []).filter(g => g.status === 'confirmed');
    select.innerHTML = confirmedGuests.map(g => `<option value="${g.id}">${g.name} (${g.passes} pase${g.passes > 1 ? 's' : ''})</option>`).join('');

    if (guestId) {
        select.value = guestId;
    }

    const dateInput = document.getElementById('destPayDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().substring(0, 10);
    }

    handleDestPaymentGuestChange(select.value);

    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeSimulateDestinationPaymentModal() {
    const modal = document.getElementById('modalSimulateDestPayment');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function handleDestPaymentGuestChange(guestId) {
    currentData = getWeddingState(currentWeddingId);
    if (!currentData) return;

    const guest = (currentData.guests || []).find(g => g.id === guestId);
    const feedback = document.getElementById('destPayFeedbackSummary');
    const amountInput = document.getElementById('destPayAmount');
    if (!guest || !feedback) return;

    const costPerPerson = Number(currentData.guestCost) || 20000;
    const required = (guest.passes || 1) * costPerPerson;
    const paid = Number(guest.destinationPaid) || (guest.passes > 1 ? 20000 : 10000);
    const remaining = Math.max(0, required - paid);

    feedback.innerHTML = `
        <strong>Resumen de Estancia para ${escapeHtml(guest.name)}:</strong><br>
        • Total paquete (${guest.passes} pax): <strong>$${required.toLocaleString('es-MX')} MXN</strong><br>
        • Pagado a la fecha: <strong>$${paid.toLocaleString('es-MX')} MXN</strong><br>
        • Saldo pendiente: <strong style="color:${remaining > 0 ? '#b91c1c' : '#15803d'};">$${remaining.toLocaleString('es-MX')} MXN</strong>
    `;

    if (amountInput && (!amountInput.value || Number(amountInput.value) <= 0)) {
        amountInput.value = remaining > 0 ? Math.min(remaining, 5000) : 0;
    }
}

function quickAddAbono(guestId, costPerPerson) {
    openSimulateDestinationPaymentModal(guestId);
}

function handleSaveDestinationPayment(e) {
    e.preventDefault();
    currentData = getWeddingState(currentWeddingId);
    if (!currentData) return;

    const guestId = document.getElementById('destPayGuestSelect').value;
    const amount = parseFloat(document.getElementById('destPayAmount').value) || 0;
    const date = document.getElementById('destPayDate').value;
    const bank = (document.getElementById('destPayBank').value || 'BBVA').trim();
    const folio = (document.getElementById('destPayFolio').value || 'SPEI-' + Date.now().toString().slice(-6)).trim();

    const guest = (currentData.guests || []).find(g => g.id === guestId);
    if (!guest) return;

    const currentPaid = Number(guest.destinationPaid) || (guest.passes > 1 ? 20000 : 10000);
    guest.destinationPaid = currentPaid + amount;

    // Log in audit log
    if (!currentData.auditLogs) currentData.auditLogs = [];
    currentData.auditLogs.unshift({
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: "Lead Wedding Planner",
        role: "planner",
        action: `Abono de Estancia: +$${amount.toLocaleString('es-MX')} MXN para ${guest.name}. Folio: ${folio}. Nuevo acumulado: $${guest.destinationPaid.toLocaleString('es-MX')}.`,
        ip: "187.190.24.11"
    });

    saveWeddingState(currentWeddingId, currentData);
    closeSimulateDestinationPaymentModal();
    renderDestinationPaymentsSuite();
    if (typeof renderGuestTable === 'function') renderGuestTable();

    showToast(`🏖️ ¡Abono de $${amount.toLocaleString('es-MX')} MXN acreditado a "${guest.name}"!`);
}

// ==========================================================================
// FASE 3: PORTAL DE PAGOS EXCLUSIVO PARA EL INVITADO (VISTA DESDE LINK)
// ==========================================================================
let activeGuestPortalId = null;

function openGuestPaymentPortalModal(guestId) {
    currentData = getWeddingState(currentWeddingId);
    if (!currentData) return;

    activeGuestPortalId = guestId || (currentData.guests && currentData.guests[0] ? currentData.guests[0].id : 'g4');
    const guest = (currentData.guests || []).find(g => g.id === activeGuestPortalId) || {
        name: "Lic. Andrea Garza",
        passes: 2,
        destinationPaid: 20000
    };

    const modal = document.getElementById('modalGuestPaymentPortal');
    if (!modal) return;

    // 1. Couple & Venue details
    const coupleNameEl = document.getElementById('portalGuestCoupleName');
    const venueDateEl = document.getElementById('portalGuestVenueDate');
    if (coupleNameEl) coupleNameEl.innerText = currentData.couple || 'Sofía & Alejandro';
    if (venueDateEl) venueDateEl.innerText = `📍 ${currentData.venue || 'Finca Bell Recó'} · ${currentData.date || '24 de Octubre, 2027'}`;

    // 2. Guest personalized amounts & reservation metadata
    const costPerPerson = Number(currentData.guestCost) || 20000;
    const passes = guest.passes || 1;
    const totalCost = passes * costPerPerson;
    const paid = Number(guest.destinationPaid) || (passes > 1 ? 20000 : 10000);
    const remaining = Math.max(0, totalCost - paid);
    const paidPct = Math.min(100, Math.round((paid / totalCost) * 100));

    const nameDisplay = document.getElementById('portalGuestNameDisplay');
    const totalCostEl = document.getElementById('portalGuestTotalCost');
    const perPaxHint = document.getElementById('portalGuestPerPaxHint');
    const paidAmountEl = document.getElementById('portalGuestPaidAmount');
    const paidPctEl = document.getElementById('portalGuestPaidPercent');
    const remBalEl = document.getElementById('portalGuestRemainingBalance');
    const deadlineHint = document.getElementById('portalGuestDeadlineHint');

    if (nameDisplay) nameDisplay.innerText = guest.name;
    if (totalCostEl) totalCostEl.innerText = `$${totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    if (perPaxHint) perPaxHint.innerText = `${passes} persona${passes > 1 ? 's' : ''} x $${costPerPerson.toLocaleString('es-MX')}`;
    if (paidAmountEl) paidAmountEl.innerText = `$${paid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    if (paidPctEl) paidPctEl.innerText = `${paidPct}% liquidado en cuenta`;
    if (remBalEl) remBalEl.innerText = `$${remaining.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    if (deadlineHint) deadlineHint.innerText = `Límite: ${currentData.deadlineMonth || 'Julio 2027'}`;

    // Folio & Dates
    const folioEl = document.getElementById('portalGuestReservationFolio');
    if (folioEl) folioEl.innerText = (guest.id || '489247746248').replace('g', '48924774');

    // Room Passengers Breakdown
    const roomPaxList = document.getElementById('portalRoomGuestsList');
    if (roomPaxList) {
        if (passes > 1 && guest.companion) {
            roomPaxList.innerHTML = `
                <div><strong>1. Titular:</strong> ${escapeHtml(guest.name)}</div>
                <div style="color:#64748b;"><strong>2. Acompañante:</strong> ${escapeHtml(guest.companion)}</div>
            `;
        } else {
            roomPaxList.innerHTML = `<div><strong>1. Titular:</strong> ${escapeHtml(guest.name)} (1 Adulto)</div>`;
        }
    }
    const roomAmount = document.getElementById('portalRoomAmountDisplay');
    if (roomAmount) roomAmount.innerText = `$${totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

    // Populate Payment History Table
    const historyBody = document.getElementById('portalGuestPaymentsHistoryBody');
    if (historyBody) {
        if (!Array.isArray(guest.destinationHistory) || guest.destinationHistory.length === 0) {
            // Generar historial de muestra realista si no existe aún
            if (paid > 0) {
                guest.destinationHistory = [
                    {
                        date: '20/05/2026',
                        folio: 'SPEI-22845',
                        method: 'Transferencia bancaria SPEI',
                        amount: paid
                    }
                ];
            } else {
                guest.destinationHistory = [];
            }
        }

        if (guest.destinationHistory.length === 0) {
            historyBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:16px; color:#64748b;">Aún no se registran abonos en esta cuenta.</td></tr>`;
        } else {
            historyBody.innerHTML = guest.destinationHistory.map(item => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 14px; color:#334155;">${escapeHtml(item.date)}</td>
                    <td style="padding: 10px 14px; font-family: monospace; font-weight:700; color:#0f172a;">${escapeHtml(item.folio)}</td>
                    <td style="padding: 10px 14px; color:#64748b;">${escapeHtml(item.method)}</td>
                    <td style="padding: 10px 14px; text-align: right; font-weight: 800; color:#059669;">$${Number(item.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                </tr>
            `).join('');
        }
    }

    // Concept helper
    const conceptHelper = document.getElementById('portalSuggestedConcept');
    if (conceptHelper) {
        conceptHelper.innerText = `Boda ${currentData.couple || 'Alex & Sofia'} - ${guest.name}`;
    }

    // Set suggested input amount for remaining balance
    const inputAmount = document.getElementById('portalGuestInputAmount');
    if (inputAmount) {
        inputAmount.value = remaining > 0 ? (remaining >= 3000 ? 3000 : remaining) : 0;
    }

    // 3. Bank Account Info
    const bankName = document.getElementById('portalBankName');
    const beneficiaryName = document.getElementById('portalBeneficiaryName');
    const clabeNumber = document.getElementById('portalClabeNumber');

    if (bankName) bankName.innerText = currentData.bankName || 'BBVA México';
    if (beneficiaryName) beneficiaryName.innerText = currentData.beneficiary || 'Mariana Garza / Aura Weddings';
    if (clabeNumber) clabeNumber.innerText = currentData.clabe || '012180015899234410';

    modal.classList.add('active');
    modal.style.display = 'flex';
}

function handleGuestPortalReportPayment(e) {
    e.preventDefault();
    currentData = getWeddingState(currentWeddingId);
    const guest = (currentData.guests || []).find(g => g.id === activeGuestPortalId);
    if (!guest) return;

    const amount = Number(document.getElementById('portalGuestInputAmount')?.value) || 0;
    const fileInput = document.getElementById('portalGuestInputFile');
    const uploadedFileName = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0].name : '';

    if (amount <= 0) {
        alert('Por favor especifica el monto del abono.');
        return;
    }

    const now = new Date();
    const dateFormatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const generatedFolio = `ABN-${Date.now().toString().slice(-6)}`;

    if (!Array.isArray(guest.destinationHistory)) {
        guest.destinationHistory = [];
    }

    guest.destinationHistory.push({
        date: dateFormatted,
        folio: generatedFolio,
        method: 'Comprobante Transferencia',
        amount: amount,
        proofFileName: uploadedFileName || 'comprobante_bancario.jpg'
    });

    guest.destinationPaid = (Number(guest.destinationPaid) || 0) + amount;

    saveWeddingState(currentWeddingId, currentData);

    // Re-render views
    renderDestinationPaymentsSuite();
    openGuestPaymentPortalModal(guest.id);

    showToast(`🎉 ¡Abono de $${amount.toLocaleString('es-MX')} MXN registrado con éxito! Tu estado de cuenta ha sido actualizado.`);
}

function closeGuestPaymentPortalModal() {
    const modal = document.getElementById('modalGuestPaymentPortal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function copyPortalGuestClabe() {
    currentData = getWeddingState(currentWeddingId);
    const clabe = (currentData && currentData.clabe) ? currentData.clabe : '012180015899234410';
    if (navigator.clipboard) {
        navigator.clipboard.writeText(clabe).then(() => {
            showToast('📋 ¡CLABE copiada! Lista para transferir desde tu banca móvil.');
        });
    } else {
        showToast('CLABE: ' + clabe);
    }
}

function triggerGuestFriendlyDecline() {
    closeGuestPaymentPortalModal();
    // Redirect to Aura Wedding experience or trigger friendly decline modal
    if (typeof openDeclineRsvpModal === 'function' && activeGuestPortalId) {
        openDeclineRsvpModal(activeGuestPortalId);
    } else {
        const url = 'https://aura-wedding-experience.vercel.app';
        window.open(url, '_blank');
        showToast('💌 Redirigiendo a la confirmación de la boda...');
    }
}

