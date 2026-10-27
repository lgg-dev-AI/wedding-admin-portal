/**
 * Wedding Planner OS - Design Studio (Ficha de Estilo & Moodboard Colaborativo)
 * Paleta de colores oficial, referencias por zonas y exportación a PDF para proveedores.
 * 100% responsivo para Móvil, Tablet y Computadora.
 */

const DEFAULT_DESIGN_STUDIO_STATE = {
    palette: [
        { name: "Blanco Marfil", hex: "#FAF8F5" },
        { name: "Oro Atelier", hex: "#D4AF37" },
        { name: "Verde Eucalipto", hex: "#5F7161" },
        { name: "Terracota Suave", hex: "#C86D51" },
        { name: "Pizarra Nupcial", hex: "#1E293B" }
    ],
    zones: [
        {
            id: "zone_flowers",
            title: "🌸 Flores & Centros de Mesa",
            desc: "Arco ceremonial botánico, arreglos florales altos y bajos, bouquet nupcial de eucalipto y olivo.",
            notes: "Floristería silvestre orgánica con olivo, rosas inglesas blancas y acentos terracota. Cero follajes plásticos.",
            images: [
                "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80"
            ]
        },
        {
            id: "zone_rentals",
            title: "🪑 Mobiliario, Manteles & Loza",
            desc: "Mesas imperiales de madera lavada, servilletas de lino crudo y cubertería dorada mate.",
            notes: "Vajilla de autor con filo irregular en cerámica artesanal. Cristalería ámbar y copas de cristal cortado.",
            images: [
                "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80",
                "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80"
            ]
        },
        {
            id: "zone_lighting",
            title: "💡 Iluminación & Pista de Baile",
            desc: "Túnel de micro-leds cálidos sobre mesas imperiales y pista de madera nogal.",
            notes: "Luz ámbar cálida (2700K). Cero luces frías o neón durante la cena; iluminación robótica solo en fiesta.",
            images: [
                "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80"
            ]
        },
        {
            id: "zone_cake",
            title: "🍰 Detalles, Papelería & Pastel",
            desc: "Pastel semi-naked decorado con higos frescos y olivo, minutas en papel algodón.",
            notes: "Papelería impresa en serigrafía con lacre dorado y caligrafía manual en cada nombre.",
            images: [
                "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80"
            ]
        }
    ]
};

