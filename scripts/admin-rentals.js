// ==========================================================================
// RENTAL ASSET AUDIT & SECURITY DEPOSIT DEDUCTION ENGINE
// ==========================================================================

function renderRentalsTab() {
    currentData = getWeddingState(currentWeddingId);
    const tbody = document.getElementById('rentalsTableBody');
    const summaryLabel = document.getElementById('rentalDepositSummary');
    const refundCard = document.getElementById('rentalRefundCard');

    if (!tbody) return;

    tbody.innerHTML = '';
    const rentals = currentData.rentals || [];
    let totalDeductions = 0;

    rentals.forEach(r => {
        const deduction = (r.broken || 0) * (r.penaltyPerItem || 0);
        totalDeductions += deduction;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${r.item}</strong></td>
            <td>${r.vendor}</td>
            <td>${r.delivered} pzas</td>
            <td><strong style="color:#10b981;">${r.returned} pzas</strong></td>
            <td><strong style="${r.broken > 0 ? 'color:#ef4444;' : ''}">${r.broken} pzas</strong></td>
            <td>$${r.penaltyPerItem.toLocaleString('es-MX')} MXN</td>
            <td><strong style="color:${deduction > 0 ? '#ef4444' : '#10b981'};">$${deduction.toLocaleString('es-MX')} MXN</strong></td>
            <td>
                <button class="btn-action secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="editRentalBreakage('${r.id}')">Registrar Rotura</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const deposit = currentData.securityDeposit || 20000;
    const finalRefund = Math.max(0, deposit - totalDeductions);

    if (summaryLabel) summaryLabel.innerText = `Depósito en Garantía Retenido: $${deposit.toLocaleString('es-MX')} MXN`;

    if (refundCard) {
        refundCard.innerHTML = `
            <div class="refund-summary-grid">
                <div><span>Depósito Inicial en Garantía:</span><strong>$${deposit.toLocaleString('es-MX')} MXN</strong></div>
                <div><span>Deducción Total por Mermas / Roturas:</span><strong style="color:#ef4444;">-$${totalDeductions.toLocaleString('es-MX')} MXN</strong></div>
                <div class="refund-total-highlight"><span>Saldo Neto a Reembolsar a los Novios:</span><strong style="color:#10b981;">$${finalRefund.toLocaleString('es-MX')} MXN</strong></div>
            </div>
            <button class="btn-action primary" style="margin-top:15px;" onclick="closeRentalAuditReport()">📄 Emitir Acta de Devolución de Depósito</button>
        `;
    }
}

function editRentalBreakage(rentalId) {
    const r = (currentData.rentals || []).find(item => item.id === rentalId);
    if (!r) return;
    const brokenStr = prompt(`Ingresar número de piezas rotas/faltantes para "${r.item}":`, r.broken);
    if (brokenStr === null) return;
    const broken = parseInt(brokenStr) || 0;
    r.broken = broken;
    r.returned = r.delivered - broken;
    r.totalPenalty = broken * r.penaltyPerItem;
    saveWeddingState(currentWeddingId, currentData);
    logAuditAction(currentWeddingId, "Wedding Planner", "planner", `Auditoría de mobiliario: ${broken} piezas rotas registradas en ${r.item} (Penalización: $${r.totalPenalty} MXN)`);
    renderRentalsTab();
    showToast(`✓ Inventario de ${r.item} actualizado.`);
}

function showNewRentalModal() {
    const item = prompt("Nombre del artículo rentado:", "Copas de Champagne Cristal");
    if (!item) return;
    const vendor = prompt("Proveedor de renta:", "Event Rentals Mallorca");
    const delivered = parseInt(prompt("Cantidad entregada:", "180") || "0");
    const penalty = parseInt(prompt("Costo de reposición por rotura en MXN:", "250") || "0");

    const newR = {
        id: "r_" + Date.now(),
        item, vendor, delivered, returned: delivered, broken: 0, penaltyPerItem: penalty, totalPenalty: 0
    };
    if (!currentData.rentals) currentData.rentals = [];
    currentData.rentals.push(newR);
    saveWeddingState(currentWeddingId, currentData);
    renderRentalsTab();
    showToast(`✓ Artículo "${item}" agregado a la auditoría de mobiliario.`);
}

function closeRentalAuditReport() {
    window.print();
}
