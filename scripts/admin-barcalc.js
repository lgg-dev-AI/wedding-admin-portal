// ==========================================================================
// CALCULADORA INTELIGENTE DE BARRA, MIXOLOGÍA & CONTROL DE DESCORCHE
// ==========================================================================

const defaultAuraBarItems = [
    { id: 'b1', name: 'Tequila Don Julio 70 / Herradura Ultra (750ml)', category: 'tequila', suggested: 18, entered: 20, opened: 16, cost: 950, isCustom: false },
    { id: 'b2', name: 'Mezcal Ojo de Tigre / 400 Conejos (750ml)', category: 'mezcal', suggested: 10, entered: 12, opened: 9, cost: 720, isCustom: false },
    { id: 'b3', name: 'Whisky Johnnie Walker Black / Macallan 12 (750ml)', category: 'whisky', suggested: 14, entered: 15, opened: 13, cost: 1100, isCustom: false },
    { id: 'b4', name: 'Ginebra Hendrick\'s / Bombay Sapphire (750ml)', category: 'gin', suggested: 8, entered: 10, opened: 7, cost: 890, isCustom: false },
    { id: 'b5', name: 'Vodka Grey Goose / Ketel One (750ml)', category: 'vodka', suggested: 6, entered: 8, opened: 5, cost: 680, isCustom: false },
    { id: 'b6', name: 'Vino Tinto Banquete (Cabernet Sauvignon / Malbec)', category: 'wine', suggested: 28, entered: 30, opened: 26, cost: 420, isCustom: false },
    { id: 'b7', name: 'Champagne Moët & Chandon / Prosecco Brindis', category: 'champagne', suggested: 22, entered: 24, opened: 21, cost: 1350, isCustom: false },
    { id: 'b8', name: 'Refrescos Variados & Aguas Minerales (Cajas 24 pzas)', category: 'mixer', suggested: 35, entered: 40, opened: 36, cost: 360, isCustom: false },
    { id: 'b9', name: 'Hielo en Cubo Cristalino Purificado (Bolsas 5kg)', category: 'ice', suggested: 50, entered: 55, opened: 52, cost: 45, isCustom: false }
];

function getStandardCleanBarItems() {
    return [
        { id: 'b1', name: 'Tequila (750ml)', category: 'tequila', suggested: 0, entered: 0, opened: 0, cost: 950, isCustom: false },
        { id: 'b2', name: 'Mezcal (750ml)', category: 'mezcal', suggested: 0, entered: 0, opened: 0, cost: 720, isCustom: false },
        { id: 'b3', name: 'Whisky (750ml)', category: 'whisky', suggested: 0, entered: 0, opened: 0, cost: 1100, isCustom: false },
        { id: 'b4', name: 'Ginebra (750ml)', category: 'gin', suggested: 0, entered: 0, opened: 0, cost: 890, isCustom: false },
        { id: 'b5', name: 'Vodka (750ml)', category: 'vodka', suggested: 0, entered: 0, opened: 0, cost: 680, isCustom: false },
        { id: 'b6', name: 'Vino Tinto Banquete', category: 'wine', suggested: 0, entered: 0, opened: 0, cost: 420, isCustom: false },
        { id: 'b7', name: 'Champagne / Espumoso Brindis', category: 'champagne', suggested: 0, entered: 0, opened: 0, cost: 1350, isCustom: false },
        { id: 'b8', name: 'Refrescos & Aguas Minerales (Cajas 24 pzas)', category: 'mixer', suggested: 0, entered: 0, opened: 0, cost: 360, isCustom: false },
        { id: 'b9', name: 'Hielo en Cubo Purificado (Bolsas 5kg)', category: 'ice', suggested: 0, entered: 0, opened: 0, cost: 45, isCustom: false }
    ];
}

function getActiveBarInventory() {
    const wId = (typeof currentWeddingId !== 'undefined' && currentWeddingId) ? currentWeddingId : null;
    if (!wId) return [];

    const storageKey = 'wedding_bar_inventory_' + wId;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        } catch(e) {}
    }

    if (wId === 'aura') {
        return JSON.parse(JSON.stringify(defaultAuraBarItems));
    }

    return getStandardCleanBarItems();
}

function saveActiveBarInventory(items) {
    const wId = (typeof currentWeddingId !== 'undefined' && currentWeddingId) ? currentWeddingId : null;
    if (!wId) return;
    try {
        localStorage.setItem('wedding_bar_inventory_' + wId, JSON.stringify(items));
    } catch(e) {}
}

