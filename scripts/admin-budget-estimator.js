/**
 * Wedding Planner OS - Estimador Inteligente de Presupuesto (Smart Budget Estimator)
 * Gráfica interactiva de dona/pastel, desglose por rubros estándar y responsive en móvil, tablet y PC.
 */

// Porcentajes estándar de la regla de oro nupcial
const BUDGET_BENCHMARKS = [
    { id: "banquet", label: "Banquete, Catering & Recinto", icon: "🍽️", pct: 45, color: "#d97706", desc: "4 tiempos, montaje, loza de autor, servicio de meseros y uso de recinto" },
    { id: "photo", label: "Fotografía Editorial & Video", icon: "📸", pct: 12, color: "#0284c7", desc: "Cobertura completa, cinematografía drone, sesión pre-boda y entrega de galería" },
    { id: "music", label: "DJ, Audio & Iluminación", icon: "🎵", pct: 10, color: "#8b5cf6", desc: "Audio para ceremonia, cóctel, iluminación robótica y pista de baile" },
    { id: "flowers", label: "Floristería & Ambientación", icon: "🌸", pct: 10, color: "#ec4899", desc: "Centros de mesa, arco botánico, ramo de novia, boutonnières y velas" },
    { id: "attire", label: "Moda Nupcial & Estilismo", icon: "👗", pct: 8, color: "#10b981", desc: "Vestido de novia, traje del novio, accesorios, prueba de peinado y maquillaje" },
    { id: "bar", label: "Barra Libre, Vinos & Cava", icon: "🍾", pct: 5, color: "#f59e0b", desc: "Destilados (Tequila, Whisky, Gin), vino tinto/blanco, hielo y mezcladores" },
    { id: "contingency", label: "Imprevistos & Contingencias", icon: "⚠️", pct: 10, color: "#ef4444", desc: "Fondo de reserva para horas extras de fiesta, clima y propinas operativas" }
];

let activeHoveredBudgetSegment = null;

/**
 * Formatter for Mexican Pesos
 */
function formatMXNCurrency(num) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(num || 0);
}

/**
 * Render the whole Budget Estimator section inside the dashboard
 */
