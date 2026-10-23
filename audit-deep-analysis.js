// audit-deep-analysis.js
// Audits each module's rendering, calculations, and report coherence
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('🧐 AUDITORÍA INTEGRAL DE MÓDULOS Y REPORTES (UX & DATA CONSISTENCY)');
console.log('================================================================');

// Set up mock DOM and browser env
const storage = { local: {}, session: {} };
global.localStorage = {
    getItem: (k) => storage.local[k] !== undefined ? storage.local[k] : null,
    setItem: (k, v) => { storage.local[k] = String(v); },
    removeItem: (k) => { delete storage.local[k]; },
    clear: () => { storage.local = {}; }
};
global.sessionStorage = {
    getItem: (k) => storage.session[k] !== undefined ? storage.session[k] : null,
    setItem: (k, v) => { storage.session[k] = String(v); },
    removeItem: (k) => { delete storage.session[k]; },
    clear: () => { storage.session = {}; }
};

function createMockEl(id = '') {
    return {
        id,
        tagName: 'DIV',
        value: '',
        innerText: '',
        innerHTML: '',
        style: {},
        classList: {
            add: () => {},
            remove: () => {},
            toggle: () => {},
            contains: () => false
        },
        setAttribute: () => {},
        getAttribute: () => '',
        removeAttribute: () => {},
        appendChild: () => {},
        removeChild: () => {},
        closest: () => createMockEl(),
        querySelector: () => createMockEl(),
        querySelectorAll: () => [],
        addEventListener: () => {}
    };
}

global.window = global;
global.window.addEventListener = () => {};
global.document = {
    body: createMockEl('body'),
    createElement: (tag) => createMockEl(tag),
    getElementById: (id) => createMockEl(id),
    querySelector: () => createMockEl(),
    querySelectorAll: () => [],
    addEventListener: () => {}
};

function loadScript(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    vm.runInThisContext(code, { filename: path.basename(filePath) });
}

const scripts = [
    'scripts/admin-data.js',
    'scripts/admin-clients.js',
    'scripts/admin-settings.js',
    'scripts/admin-dispatch.js',
    'scripts/admin-seating.js',
    'scripts/admin-dayof.js',
    'scripts/admin-barcalc.js',
    'scripts/admin-vendors.js',
    'scripts/admin-finance.js',
    'scripts/admin-album-playlist.js',
    'scripts/admin-pdf-reports.js',
    'scripts/admin-app.js',
    'scripts/dayof-hostess.js',
    'scripts/admin-auth.js',
    'scripts/stripe-billing.js'
];

scripts.forEach(s => {
    try {
        loadScript(path.join(__dirname, s));
        console.log(`✓ Cargado: ${s}`);
    } catch (e) {
        console.error(`❌ Error cargando ${s}:`, e.message);
    }
});

// Let's inspect WEDDINGS_DB and sample data
console.log('\n--- Bódas en WEDDINGS_DB ---');
const weddingKeys = Object.keys(global.WEDDINGS_DB || {});
console.log(`Bodas disponibles: ${weddingKeys.length} (${weddingKeys.join(', ')})`);

const auditResults = [];

function checkModule(modName, fn) {
    try {
        const issues = fn();
        if (!issues || issues.length === 0) {
            auditResults.push({ module: modName, status: 'PASS', issues: [] });
            console.log(`\n🟢 [${modName}]: Sin anomalías ni desfases detectados.`);
        } else {
            auditResults.push({ module: modName, status: 'WARN', issues });
            console.log(`\n🟡 [${modName}]: ${issues.length} observaciones encontradas:`);
            issues.forEach(iss => console.log(`   - ${iss}`));
        }
    } catch (e) {
        auditResults.push({ module: modName, status: 'FAIL', issues: [e.message] });
        console.error(`\n🔴 [${modName}]: Error de ejecución: ${e.message}`);
    }
}