let currentBarItems = [];

const barInventoryState = {
    get items() {
        if (!currentBarItems || currentBarItems.length === 0) {
            currentBarItems = getActiveBarInventory();
        }
        return currentBarItems;
    },
    set items(val) {
        currentBarItems = val;
        saveActiveBarInventory(val);
    }
};

function syncBarGuestsFromConfirmed(silent = false) {
    const input = document.getElementById('barGuestsInput');
    const hint = document.getElementById('barGuestsSyncHint');

    if (typeof currentWeddingId === 'undefined' || !currentWeddingId) {
        if (input) input.value = 0;
        if (hint) hint.innerText = 'Sin boda activa';
        recalcBar();
        return 0;
    }

    if (typeof getWeddingState === 'function') {
        const state = getWeddingState(currentWeddingId);
        if (state && state.guests) {
            const confirmedPasses = state.guests
                .filter(g => g.status === 'confirmed')
                .reduce((acc, g) => acc + (g.passes || 1), 0);
            
            const count = confirmedPasses > 0 ? confirmedPasses : (state.targetGuests || (currentWeddingId === 'aura' ? 180 : 0));
            if (input) {
                input.value = count;
                if (hint) {
                    hint.innerText = confirmedPasses > 0 ? `✓ ${confirmedPasses} confirmados` : (count > 0 ? `Meta: ${count}` : '0 comensales');
                }
                recalcBar();
                if (!silent && typeof showToast === 'function' && count > 0) {
                    showToast(`🍾 Comensales sincronizados con lista oficial: ${count} pax.`);
                }
                return count;
            }
        }
    }
    if (input) input.value = 0;
    if (hint) hint.innerText = '0 comensales';
    recalcBar();
    return null;
}

function recalcBar() {
    const guestsInput = document.getElementById('barGuestsInput');
    const hoursInput = document.getElementById('barHoursInput');
    const tempInput = document.getElementById('barTempInput');
    if (!guestsInput || !hoursInput) return;

    if (!currentWeddingId) {
        guestsInput.value = 0;
        currentBarItems = [];
        renderBarCalculator();
        return;
    }

    currentBarItems = getActiveBarInventory();

    let guests = parseInt(guestsInput.value);
    if (isNaN(guests) || guests < 0) {
        guests = (currentWeddingId === 'aura' ? 180 : 0);
        guestsInput.value = guests;
    }
    const hours = parseInt(hoursInput.value) || 8;
    const tempMultiplier = tempInput && tempInput.value === 'hot' ? 1.2 : 1.0;

    // Regla de Oro Sommelier / Banquetero (Estándar México & LATAM):
    // 1 botella de 750ml = ~16 copas/tragos estándar de 1.5 oz (45 ml).
    // Consumo promedio estimado: 5 tragos por comensal adulto en 8 horas de barra.
    // Factor: 1 botella por cada 3.2 comensales adultos para 8 horas base.
    const totalLiquorBottles = guests > 0 ? Math.round((guests / 3.2) * (hours / 8) * tempMultiplier) : 0;
    
    // Perfil de Consumo Personalizado
    const profileInput = document.getElementById('barProfileInput');
    const profile = profileInput ? profileInput.value : 'balanced';

    let pTequila = 0.32, pMezcal = 0.16, pWhisky = 0.24, pGin = 0.14, pVodka = 0.14;

    if (profile === 'tequilero') {
        pTequila = 0.48; pWhisky = 0.22; pMezcal = 0.14; pGin = 0.08; pVodka = 0.08;
    } else if (profile === 'cocktail') {
        pGin = 0.28; pMezcal = 0.24; pTequila = 0.20; pVodka = 0.16; pWhisky = 0.12;
    } else if (profile === 'whisky') {
        pWhisky = 0.42; pTequila = 0.26; pMezcal = 0.12; pGin = 0.10; pVodka = 0.10;
    } else if (profile === 'carajillos') {
        pTequila = 0.30; pWhisky = 0.25; pMezcal = 0.15; pGin = 0.15; pVodka = 0.15;
    }

    const tequila = Math.round(totalLiquorBottles * pTequila);
    const mezcal = Math.round(totalLiquorBottles * pMezcal);
    const whisky = Math.round(totalLiquorBottles * pWhisky);
    const gin = Math.round(totalLiquorBottles * pGin);
    const vodka = Math.round(totalLiquorBottles * pVodka);
    const wine = guests > 0 ? Math.round((guests / 4.5) * tempMultiplier) : 0;
    const champagne = guests > 0 ? Math.round(guests / 6.0) : 0;
    const mixers = guests > 0 ? Math.round((guests / 4.5) * (hours / 8)) : 0;
    const ice = guests > 0 ? Math.round((guests / 3.0) * (hours / 8) * tempMultiplier) : 0;

    // Update standard item suggestions
    const bTequila = currentBarItems.find(i => i.category === 'tequila');
    const bMezcal = currentBarItems.find(i => i.category === 'mezcal');
    const bWhisky = currentBarItems.find(i => i.category === 'whisky');
    const bGin = currentBarItems.find(i => i.category === 'gin');
    const bVodka = currentBarItems.find(i => i.category === 'vodka');
    const bWine = currentBarItems.find(i => i.category === 'wine');
    const bChampagne = currentBarItems.find(i => i.category === 'champagne');
    const bMixer = currentBarItems.find(i => i.category === 'mixer');
    const bIce = currentBarItems.find(i => i.category === 'ice');

    if (bTequila) bTequila.suggested = tequila;
    if (bMezcal) bMezcal.suggested = mezcal;
    if (bWhisky) bWhisky.suggested = whisky;
    if (bGin) bGin.suggested = gin;
    if (bVodka) bVodka.suggested = vodka;
    if (bWine) bWine.suggested = wine;
    if (bChampagne) bChampagne.suggested = champagne;
    if (bMixer) bMixer.suggested = mixers;
    if (bIce) bIce.suggested = ice;

    renderBarCalculator();
}

