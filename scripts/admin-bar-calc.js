// ==========================================================================
// ALGORITHMIC BAR & BEVERAGE CONSUMPTION CALCULATOR
// ==========================================================================

function recalcBar() {
    currentData = getWeddingState(currentWeddingId);
    const confirmed = currentData.guests.filter(g => g.status === 'confirmed');
    const adults = parseInt(document.getElementById('barAdultsInput')?.value) || confirmed.length || 100;
    const hours = parseInt(document.getElementById('barHoursInput')?.value) || 8;
    const intensity = document.getElementById('barIntensity')?.value || 'party';
    const season = document.getElementById('barSeason')?.value || 'warm';

    let multiplier = 1.2;
    if (intensity === 'moderate') multiplier = 0.9;
    if (intensity === 'vip') multiplier = 1.6;

    const totalDrinks = Math.round(adults * hours * multiplier);
    
    let teqRatio = season === 'warm' ? 0.35 : 0.25;
    let whiskyRatio = season === 'warm' ? 0.15 : 0.30;
    let ginRatio = season === 'warm' ? 0.25 : 0.15;
    let vodkaRatio = 0.10;
    let wineRatio = 0.15;

    const tequilaBottles = Math.ceil((totalDrinks * teqRatio) / 16);
    const whiskyBottles = Math.ceil((totalDrinks * whiskyRatio) / 16);
    const ginBottles = Math.ceil((totalDrinks * ginRatio) / 16);
    const vodkaBottles = Math.ceil((totalDrinks * vodkaRatio) / 16);
    const wineBottles = Math.ceil((totalDrinks * wineRatio) / 5);
    const champagneBottles = Math.ceil(adults / 5);
    const iceKg = Math.round(adults * 1.5);
    const mixersCans = Math.round(totalDrinks * 1.8);

    const estCost = (tequilaBottles * 650) + (whiskyBottles * 850) + (ginBottles * 700) + (vodkaBottles * 500) + (wineBottles * 380) + (champagneBottles * 550) + (iceKg * 10) + (mixersCans * 18);

    const costLabel = document.getElementById('barEstimatedTotalCost');
    if (costLabel) costLabel.innerText = `Costo Est. Mayoreo: $${estCost.toLocaleString('es-MX')} MXN`;

    const grid = document.getElementById('barBottlesGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="bar-bottle-card">
                <div class="b-icon">🌵</div>
                <div class="b-title">Tequila Cristalino / Reposado</div>
                <div class="b-count">${tequilaBottles} botellas</div>
                <small>${Math.ceil(tequilaBottles/12)} cajas · 750ml</small>
            </div>
            <div class="bar-bottle-card">
                <div class="b-icon">🥃</div>
                <div class="b-title">Whisky Escocés / Bourbon</div>
                <div class="b-count">${whiskyBottles} botellas</div>
                <small>${Math.ceil(whiskyBottles/12)} cajas · 750ml</small>
            </div>
            <div class="bar-bottle-card">
                <div class="b-icon">🍸</div>
                <div class="b-title">Ginebra London Dry / Rosa</div>
                <div class="b-count">${ginBottles} botellas</div>
                <small>${Math.ceil(ginBottles/12)} cajas · 750ml</small>
            </div>
            <div class="bar-bottle-card">
                <div class="b-icon">🧊</div>
                <div class="b-title">Vodka Premium</div>
                <div class="b-count">${vodkaBottles} botellas</div>
                <small>${Math.ceil(vodkaBottles/12)} cajas · 750ml</small>
            </div>
            <div class="bar-bottle-card">
                <div class="b-icon">🍷</div>
                <div class="b-title">Vino Tinto &amp; Blanco</div>
                <div class="b-count">${wineBottles} botellas</div>
                <small>${Math.ceil(wineBottles/12)} cajas de reserva</small>
            </div>
            <div class="bar-bottle-card">
                <div class="b-icon">🥂</div>
                <div class="b-title">Champagne / Prosecco (Brindis)</div>
                <div class="b-count">${champagneBottles} botellas</div>
                <small>${Math.ceil(champagneBottles/6)} cajas · 1 copa x adulto</small>
            </div>
        `;
    }

    const mixersWrap = document.getElementById('barMixersSummary');
    if (mixersWrap) {
        mixersWrap.innerHTML = `
            <div class="mixers-pill">🧊 Hielo Purificado: <strong>${iceKg} kg (${Math.ceil(iceKg/5)} bolsas de 5kg)</strong></div>
            <div class="mixers-pill">🥤 Refrescos &amp; Agua Mineral: <strong>${mixersCans} latas (${Math.ceil(mixersCans/24)} cartones)</strong></div>
            <div class="mixers-pill">🍋 Cítricos (Limón / Naranja / Romero): <strong>${Math.ceil(adults * 0.15)} kg</strong></div>
            <div class="mixers-pill">💧 Agua Natural Embotellada: <strong>${adults * 2} botellines</strong></div>
        `;
    }

    const cascadeCatering = document.getElementById('cascadeCateringCost');
    if (cascadeCatering) cascadeCatering.innerText = (adults * (currentData.costPerGuestCatering || 1450)).toLocaleString('es-MX');
    const cascadeBottles = document.getElementById('cascadeBottlesCount');
    if (cascadeBottles) cascadeBottles.innerText = tequilaBottles + whiskyBottles + ginBottles + vodkaBottles + wineBottles + champagneBottles;
}

function exportBarOrder() {
    window.print();
}
