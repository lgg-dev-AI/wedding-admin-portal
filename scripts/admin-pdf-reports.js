// ==========================================================================
// EXECUTIVE PDF REPORT GENERATOR & LUXURY PRINTABLE REPORTS SUITE
// FOR PASEBODA & MASTER DEVELOPER CONSOLE
// ==========================================================================

function openLuxuryReportModal(modalTitleText, documentHtml) {
    const modal = document.getElementById('modalPDFPreview');
    const paper = document.getElementById('pdfDocumentPaper');
    if (!modal || !paper) return;

    const headerTitle = modal.querySelector('.modal-header h3');
    if (headerTitle && modalTitleText) {
        headerTitle.innerHTML = modalTitleText;
    }

    paper.innerHTML = documentHtml;
    modal.classList.add('show');
}

function generateAndPreviewPDF() {
    currentData = getWeddingState(currentWeddingId);
    const paper = document.getElementById('pdfDocumentPaper');
    if (!paper) return;

    // Financial KPIs
    const totalContracted = (currentData.vendors || []).reduce((s, v) => s + (v.contractTotal || 0), 0);
    const totalPaid = (currentData.vendors || []).reduce((s, v) => s + (v.paidTotal || 0), 0);
    const percentPaid = totalContracted > 0 ? Math.round((totalPaid / totalContracted) * 100) : 0;
    
    // RSVP stats
    const guests = currentData.guests || [];
    const confirmed = guests.filter(g => g.status === 'confirmed');
    const declined = guests.filter(g => g.status === 'declined');
    const pending = guests.filter(g => g.status !== 'confirmed' && g.status !== 'declined');
    const totalPasses = confirmed.reduce((s, g) => s + (g.passes || 1), 0);
    const targetGuests = currentData.targetGuests || 180;
    const rsvpPercent = Math.min(100, Math.round((totalPasses / targetGuests) * 100));

    // Dynamic Menu counts (accounting for both Guest 1 and Companion individually)
    let filete = 0, salmon = 0, risotto = 0;
    confirmed.forEach(g => {
        const passCount = g.passes || 1;
        const m1 = (g.guest1Menu || g.menu || 'filete').toLowerCase();
        if (m1.includes('filete')) filete++;
        else if (m1.includes('salmon') || m1.includes('salmón')) salmon++;
        else if (m1.includes('risotto')) risotto++;
        else filete++;

        if (passCount > 1) {
            const m2 = (g.companionMenu || (m1 === 'salmon' ? 'filete' : 'salmon')).toLowerCase();
            if (m2.includes('filete')) filete++;
            else if (m2.includes('salmon') || m2.includes('salmón')) salmon++;
            else if (m2.includes('risotto')) risotto++;
            else filete++;
        }
    });

    // Dynamic Allergies breakdown
    const allergyList = [];
    confirmed.forEach(g => {
        const a1 = g.guest1Allergies || g.allergies;
        if (a1 && a1.toLowerCase() !== 'ninguna' && a1.trim() !== '') {
            allergyList.push(`${g.name.split(' ')[0]}: ${a1}`);
        }
        if ((g.passes || 1) > 1) {
            const a2 = g.companionAllergies;
            if (a2 && a2.toLowerCase() !== 'ninguna' && a2.trim() !== '') {
                allergyList.push(`${(g.companion || 'Acomp').split(' ')[0]}: ${a2}`);
            }
        }
    });

    // Tables & Seating
    const tables = currentData.tables || [];
    const seatedCount = tables.reduce((sum, t) => sum + (t.guests ? t.guests.length : 0), 0);
    const unseatedCount = Math.max(0, confirmed.length - seatedCount);
    const seatedPercent = confirmed.length > 0 ? Math.min(100, Math.round((seatedCount / confirmed.length) * 100)) : 0;

    // Upcoming milestones
    const upcoming = (currentData.milestones || []).filter(m => m.status === 'pending').slice(0, 3);

    // Build Luxury Printable Document
    const html = `
        <div class="pdf-header-luxury">
            <div class="pdf-brand-top">
                <span class="pdf-badge-gold">INFORME EJECUTIVO QUINCENAL · TORRE DE CONTROL</span>
                <span class="pdf-date-issued">Emitido: ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
            <h1 class="pdf-wedding-title">${currentData.couple}</h1>
            <p class="pdf-wedding-meta">📍 ${currentData.venue} · Fecha de Boda: ${currentData.date}</p>
        </div>

        <!-- PLANNER EXECUTIVE NOTE -->
        <div class="pdf-planner-letter">
            <div class="pdf-letter-badge">💌 NOTA DE TU WEDDING PLANNER</div>
            <p class="pdf-letter-body">${currentData.plannerNote || 'Avanzamos de forma excelente con el cronograma. A continuación el desglose detallado de finanzas, pases de banquete y logística.'}</p>
        </div>

        <!-- 3-COLUMN EXECUTIVE METRICS -->
        <div class="pdf-grid-3">
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">RSVP &amp; Aforo Confirmado</span>
                <div class="pdf-stat-val" style="color:#059669;">${totalPasses} Pases (${rsvpPercent}%)</div>
                <div class="pdf-bar-wrap"><div class="pdf-bar-fill" style="width:${rsvpPercent}%;"></div></div>
                <small>${confirmed.length} familias asisten · ${declined.length} declinaron · ${pending.length} pendientes</small>
            </div>

            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Acomodo en Plano 2D</span>
                <div class="pdf-stat-val" style="color:#0284c7;">${tables.length} Mesas Activas</div>
                <div class="pdf-bar-wrap"><div class="pdf-bar-fill" style="width:${seatedPercent}%; background:#0284c7;"></div></div>
                <small>${seatedCount} comensales ubicados · <strong style="color:#d97706;">${unseatedCount} por sentar</strong></small>
            </div>

            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Presupuesto Pagado</span>
                <div class="pdf-stat-val">${percentPaid}% Liquidado</div>
                <div class="pdf-bar-wrap"><div class="pdf-bar-fill" style="width:${percentPaid}%;"></div></div>
                <small>$${totalPaid.toLocaleString('es-MX')} de $${totalContracted.toLocaleString('es-MX')} MXN</small>
            </div>
        </div>

        <!-- FINANCIAL MILESTONES TABLE -->
        <div class="pdf-section">
            <h3 class="pdf-section-heading">💳 Próximos Pagos a Proveedores (Vencimientos a 30 Días)</h3>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th>Proveedor / Concepto</th>
                        <th>Fecha Límite</th>
                        <th>Monto a Pagar</th>
                        <th>Banco &amp; CLABE Interbancaria</th>
                        <th class="no-print">Acción Directa</th>
                    </tr>
                </thead>
                <tbody>
                    ${upcoming.length > 0 ? upcoming.map(m => `
                        <tr>
                            <td><strong>${m.vendorName}</strong><br><small>${m.title}</small></td>
                            <td><span class="pdf-tag-urgent">⏰ ${m.dueDate}</span></td>
                            <td><strong>$${m.amount.toLocaleString('es-MX')} MXN</strong></td>
                            <td><code>${m.clabe || 'Consultar con Planner'}</code><br><small>${m.bank || ''}</small></td>
                            <td class="no-print">
                                <button class="btn-pdf-action" onclick="executeMagicApproval('${m.id}')">✓ Marcar Pagado</button>
                            </td>
                        </tr>
                    `).join('') : `
                        <tr>
                            <td colspan="5" style="text-align:center; padding:14px; color:#64748b;">No hay pagos pendientes urgentes en los próximos 30 días.</td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>

        <!-- CATERING & ALLERGIES BREAKDOWN -->
        <div class="pdf-section">
            <h3 class="pdf-section-heading">🍽️ Matriz de Banquete por Persona &amp; Alergias Críticas</h3>
            <div class="pdf-catering-row" style="flex-wrap:wrap;">
                <div class="pdf-dish-pill">🥩 Filete Mignon: <strong>${filete} comensales</strong></div>
                <div class="pdf-dish-pill">🐟 Salmón Rosé: <strong>${salmon} comensales</strong></div>
                <div class="pdf-dish-pill">🍄 Risotto Vegano: <strong>${risotto} comensales</strong></div>
            </div>
            <div class="pdf-allergy-alert" style="margin-top:12px;">
                <strong>⚠️ Alertas Médicas para Cocina y Capitán de Meseros (${allergyList.length} reportadas):</strong>
                <div style="margin-top:4px;">
                    ${allergyList.length > 0 
                        ? allergyList.map(a => `<span style="display:inline-block; background:#ffffff; border:1px solid #f87171; color:#991b1b; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:700; margin:3px 4px 3px 0;">🚨 ${a}</span>`).join('') 
                        : '<span style="color:#059669;">Sin restricciones médicas reportadas.</span>'}
                </div>
            </div>
        </div>

        <!-- PENDING APPROVALS (MAGIC LINKS) -->
        <div class="pdf-section no-print">
            <h3 class="pdf-section-heading">⚡ Acciones de 1 Clic para los Novios</h3>
            <div class="pdf-magic-actions">
                <div class="pdf-action-card">
                    <div>
                        <strong>Validación de Acomodo de Mesas</strong>
                        <p style="font-size:0.75rem; color:#64748b;">Revisar la distribución de mesas asignadas en el Seating Chart.</p>
                    </div>
                    <button class="btn-pdf-magic" onclick="showTab('seating'); closeModal('modalPDFPreview');">Abrir Seating Chart</button>
                </div>
                <div class="pdf-action-card">
                    <div>
                        <strong>Aprobación de Cotización de Mixología</strong>
                        <p style="font-size:0.75rem; color:#64748b;">Barra libre premium de ginebras y coctelería de autor ($22,000 MXN).</p>
                    </div>
                    <button class="btn-pdf-magic" onclick="approveQuoteDirect('mixologia')">✓ Autorizar Cotización</button>
                </div>
            </div>
        </div>

        <div class="pdf-footer-signature">
            <div>
                <strong>AURA WEDDINGS MANAGEMENT · PASEBODA</strong>
                <p style="font-size:0.75rem; color:#888;">Gestión Operativa Integral · Antigravity Web Studio</p>
            </div>
            <div style="text-align:right;">
                <p style="font-size:0.75rem; color:#888;">Documento Confidencial · Emitido Digitalmente</p>
            </div>
        </div>
    `;

    openLuxuryReportModal('📄 Previsualización de Reporte Ejecutivo Semanal', html);
}

// ==========================================================================
// 1. REPORTE DE BARRA, MIXOLOGÍA & ACTA DE CIERRE DE DESCORCHE (tab-barcalc)
// ==========================================================================
function printBarAuditReport() {
    if (typeof activeRole !== 'undefined' && activeRole === 'couple') {
        showToast('🔒 Acción exclusiva de tu Wedding Planner.');
        return;
    }
    currentData = getWeddingState(currentWeddingId);
    const items = (typeof barInventoryState !== 'undefined' && barInventoryState.items) ? barInventoryState.items : [];
    const pax = document.getElementById('barGuestsInput') ? document.getElementById('barGuestsInput').value : 180;
    const hours = document.getElementById('barHoursInput') ? document.getElementById('barHoursInput').value : 8;

    let totalEntered = 0, totalOpened = 0, totalReturned = 0, totalSavings = 0;
    const rowsHtml = items.map(item => {
        const returned = Math.max(0, (item.entered || 0) - (item.opened || 0));
        const val = returned * (item.cost || 0);
        totalEntered += (item.entered || 0);
        totalOpened += (item.opened || 0);
        totalReturned += returned;
        totalSavings += val;

        return `
            <tr>
                <td><strong>${item.name}</strong><br><small style="color:#64748b;">Costo unitario: $${(item.cost || 0).toLocaleString('es-MX')} MXN</small></td>
                <td style="text-align:center;">${item.suggested || 0} bot.</td>
                <td style="text-align:center; font-weight:700;">${item.entered || 0} bot.</td>
                <td style="text-align:center; font-weight:700; color:#b45309;">${item.opened || 0} bot.</td>
                <td style="text-align:center; font-weight:800; color:#059669; background:#ecfdf5;">${returned} bot.</td>
                <td style="text-align:right; font-weight:700;">$${val.toLocaleString('es-MX')} MXN</td>
            </tr>
        `;
    }).join('');

    const html = `
        <div class="pdf-header-luxury">
            <div class="pdf-brand-top">
                <span class="pdf-badge-gold">ACTA OFICIAL DE AUDITORÍA Y CIERRE DE BARRA</span>
                <span class="pdf-date-issued">Fecha de Corte: ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
            <h1 class="pdf-wedding-title">${currentData.couple}</h1>
            <p class="pdf-wedding-meta">📍 ${currentData.venue} · Parámetros: ${pax} Adultos · ${hours} Horas de Servicio</p>
        </div>

        <div class="pdf-grid-3" style="grid-template-columns: repeat(4, 1fr);">
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Botellas Ingresadas</span>
                <div class="pdf-stat-val">${totalEntered} uds</div>
                <small>Remisión en almacén</small>
            </div>
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Botellas Abiertas</span>
                <div class="pdf-stat-val" style="color:#b45309;">${totalOpened} uds</div>
                <small>Consumo en evento</small>
            </div>
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Cerradas a Devolver</span>
                <div class="pdf-stat-val" style="color:#059669;">${totalReturned} uds</div>
                <small>Selladas intactas</small>
            </div>
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Valor Recuperado</span>
                <div class="pdf-stat-val" style="color:#0f172a;">$${totalSavings.toLocaleString('es-MX')}</div>
                <small>Ahorro en botellas cerradas</small>
            </div>
        </div>

        <div class="pdf-section">
            <h3 class="pdf-section-heading">🍾 Desglose Físico de Destilados, Vinos e Insumos (Conciliación de Cierre)</h3>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th>Destilado / Marca</th>
                        <th style="text-align:center;">Sugerido</th>
                        <th style="text-align:center;">Ingresadas</th>
                        <th style="text-align:center;">Abiertas</th>
                        <th style="text-align:center;">Sobrante Cerrado</th>
                        <th style="text-align:right;">Valor Recuperado</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>

        <div style="margin-top:32px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px; text-align:center; padding-top:20px;">
            <div style="border-top:1px solid #0f172a; padding-top:8px;">
                <strong style="font-size:0.8rem; display:block;">Wedding Planner / Coordinación</strong>
                <small style="color:#64748b; font-size:0.72rem;">Entrega y Auditoría</small>
            </div>
            <div style="border-top:1px solid #0f172a; padding-top:8px;">
                <strong style="font-size:0.8rem; display:block;">Capitán de Barra / Banquete</strong>
                <small style="color:#64748b; font-size:0.72rem;">Responsable de Almacén</small>
            </div>
            <div style="border-top:1px solid #0f172a; padding-top:8px;">
                <strong style="font-size:0.8rem; display:block;">Novios / Representante Familiar</strong>
                <small style="color:#64748b; font-size:0.72rem;">Recibe ${totalReturned} Botellas Cerradas</small>
            </div>
        </div>
    `;

    openLuxuryReportModal('🍾 Acta de Entrega-Recepción y Cierre de Barra', html);
}

// ==========================================================================
// 2. REPORTE DE PROVEEDORES, ESTADO DE CUENTA & MONTAJE (tab-vendors)
// ==========================================================================
function printVendorsReport() {
    currentData = getWeddingState(currentWeddingId);
    const vendors = currentData.vendors || [];

    const totalContracted = vendors.reduce((s, v) => s + (v.contractTotal || 0), 0);
    const totalPaid = vendors.reduce((s, v) => s + (v.paidTotal || 0), 0);
    const totalPending = Math.max(0, totalContracted - totalPaid);

    const rowsHtml = vendors.map(v => {
        const pending = Math.max(0, (v.contractTotal || 0) - (v.paidTotal || 0));
        return `
            <tr>
                <td>
                    <strong>${v.name}</strong>
                    <div style="font-size:0.72rem; color:#64748b;">${v.category || 'Proveedor Oficial'} · 👤 ${v.contactName || 'Contacto'} (${v.phone || ''})</div>
                </td>
                <td>
                    <div style="font-size:0.75rem;"><strong>⏰ Montaje:</strong> ${v.setupTime || 'Por definir'}</div>
                    <div style="font-size:0.72rem; color:#64748b;">⚡ ${v.powerSpecs || 'Estándar'}</div>
                </td>
                <td style="font-size:0.75rem;">
                    <strong>${v.bank || 'SPEI'}</strong><br>
                    <code>${v.clabe || 'N/A'}</code>
                </td>
                <td style="text-align:right; font-weight:700;">$${(v.contractTotal || 0).toLocaleString('es-MX')}</td>
                <td style="text-align:right; color:#059669; font-weight:700;">$${(v.paidTotal || 0).toLocaleString('es-MX')}</td>
                <td style="text-align:right; color:${pending > 0 ? '#dc2626' : '#059669'}; font-weight:800;">
                    ${pending > 0 ? `$${pending.toLocaleString('es-MX')}` : '✓ LIQUIDADO'}
                </td>
            </tr>
        `;
    }).join('');

    const html = `
        <div class="pdf-header-luxury">
            <div class="pdf-brand-top">
                <span class="pdf-badge-gold">ESTADO DE CUENTA DE PROVEEDORES &amp; LOGÍSTICA DE MONTAJE</span>
                <span class="pdf-date-issued">Emitido: ${new Date().toLocaleDateString('es-MX')}</span>
            </div>
            <h1 class="pdf-wedding-title">${currentData.couple}</h1>
            <p class="pdf-wedding-meta">📍 ${currentData.venue} · Fecha del Evento: ${currentData.date}</p>
        </div>

        <div class="pdf-grid-3">
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Total Contratado</span>
                <div class="pdf-stat-val">$${totalContracted.toLocaleString('es-MX')} MXN</div>
                <small>${vendors.length} contratos registrados</small>
            </div>
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Anticipos Liquidados</span>
                <div class="pdf-stat-val" style="color:#059669;">$${totalPaid.toLocaleString('es-MX')} MXN</div>
                <small>Pagos cubiertos a la fecha</small>
            </div>
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Saldo por Liquidar</span>
                <div class="pdf-stat-val" style="color:#d97706;">$${totalPending.toLocaleString('es-MX')} MXN</div>
                <small>Pendiente antes del evento</small>
            </div>
        </div>

        <div class="pdf-section">
            <h3 class="pdf-section-heading">🏢 Directorio Financiero y Técnico de Proveedores Autorizados</h3>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th>Proveedor &amp; Contacto</th>
                        <th>Llegada / Requerimientos</th>
                        <th>Banco &amp; CLABE</th>
                        <th style="text-align:right;">Contrato</th>
                        <th style="text-align:right;">Pagado</th>
                        <th style="text-align:right;">Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>

        <div class="pdf-footer-signature">
            <div>
                <strong>CONTROL DE PRODUCCIÓN &amp; FINANZAS · PASEBODA</strong>
                <p style="font-size:0.75rem; color:#888;">Documento válido para acceso de proveedores en caseta de seguridad y conciliación con novios.</p>
            </div>
        </div>
    `;

    openLuxuryReportModal('🏢 Estado de Cuenta de Proveedores y Ficha de Montaje', html);
}

// ==========================================================================
// 3. LISTA MAESTRA OFICIAL DE INVITADOS, MENÚS Y ALERGIAS (tab-guests)
// ==========================================================================
function printGuestsMasterReport() {
    currentData = getWeddingState(currentWeddingId);
    const guests = currentData.guests || [];
    const tables = currentData.tables || [];

    const confirmed = guests.filter(g => g.status === 'confirmed');
    const pending = guests.filter(g => g.status === 'pending');
    const declined = guests.filter(g => g.status === 'declined');
    const totalPasses = confirmed.reduce((s, g) => s + (g.passes || 1), 0);

    const formatMenuName = (m) => {
        if (!m) return '🥩 Filete';
        const lower = m.toLowerCase();
        if (lower.includes('filete')) return '🥩 Filete Mignon';
        if (lower.includes('salmon') || lower.includes('salmón')) return '🐟 Salmón Rosé';
        if (lower.includes('risotto')) return '🍄 Risotto Vegano';
        return m;
    };

    const statusNames = { confirmed: '✓ Confirmado', pending: '⏳ Pendiente', declined: '✕ Declinó' };

    const rowsHtml = guests.map((g, idx) => {
        const tbl = tables.find(t => t.id === g.tableId);
        const tableName = tbl ? tbl.name : 'Sin Asignar';
        const passCount = g.passes || 1;

        let menuCellHtml = '';
        let allergyCellHtml = '';

        if (g.status === 'declined') {
            menuCellHtml = '<span style="color:#94a3b8; font-style:italic;">No aplica</span>';
            allergyCellHtml = '<span style="color:#94a3b8; font-style:italic;">Declinó asistencia</span>';
        } else if (passCount === 1) {
            menuCellHtml = `<strong>${formatMenuName(g.guest1Menu || g.menu)}</strong>`;
            const a1 = g.guest1Allergies || g.allergies || 'Ninguna';
            allergyCellHtml = (a1 && a1.toLowerCase() !== 'ninguna')
                ? `<strong style="color:#dc2626;">⚠️ ${a1}</strong>`
                : '<span style="color:#94a3b8;">Ninguna</span>';
        } else {
            const m1 = formatMenuName(g.guest1Menu || g.menu);
            const m2 = formatMenuName(g.companionMenu || (g.menu === 'salmon' ? 'filete' : 'salmon'));
            menuCellHtml = `
                <div style="font-size:0.75rem; line-height:1.4;">
                    <div><strong>1. Titular:</strong> ${m1}</div>
                    <div><strong>2. Acomp:</strong> ${m2}</div>
                </div>
            `;

            const a1 = g.guest1Allergies || g.allergies || 'Ninguna';
            const a2 = g.companionAllergies || 'Ninguna';
            const hasA1 = a1 && a1.toLowerCase() !== 'ninguna';
            const hasA2 = a2 && a2.toLowerCase() !== 'ninguna';

            allergyCellHtml = `
                <div style="font-size:0.75rem; line-height:1.4;">
                    <div>${hasA1 ? `<span style="color:#dc2626; font-weight:700;">⚠️ Titular: ${a1}</span>` : '<span style="color:#94a3b8;">1. Ninguna</span>'}</div>
                    <div>${hasA2 ? `<span style="color:#dc2626; font-weight:700;">⚠️ Acomp: ${a2}</span>` : '<span style="color:#94a3b8;">2. Ninguna</span>'}</div>
                </div>
            `;
        }

        return `
            <tr>
                <td style="text-align:center; font-weight:700; color:#64748b;">${idx + 1}</td>
                <td>
                    <strong>${g.name}</strong>
                    ${g.passes > 1 ? `<div style="font-size:0.72rem; color:#64748b;">+ ${g.companion || 'Acompañante'}</div>` : ''}
                </td>
                <td style="font-size:0.75rem;">${g.phone || '—'}</td>
                <td style="text-align:center; font-weight:800;">${g.passes || 1}</td>
                <td style="font-weight:700;">${tableName}</td>
                <td>${menuCellHtml}</td>
                <td>${allergyCellHtml}</td>
                <td><strong>${statusNames[g.status] || g.status}</strong></td>
                <td style="text-align:center;">☐</td>
            </tr>
        `;
    }).join('');

    const html = `
        <div class="pdf-header-luxury">
            <div class="pdf-brand-top">
                <span class="pdf-badge-gold">LISTA MAESTRA OFICIAL DE INVITADOS, MENÚS &amp; RECEPCIÓN</span>
                <span class="pdf-date-issued">Emitido: ${new Date().toLocaleDateString('es-MX')}</span>
            </div>
            <h1 class="pdf-wedding-title">${currentData.couple}</h1>
            <p class="pdf-wedding-meta">📍 ${currentData.venue} · Fecha de Boda: ${currentData.date}</p>
        </div>

        <div class="pdf-grid-3">
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Pases Confirmados</span>
                <div class="pdf-stat-val" style="color:#059669;">${totalPasses} Pax</div>
                <small>${confirmed.length} familias confirmadas</small>
            </div>
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Pendientes por Confirmar</span>
                <div class="pdf-stat-val" style="color:#d97706;">${pending.length} Invitaciones</div>
                <small>En seguimiento RSVP</small>
            </div>
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Bajas / Declinados</span>
                <div class="pdf-stat-val" style="color:#64748b;">${declined.length} Invitaciones</div>
                <small>Lugares liberados</small>
            </div>
        </div>

        <div class="pdf-section">
            <h3 class="pdf-section-heading">👥 Padrón Completo de Comensales, Asignación de Mesa y Restricciones</h3>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th style="width:32px; text-align:center;">#</th>
                        <th>Invitado Titular &amp; Acompañante</th>
                        <th>WhatsApp</th>
                        <th style="text-align:center;">Pases</th>
                        <th>Mesa</th>
                        <th>Menú</th>
                        <th>Alergias</th>
                        <th>RSVP</th>
                        <th style="text-align:center;">Acceso</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    `;

    openLuxuryReportModal('👥 Lista Maestra Oficial de Invitados y Alergias', html);
}

// ==========================================================================
// 4. CORTE DE CAJA — MESA DE REGALOS & TRANSFERENCIAS SPEI (tab-finance)
// ==========================================================================
function printGiftRegistryReport() {
    currentData = getWeddingState(currentWeddingId);
    const vouchers = currentData.vouchers || [];
    const approved = vouchers.filter(v => v.status === 'approved');
    const pending = vouchers.filter(v => v.status !== 'approved');
    const totalApproved = approved.reduce((s, v) => s + (v.amount || 0), 0);
    const totalPending = pending.reduce((s, v) => s + (v.amount || 0), 0);

    const rowsHtml = vouchers.map((v, i) => `
        <tr>
            <td style="text-align:center; font-weight:700;">${i + 1}</td>
            <td>
                <strong>${v.guestName || v.donor || 'Invitado'}</strong>
                <div style="font-size:0.72rem; color:#64748b; font-style:italic;">"${v.message || '¡Muchas felicidades a los novios!'}"</div>
            </td>
            <td>${v.date || 'Reciente'}</td>
            <td><code>${v.reference || v.id || 'SPEI-VERIFICADO'}</code></td>
            <td>
                <span style="font-weight:700; color:${v.status === 'approved' ? '#059669' : '#d97706'};">
                    ${v.status === 'approved' ? '✓ Validado en Banco' : '⏳ Pendiente de Revisar'}
                </span>
            </td>
            <td style="text-align:right; font-weight:800; font-size:0.9rem;">$${(v.amount || 0).toLocaleString('es-MX')} MXN</td>
        </tr>
    `).join('');

    const html = `
        <div class="pdf-header-luxury">
            <div class="pdf-brand-top">
                <span class="pdf-badge-gold">CORTE DE CAJA — MESA DE REGALOS &amp; TRANSFERENCIAS SPEI</span>
                <span class="pdf-date-issued">Emitido: ${new Date().toLocaleDateString('es-MX')}</span>
            </div>
            <h1 class="pdf-wedding-title">${currentData.couple}</h1>
            <p class="pdf-wedding-meta">📍 Fondo de Luna de Miel · Conciliación Directa de Transferencias Bancarias</p>
        </div>

        <div class="pdf-grid-3">
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Total Validado en Cuenta</span>
                <div class="pdf-stat-val" style="color:#059669;">$${totalApproved.toLocaleString('es-MX')} MXN</div>
                <small>${approved.length} aportaciones confirmadas</small>
            </div>
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">En Revisión / Por Validar</span>
                <div class="pdf-stat-val" style="color:#d97706;">$${totalPending.toLocaleString('es-MX')} MXN</div>
                <small>${pending.length} comprobantes en cola</small>
            </div>
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Regalo Promedio</span>
                <div class="pdf-stat-val">$${approved.length > 0 ? Math.round(totalApproved / approved.length).toLocaleString('es-MX') : 0} MXN</div>
                <small>0% comisiones retenidas</small>
            </div>
        </div>

        <div class="pdf-section">
            <h3 class="pdf-section-heading">💳 Bitácora Detallada de Aportaciones y Dedicatorias de Invitados</h3>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th style="width:35px; text-align:center;">#</th>
                        <th>Invitado Donante &amp; Dedicatoria</th>
                        <th>Fecha</th>
                        <th>Referencia SPEI</th>
                        <th>Estado</th>
                        <th style="text-align:right;">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    `;

    openLuxuryReportModal('💳 Estado de Cuenta — Mesa de Regalos y Transferencias', html);
}

// ==========================================================================
// 5. PIZARRÓN DE MESAS & SEATING CHART IMPRIMIBLE (tab-seating)
// ==========================================================================
function printSeatingChartReport() {
    currentData = getWeddingState(currentWeddingId);
    const tables = currentData.tables || [];
    const guests = currentData.guests || [];

    const tablesHtml = tables.map(t => {
        const seated = guests.filter(g => g.tableId === t.id);
        const occupiedSeats = seated.reduce((s, g) => s + (g.passes || 1), 0);
        const guestListHtml = seated.length > 0
            ? seated.map(g => `
                <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #e2e8f0; font-size:0.78rem;">
                    <span><strong>${g.name}</strong> ${g.passes > 1 ? `<small style="color:#64748b;">(+1)</small>` : ''}</span>
                    <span style="font-weight:700; color:#475569;">${g.passes || 1} pax ${g.allergies && g.allergies !== 'Ninguna' ? `<strong style="color:#dc2626;">⚠️ ${g.allergies}</strong>` : ''}</span>
                </div>
            `).join('')
            : `<div style="font-size:0.75rem; color:#94a3b8; font-style:italic; padding:6px 0;">Sin comensales asignados</div>`;

        return `
            <div style="border:1px solid #cbd5e1; border-radius:8px; padding:12px; background:#ffffff; page-break-inside:avoid;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0f172a; padding-bottom:6px; margin-bottom:8px;">
                    <strong style="font-size:0.9rem; color:#0f172a;">🪑 ${t.name}</strong>
                    <span style="font-size:0.74rem; font-weight:800; background:#f1f5f9; padding:2px 8px; border-radius:12px;">${occupiedSeats} / ${t.capacity || 10} sillas</span>
                </div>
                ${guestListHtml}
            </div>
        `;
    }).join('');

    const unassigned = guests.filter(g => !g.tableId && g.status !== 'declined');

    const html = `
        <div class="pdf-header-luxury">
            <div class="pdf-brand-top">
                <span class="pdf-badge-gold">DIRECTORIO OFICIAL DE MESAS &amp; SEATING CHART</span>
                <span class="pdf-date-issued">Emitido: ${new Date().toLocaleDateString('es-MX')}</span>
            </div>
            <h1 class="pdf-wedding-title">${currentData.couple}</h1>
            <p class="pdf-wedding-meta">📍 ${currentData.venue} · ${tables.length} Mesas Configuradas · ${unassigned.length} familias por ubicar</p>
        </div>

        <div class="pdf-section">
            <h3 class="pdf-section-heading">🪑 Distribución de Comensales por Mesa (Para Recepción y Hostess)</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px;">
                ${tablesHtml}
            </div>
        </div>
    `;

    openLuxuryReportModal('🪑 Pizarrón Oficial de Mesas (Seating Chart)', html);
}

// ==========================================================================
// 6. CUE SHEET & BRIEFING MUSICAL OFICIAL PARA CABINA DE DJ (tab-playlist)
// ==========================================================================
function printDJSetlistReport() {
    currentData = getWeddingState(currentWeddingId);
    const allSongs = (typeof defaultPlaylist !== 'undefined' && Array.isArray(defaultPlaylist)) ? [...defaultPlaylist] : [];

    const protocolSongs = allSongs.filter(s => s.category === 'protocol');
    const partySongs = allSongs.filter(s => !s.category || s.category === 'party').sort((a, b) => (b.votes || 0) - (a.votes || 0));
    const blacklistSongs = allSongs.filter(s => s.category === 'blacklist');

    const protocolRowsHtml = protocolSongs.length > 0 ? protocolSongs.map((s, idx) => `
        <tr>
            <td style="text-align:center; font-weight:800; color:#b45309;">👑 #${idx + 1}</td>
            <td><strong>${s.title}</strong></td>
            <td>${s.artist}</td>
            <td><strong>${s.album || 'Versión Estudio Original'}</strong></td>
            <td style="color:#92400e; font-weight:700;">${s.requestedBy || 'Momento de Protocolo'}</td>
            <td style="text-align:center;">☐ Probada</td>
        </tr>
    `).join('') : `<tr><td colspan="6" style="text-align:center; color:#64748b;">Sin canciones de protocolo registradas.</td></tr>`;

    const partyRowsHtml = partySongs.length > 0 ? partySongs.map((s, idx) => `
        <tr>
            <td style="text-align:center; font-weight:800; color:#059669;">#${idx + 1}</td>
            <td><strong>${s.title}</strong></td>
            <td>${s.artist}</td>
            <td>${s.requestedBy || 'RSVP Pre-Boda'}</td>
            <td style="text-align:center; font-weight:800; color:#e11d48;">❤️ ${s.votes || 0}</td>
            <td style="text-align:center;">☐</td>
        </tr>
    `).join('') : `<tr><td colspan="6" style="text-align:center; color:#64748b;">Sin sugerencias de pista registradas.</td></tr>`;

    const blacklistRowsHtml = blacklistSongs.length > 0 ? blacklistSongs.map((s, idx) => `
        <tr style="background:#fef2f2;">
            <td style="text-align:center; font-weight:800; color:#dc2626;">🚫 VETO ${idx + 1}</td>
            <td style="color:#991b1b; text-decoration:line-through;"><strong>${s.title}</strong></td>
            <td style="color:#991b1b;"><strong>${s.artist}</strong></td>
            <td style="color:#b91c1c; font-weight:700;">${s.requestedBy || 'Vetada por los Novios — Prohibido tocar aunque la pidan'}</td>
            <td style="text-align:center; color:#dc2626; font-weight:800;">⛔ PROHIBIDA</td>
        </tr>
    `).join('') : `<tr><td colspan="5" style="text-align:center; color:#64748b;">Sin canciones vetadas en la Lista Negra.</td></tr>`;

    const html = `
        <div class="pdf-header-luxury">
            <div class="pdf-brand-top">
                <span class="pdf-badge-gold">BRIEFING MUSICAL &amp; CUE SHEET OFICIAL PARA CABINA DE DJ</span>
                <span class="pdf-date-issued">Emitido: ${new Date().toLocaleDateString('es-MX')}</span>
            </div>
            <h1 class="pdf-wedding-title">${currentData.couple}</h1>
            <p class="pdf-wedding-meta">📍 ${currentData.venue} ·Fecha: ${currentData.date} · Documento vinculante para DJ, Ingeniero de Audio y Wedding Planner</p>
        </div>

        <div class="pdf-grid-3">
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">👑 Canciones de Protocolo</span>
                <div class="pdf-stat-val" style="color:#b45309;">${protocolSongs.length} Momentos</div>
                <small>Reproducir versión exacta verificada</small>
            </div>
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">🔥 Sugerencias Pre-Boda Pista</span>
                <div class="pdf-stat-val" style="color:#059669;">${partySongs.length} Canciones</div>
                <small>Votadas por invitados en RSVP</small>
            </div>
            <div class="pdf-stat-box" style="border-color:#fca5a5; background:#fff1f2;">
                <span class="pdf-stat-label" style="color:#991b1b;">🚫 Lista Negra (Do Not Play)</span>
                <div class="pdf-stat-val" style="color:#dc2626;">${blacklistSongs.length} Prohibidas</div>
                <small style="color:#991b1b;">Estrictamente vetadas en cabina</small>
            </div>
        </div>

        <div class="pdf-section">
            <h3 class="pdf-section-heading">👑 1. CANCIONES DE PROTOCOLO OFICIAL (VERSIÓN EXACTA OBLIGATORIA)</h3>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th style="width:65px; text-align:center;">Orden</th>
                        <th>Canción / Track</th>
                        <th>Artista</th>
                        <th>Álbum / Versión Verificada</th>
                        <th>Momento Exacto de Escaleta</th>
                        <th style="width:85px; text-align:center;">Soundcheck</th>
                    </tr>
                </thead>
                <tbody>
                    ${protocolRowsHtml}
                </tbody>
            </table>
        </div>

        <div class="pdf-section">
            <h3 class="pdf-section-heading">🔥 2. SUGERENCIAS PRE-BODA DE INVITADOS PARA PISTA DE BAILE (RANKING RSVP)</h3>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th style="width:55px; text-align:center;">Rank</th>
                        <th>Canción / Track</th>
                        <th>Artista / Banda</th>
                        <th>Mesa / Invitado que Sugiere</th>
                        <th style="width:70px; text-align:center;">Votos</th>
                        <th style="width:65px; text-align:center;">Tocada</th>
                    </tr>
                </thead>
                <tbody>
                    ${partyRowsHtml}
                </tbody>
            </table>
        </div>

        <div class="pdf-section">
            <h3 class="pdf-section-heading" style="color:#b91c1c; border-bottom-color:#fca5a5;">🚫 3. LISTA NEGRA ("DO NOT PLAY") — ESTRICTAMENTE PROHIBIDO TOCAR</h3>
            <div class="pdf-allergy-alert" style="background:#fef2f2; border-color:#fca5a5; color:#991b1b; margin-bottom:10px;">
                <strong>⚠️ INSTRUCCIÓN ESTRICTA PARA CABINA DE DJ:</strong> Las siguientes canciones o artistas están <strong>vetados directamente por los novios</strong>. Queda prohibido reproducirlas durante todo el evento, incluso si algún invitado las solicita en cabina.
            </div>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th style="width:80px; text-align:center;">Estatus</th>
                        <th>Canción Vetada</th>
                        <th>Artista / Grupo</th>
                        <th>Motivo / Instrucción de los Novios</th>
                        <th style="width:105px; text-align:center;">Restricción</th>
                    </tr>
                </thead>
                <tbody>
                    ${blacklistRowsHtml}
                </tbody>
            </table>
        </div>

        <div class="pdf-footer-signature" style="margin-top:28px;">
            <div><strong>Firma Wedding Planner:</strong> ___________________________</div>
            <div><strong>Firma DJ / Audio en Cabina:</strong> ___________________________</div>
            <div><strong>Vo.Bo. Novios:</strong> ___________________________</div>
        </div>
    `;

    openLuxuryReportModal('🎵 Briefing Musical & Setlist Oficial para DJ (Protocolo + Pista + Lista Negra)', html);
}

// ==========================================================================
// 7. CORTE CONTABLE MENSUAL SAAS — MASTER DEVELOPER (tab-dev-clients / analytics)
// ==========================================================================
function printMasterDeveloperSaaSReport() {
    const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
    const payments = typeof getPaymentsHistory === 'function' ? getPaymentsHistory() : [];

    const activeClients = clients.filter(c => !c.isSuspended);
    const suspendedClients = clients.filter(c => c.isSuspended);
    const mrr = activeClients.reduce((s, c) => s + (Number(c.monthlyFee) || 1500), 0);
    const totalCollected = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const clientsRows = clients.map(c => `
        <tr>
            <td><strong>${c.agencyName}</strong><br><small style="color:#64748b;">👤 ${c.plannerName}</small></td>
            <td>${c.email}<br><small>${c.phone || ''}</small></td>
            <td><strong>${(c.planTier || 'intermediate').toUpperCase()}</strong> (Máx. ${c.maxWeddings || 10} bodas)</td>
            <td>${c.nextDueDate || '—'}</td>
            <td>
                <strong style="color:${c.isSuspended ? '#dc2626' : '#059669'};">
                    ${c.isSuspended ? '🔒 Suspendido' : '🟢 Activo (' + (c.paymentStatus || 'paid') + ')'}
                </strong>
            </td>
            <td style="text-align:right; font-weight:800;">$${(c.monthlyFee || 0).toLocaleString('es-MX')} MXN</td>
        </tr>
    `).join('');

    const paymentsRows = payments.map(p => `
        <tr>
            <td>${new Date(p.date).toLocaleDateString('es-MX')}</td>
            <td><strong>${p.agencyName}</strong></td>
            <td>${p.planName || p.planTier}</td>
            <td>${p.method}</td>
            <td><code>${p.id}</code></td>
            <td style="text-align:right; font-weight:800; color:#059669;">$${Number(p.amount).toLocaleString('es-MX')} MXN</td>
        </tr>
    `).join('');

    const html = `
        <div class="pdf-header-luxury">
            <div class="pdf-brand-top">
                <span class="pdf-badge-gold">CORTE CONTABLE SAAS &amp; CARTERA DE AGENCIAS (MASTER DEVELOPER)</span>
                <span class="pdf-date-issued">Emitido: ${new Date().toLocaleDateString('es-MX')}</span>
            </div>
            <h1 class="pdf-wedding-title">Antigravity Web Studio · PaseBoda</h1>
            <p class="pdf-wedding-meta">🛡️ Reporte Financiero Confidencial · Master Admin: antigravitywebstudio@hotmail.com</p>
        </div>

        <div class="pdf-grid-3">
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Ingresos Recurrentes (MRR)</span>
                <div class="pdf-stat-val" style="color:#059669;">$${mrr.toLocaleString('es-MX')} MXN</div>
                <small>${activeClients.length} suscripciones activas</small>
            </div>
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Cobros Procesados en Bitácora</span>
                <div class="pdf-stat-val">$${totalCollected.toLocaleString('es-MX')} MXN</div>
                <small>${payments.length} transacciones Stripe / SPEI</small>
            </div>
            <div class="pdf-stat-box">
                <span class="pdf-stat-label">Cuentas Suspendidas</span>
                <div class="pdf-stat-val" style="color:#dc2626;">${suspendedClients.length} Agencias</div>
                <small>De ${clients.length} registradas en total</small>
            </div>
        </div>

        <div class="pdf-section">
            <h3 class="pdf-section-heading">🏢 Padrón de Agencias Wedding Planner &amp; Estado de Suscripción</h3>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th>Agencia &amp; Planner</th>
                        <th>Contacto</th>
                        <th>Plan Contratado</th>
                        <th>Próximo Corte</th>
                        <th>Estatus</th>
                        <th style="text-align:right;">Cuota Mensual</th>
                    </tr>
                </thead>
                <tbody>
                    ${clientsRows}
                </tbody>
            </table>
        </div>

        <div class="pdf-section">
            <h3 class="pdf-section-heading">💳 Libro de Ingresos &amp; Folios Conciliados (Stripe / SPEI)</h3>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Agencia</th>
                        <th>Membresía</th>
                        <th>Método de Pago</th>
                        <th>Folio / ID</th>
                        <th style="text-align:right;">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    ${paymentsRows}
                </tbody>
            </table>
        </div>
    `;

    openLuxuryReportModal('💎 Corte Contable Mensual SaaS (Master Developer)', html);
}

// ==========================================================================
// UNIVERSAL PRINT ENGINE (MOBILE & DESKTOP SAFE)
// ==========================================================================
function printExecutiveReport(paperId = 'pdfDocumentPaper') {
    const paper = document.getElementById(paperId);
    if (!paper) {
        window.print();
        return;
    }

    const printWindow = window.open('', '_blank', 'width=950,height=800');
    if (!printWindow) {
        window.print();
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte Oficial — PaseBoda</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
            <style>
                * { box-sizing: border-box; }
                body {
                    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
                    color: #0f172a;
                    background: #ffffff;
                    margin: 0;
                    padding: 28px;
                }
                .no-print { display: none !important; }
                .pdf-header-luxury { border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 20px; }
                .pdf-brand-top { display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; font-weight: 700; margin-bottom: 6px; }
                .pdf-badge-gold { background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 4px; font-weight: 800; }
                .pdf-wedding-title { font-family: 'Playfair Display', serif; font-size: 1.85rem; color: #0f172a; margin: 4px 0; }
                .pdf-wedding-meta { font-size: 0.85rem; color: #64748b; margin: 0; }
                .pdf-planner-letter { background: #f8fafc; border-left: 4px solid #c5a059; padding: 12px 16px; border-radius: 4px; margin-bottom: 18px; }
                .pdf-letter-badge { font-size: 0.68rem; font-weight: 800; color: #8a6c28; margin-bottom: 4px; }
                .pdf-letter-body { font-size: 0.84rem; font-style: italic; color: #334155; margin: 0; }
                .pdf-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
                .pdf-stat-box { background: #fcfcfc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; }
                .pdf-stat-label { font-size: 0.68rem; color: #64748b; text-transform: uppercase; font-weight: 700; display: block; }
                .pdf-stat-val { font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 4px 0; }
                .pdf-bar-wrap { height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin: 4px 0; }
                .pdf-bar-fill { height: 100%; background: #c5a059; }
                .pdf-section { margin-bottom: 20px; }
                .pdf-section-heading { font-size: 0.92rem; font-weight: 800; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 10px; }
                .pdf-table { width: 100%; border-collapse: collapse; font-size: 0.76rem; }
                .pdf-table th { background: #f1f5f9; padding: 8px; text-align: left; border: 1px solid #cbd5e1; font-weight: 800; }
                .pdf-table td { padding: 7px 8px; border: 1px solid #e2e8f0; vertical-align: top; }
                .pdf-catering-row { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
                .pdf-dish-pill { background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; font-size: 0.78rem; }
                .pdf-allergy-alert { background: #fffbeb; border: 1px solid #fde68a; padding: 10px 14px; border-radius: 6px; font-size: 0.78rem; color: #92400e; }
                .page-break-before {
                    page-break-before: always !important;
                    break-before: page !important;
                    margin-top: 25px;
                }
                .avoid-page-break {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                @media print {
                    body { padding: 10px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .page-break-before {
                        page-break-before: always !important;
                        break-before: page !important;
                        margin-top: 0 !important;
                        padding-top: 20px !important;
                    }
                    .avoid-page-break {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                }
            </style>
        </head>
        <body>
            ${paper.innerHTML}
            <script>
                window.onload = function() {
                    setTimeout(function() { window.print(); }, 250);
                };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function savePlannerNote() {
    const note = document.getElementById('pdfPlannerNote').value;
    currentData.plannerNote = note;
    saveWeddingState(currentWeddingId, currentData);
    logAuditAction(currentWeddingId, "Wedding Planner", "planner", "Actualización de nota personalizada para el reporte ejecutivo en PDF");
    showToast("💾 Nota guardada en el reporte semanal.");
}

function executeMagicApproval(milestoneId) {
    const m = (currentData.milestones || []).find(item => item.id === milestoneId);
    if (m) {
        m.status = 'paid';
        const vendor = currentData.vendors.find(v => v.id === m.vendorId);
        if (vendor) vendor.paidTotal += m.amount;
        saveWeddingState(currentWeddingId, currentData);
        logAuditAction(currentWeddingId, currentData.couple, "couple", `Pago de $${m.amount.toLocaleString('es-MX')} MXN para ${m.vendorName} autorizado y marcado como pagado`);
        generateAndPreviewPDF();
        renderDashboard();
        renderCashflowTab();
        showToast(`🎉 Pago de $${m.amount.toLocaleString('es-MX')} MXN registrado con éxito.`);
    }
}

function approveQuoteDirect(quoteType) {
    logAuditAction(currentWeddingId, currentData.couple, "couple", `Cotización de ${quoteType} aprobada con 1 clic desde el reporte ejecutivo`);
    showToast("✓ Cotización aprobada y registrada en la bitácora legal.");
}

// ==========================================================================
// 7. PLAN DE LOGÍSTICA, HOTELES & TRASLADOS IMPRIMIBLE (tab-travel)
// ==========================================================================
function printTravelReport() {
    currentData = getWeddingState(currentWeddingId);

    // Extract dynamic flights from DOM if present or fallback to defaults
    let flightRowsHtml = '';
    const domFlightRows = document.querySelectorAll('#flightsTableBody tr');
    if (domFlightRows && domFlightRows.length > 0) {
        domFlightRows.forEach(tr => {
            const cells = tr.querySelectorAll('td');
            if (cells.length >= 6) {
                flightRowsHtml += `
                    <tr style="border-bottom:1px solid #f1f5f9;">
                        <td style="padding:10px 12px; font-size:0.8rem;">${cells[0].innerHTML}</td>
                        <td style="padding:10px 12px; font-size:0.8rem;">${cells[1].innerHTML}</td>
                        <td style="padding:10px 12px; font-size:0.8rem;">${cells[2].innerHTML}</td>
                        <td style="padding:10px 12px; font-size:0.8rem;">${cells[3].innerHTML}</td>
                        <td style="padding:10px 12px; font-size:0.8rem;">${cells[4].innerHTML}</td>
                        <td style="padding:10px 12px; text-align:center; font-size:0.8rem;">${cells[5].innerHTML}</td>
                    </tr>
                `;
            }
        });
    }

    if (!flightRowsHtml) {
        flightRowsHtml = `
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 12px;"><strong>Sofía &amp; Alejandro (Novios)</strong><br><small style="color:#64748b;">Pareja Titular</small></td>
                <td style="padding:10px 12px;">Monterrey (MTY) ➔ Palma (PMI)<br><small style="color:#64748b;">Escala Madrid (MAD)</small></td>
                <td style="padding:10px 12px;"><span style="background:#dbeafe; color:#1e40af; padding:2px 7px; border-radius:4px; font-weight:800; font-size:0.75rem;">Iberia IB-6403</span></td>
                <td style="padding:10px 12px;"><strong>22 Oct 2027</strong><br><span style="color:#059669; font-weight:700;">11:45 hrs</span></td>
                <td style="padding:10px 12px;">Terminal 1</td>
                <td style="padding:10px 12px; text-align:center;"><span style="background:#f5f3ff; color:#6d28d9; padding:2px 8px; border-radius:12px; font-weight:700; font-size:0.72rem;">Van 01 (14:00)</span></td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 12px;"><strong>Doña Carmen &amp; Don Fernando</strong><br><small style="color:#64748b;">Padres de la Novia</small></td>
                <td style="padding:10px 12px;">CDMX (MEX) ➔ Palma (PMI)<br><small style="color:#64748b;">Vuelo Directo / Conexión</small></td>
                <td style="padding:10px 12px;"><span style="background:#e0e7ff; color:#3730a3; padding:2px 7px; border-radius:4px; font-weight:800; font-size:0.75rem;">Air Europa UX-1022</span></td>
                <td style="padding:10px 12px;"><strong>23 Oct 2027</strong><br><span style="color:#059669; font-weight:700;">13:15 hrs</span></td>
                <td style="padding:10px 12px;">Terminal 2</td>
                <td style="padding:10px 12px; text-align:center;"><span style="background:#f5f3ff; color:#6d28d9; padding:2px 8px; border-radius:12px; font-weight:700; font-size:0.72rem;">Van 01 (14:00)</span></td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 12px;"><strong>Dr. Roberto Elizondo &amp; Mariana Ruiz</strong><br><small style="color:#64748b;">Testigo &amp; Dama</small></td>
                <td style="padding:10px 12px;">Monterrey (MTY) ➔ Palma (PMI)<br><small style="color:#64748b;">Vía CDMX</small></td>
                <td style="padding:10px 12px;"><span style="background:#fef3c7; color:#92400e; padding:2px 7px; border-radius:4px; font-weight:800; font-size:0.75rem;">Aeroméxico AM-001</span></td>
                <td style="padding:10px 12px;"><strong>23 Oct 2027</strong><br><span style="color:#059669; font-weight:700;">16:20 hrs</span></td>
                <td style="padding:10px 12px;">Terminal 1</td>
                <td style="padding:10px 12px; text-align:center;"><span style="background:#f5f3ff; color:#6d28d9; padding:2px 8px; border-radius:12px; font-weight:700; font-size:0.72rem;">Van 02 (17:30)</span></td>
            </tr>
        `;
    }

    const reportHtml = `
        <div class="pdf-page-container">
            <!-- ========================================== -->
            <!-- PÁGINA 1: HOTELES & FLOTA DE SHUTTLES     -->
            <!-- ========================================== -->
            <div class="pdf-page-1 avoid-page-break">
                <div class="pdf-header-hero">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span class="pdf-badge-gold">AURA WEDDINGS OS · PLAN DE LOGÍSTICA &amp; TRASLADOS</span>
                        <span style="font-size:0.75rem; color:#64748b; font-weight:700;">Emitido: ${new Date().toLocaleDateString('es-MX')}</span>
                    </div>
                    <h1 class="pdf-wedding-title" style="margin:4px 0 6px;">${currentData.couple}</h1>
                    <p class="pdf-wedding-meta" style="margin:0 0 16px;">📍 ${currentData.venue} · Fecha del Evento: ${currentData.date} · Coordinación de Huéspedes Foráneos, Rooming y Flota</p>
                </div>

                <!-- RESUMEN EJECUTIVO -->
                <div class="pdf-grid-3" style="margin-bottom:18px;">
                    <div class="pdf-stat-box" style="border-left:4px solid #0284c7;">
                        <span class="pdf-stat-label">🏨 Bloqueo Hotel Sede</span>
                        <div class="pdf-stat-val" style="color:#0284c7;">32 / 40 Hab.</div>
                        <small>80% de ocupación confirmada (Belmond La Residencia)</small>
                    </div>
                    <div class="pdf-stat-box" style="border-left:4px solid #7c3aed;">
                        <span class="pdf-stat-label">🚐 Flota de Shuttles</span>
                        <div class="pdf-stat-val" style="color:#7c3aed;">2 Vans Sprinter</div>
                        <small>26 / 36 Pasajeros asignados con chofer dedicado</small>
                    </div>
                    <div class="pdf-stat-box" style="border-left:4px solid #10b981;">
                        <span class="pdf-stat-label">✈️ Huéspedes Foráneos</span>
                        <div class="pdf-stat-val" style="color:#059669;">100% Coordinados</div>
                        <small>Itinerarios aéreos en Página 2</small>
                    </div>
                </div>

                <!-- SECCIÓN 1: ROOMING LIST -->
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:18px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #0284c7; padding-bottom:8px; margin-bottom:12px;">
                        <h3 style="margin:0; font-family:'Playfair Display', serif; font-size:1.15rem; color:#0f172a;">🏨 Hotel Sede: Belmond La Residencia · Mallorca</h3>
                        <span style="font-size:0.75rem; font-weight:800; background:#f0f9ff; color:#0369a1; padding:3px 8px; border-radius:4px;">CÓDIGO TARIFA: AURA2027 (-20%)</span>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                        <thead>
                            <tr style="background:#f8fafc; border-bottom:1px solid #cbd5e1; text-align:left; font-size:0.72rem; text-transform:uppercase; color:#475569;">
                                <th style="padding:8px 10px;">Habitación</th>
                                <th style="padding:8px 10px;">Huéspedes Confirmados</th>
                                <th style="padding:8px 10px;">Tipo de Habitación</th>
                                <th style="padding:8px 10px;">Check-in</th>
                                <th style="padding:8px 10px;">Check-out</th>
                                <th style="padding:8px 10px; text-align:center;">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom:1px solid #f1f5f9;">
                                <td style="padding:8px 10px; font-weight:800; color:#0f172a;">Hab. 204</td>
                                <td style="padding:8px 10px;"><strong>Juan Manuel Gómez</strong> &amp; Acompañante</td>
                                <td style="padding:8px 10px; color:#b45309; font-weight:700;">Suite Deluxe · Cama King</td>
                                <td style="padding:8px 10px;">23 Oct 2027</td>
                                <td style="padding:8px 10px;">26 Oct 2027</td>
                                <td style="padding:8px 10px; text-align:center;"><span style="background:#dcfce7; color:#166534; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:4px;">✓ Confirmada</span></td>
                            </tr>
                            <tr style="border-bottom:1px solid #f1f5f9;">
                                <td style="padding:8px 10px; font-weight:800; color:#0f172a;">Hab. 205</td>
                                <td style="padding:8px 10px;"><strong>Mariana Ruiz</strong> &amp; Dr. Roberto Elizondo</td>
                                <td style="padding:8px 10px; color:#b45309; font-weight:700;">King Garden View</td>
                                <td style="padding:8px 10px;">23 Oct 2027</td>
                                <td style="padding:8px 10px;">25 Oct 2027</td>
                                <td style="padding:8px 10px; text-align:center;"><span style="background:#dcfce7; color:#166534; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:4px;">✓ Confirmada</span></td>
                            </tr>
                            <tr style="border-bottom:1px solid #f1f5f9;">
                                <td style="padding:8px 10px; font-weight:800; color:#0f172a;">Hab. 310</td>
                                <td style="padding:8px 10px;"><strong>Carlos Eduardo Slim</strong></td>
                                <td style="padding:8px 10px; color:#b45309; font-weight:700;">Habitación Superior</td>
                                <td style="padding:8px 10px;">24 Oct 2027</td>
                                <td style="padding:8px 10px;">25 Oct 2027</td>
                                <td style="padding:8px 10px; text-align:center;"><span style="background:#dcfce7; color:#166534; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:4px;">✓ Confirmada</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- SECCIÓN 2: COORDINACIÓN DE SHUTTLES -->
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:16px;">
                    <div style="border-bottom:1.5px solid #7c3aed; padding-bottom:8px; margin-bottom:12px;">
                        <h3 style="margin:0; font-family:'Playfair Display', serif; font-size:1.15rem; color:#0f172a;">🚐 Coordinación de Shuttles &amp; Traslados Privados</h3>
                        <p style="margin:2px 0 0; font-size:0.75rem; color:#64748b;">Ruta Oficial: Aeropuerto de Palma (PMI) ⇄ Hotel Belmond ⇄ Finca Bell Recó</p>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
                        <!-- VAN 1 -->
                        <div style="border:1px solid #e2e8f0; border-left:4px solid #7c3aed; border-radius:8px; padding:12px; background:#fdfdfd;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <strong style="color:#0f172a; font-size:0.88rem;">Van 01 · Mercedes-Benz Sprinter</strong>
                                <span style="background:#f5f3ff; color:#6d28d9; font-weight:800; font-size:0.75rem; padding:2px 8px; border-radius:12px;">⏰ 14:00 hrs</span>
                            </div>
                            <div style="font-size:0.78rem; color:#475569; margin-bottom:6px;">
                                🛫 Aeropuerto de Palma ➔ 🏨 Hotel Belmond
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700; margin-bottom:6px;">
                                <span>Ocupación: 14 / 18 pasajeros</span>
                                <span style="color:#166534;">4 asientos disponibles</span>
                            </div>
                            <div style="font-size:0.72rem; color:#64748b; border-top:1px dashed #cbd5e1; padding-top:6px;">
                                👤 <strong>Chofer:</strong> Antonio Soler · 📞 Tel: +34 611 223 344
                            </div>
                        </div>

                        <!-- VAN 2 -->
                        <div style="border:1px solid #e2e8f0; border-left:4px solid #7c3aed; border-radius:8px; padding:12px; background:#fdfdfd;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <strong style="color:#0f172a; font-size:0.88rem;">Van 02 · Mercedes-Benz Sprinter</strong>
                                <span style="background:#f5f3ff; color:#6d28d9; font-weight:800; font-size:0.75rem; padding:2px 8px; border-radius:12px;">⏰ 17:30 hrs</span>
                            </div>
                            <div style="font-size:0.78rem; color:#475569; margin-bottom:6px;">
                                🛫 Aeropuerto de Palma ➔ 🏨 Hotel Belmond
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700; margin-bottom:6px;">
                                <span>Ocupación: 12 / 18 pasajeros</span>
                                <span style="color:#166534;">6 asientos disponibles</span>
                            </div>
                            <div style="font-size:0.72rem; color:#64748b; border-top:1px dashed #cbd5e1; padding-top:6px;">
                                👤 <strong>Chofer:</strong> Jordi Miró · 📞 Tel: +34 622 334 455
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pdf-footer-signature" style="margin-top:20px; padding-top:10px; border-top:1px solid #cbd5e1; display:flex; justify-content:space-between; font-size:0.72rem; color:#64748b;">
                    <span>AURA WEDDINGS OS · Coordinación Logística Terrestre</span>
                    <strong>Página 1 de 2</strong>
                </div>
            </div>

            <!-- ========================================================================= -->
            <!-- PÁGINA 2: ITINERARIOS DE VUELO & LLEGADAS FORÁNEAS (DESTINOS FUERA DE NL) -->
            <!-- ========================================================================= -->
            <div class="pdf-page-2 page-break-before avoid-page-break" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:20px; margin-top:30px;">
                <div class="pdf-header-hero" style="border-bottom:2px solid #059669; padding-bottom:12px; margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; font-size:0.75rem; font-weight:800; padding:3px 10px; border-radius:4px;">
                            🛫 ANEXO DE LOGÍSTICA AÉREA &amp; VUELOS FORÁNEOS
                        </span>
                        <span style="font-size:0.75rem; color:#64748b; font-weight:700;">Boda Fuera de Nuevo León / Destino Internacional</span>
                    </div>
                    <h2 style="font-family:'Playfair Display', serif; font-size:1.45rem; color:#0f172a; margin:4px 0;">
                        Control Detallado de Vuelos &amp; Recepción en Aeropuerto
                    </h2>
                    <p style="margin:2px 0 0; font-size:0.78rem; color:#64748b;">
                        Monitoreo de aerolíneas, números de vuelo, escalas, terminales y asignación inmediata de shuttles para invitados que vuelan a la boda.
                    </p>
                </div>

                <div class="pdf-grid-3" style="margin-bottom:16px;">
                    <div class="pdf-stat-box" style="border-left:4px solid #059669; background:#f0fdf4;">
                        <span class="pdf-stat-label" style="color:#166534;">Aeropuerto Destino</span>
                        <div class="pdf-stat-val" style="color:#059669; font-size:1.15rem;">Palma de Mallorca (PMI)</div>
                        <small style="color:#15803d;">Recepción en Terminales 1 y 2</small>
                    </div>
                    <div class="pdf-stat-box" style="border-left:4px solid #1e40af; background:#f8fafc;">
                        <span class="pdf-stat-label" style="color:#1e3a8a;">Aerolíneas Monitoreadas</span>
                        <div class="pdf-stat-val" style="color:#1e40af; font-size:1.15rem;">Iberia · UX · AM</div>
                        <small style="color:#475569;">Conexiones directas MTY / MEX</small>
                    </div>
                    <div class="pdf-stat-box" style="border-left:4px solid #7c3aed; background:#faf5ff;">
                        <span class="pdf-stat-label" style="color:#6d28d9;">Enlace con Shuttles</span>
                        <div class="pdf-stat-val" style="color:#7c3aed; font-size:1.15rem;">100% Asignados</div>
                        <small style="color:#6b21a8;">Traslado directo al Hotel Belmond</small>
                    </div>
                </div>

                <table style="width:100%; border-collapse:collapse; font-size:0.8rem; margin-top:10px;">
                    <thead>
                        <tr style="background:#f8fafc; border-bottom:1.5px solid #cbd5e1; text-align:left; font-size:0.72rem; text-transform:uppercase; color:#334155;">
                            <th style="padding:10px 12px; border:1px solid #e2e8f0;">Pasajero(s) / Huésped</th>
                            <th style="padding:10px 12px; border:1px solid #e2e8f0;">Ruta de Vuelo</th>
                            <th style="padding:10px 12px; border:1px solid #e2e8f0;">Aerolínea &amp; No. Vuelo</th>
                            <th style="padding:10px 12px; border:1px solid #e2e8f0;">Fecha &amp; Hora Llegada</th>
                            <th style="padding:10px 12px; border:1px solid #e2e8f0;">Terminal</th>
                            <th style="padding:10px 12px; text-align:center; border:1px solid #e2e8f0;">Shuttle Asignado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${flightRowsHtml}
                    </tbody>
                </table>

                <div style="margin-top:20px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; padding:12px; font-size:0.75rem; color:#475569; line-height:1.4;">
                    <strong>ℹ️ Protocolo de Recepción en Aeropuerto:</strong> El chofer asignado a cada shuttle esperará en la puerta de salida de la terminal indicada con un cartel distintivo de la boda. En caso de retraso en el vuelo de algún pasajero, reportarlo de inmediato a la coordinación logística para reasignar su cupo en el siguiente shuttle disponible.
                </div>

                <div class="pdf-footer-signature" style="margin-top:24px; padding-top:12px; border-top:1px solid #cbd5e1; display:flex; justify-content:space-between; font-size:0.72rem; color:#64748b;">
                    <span>Documento oficial de coordinación logística para transportistas y concierge de hotel.</span>
                    <strong>Página 2 de 2 · AURA WEDDINGS ENTERPRISE OS</strong>
                </div>
            </div>
        </div>
    `;

    openLuxuryReportModal('✈️ Plan Oficial de Logística, Hoteles, Shuttles & Vuelos Foráneos', reportHtml);
}