function renderSmartBudgetEstimator() {
    const container = document.getElementById('dashboardBudgetEstimatorWrap');
    if (!container) return;

    const data = (typeof getWeddingState === 'function' ? getWeddingState(window.currentWeddingId) : window.currentData) || {};
    const totalBudget = parseFloat(data.budget) || 850000;
    
    // Calculate total real contracted from vendors
    const vendors = data.vendors || [];
    const totalContractedReal = vendors.reduce((sum, v) => sum + (parseFloat(v.contractTotal) || 0), 0);
    const totalPaidReal = vendors.reduce((sum, v) => sum + (parseFloat(v.paidTotal) || 0), 0);
    const contractedPct = Math.min(100, Math.round((totalContractedReal / (totalBudget || 1)) * 100));

    // Render HTML structure
    container.innerHTML = `
        <div class="section-card mb-4" style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:16px; padding:22px 24px; box-shadow:0 4px 20px rgba(0,0,0,0.04);">
            
            <!-- HEADER DEL ESTIMADOR -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:20px; border-bottom:1px solid #f1f5f9; padding-bottom:16px;">
                <div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:1.4rem;">💰</span>
                        <h3 style="font-size:1.18rem; color:#0f172a; font-weight:800; margin:0;">Estimador Inteligente de Presupuesto</h3>
                        <span class="badge-accent" style="background:#fef3c7; color:#b45309; font-weight:800; border:1px solid #fde047;">Regla de Oro Nupcial</span>
                    </div>
                    <p style="color:#64748b; font-size:0.82rem; margin:4px 0 0; line-height:1.4;">
                        Proyección estratégica de gastos sugerida por la industria. Permite a la wedding planner y a la pareja cuidar cada peso y anticipar imprevistos.
                    </p>
                </div>

                <!-- CONTROLES RÁPIDOS DE SIMULACIÓN -->
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                    <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:10px; padding:6px 12px; display:flex; align-items:center; gap:8px;">
                        <span style="font-size:0.75rem; color:#475569; font-weight:800; text-transform:uppercase;">Presupuesto Global:</span>
                        <input type="number" id="inputSimulatorBudget" value="${totalBudget}" step="10000" min="50000" onchange="handleBudgetSimulatorChange(this.value)" style="width:130px; font-weight:800; color:#0f172a; border:none; background:transparent; font-size:0.95rem; outline:none; text-align:right;">
                        <span style="font-size:0.78rem; color:#64748b; font-weight:700;">MXN</span>
                    </div>
                    <button type="button" class="btn-action secondary" onclick="printBudgetBreakdownPDF()" style="font-size:0.78rem; padding:8px 14px; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:6px;">
                        <span>🖨️ Ficha Presupuestal</span>
                    </button>
                </div>
            </div>

            <!-- CONTENIDO PRINCIPAL: 2 COLUMNAS (GRÁFICA DONUT + TABLA DE GASTOS) -->
            <div class="budget-estimator-grid" style="display:grid; grid-template-columns: minmax(280px, 340px) 1fr; gap:24px; align-items:start;">
                
                <!-- COLUMNA 1: GRÁFICA INTERACTIVA DONUT SVG -->
                <div style="background:linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); border:1px solid #e2e8f0; border-radius:14px; padding:20px; text-align:center; display:flex; flex-direction:column; align-items:center;">
                    <div style="font-size:0.75rem; color:#64748b; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px;">Distribución Porcentual Óptima</div>
                    
                    <div style="position:relative; width:240px; height:240px; max-width:100%;">
                        <svg viewBox="0 0 100 100" style="width:100%; height:100%; transform:rotate(-90deg); border-radius:50%;" id="budgetDonutSvg">
                            ${buildDonutChartSvg(totalBudget)}
                        </svg>
                        
                        <!-- CENTRO DEL DONUT CON TOTAL DINÁMICO -->
                        <div id="donutCenterDisplay" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; width:140px; pointer-events:none;">
                            <span style="display:block; font-size:0.68rem; color:#64748b; font-weight:800; text-transform:uppercase;">Presupuesto</span>
                            <strong style="display:block; font-size:1.05rem; color:#0f172a; font-weight:800; line-height:1.2;" id="donutCenterAmount">${formatMXNCurrency(totalBudget)}</strong>
                            <small style="font-size:0.68rem; color:#10b981; font-weight:700;">100% Proyectado</small>
                        </div>
                    </div>

                    <!-- RESUMEN DE SALUD FINANCIERA (COMPROMETIDO VS TOTAL) -->
                    <div style="width:100%; margin-top:18px; padding-top:14px; border-top:1px dashed #cbd5e1; text-align:left;">
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:6px;">
                            <span>Contratado Real en Proveedores:</span>
                            <strong style="color:#0f172a;">${formatMXNCurrency(totalContractedReal)} (${contractedPct}%)</strong>
                        </div>
                        <div style="width:100%; height:8px; background:#e2e8f0; border-radius:6px; overflow:hidden;">
                            <div style="width:${contractedPct}%; height:100%; background:${contractedPct > 100 ? '#ef4444' : '#10b981'}; border-radius:6px; transition:width 0.4s ease;"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#64748b; margin-top:4px;">
                            <span>Pagado: ${formatMXNCurrency(totalPaidReal)}</span>
                            <span>Sobrante / Por asignar: ${formatMXNCurrency(Math.max(0, totalBudget - totalContractedReal))}</span>
                        </div>
                    </div>
                </div>

                <!-- COLUMNA 2: TABLA Y TARJETAS DETALLADAS DE CADA RUBRO -->
                <div style="display:flex; flex-direction:column; gap:10px;">
                    ${BUDGET_BENCHMARKS.map(item => {
                        const estimatedAmount = (totalBudget * (item.pct / 100));
                        return `
                            <div class="budget-item-card" 
                                 id="budgetItem-${item.id}"
                                 onmouseenter="highlightBudgetSegment('${item.id}', '${item.label}', ${estimatedAmount}, ${item.pct})"
                                 onmouseleave="resetBudgetSegmentHighlight()"
                                 style="background:#f8fafc; border:1px solid #e2e8f0; border-left:4px solid ${item.color}; border-radius:10px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; transition:all 0.15s ease;">
                                
                                <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:200px;">
                                    <span style="font-size:1.3rem;">${item.icon}</span>
                                    <div>
                                        <div style="display:flex; align-items:center; gap:6px;">
                                            <strong style="font-size:0.86rem; color:#0f172a;">${item.label}</strong>
                                            <span style="font-size:0.7rem; font-weight:800; background:${item.color}20; color:${item.color}; padding:1px 6px; border-radius:6px;">${item.pct}%</span>
                                        </div>
                                        <p style="font-size:0.72rem; color:#64748b; margin:2px 0 0; line-height:1.3;">${item.desc}</p>
                                    </div>
                                </div>

                                <div style="text-align:right;">
                                    <span style="display:block; font-size:0.68rem; color:#64748b; text-transform:uppercase; font-weight:700;">Presupuesto Sugerido</span>
                                    <strong style="font-size:0.96rem; color:#0f172a; font-weight:800;">${formatMXNCurrency(estimatedAmount)}</strong>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

            </div>

        </div>
    `;
}

/**
 * Builds the SVG stroke-dasharray donut segments
 */
function buildDonutChartSvg(total) {
    const circumference = 2 * Math.PI * 35; // r=35 -> circumference ~219.91
    let accumulatedPct = 0;

    return BUDGET_BENCHMARKS.map((item, index) => {
        const strokeDasharray = `${(item.pct / 100) * circumference} ${circumference}`;
        const strokeDashoffset = -((accumulatedPct / 100) * circumference);
        accumulatedPct += item.pct;

        const estimatedAmount = total * (item.pct / 100);

        return `
            <circle cx="50" cy="50" r="35"
                    fill="transparent"
                    stroke="${item.color}"
                    stroke-width="18"
                    stroke-dasharray="${strokeDasharray}"
                    stroke-dashoffset="${strokeDashoffset}"
                    style="cursor:pointer; transition:stroke-width 0.2s ease, opacity 0.2s ease;"
                    id="donutSegment-${item.id}"
                    onmouseenter="highlightBudgetSegment('${item.id}', '${item.label}', ${estimatedAmount}, ${item.pct})"
                    onmouseleave="resetBudgetSegmentHighlight()" />
        `;
    }).join('');
}

/**
 * Highlight segment on hover
 */
function highlightBudgetSegment(id, label, amount, pct) {
    activeHoveredBudgetSegment = id;
    
    // Dim other segments and thicken active
    BUDGET_BENCHMARKS.forEach(item => {
        const seg = document.getElementById(`donutSegment-${item.id}`);
        const card = document.getElementById(`budgetItem-${item.id}`);
        if (seg) {
            if (item.id === id) {
                seg.style.strokeWidth = "22";
                seg.style.opacity = "1";
            } else {
                seg.style.strokeWidth = "18";
                seg.style.opacity = "0.45";
            }
        }
        if (card) {
            if (item.id === id) {
                card.style.background = "#ffffff";
                card.style.borderColor = item.color;
                card.style.transform = "translateX(4px)";
                card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
            } else {
                card.style.background = "#f8fafc";
                card.style.borderColor = "#e2e8f0";
                card.style.transform = "none";
                card.style.boxShadow = "none";
            }
        }
    });

    // Update center display
    const centerAmount = document.getElementById('donutCenterAmount');
    const centerDisplay = document.getElementById('donutCenterDisplay');
    if (centerAmount && centerDisplay) {
        centerDisplay.innerHTML = `
            <span style="display:block; font-size:0.65rem; color:#64748b; font-weight:800; text-transform:uppercase;">${label.split(' ')[0]}</span>
            <strong style="display:block; font-size:1.02rem; color:#0f172a; font-weight:800; line-height:1.2;">${formatMXNCurrency(amount)}</strong>
            <small style="font-size:0.68rem; color:#d97706; font-weight:800;">${pct}% del total</small>
        `;
    }
}

/**
 * Reset segment highlight
 */
function resetBudgetSegmentHighlight() {
    activeHoveredBudgetSegment = null;
    const data = (typeof getWeddingState === 'function' ? getWeddingState(window.currentWeddingId) : window.currentData) || {};
    const totalBudget = parseFloat(data.budget) || 850000;

    BUDGET_BENCHMARKS.forEach(item => {
        const seg = document.getElementById(`donutSegment-${item.id}`);
        const card = document.getElementById(`budgetItem-${item.id}`);
        if (seg) {
            seg.style.strokeWidth = "18";
            seg.style.opacity = "1";
        }
        if (card) {
            card.style.background = "#f8fafc";
            card.style.borderColor = "#e2e8f0";
            card.style.transform = "none";
            card.style.boxShadow = "none";
        }
    });

    const centerDisplay = document.getElementById('donutCenterDisplay');
    if (centerDisplay) {
        centerDisplay.innerHTML = `
            <span style="display:block; font-size:0.68rem; color:#64748b; font-weight:800; text-transform:uppercase;">Presupuesto</span>
            <strong style="display:block; font-size:1.05rem; color:#0f172a; font-weight:800; line-height:1.2;" id="donutCenterAmount">${formatMXNCurrency(totalBudget)}</strong>
            <small style="font-size:0.68rem; color:#10b981; font-weight:700;">100% Proyectado</small>
        `;
    }
}

/**
 * Live Budget Simulator on change
 */
function handleBudgetSimulatorChange(newVal) {
    const parsed = parseFloat(newVal);
    if (!parsed || parsed < 10000) return;

    if (window.currentData) {
        window.currentData.budget = parsed;
    }
    const state = typeof getWeddingState === 'function' ? getWeddingState(window.currentWeddingId) : null;
    if (state) {
        state.budget = parsed;
        if (typeof saveWeddingState === 'function') saveWeddingState(window.currentWeddingId, state);
    }
    
    renderSmartBudgetEstimator();
    if (typeof showToast === 'function') {
        showToast(`💰 Presupuesto recalculado con base en ${formatMXNCurrency(parsed)}`);
    }
}

/**
 * Printable Budget Breakdown Sheet
 */
function printBudgetBreakdownPDF() {
    const data = (typeof getWeddingState === 'function' ? getWeddingState(window.currentWeddingId) : window.currentData) || {};
    const total = parseFloat(data.budget) || 850000;
    const couple = data.couple || "Novios";
    const date = data.date || "Fecha de Boda";
    const venue = data.venue || "Recinto";

    const printWin = window.open('', '_blank');
    if (!printWin) {
        alert('Por favor habilita las ventanas emergentes para imprimir.');
        return;
    }

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Ficha de Presupuesto Nupcial - ${couple}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 30px; margin: 0; }
                .header { border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
                h1 { margin: 0; font-size: 1.5rem; color: #0f172a; }
                .meta { color: #64748b; font-size: 0.88rem; margin-top: 4px; }
                .total-box { background: #fef3c7; border: 1.5px solid #d97706; border-radius: 8px; padding: 12px 20px; text-align: right; }
                .total-box small { display: block; font-size: 0.72rem; color: #92400e; font-weight: 800; text-transform: uppercase; }
                .total-box strong { font-size: 1.35rem; color: #b45309; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.86rem; }
                th, td { padding: 10px 12px; border: 1px solid #e2e8f0; text-align: left; }
                th { background: #f1f5f9; font-weight: 800; color: #334155; }
                .footer { margin-top: 30px; font-size: 0.75rem; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
                @media print {
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1>Ficha Técnica de Presupuesto Nupcial</h1>
                    <div class="meta">Pareja: <strong>${couple}</strong> · Fecha: ${date} · Recinto: ${venue}</div>
                </div>
                <div class="total-box">
                    <small>Presupuesto Total Estimado</small>
                    <strong>${formatMXNCurrency(total)}</strong>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width:40%;">Rubro Nupcial</th>
                        <th style="width:15%; text-align:center;">Porcentaje</th>
                        <th style="width:25%; text-align:right;">Monto Estimado</th>
                        <th style="width:20%;">Alcance Recomendado</th>
                    </tr>
                </thead>
                <tbody>
                    ${BUDGET_BENCHMARKS.map(b => `
                        <tr>
                            <td><strong>${b.icon} ${b.label}</strong></td>
                            <td style="text-align:center; font-weight:700;">${b.pct}%</td>
                            <td style="text-align:right; font-weight:800; color:#0f172a;">${formatMXNCurrency(total * (b.pct/100))}</td>
                            <td><small style="color:#64748b;">${b.desc}</small></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="footer">
                Documento emitido por Wedding OS · Sistema de Coordinación Ejecutiva para Wedding Planners.
            </div>
            <div style="text-align:center; margin-top:16px;">
                <button onclick="window.print()" style="padding:10px 20px; background:#0f172a; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:700;">🖨️ Imprimir Documento</button>
            </div>
        </body>
        </html>
    `;

    printWin.document.write(html);
    printWin.document.close();
}

// Global exposure
window.renderSmartBudgetEstimator = renderSmartBudgetEstimator;
window.highlightBudgetSegment = highlightBudgetSegment;
window.resetBudgetSegmentHighlight = resetBudgetSegmentHighlight;
window.handleBudgetSimulatorChange = handleBudgetSimulatorChange;
window.printBudgetBreakdownPDF = printBudgetBreakdownPDF;
