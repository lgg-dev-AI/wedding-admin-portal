// ==========================================================================
// PASEBODA INTELLIGENT BRIEFING AUDITOR (8 BLOQUES)
// Realiza auditoría exhaustiva en tiempo real sobre los 8 módulos del briefing.
// ==========================================================================

function auditBriefingData(data = {}) {
    const {
        couple = '',
        date = '',
        cityVenue = '',
        planner = '',
        plannerEmail = '',
        phone = '',
        theme = '',
        customThemeDetails = null,
        masterDrive = '',
        photos = {},
        itinerary = {},
        dressCode = {},
        giftRegistry = {},
        rsvp = {},
        transport = {}
    } = data;

    const blocks = [];

    // -------------------------------------------------------------
    // BLOQUE 1: DATOS GENERALES & CONTACTO
    // -------------------------------------------------------------
    const b1Warnings = [];
    if (!couple || couple.trim().length < 4) b1Warnings.push('Nombre de pareja incompleto');
    if (!date) {
        b1Warnings.push('Falta fecha oficial');
    } else {
        const weddingTime = new Date(date).getTime();
        const now = Date.now();
        if (weddingTime < now - 86400000) b1Warnings.push('La fecha especificada está en el pasado');
    }
    if (!planner || planner.trim().length < 3) b1Warnings.push('Nombre de planner no especificado');
    
    // Validar teléfono (10 dígitos mínimo)
    const cleanPhone = (phone || '').replace(/[^\d+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) b1Warnings.push('Teléfono con lada incompleto');
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!plannerEmail || !emailRegex.test(plannerEmail)) b1Warnings.push('Correo de planner inválido');
    if (!cityVenue || cityVenue.trim().length < 4) b1Warnings.push('Falta recinto/ciudad');

    blocks.push({
        num: 1,
        title: 'Datos Generales & Contacto',
        icon: '💍',
        ok: b1Warnings.length === 0,
        summary: b1Warnings.length === 0 
            ? `${couple} · ${date} · ${planner}` 
            : `Observaciones: ${b1Warnings.join(', ')}`,
        detail: {
            couple: couple || 'No especificado',
            date: date || 'No especificada',
            planner: `${planner} (${cleanPhone || 'Sin tel'})`,
            email: plannerEmail || 'Sin email',
            venue: cityVenue || 'No especificado'
        }
    });

    // -------------------------------------------------------------
    // BLOQUE 2: TEMÁTICA & ESTILO VISUAL
    // -------------------------------------------------------------
    const b2Warnings = [];
    const validThemes = ['tuscany', 'minimalist', 'royal', 'boho', 'riviera', 'custom'];
    const chosenTheme = (theme || '').toLowerCase();
    if (!chosenTheme) {
        b2Warnings.push('No se seleccionó estilo visual');
    } else if (chosenTheme === 'custom' && (!customThemeDetails || !customThemeDetails.name)) {
        b2Warnings.push('Estilo personalizado sin nombre ni notas descriptivas');
    }

    const themeName = chosenTheme === 'custom' && customThemeDetails 
        ? `Personalizado: ${customThemeDetails.name}` 
        : (theme.charAt(0).toUpperCase() + theme.slice(1) || 'Estándar');

    blocks.push({
        num: 2,
        title: 'Temática & Estilo Visual',
        icon: '🎨',
        ok: b2Warnings.length === 0,
        summary: b2Warnings.length === 0 ? `Línea: ${themeName}` : b2Warnings.join(', '),
        detail: {
            theme: themeName,
            customNotes: customThemeDetails?.notes || 'N/A'
        }
    });

    // -------------------------------------------------------------
    // BLOQUE 3: BLUEPRINT FOTOGRÁFICO (15 FOTOS)
    // -------------------------------------------------------------
    const b3Warnings = [];
    const driveUrl = (masterDrive || '').trim();
    if (!driveUrl) {
        b3Warnings.push('Enlace a nube/Drive pendiente');
    } else if (!/^https?:\/\//i.test(driveUrl)) {
        b3Warnings.push('Enlace a carpeta Drive no tiene formato web válido');
    }

    blocks.push({
        num: 3,
        title: 'Blueprint Fotos (15 Tomas)',
        icon: '📸',
        ok: b3Warnings.length === 0,
        summary: b3Warnings.length === 0 ? 'Repositorio de imágenes adjunto' : b3Warnings.join(', '),
        detail: {
            driveUrl: driveUrl || 'Pendiente por adjuntar',
            hero: photos?.hero || 'foto_hero_portada.jpg',
            storyCount: Array.isArray(photos?.story) ? photos.story.filter(Boolean).length : 0
        }
    });

    // -------------------------------------------------------------
    // BLOQUE 4: ITINERARIO & CRONOGRAMA
    // -------------------------------------------------------------
    const b4Warnings = [];
    const cerem = itinerary?.ceremony || {};
    const recep = itinerary?.reception || {};

    if (!cerem.start) b4Warnings.push('Hora de ceremonia no indicada');
    if (!cerem.venue && !cityVenue) b4Warnings.push('Recinto de ceremonia no especificado');
    if (!recep.dinner && !recep.cocktail) b4Warnings.push('Horario de recepción/banquete incompleto');

    blocks.push({
        num: 4,
        title: 'Itinerario & Cronograma',
        icon: '⏱️',
        ok: b4Warnings.length === 0,
        summary: b4Warnings.length === 0 
            ? `Ceremonia ${cerem.start || '--:--'} · Cóctel ${recep.cocktail || '--:--'} · Cena ${recep.dinner || '--:--'}`
            : b4Warnings.join(', '),
        detail: {
            ceremony: `${cerem.start || '--'} a ${cerem.end || '--'} en ${cerem.venue || cityVenue}`,
            reception: `Cóctel: ${recep.cocktail || '--'} | Banquete: ${recep.dinner || '--'} | Fin: ${recep.partyEnd || '--'}`,
            ceremonyMap: cerem.map || 'Sin mapa',
            receptionMap: recep.map || 'Sin mapa'
        }
    });

    // -------------------------------------------------------------
    // BLOQUE 5: CÓDIGO DE VESTIMENTA (DRESS CODE)
    // -------------------------------------------------------------
    const b5Warnings = [];
    const dType = (dressCode?.type || '').trim();
    if (!dType) b5Warnings.push('Nivel de etiqueta no indicado');

    blocks.push({
        num: 5,
        title: 'Código de Vestimenta',
        icon: '👔',
        ok: b5Warnings.length === 0,
        summary: b5Warnings.length === 0 
            ? `Etiqueta: ${dType} ${dressCode?.reserved ? '(Reservados: ' + dressCode.reserved + ')' : ''}`
            : b5Warnings.join(', '),
        detail: {
            type: dType || 'Formal',
            reserved: dressCode?.reserved || 'Blanco novias reservado',
            suggested: dressCode?.suggested || 'Colores libres',
            shoeNote: dressCode?.shoeNote || 'Sin nota de calzado'
        }
    });

    // -------------------------------------------------------------
    // BLOQUE 6: MESA DE REGALOS & CLABE INTERBANCARIA
    // -------------------------------------------------------------
    const b6Warnings = [];
    const clabe = (giftRegistry?.clabe || '').replace(/\s+/g, '');
    let clabeValid = false;

    if (clabe) {
        if (/^\d{18}$/.test(clabe)) {
            clabeValid = true;
        } else {
            b6Warnings.push(`CLABE con longitud inválida (${clabe.length} de 18 dígitos requeridos)`);
        }
    }

    const hasBank = !!giftRegistry?.bank;
    const hasStores = !!giftRegistry?.store || !!giftRegistry?.amazon;
    const hasEnvelope = !!giftRegistry?.envelope;

    if (!clabe && !hasStores && !hasEnvelope) {
        b6Warnings.push('No se configuró ninguna opción de mesa de regalos');
    }

    blocks.push({
        num: 6,
        title: 'Mesa de Regalos & Cuenta',
        icon: '🎁',
        ok: b6Warnings.length === 0,
        summary: b6Warnings.length === 0 
            ? (clabeValid ? `CLABE 18 dígitos validada (${giftRegistry.bank || 'Banco'})` : 'Opciones en tienda/sobres activas')
            : b6Warnings.join(', '),
        detail: {
            bank: giftRegistry?.bank || 'N/A',
            owner: giftRegistry?.owner || 'N/A',
            clabe: clabe || 'N/A',
            stores: giftRegistry?.store || 'N/A',
            amazon: giftRegistry?.amazon || 'N/A',
            envelope: giftRegistry?.envelope ? 'Activada' : 'No'
        }
    });

    // -------------------------------------------------------------
    // BLOQUE 7: RSVP, CANAL DE CONFIRMACIÓN & MENÚ
    // -------------------------------------------------------------
    const b7Warnings = [];
    const rsvpDeadline = rsvp?.deadline || '';
    if (!rsvpDeadline) {
        b7Warnings.push('Falta fecha límite para confirmar RSVP');
    } else if (date) {
        const rDate = new Date(rsvpDeadline).getTime();
        const wDate = new Date(date).getTime();
        if (rDate >= wDate) {
            b7Warnings.push('La fecha límite de RSVP debe ser anterior a la boda');
        }
    }

    const menuType = rsvp?.menuType || 'choice';
    const kidsPolicy = rsvp?.kidsPolicy || 'adults_only';

    blocks.push({
        num: 7,
        title: 'RSVP, Menú & Alergias',
        icon: '🍽️',
        ok: b7Warnings.length === 0,
        summary: b7Warnings.length === 0 
            ? `Límite: ${rsvpDeadline} · ${kidsPolicy === 'adults_only' ? 'Solo Adultos' : 'Niños Permitidos'} · Menú: ${menuType === 'fixed' ? 'Fijo 4 tiempos' : 'Selección Gourmet'}`
            : b7Warnings.join(', '),
        detail: {
            deadline: rsvpDeadline || 'Por definir',
            kidsPolicy: kidsPolicy === 'adults_only' ? 'Solo Adultos' : 'Niños bienvenidos',
            menuType: menuType === 'fixed' ? 'Menú Único' : 'Menú por Elección',
            fixedDesc: rsvp?.fixedMenuDesc || 'N/A',
            options: rsvp?.menuOptions || {}
        }
    });

    // -------------------------------------------------------------
    // BLOQUE 8: LOGÍSTICA DE TRANSPORTE & HOTELES
    // -------------------------------------------------------------
    const hasShuttle = transport?.hasShuttle === 'yes' || transport?.hasShuttle === true;
    const b8Warnings = [];
    if (hasShuttle && !transport?.pickup) {
        b8Warnings.push('Shuttles marcados pero falta punto de partida');
    }

    blocks.push({
        num: 8,
        title: 'Transporte & Hoteles',
        icon: '🚐',
        ok: b8Warnings.length === 0,
        summary: b8Warnings.length === 0 
            ? (hasShuttle ? `Shuttles activos desde ${transport.pickup}` : 'Sin shuttles programados (Evento local/sede única)')
            : b8Warnings.join(', '),
        detail: {
            hasShuttle: hasShuttle ? 'Sí' : 'No',
            pickup: transport?.pickup || 'N/A',
            hotel1: transport?.hotel1 || 'N/A',
            hotel2: transport?.hotel2 || 'N/A'
        }
    });

    // -------------------------------------------------------------
    // CÁLCULO DE SCORE GLOBAL
    // -------------------------------------------------------------
    const approvedCount = blocks.filter(b => b.ok).length;
    const isFullPass = approvedCount === blocks.length;

    return {
        score: `${approvedCount}/${blocks.length}`,
        approvedCount,
        totalBlocks: blocks.length,
        isFullPass,
        status: isFullPass ? 'LISTO PARA PRODUCCIÓN' : 'CON OBSERVACIONES MENORES',
        blocks
    };
}