function renderBarCalculator() {
    const tableBody = document.getElementById('barInventoryTableBody');
    if (!tableBody) return;

    const totalEnteredEl = document.getElementById('statBarEntered');
    const totalOpenedEl = document.getElementById('statBarOpened');
    const totalReturnedEl = document.getElementById('statBarReturned');
    const totalSavingsEl = document.getElementById('statBarSavings');

    if (!currentWeddingId) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:32px 16px; color:#64748b; background:#f8fafc;">
                    <div style="font-size:1.8rem; margin-bottom:8px;">🍾</div>
                    <div style="font-weight:700; color:#0f172a; margin-bottom:4px;">No hay boda seleccionada</div>
                    <small>Crea o selecciona una boda para gestionar la matriz de insumos, destilados y control de descorche.</small>
                </td>
            </tr>
        `;
        if (totalEnteredEl) totalEnteredEl.innerText = '0';
        if (totalOpenedEl) totalOpenedEl.innerText = '0';
        if (totalReturnedEl) totalReturnedEl.innerText = '0';
        if (totalSavingsEl) totalSavingsEl.innerText = '$0 MXN';
        return;
    }

    const items = currentBarItems || [];
    if (items.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:32px 16px; color:#64748b; background:#f8fafc;">
                    <div style="font-size:1.8rem; margin-bottom:8px;">🍾</div>
                    <div style="font-weight:700; color:#0f172a; margin-bottom:4px;">No hay botellas ni insumos registrados</div>
                    <small>Usa el botón "+ Agregar Destilado / Insumo" para registrar botellas o especifica comensales para el cálculo.</small>
                </td>
            </tr>
        `;
        if (totalEnteredEl) totalEnteredEl.innerText = '0';
        if (totalOpenedEl) totalOpenedEl.innerText = '0';
        if (totalReturnedEl) totalReturnedEl.innerText = '0';
        if (totalSavingsEl) totalSavingsEl.innerText = '$0 MXN';
        return;
    }

    let totalEntered = 0;
    let totalOpened = 0;
    let totalReturned = 0;
    let totalSavingsValue = 0;

    tableBody.innerHTML = items.map((item, idx) => {
        const returned = Math.max(0, (item.entered || 0) - (item.opened || 0));
        const itemRefundVal = returned * (item.cost || 0);
        
        totalEntered += (item.entered || 0);
        totalOpened += (item.opened || 0);
        totalReturned += returned;
        totalSavingsValue += itemRefundVal;

        return `
            <tr>
                <td>
                    <div style="font-weight:700; color:#0f172a;">${item.name}</div>
                    <small style="color:#64748b;">$${(item.cost || 0).toLocaleString('es-MX')} MXN c/u</small>
                </td>
                <td style="text-align:center; font-weight:700; color:#d97706; background:#fffbeb;">
                    ${item.suggested || 0}
                </td>
                <td style="text-align:center;">
                    <input type="number" min="0" class="input-table-mini" value="${item.entered || 0}" onchange="updateBarItem(${idx}, 'entered', this.value)">
                </td>
                <td style="text-align:center;">
                    <input type="number" min="0" class="input-table-mini" value="${item.opened || 0}" onchange="updateBarItem(${idx}, 'opened', this.value)">
                </td>
                <td style="text-align:center; font-weight:800; color:#10b981; background:#ecfdf5;">
                    ${returned}
                </td>
                <td style="text-align:right; font-weight:700; color:#0f172a;">
                    $${itemRefundVal.toLocaleString('es-MX')} MXN
                </td>
                <td style="text-align:center;">
                    ${item.isCustom ? `
                        <button class="btn-icon-action danger" onclick="deleteBarItem(${idx})" title="Eliminar insumo">✕</button>
                    ` : `
                        <span style="color:#cbd5e1; font-size:0.75rem;">—</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');

    // Update KPI Metric Cards
    if (totalEnteredEl) totalEnteredEl.innerText = totalEntered;
    if (totalOpenedEl) totalOpenedEl.innerText = totalOpened;
    if (totalReturnedEl) totalReturnedEl.innerText = totalReturned;
    if (totalSavingsEl) totalSavingsEl.innerText = `$${totalSavingsValue.toLocaleString('es-MX')} MXN`;
}

function updateBarItem(idx, field, value) {
    if (!currentBarItems[idx]) return;
    currentBarItems[idx][field] = Math.max(0, parseInt(value) || 0);
    saveActiveBarInventory(currentBarItems);
    renderBarCalculator();
    if (typeof showToast === 'function') {
        showToast(`🍾 Control de botellas actualizado.`);
    }
}

// ==========================================================================
// MODAL: AGREGAR DESTILADO / INSUMO PERSONALIZADO
// ==========================================================================
function openNewBarItemModal() {
    if (!currentWeddingId) {
        alert('Por favor selecciona o crea una boda antes de agregar insumos a la barra.');
        return;
    }
    document.getElementById('newBarItemName').value = '';
    document.getElementById('newBarItemCat').value = 'tequila';
    document.getElementById('newBarItemCost').value = '850';
    document.getElementById('newBarItemEntered').value = '12';
    document.getElementById('newBarItemOpened').value = '8';

    const m = document.getElementById('modalNewBarItem');
    if (m) m.classList.add('active');
}

function closeNewBarItemModal() {
    const m = document.getElementById('modalNewBarItem');
    if (m) m.classList.remove('active');
}

function saveNewBarItem() {
    if (!currentWeddingId) return;
    const name = document.getElementById('newBarItemName').value.trim();
    const category = document.getElementById('newBarItemCat').value;
    const cost = parseFloat(document.getElementById('newBarItemCost').value) || 0;
    const entered = parseInt(document.getElementById('newBarItemEntered').value) || 0;
    const opened = parseInt(document.getElementById('newBarItemOpened').value) || 0;

    if (!name) {
        alert('Por favor especifica el nombre o marca del destilado o insumo.');
        return;
    }

    const newItem = {
        id: 'bar_custom_' + Date.now(),
        name: name,
        category: category,
        suggested: entered, // Baseline suggestion set to entered
        entered: entered,
        opened: opened,
        cost: cost,
        isCustom: true
    };

    if (!currentBarItems) currentBarItems = [];
    currentBarItems.push(newItem);
    saveActiveBarInventory(currentBarItems);
    closeNewBarItemModal();
    renderBarCalculator();
    if (typeof showToast === 'function') {
        showToast(`🍾 Insumo "${name}" agregado a la matriz.`);
    }
}

function deleteBarItem(idx) {
    if (!currentBarItems || !currentBarItems[idx]) return;
    const item = currentBarItems[idx];

    if (confirm(`¿Deseas eliminar "${item.name}" de la matriz de descorche?`)) {
        currentBarItems.splice(idx, 1);
        saveActiveBarInventory(currentBarItems);
        renderBarCalculator();
        if (typeof showToast === 'function') {
            showToast(`🗑️ Insumo eliminado.`);
        }
    }
}