// Inspect every wedding in database for consistency
weddingKeys.forEach(wid => {
    const w = global.WEDDINGS_DB[wid];
    console.log(`\n---------------------------------------------------------`);
    console.log(`🔍 Auditando Boda: "${w.couple}" (ID: ${wid})`);
    console.log(`   Target: ${w.targetGuests} | Presupuesto: $${(w.budget || 0).toLocaleString('es-MX')} | Fecha: ${w.date}`);
    console.log(`---------------------------------------------------------`);

    // 1. GUESTS & RSVP CONSISTENCY
    const guests = w.guests || [];
    const confirmed = guests.filter(g => g.status === 'confirmed');
    const declined = guests.filter(g => g.status === 'declined');
    const pending = guests.filter(g => g.status !== 'confirmed' && g.status !== 'declined');
    const totalPasses = confirmed.reduce((sum, g) => sum + (g.passes || 1), 0);
    const totalInvitedPax = guests.reduce((sum, g) => sum + (g.passes || 1), 0);

    console.log(`   [RSVP Check] Invitados: ${guests.length} registros | Pases confirmados: ${totalPasses} | Declinados: ${declined.length} | Pendientes: ${pending.length}`);

    // Check menu count vs confirmed passes
    let totalMenus = 0;
    confirmed.forEach(g => {
        const p = g.passes || 1;
        totalMenus += p; // Each pass gets a menu
    });
    console.log(`   [Banquete Check] Menús necesarios: ${totalMenus} menús para ${totalPasses} pases`);

    // 2. SEATING vs CONFIRMED
    const tables = w.tables || [];
    let totalSeatsSeated = 0;
    let totalTableCapacity = 0;
    tables.forEach(t => {
        totalTableCapacity += (t.capacity || 0);
        if (t.guests) totalSeatsSeated += t.guests.length;
    });

    // Also check guests that have tableId assigned
    const guestsWithTable = confirmed.filter(g => g.tableId && g.tableId.trim() !== '');
    console.log(`   [Seating Check] Mesas: ${tables.length} (Capacidad total: ${totalTableCapacity}) | Pases acomodados: ${totalSeatsSeated} (Invitados con mesa: ${guestsWithTable.length})`);

    // Check if seating capacity is less than confirmed passes
    if (totalTableCapacity < totalPasses) {
        console.log(`   ⚠️ ALERTA: Capacidad de mesas (${totalTableCapacity}) menor a pases confirmados (${totalPasses}). Faltan ${totalPasses - totalTableCapacity} asientos.`);
    }

    // 3. VENDORS & BUDGET CONSISTENCY
    const vendors = w.vendors || [];
    const totalContracted = vendors.reduce((s, v) => s + (v.contractTotal || 0), 0);
    const totalPaid = vendors.reduce((s, v) => s + (v.paidTotal || 0), 0);
    const pendingBalance = totalContracted - totalPaid;
    console.log(`   [Finanzas Check] Presupuesto total: $${(w.budget || 0).toLocaleString('es-MX')} | Contratado: $${totalContracted.toLocaleString('es-MX')} | Pagado: $${totalPaid.toLocaleString('es-MX')} | Saldo pendiente: $${pendingBalance.toLocaleString('es-MX')}`);

    if (totalContracted > (w.budget || 0)) {
        console.log(`   ⚠️ ALERTA: Monto contratado ($${totalContracted.toLocaleString('es-MX')}) supera el presupuesto ($${(w.budget || 0).toLocaleString('es-MX')}) en $${(totalContracted - w.budget).toLocaleString('es-MX')}.`);
    }

    // 4. DAY-OF RUN SHEET
    const timeline = w.timeline || [];
    console.log(`   [Minuta Día-D] Actividades programadas: ${timeline.length} momentos`);
});

console.log('\n================================================================');
console.log('📑 AUDITORÍA DE REPORTES PDF (scripts/admin-pdf-reports.js)');
console.log('================================================================');

// Check report functions directly
const reportFunctions = [
    { name: 'Informe Ejecutivo Quincenal', fn: 'generateAndPreviewPDF' },
    { name: 'Auditoría de Barra Libre', fn: 'printBarAuditReport' },
    { name: 'Reporte de Proveedores & Pagos', fn: 'printVendorsReport' },
    { name: 'Reporte Master de Invitados', fn: 'printGuestsMasterReport' },
    { name: 'Reporte de Mesa de Regalos', fn: 'printGiftRegistryReport' },
    { name: 'Reporte de Croquis y Mesas', fn: 'printSeatingChartReport' },
    { name: 'Briefing Musical & DJ Setlist', fn: 'printDJSetlistReport' },
    { name: 'Logística de Viaje & Hoteles', fn: 'printTravelReport' }
];

// Set active wedding to first sample wedding
global.currentWeddingId = weddingKeys[0];
global.currentData = global.getWeddingState(global.currentWeddingId);

let paperHtml = '';
global.document.getElementById = (id) => {
    if (id === 'pdfDocumentPaper') {
        return {
            set innerHTML(val) { paperHtml = val; },
            get innerHTML() { return paperHtml; },
            appendChild: () => {},
            style: {}
        };
    }
    return createMockEl(id);
};

global.openLuxuryReportModal = (title, html) => {
    paperHtml = html;
};

reportFunctions.forEach(rep => {
    try {
        paperHtml = '';
        if (typeof global[rep.fn] === 'function') {
            global[rep.fn]();
            const len = paperHtml.length;
            const hasNaN = paperHtml.includes('NaN');
            const hasUndefined = paperHtml.includes('undefined');
            const hasNull = paperHtml.includes('null');

            console.log(`\n📄 Reporte: "${rep.name}" [${rep.fn}]`);
            console.log(`   - Longitud HTML generado: ${len} caracteres`);
            console.log(`   - ¿Contiene NaN?: ${hasNaN ? '❌ SÍ (DESFASE DETECTADO)' : '✓ No'}`);
            console.log(`   - ¿Contiene "undefined"?: ${hasUndefined ? '❌ SÍ (DATO FALTANTE)' : '✓ No'}`);
            console.log(`   - ¿Contiene "null"?: ${hasNull ? '❌ SÍ (DATO FALTANTE)' : '✓ No'}`);

            if (hasNaN || hasUndefined || hasNull) {
                // Find where it occurred
                const snippet = paperHtml.substring(Math.max(0, paperHtml.indexOf(hasNaN ? 'NaN' : (hasUndefined ? 'undefined' : 'null')) - 60), Math.min(paperHtml.length, paperHtml.indexOf(hasNaN ? 'NaN' : (hasUndefined ? 'undefined' : 'null')) + 80));
                console.log(`   👉 Contexto del error: "...${snippet.trim()}..."`);
            }
        } else {
            console.error(`❌ Función ${rep.fn} no encontrada`);
        }
    } catch (e) {
        console.error(`❌ Error ejecutando ${rep.fn}:`, e.message);
    }
});