// Genera texto enriquecido para la notificación de Telegram
function formatTelegramAuditSummary(couple, planner, date, audit) {
    const timestamp = new Date().toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Mexico_City'
    });

    let lines = [];
    lines.push(`💍 <b>NUEVO BRIEFING RECIBIDO · PASEBODA</b> 📋`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`👰🤵 <b>Pareja:</b> ${couple}`);
    lines.push(`📅 <b>Fecha:</b> ${date}`);
    lines.push(`✨ <b>Planner:</b> ${planner}`);
    lines.push(`🕒 <b>Registrado:</b> ${timestamp} hrs`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`🧠 <b>AUDITORÍA INTELIGENTE DE 8 BLOQUES:</b>`);
    lines.push(``);

    audit.blocks.forEach(b => {
        const checkIcon = b.ok ? '✅' : '⚠️';
        lines.push(`${checkIcon} <b>${b.num}. ${b.title}:</b>`);
        lines.push(`   └ <i>${b.summary}</i>`);
    });

    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    if (audit.isFullPass) {
        lines.push(`🎯 <b>SCORE: ${audit.score} BLOQUES APROBADOS</b>`);
        lines.push(`✨ <b>STATUS: LISTO PARA PRODUCCIÓN</b> (Sin faltantes)`);
    } else {
        lines.push(`⚠️ <b>SCORE: ${audit.score} BLOQUES APROBADOS</b>`);
        lines.push(`🔍 <b>STATUS: REVISAR OBSERVACIONES EN EL DOCUMENTO</b>`);
    }
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`📎 <i>Se adjuntó el documento completo para abrir con 1 tap.</i>`);

    return lines.join('\n');
}

module.exports = {
    auditBriefingData,
    formatTelegramAuditSummary
};