function getDesignStudioData() {
    const wId = window.currentWeddingId || 'aura';
    const key = `wedding_design_studio_${wId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.palette && parsed.zones) return parsed;
        } catch (e) {}
    }
    const initial = JSON.parse(JSON.stringify(DEFAULT_DESIGN_STUDIO_STATE));
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
}

function saveDesignStudioData(data) {
    const wId = window.currentWeddingId || 'aura';
    const key = `wedding_design_studio_${wId}`;
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Render Design Studio Tab
 */
function renderDesignStudioTab() {
    const container = document.getElementById('tab-designstudio');
    if (!container) return;

    const data = getDesignStudioData();
    const weddingState = (typeof getWeddingState === 'function' ? getWeddingState(window.currentWeddingId) : window.currentData) || {};
    const coupleName = weddingState.couple || "Novios";

    container.innerHTML = `
        <div class="tab-header" style="margin-bottom: 20px;">
            <div>
                <div class="d-flex align-center gap-2 mb-1">
                    <h1 class="tab-title">Design Studio &amp; Ficha de Estilo</h1>
                    <span class="badge-accent" style="background:#fef3c7; color:#b45309; border:1px solid #fde047; font-weight:800;">Moodboard Colaborativo</span>
                </div>
                <p class="tab-subtitle">Curaduría estética de <strong>${coupleName}</strong>. Paleta de colores oficial y referencias por zona para alinear a floristas, decoradores y banquete.</p>
            </div>
            <div class="tab-actions" style="display:flex; gap:10px; flex-wrap:wrap;">
                <button type="button" class="btn-action primary" onclick="printDesignDossierPDF()" style="background:#0f172a; border-color:#0f172a; font-weight:700; display:flex; align-items:center; gap:6px;">
                    <span>🖨️ Dossier Estilo en PDF</span>
                </button>
            </div>
        </div>

        <!-- PALETA DE COLOR OFICIAL -->
        <div class="section-card mb-4" style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:16px; padding:20px 24px; box-shadow:0 4px 16px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
                <div>
                    <h3 style="font-size:1.05rem; color:#0f172a; font-weight:800; margin:0; display:flex; align-items:center; gap:8px;">
                        <span>🎨</span> Paleta Cromática Nupcial Oficial
                    </h3>
                    <small style="color:#64748b; font-size:0.75rem;">Haz clic en cualquier color para cambiar el tono o copiar el código HEX para tus proveedores.</small>
                </div>
                <button type="button" class="btn-action secondary" onclick="addNewPaletteColor()" style="font-size:0.75rem; padding:6px 12px; font-weight:700;">
                    + Agregar Color
                </button>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:14px;">
                ${data.palette.map((c, i) => `
                    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px; padding:12px; text-align:center; position:relative;">
                        <input type="color" value="${c.hex}" onchange="updatePaletteColorHex(${i}, this.value)" style="width:54px; height:54px; border:none; border-radius:50%; cursor:pointer; background:none; margin-bottom:8px; box-shadow:0 4px 10px rgba(0,0,0,0.15);">
                        <input type="text" value="${c.name}" onchange="updatePaletteColorName(${i}, this.value)" style="width:100%; font-size:0.78rem; font-weight:800; color:#0f172a; text-align:center; border:none; background:transparent; margin-bottom:4px; outline:none;">
                        <div style="display:flex; justify-content:center; align-items:center; gap:4px;">
                            <code style="font-size:0.72rem; color:#64748b; font-weight:700;">${c.hex.toUpperCase()}</code>
                            <button type="button" onclick="copyHexCode('${c.hex}')" title="Copiar código HEX" style="background:none; border:none; color:#0284c7; font-size:0.75rem; cursor:pointer; padding:2px;">📋</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- MOODBOARD GRID POR ZONAS -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
            ${data.zones.map((z, idx) => `
                <div class="section-card" style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:14px; padding:18px; box-shadow:0 4px 14px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <h3 style="font-size:0.98rem; color:#0f172a; font-weight:800; margin:0;">${z.title}</h3>
                            <button type="button" onclick="openAddImageModal(${idx})" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; font-size:0.72rem; font-weight:700; padding:3px 8px; cursor:pointer;">+ Foto</button>
                        </div>
                        <p style="font-size:0.74rem; color:#64748b; margin:0 0 10px; line-height:1.4;">${z.desc}</p>
                        
                        <!-- IMAGES GALLERY GRID -->
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:12px;">
                            ${z.images.map(img => `
                                <div style="height:120px; border-radius:8px; overflow:hidden; background:#e2e8f0; position:relative;">
                                    <img src="${img}" alt="Referencia" style="width:100%; height:100%; object-fit:cover;">
                                </div>
                            `).join('')}
                        </div>

                        <!-- SPECIFIC STYLING NOTES -->
                        <div style="background:#f8fafc; border-left:3px solid #d97706; padding:8px 10px; border-radius:6px;">
                            <span style="display:block; font-size:0.68rem; font-weight:800; color:#b45309; text-transform:uppercase;">Instrucciones para Proveedores:</span>
                            <textarea onchange="updateZoneNotes(${idx}, this.value)" rows="2" style="width:100%; border:none; background:transparent; font-size:0.74rem; color:#334155; font-family:inherit; resize:none; outline:none; padding:2px 0;">${z.notes || ''}</textarea>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function updatePaletteColorHex(index, newHex) {
    const data = getDesignStudioData();
    if (data.palette[index]) {
        data.palette[index].hex = newHex;
        saveDesignStudioData(data);
        renderDesignStudioTab();
    }
}

function updatePaletteColorName(index, newName) {
    const data = getDesignStudioData();
    if (data.palette[index]) {
        data.palette[index].name = newName;
        saveDesignStudioData(data);
    }
}

function addNewPaletteColor() {
    const data = getDesignStudioData();
    data.palette.push({ name: "Nuevo Tono", hex: "#E2E8F0" });
    saveDesignStudioData(data);
    renderDesignStudioTab();
}

function copyHexCode(hex) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(hex).then(() => {
            if (typeof showToast === 'function') showToast(`🎨 Código ${hex.toUpperCase()} copiado.`);
        });
    }
}

function updateZoneNotes(zoneIndex, notes) {
    const data = getDesignStudioData();
    if (data.zones[zoneIndex]) {
        data.zones[zoneIndex].notes = notes;
        saveDesignStudioData(data);
    }
}

function openAddImageModal(zoneIndex) {
    const url = prompt("Pega el enlace de la imagen o foto de referencia (Pinterest, Unsplash, Instagram o web):");
    if (!url || !url.trim()) return;

    const data = getDesignStudioData();
    if (data.zones[zoneIndex]) {
        data.zones[zoneIndex].images.push(url.trim());
        saveDesignStudioData(data);
        renderDesignStudioTab();
        if (typeof showToast === 'function') showToast("📷 Imagen de referencia agregada al Moodboard.");
    }
}

/**
 * Printable Editorial Design Dossier PDF for Vendors (Florists, Decorators)
 */
function printDesignDossierPDF() {
    const data = getDesignStudioData();
    const weddingState = (typeof getWeddingState === 'function' ? getWeddingState(window.currentWeddingId) : window.currentData) || {};
    const coupleName = weddingState.couple || "Novios";
    const date = weddingState.date || "Fecha de Boda";
    const venue = weddingState.venue || "Recinto";

    const printWin = window.open('', '_blank');
    if (!printWin) {
        alert('Por favor habilita las ventanas emergentes para ver el dossier.');
        return;
    }

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Dossier de Estilo Nupcial - ${coupleName}</title>
            <style>
                @page {
                    size: letter portrait;
                    margin: 12mm 15mm 12mm 15mm;
                }
                * {
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                html, body {
                    margin: 0;
                    padding: 0;
                    background: #ffffff;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif;
                    color: #1e293b;
                    line-height: 1.45;
                }
                .dossier-wrap {
                    padding: 24px 30px;
                }
                .header {
                    border-bottom: 2px solid #0f172a;
                    padding-bottom: 12px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                h1 { margin: 0; font-size: 1.5rem; color: #0f172a; font-family: 'Playfair Display', Georgia, serif; }
                .meta { color: #64748b; font-size: 0.85rem; margin-top: 4px; }
                .palette-bar { display: flex; gap: 12px; margin-bottom: 24px; page-break-inside: avoid; break-inside: avoid; }
                .palette-item {
                    flex: 1;
                    text-align: center;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 10px 8px;
                    background: #ffffff;
                }
                .color-svg-wrap {
                    width: 44px;
                    height: 44px;
                    margin: 0 auto 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .zone-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .zone-card {
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 14px;
                    background: #f8fafc;
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
                .zone-title { font-size: 0.98rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
                .zone-notes {
                    background: #ffffff;
                    border-left: 3px solid #d97706;
                    padding: 7px 10px;
                    font-size: 0.78rem;
                    margin-top: 8px;
                    color: #334155;
                }
                .img-row { display: flex; gap: 8px; margin-top: 8px; }
                .img-row img { width: 50%; height: 105px; object-fit: cover; border-radius: 6px; }
                .no-print { display: block; }
                @media print {
                    .no-print { display: none !important; }
                    .dossier-wrap { padding: 0 !important; }
                    body { margin: 0 !important; padding: 0 !important; }
                }
            </style>
        </head>
        <body>
            <div class="dossier-wrap">
                <div class="header">
                    <div>
                        <span style="font-size:0.75rem; text-transform:uppercase; color:#d97706; font-weight:800; letter-spacing:0.5px;">Ficha Oficial de Ambientación &amp; Estilo</span>
                        <h1>${coupleName}</h1>
                        <div class="meta">Fecha: ${date} · Recinto: ${venue}</div>
                    </div>
                    <div class="no-print">
                        <button onclick="window.print()" style="padding: 10px 20px; background:#0f172a; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:800;">🖨️ Imprimir Dossier</button>
                    </div>
                </div>

                <h3 style="font-size:0.95rem; color:#0f172a; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px;">PALETA CROMÁTICA OFICIAL</h3>
                <div class="palette-bar">
                    ${data.palette.map(c => `
                        <div class="palette-item">
                            <div class="color-svg-wrap">
                                <svg width="44" height="44" viewBox="0 0 44 44" style="display:block;">
                                    <circle cx="22" cy="22" r="20" fill="${c.hex}" stroke="#cbd5e1" stroke-width="1.5" />
                                </svg>
                            </div>
                            <strong style="display:block; font-size:0.78rem; color:#0f172a;">${c.name}</strong>
                            <code style="font-size:0.72rem; color:#64748b; font-weight:700;">${c.hex.toUpperCase()}</code>
                        </div>
                    `).join('')}
                </div>

                <h3 style="font-size:0.95rem; color:#0f172a; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px;">DIRECTRICES VISUALES POR ZONA</h3>
                <div class="zone-grid">
                    ${data.zones.map(z => `
                        <div class="zone-card">
                            <div class="zone-title">${z.title}</div>
                            <div style="font-size:0.75rem; color:#64748b;">${z.desc}</div>
                            <div class="img-row">
                                ${z.images.map(img => `<img src="${img}" alt="Ref">`).join('')}
                            </div>
                            <div class="zone-notes">
                                <strong>Instrucciones para Proveedor:</strong><br>
                                ${z.notes}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </body>
        </html>
    `;

    printWin.document.write(html);
    printWin.document.close();
}

// Global exposure
window.renderDesignStudioTab = renderDesignStudioTab;
window.updatePaletteColorHex = updatePaletteColorHex;
window.updatePaletteColorName = updatePaletteColorName;
window.addNewPaletteColor = addNewPaletteColor;
window.copyHexCode = copyHexCode;
window.updateZoneNotes = updateZoneNotes;
window.openAddImageModal = openAddImageModal;
window.printDesignDossierPDF = printDesignDossierPDF;
