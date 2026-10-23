// ==========================================================================
// PREDICTIVE CASHFLOW & VENDOR MILESTONE ENGINE
// ==========================================================================

function renderCashflowTab() {
    currentData = getWeddingState(currentWeddingId);
    const upcomingList = document.getElementById('upcomingMilestonesList');
    const allList = document.getElementById('allMilestonesList');
    const badge = document.getElementById('badgeUpcomingPayments');

    if (!upcomingList || !allList) return;

    upcomingList.innerHTML = '';
    allList.innerHTML = '';

    const milestones = currentData.milestones || [];
    const pending = milestones.filter(m => m.status === 'pending');
    if (badge) badge.innerText = `${pending.length} pendientes`;

    if (pending.length === 0) {
        upcomingList.innerHTML = '<div style="color:#64748b; font-size:0.85rem; padding:15px; text-align:center; background:#f8fafc; border-radius:8px;">✓ Todos los hitos están al corriente.</div>';
    } else {
        pending.forEach(m => {
            const item = document.createElement('div');
            item.className = 'milestone-card urgent';
            item.innerHTML = `
                <div class="m-header">
                    <div>
                        <span class="m-urgency-badge">⏰ Vence en ${m.daysBefore} días (${m.dueDate})</span>
                        <h4 class="m-vendor-title">${m.vendorName}</h4>
                        <div class="m-concept">${m.title}</div>
                    </div>
                    <div class="m-amount">$${m.amount.toLocaleString('es-MX')} MXN</div>
                </div>
                <div class="m-bank-info">
                    <span>🏦 <strong>${m.bank || 'Banco'}</strong> · CLABE: <code>${m.clabe || '—'}</code></span>
                </div>
                <div class="m-actions">
                    <button class="btn-action primary" style="font-size:0.75rem; padding:6px 14px;" onclick="executeMagicApproval('${m.id}')">✓ Marcar como Pagado</button>
                </div>
            `;
            upcomingList.appendChild(item);
        });
    }

    // Render All Milestones
    milestones.forEach(m => {
        const item = document.createElement('div');
        item.className = `milestone-card ${m.status === 'paid' ? 'paid' : ''}`;
        item.innerHTML = `
            <div class="m-header">
                <div>
                    <span class="m-status-pill ${m.status}">${m.status === 'paid' ? '✓ Pagado' : '⏳ Pendiente'}</span>
                    <h4 class="m-vendor-title">${m.vendorName}</h4>
                    <div class="m-concept">${m.title} · Vence: ${m.dueDate}</div>
                </div>
                <div class="m-amount" style="${m.status === 'paid' ? 'color:#10b981;' : ''}">$${m.amount.toLocaleString('es-MX')} MXN</div>
            </div>
        `;
        allList.appendChild(item);
    });
}

function showNewMilestoneModal() {
    const vendorName = prompt("Nombre del proveedor:", "Haute Cuisine Mallorca");
    if (!vendorName) return;
    const title = prompt("Concepto del hito (ej. Segundo Pago 25%):", "Pago Intermedio 25%");
    const amount = parseInt(prompt("Monto en MXN:", "35000") || "0");
    const dueDate = prompt("Fecha límite (ej. 15 Oct 2027):", "15 Oct 2027");

    const newM = {
        id: "m_" + Date.now(),
        vendorId: "ven1",
        vendorName,
        title,
        amount,
        dueDate,
        daysBefore: 15,
        status: "pending",
        urgency: "medium",
        bank: "Santander",
        clabe: "ES76 0049 1500 0512 3456 7890"
    };

    if (!currentData.milestones) currentData.milestones = [];
    currentData.milestones.push(newM);
    saveWeddingState(currentWeddingId, currentData);
    logAuditAction(currentWeddingId, "Wedding Planner", "planner", `Nuevo hito de pago creado: ${title} para ${vendorName} ($${amount.toLocaleString('es-MX')})`);
    renderCashflowTab();
    renderDashboard();
    showToast(`✓ Hito de pago creado con éxito.`);
}
