// test-new-features.js
const fs = require('fs');

console.log("Testing CSV parser logic...");

function parseGuestCsv(rawText) {
    if (!rawText || !rawText.trim()) return [];
    
    // Normalize newlines
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];

    // Detect delimiter: tab, semicolon or comma
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

    const parseLine = (line) => {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' || char === "'") {
                inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
                result.push(cur.trim().replace(/^["']|["']$/g, ''));
                cur = '';
            } else {
                cur += char;
            }
        }
        result.push(cur.trim().replace(/^["']|["']$/g, ''));
        return result;
    };

    const headerTokens = parseLine(lines[0]).map(h => h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    const isHeaderRow = headerTokens.some(h => 
        h.includes('nombre') || h.includes('name') || 
        h.includes('telefono') || h.includes('phone') || h.includes('celular') ||
        h.includes('pase') || h.includes('invitado')
    );

    let colMap = { name: 0, phone: 1, passes: 2, companion: 3, menu: 4, allergies: 5, table: 6 };

    let startIndex = 0;
    if (isHeaderRow) {
        startIndex = 1;
        headerTokens.forEach((col, idx) => {
            if (col.includes('nom') || col.includes('invitado') || col.includes('name')) colMap.name = idx;
            else if (col.includes('tel') || col.includes('cel') || col.includes('phone') || col.includes('movil')) colMap.phone = idx;
            else if (col.includes('pas') || col.includes('lug') || col.includes('cant') || col.includes('ticket')) colMap.passes = idx;
            else if (col.includes('acomp') || col.includes('pareja') || col.includes('guest2')) colMap.companion = idx;
            else if (col.includes('men') || col.includes('plat') || col.includes('comid')) colMap.menu = idx;
            else if (col.includes('aler') || col.includes('restri') || col.includes('dieta')) colMap.allergies = idx;
            else if (col.includes('mes') || col.includes('tabl')) colMap.table = idx;
        });
    }

    const parsedGuests = [];
    for (let i = startIndex; i < lines.length; i++) {
        const row = parseLine(lines[i]);
        if (row.length === 0 || !row[colMap.name]) continue;

        const name = (row[colMap.name] || '').trim();
        if (name.length < 2) continue;

        const rawPhone = (row[colMap.phone] || '').replace(/[^\d+]/g, '');
        const passesRaw = parseInt(row[colMap.passes]);
        const passes = (!isNaN(passesRaw) && passesRaw >= 1) ? Math.min(passesRaw, 10) : 1;
        const companion = (row[colMap.companion] || '').trim();
        const rawMenu = (row[colMap.menu] || '').toLowerCase();
        let menu = 'filete';
        if (rawMenu.includes('pesc') || rawMenu.includes('salm')) menu = 'salmon';
        else if (rawMenu.includes('veg') || rawMenu.includes('plant')) menu = 'vegano';
        else if (rawMenu.includes('inf') || rawMenu.includes('nin')) menu = 'infantil';

        const allergies = (row[colMap.allergies] || '').trim();
        const table = (row[colMap.table] || '').trim();

        parsedGuests.push({
            name,
            phone: rawPhone || '8100000000',
            passes,
            companion: passes > 1 ? (companion || 'Acompañante') : '',
            menu,
            allergies: allergies || 'Ninguna',
            table
        });
    }

    return parsedGuests;
}

const sampleCsv = `Nombre,Telefono,Pases,Acompañante,Menu,Alergias,Mesa
Lic. Roberto Cantú,8115203344,2,Sra. Marcela de Cantú,Filete de Res,Ninguna,Mesa 1
Dr. Fernando Villalobos,5512345678,1,,Salmón Glaseado,Gluten,Mesa 2
Arq. Lucía Garza,8187654321,2,Ing. Pablo Garza,Vegetariano,Nueces,Mesa 1`;

const parsed = parseGuestCsv(sampleCsv);
console.log(`Parsed ${parsed.length} guests:`, parsed);
if (parsed.length === 3 && parsed[0].name === 'Lic. Roberto Cantú' && parsed[1].menu === 'salmon' && parsed[2].allergies === 'Nueces') {
    console.log("✓ CSV parser test passed!");
} else {
    console.error("✕ CSV parser failed!");
    process.exit(1);
}

// Test WhatsApp Summary Generation
function generateCoupleWhatsAppSummary(weddingData) {
    const couple = weddingData.coupleNames || 'Novios';
    const date = weddingData.date || 'Por definir';
    const loc = weddingData.location || 'Por definir';
    const guests = weddingData.guests || [];

    let totalPasses = 0;
    let confPasses = 0;
    let pendPasses = 0;
    let declPasses = 0;
    let confGuestsCount = 0;

    let menuRes = 0;
    let menuFish = 0;
    let menuVeg = 0;
    let menuKid = 0;
    const allergiesList = [];

    let seatedCount = 0;

    guests.forEach(g => {
        const p = g.passes || 1;
        totalPasses += p;

        if (g.status === 'confirmed') {
            confPasses += p;
            confGuestsCount++;
            if (g.tableId) seatedCount += p;

            // Menus
            const m1 = (g.guest1Menu || g.menu || 'filete').toLowerCase();
            if (m1.includes('pesc') || m1.includes('salm')) menuFish++;
            else if (m1.includes('veg')) menuVeg++;
            else if (m1.includes('inf')) menuKid++;
            else menuRes++;

            if (p > 1) {
                const m2 = (g.companionMenu || 'salmon').toLowerCase();
                if (m2.includes('pesc') || m2.includes('salm')) menuFish++;
                else if (m2.includes('veg')) menuVeg++;
                else if (m2.includes('inf')) menuKid++;
                else menuRes++;
            }

            // Allergies
            const a1 = g.guest1Allergies || g.allergies;
            if (a1 && a1.toLowerCase() !== 'ninguna' && a1.trim() !== '') {
                allergiesList.push(`${g.name}: ${a1}`);
            }
            const a2 = g.companionAllergies;
            if (a2 && a2.toLowerCase() !== 'ninguna' && a2.trim() !== '') {
                allergiesList.push(`${g.companion || 'Acompañante de ' + g.name}: ${a2}`);
            }
        } else if (g.status === 'declined') {
            declPasses += p;
        } else {
            pendPasses += p;
        }
    });

    const confPct = totalPasses > 0 ? Math.round((confPasses / totalPasses) * 100) : 0;

    let msg = `✨ *RESUMEN EJECUTIVO DE BODA* ✨\n`;
    msg += `💍 *${couple.toUpperCase()}*\n`;
    msg += `📅 ${date} · 📍 ${loc}\n\n`;

    msg += `📊 *ESTADO DE INVITADOS & RSVP:*\n`;
    msg += `• Total Convocados: *${totalPasses} pases* (${guests.length} familias/invitados)\n`;
    msg += `• ✅ *Confirmados:* *${confPasses} pases* (${confPct}% de confirmación)\n`;
    msg += `• ⏳ *Pendientes:* *${pendPasses} pases*\n`;
    msg += `• ❌ *Declinados:* *${declPasses} pases*\n\n`;

    msg += `🍽️ *SELECCIÓN DE PLATILLOS (CONFIRMADOS):*\n`;
    msg += `• 🥩 Res / Filete: *${menuRes}*\n`;
    msg += `• 🐟 Salmón / Pescado: *${menuFish}*\n`;
    msg += `• 🥗 Vegano / Vegetariano: *${menuVeg}*\n`;
    if (menuKid > 0) msg += `• 👶 Menú Infantil: *${menuKid}*\n`;
    msg += `\n`;

    if (allergiesList.length > 0) {
        msg += `⚠️ *RESTRICCIONES ALIMENTARIAS & ALERGIAS (${allergiesList.length}):*\n`;
        allergiesList.slice(0, 5).forEach(a => {
            msg += `  - ${a}\n`;
        });
        if (allergiesList.length > 5) {
            msg += `  - ... y ${allergiesList.length - 5} más (detallados en portal)\n`;
        }
        msg += `\n`;
    }

    msg += `🪑 *DISTRIBUCIÓN EN MESAS:*\n`;
    msg += `• Asignados: *${seatedCount} de ${confPasses} confirmados* (${confPasses > 0 ? Math.round((seatedCount / confPasses) * 100) : 0}%)\n\n`;

    msg += `📲 _Generado en tiempo real desde Wedding Planner OS_`;

    return msg;
}

const mockWedding = {
    coupleNames: 'Sofía & Alejandro',
    date: '24 Oct 2027',
    location: 'Valldemossa, Mallorca',
    guests: [
        { name: 'Lic. Cantú', passes: 2, status: 'confirmed', menu: 'filete', companionMenu: 'salmon', allergies: 'Mariscos', tableId: 't1' },
        { name: 'Dr. Villalobos', passes: 1, status: 'confirmed', menu: 'salmon', tableId: 't1' },
        { name: 'Sra. García', passes: 2, status: 'pending' },
        { name: 'Ing. Santos', passes: 1, status: 'declined' }
    ]
};

const summary = generateCoupleWhatsAppSummary(mockWedding);
console.log("Generated WhatsApp Summary:\n", summary);
if (summary.includes('SOFÍA & ALEJANDRO') && summary.includes('Mariscos') && summary.includes('3 pases')) {
    console.log("✓ WhatsApp summary test passed!");
} else {
    console.error("✕ WhatsApp summary failed!");
    process.exit(1);
}

// Test Day D Search
function filterDayDGuests(guests, tables, query) {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase().trim();
    return guests.filter(g => {
        const nameMatch = (g.name || '').toLowerCase().includes(q);
        const compMatch = (g.companion || '').toLowerCase().includes(q);
        const phoneMatch = (g.phone || '').includes(q);
        return nameMatch || compMatch || phoneMatch;
    }).map(g => {
        const table = (tables || []).find(t => t.id === g.tableId);
        return {
            id: g.id,
            name: g.name,
            passes: g.passes || 1,
            companion: g.companion || '',
            tableName: table ? table.name : 'Sin Asignar',
            allergies: g.allergies || g.guest1Allergies || '',
            isCheckedIn: !!g.hostessCheckin
        };
    });
}

const searchResults = filterDayDGuests(mockWedding.guests, [{ id: 't1', name: 'Mesa 1 - VIP' }], 'cantú');
console.log("Day D Search Results for 'cantú':", searchResults);
if (searchResults.length === 1 && searchResults[0].tableName === 'Mesa 1 - VIP') {
    console.log("✓ Day D search test passed!");
} else {
    console.error("✕ Day D search test failed!");
    process.exit(1);
}


