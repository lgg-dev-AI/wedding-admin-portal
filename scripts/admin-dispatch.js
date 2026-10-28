// ==========================================================================
// WEDDING PLANNER WHATSAPP COMMUNICATION & RSVP TRACKING HUB
// (3 REAL STAGES: 1. INITIAL INVITE, 2. RSVP REMINDER, 3. QR PASS & TABLE)
// ==========================================================================

let activeDispatchFilter = 'all';
let activeDispatchSort = 'az';
let currentGatewayMode = 'meta_api'; // 'meta_api' = Stage 1 Invite, 'qr_gateway' = Stage 2 Reminder, 'manual' = Stage 3 QR + Table
let previewedGuestId = null;
let isDispatchingBatch = false;

function formatPhoneForWhatsAppLink(phone) {
    let clean = (phone || '').replace(/[^0-9]/g, '');
    if (clean.length === 10) {
        return '521' + clean;
    }
    if (clean.length === 12 && clean.startsWith('52') && !clean.startsWith('521')) {
        return '521' + clean.substring(2);
    }
    return clean;
}

function setDispatchSort(sortKey) {
    activeDispatchSort = sortKey;
    const sortSelect = document.getElementById('dispatchSortOrder');
    if (sortSelect) sortSelect.value = sortKey;
    renderDispatchTab();
}

// PASO 3: Showroom State for Couple & Planner View
let currentDispatchDisplayMode = 'planner'; // 'planner' or 'showroom'
let coupleShowroomStage = 'meta_api'; // 'meta_api', 'qr_gateway', 'destination_payment', 'manual'
let coupleShowroomTone = 'opt1'; // 'opt1', 'opt2', 'opt3'


function getGuestTableName(guest, data) {
    if (!guest || !guest.tableId || !data || !Array.isArray(data.tables)) {
        return 'Mesa por asignar en recepción';
    }
    const found = data.tables.find(t => t.id === guest.tableId);
    return found ? found.name : 'Mesa Principal';
}

const DEFAULT_WHATSAPP_TEMPLATES = {
    // =========================================================================
    // ETAPA 1: INVITACIÓN OFICIAL & CONFIRMACIÓN (3 VARIANTES)
    // =========================================================================
    meta_api: {
        // Opción 1: Aprobada Oficial en Meta (notificacion_reservas_bodas - APPROVED)
        opt1: `Estimado(a) {nombre_familia},\n\nLe notificamos que su registro de asistencia cuenta con {pases} reservados para el evento de {novios} ({fecha} en {lugar}).\n\nPara confirmar su asistencia y validar sus accesos, favor de ingresar a su enlace digital oficial:\n{link_invitacion}\n\nFavor de completar su registro. Gracias.`,
        // Opción 2: Formal Ejecutivo
        opt2: `Apreciable {nombre_familia},\n\nCon motivo del enlace matrimonial de *{novios}*, le informamos que tiene asignados {pases} de honor para la recepción en {lugar} este {fecha}.\n\nLe solicitamos validar su confirmación de lugares y requerimientos especiales en el portal:\n👉 {link_invitacion}\n\nEsperamos contar con su distinguida presencia.`,
        // Opción 3: Cálido & Emotivo
        opt3: `¡Hola {nombre_familia}! 💍✨\n\nCon inmensa alegría, *{novios}* te comparten su invitación para celebrar su boda el *{fecha}* en *{lugar}*.\n\nHemos reservado con mucho cariño: *{pases}*.\n\nPor favor ingresa a tu enlace interactivo para conocer el programa y confirmar tu asistencia:\n👉 {link_invitacion}\n\n¡Será un honor compartir este día contigo!`
    },

    // =========================================================================
    // ETAPA 2: RECORDATORIOS RSVP & CIERRE DE BANQUETE (3 VARIANTES)
    // =========================================================================
    qr_gateway: {
        // Opción 1: Aprobada Oficial en Meta con Fecha Dinámica y Espaciado
        opt1: `Estimado/a {nombre_familia},\n\nLe notificamos que su registro de asistencia cuenta con {pases} reservados para el evento de {novios} este {fecha}.\n\nPara completar su confirmacion y requerimientos de banquete, favor de ingresar a su enlace oficial:\n{link_invitacion}\n\nGracias por su atencion.`,
        // Opción 2: Recordatorio Amable de Planificación
        opt2: `¡Hola {nombre_familia}! ✨\n\nTe contactamos de la coordinación de la boda de *{novios}* ({fecha}).\n\nEstamos en la etapa final de acomodo de mesas y entrega de números a cocina para tus *{pases}*.\n\n¿Nos ayudas confirmando si nos acompañas en tu enlace digital?\n👉 {link_invitacion}\n\n¡Agradecemos mucho tu respuesta!`,
        // Opción 3: Última Llamada Urgente
        opt3: `⚠️ *ÚLTIMO RECORDATORIO DE CONFIRMACIÓN* ⚠️\n\nEstimado(a) {nombre_familia}, estamos a pocos días del evento de *{novios}* y necesitamos validar tus *{pases}* reservados para la asignación definitiva de sillas en {lugar}.\n\nPor favor confirma hoy mismo en tu enlace para asegurar tus lugares:\n👉 {link_invitacion}\n\n¡Gracias por tu apoyo!`
    },

    // =========================================================================
    // ETAPA 3: PASE QR, MESA Y RECEPCIÓN EN PUERTA (3 VARIANTES)
    // =========================================================================
    manual: {
        // Opción 1: Aprobada Oficial en Meta (notificacion_reservas_bodas con párrafos)
        opt1: `Estimado(a) {nombre_familia},\n\nLe notificamos que su registro de asistencia cuenta con {pases} reservados para el evento de {novios} ({fecha} en {lugar}).\n\nPara confirmar su asistencia y validar sus accesos, favor de ingresar a su enlace digital oficial:\n{link_invitacion}\n\nFavor de completar su registro. Gracias.`,
        // Opción 2: Protocolo Elegante & Bienvenida
        opt2: `¡Hola {nombre_familia}! 🥂✨\n\n¡El gran día de *{novios}* ha llegado!\n\nTe compartimos tu asignación de mesa y acceso para disfrutar de la velada en {lugar}:\n\n🎟️ Pases: *{pases}*\n🪑 Mesa: *{mesa}*\n\nAccede a tu código de bienvenida y plano de mesas aquí:\n👉 {link_invitacion}\n\n¡Te esperamos para celebrar en grande!`,
        // Opción 3: Práctico & Logístico para el Día del Evento
        opt3: `¡Todo listo para hoy, {nombre_familia}! 🍾\n\nTe recordamos que tu mesa asignada es la *{mesa}* ({pases}) en {lugar}.\n\nPara agilizar tu entrada con las hostess y ver el croquis de ubicación, abre tu pase aquí:\n👉 {link_invitacion}\n\n¡Nos vemos en un momento!`
    },

    // =========================================================================
    // ETAPA 4: BODA DESTINO / PLAYA — RECORDATORIO DE ABONO & ESTANCIA
    // =========================================================================
    destination_payment: {
        // Opción 1: Utilidad Estricta Aprobable por Meta (Reserva hotelera)
        opt1: `Estimado(a) {nombre_familia},\n\nLe notificamos que su reservacion para la boda destino de {novios} en {lugar} cuenta con {pases} confirmados.\n\nEl costo de paquete de estancia es de {costo_total} ({abono_sugerido}/mes sugerido hasta {fecha_limite}).\n\nConsulte el desglose de su cuenta y CLABE para transferencias en su portal oficial:\n{link_pagos}\n\nNota: Los vuelos no estan incluidos. Gracias por su atencion.`,
        // Opción 2: Emotivo & Coordinación de Hospedaje
        opt2: `¡Hola {nombre_familia}! 🏖️🌊\n\n¡Qué emoción celebrar con *{novios}* en la playa!\n\nTe recordamos que tienes reservados tus *{pases}* para el enlace en *{lugar}*.\n\nPara asegurar tu habitación y amenidades de resort, el total de tu estancia es de *{costo_total}*, el cual puedes abonar cómodamente mes con mes (*{abono_sugerido}* sugerido) antes de *{fecha_limite}*.\n\nAccede a tu estado de cuenta y CLABE oficial aquí:\n👉 {link_pagos}\n\n_Recuerda que los vuelos se gestionan por separado._ ¡Nos vemos en el paraíso! 🌴`,
        // Opción 3: Recordatorio Amable de Calendario y Abonos
        opt3: `Hola {nombre_familia} ✨\n\nDesde la coordinación de la boda de *{novios}*, te enviamos un cordial recordatorio de tu estancia para la boda en {lugar}.\n\n💳 Tu total de paquete ({pases}): *{costo_total}*\n📅 Límite de liquidación definitiva: *{fecha_limite}*\n\nPuedes consultar tu CLABE bancaria SPEI o registrar abonos en tu portal exclusivo:\n👉 {link_pagos}\n\nSi surge algún imprevisto y no puedes acompañarnos, puedes notificarnos directamente desde el enlace en el botón de aviso cariñoso. ¡Muchas gracias!`
    }
};

let currentTemplateOption = 'opt1'; // 'opt1', 'opt2', 'opt3'

function getActiveTemplateText(mode, data) {
    if (data && data.customTemplates && data.customTemplates[`${mode}_${currentTemplateOption}`]) {
        return data.customTemplates[`${mode}_${currentTemplateOption}`];
    }
    const stageTemplates = DEFAULT_WHATSAPP_TEMPLATES[mode] || DEFAULT_WHATSAPP_TEMPLATES.meta_api;
    return stageTemplates[currentTemplateOption] || stageTemplates.opt1;
}

function selectTemplateOption(optKey) {
    currentTemplateOption = optKey;
    document.querySelectorAll('.tpl-opt-pill').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-opt') === optKey);
    });
    updateTemplateEditorView();
    renderDispatchTab();
}

function updateTemplateEditorView() {
    currentData = getWeddingState(currentWeddingId);
    const textarea = document.getElementById('customTemplateTextarea');
    const counter = document.getElementById('customTemplateCharCount');
    if (!textarea) return;

    const currentText = getActiveTemplateText(currentGatewayMode, currentData);
    textarea.value = currentText;
    if (counter) counter.innerText = `${currentText.length} caracteres`;
}

function onCustomTemplateInput() {
    const textarea = document.getElementById('customTemplateTextarea');
    const counter = document.getElementById('customTemplateCharCount');
    if (!textarea) return;
    if (counter) counter.innerText = `${textarea.value.length} caracteres`;
}

function insertTemplateVariable(tag) {
    const textarea = document.getElementById('customTemplateTextarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    textarea.value = text.substring(0, start) + tag + text.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + tag.length;
    textarea.focus();
    onCustomTemplateInput();
}

function saveActiveCustomTemplate() {
    currentData = getWeddingState(currentWeddingId);
    const textarea = document.getElementById('customTemplateTextarea');
    if (!textarea) return;

    if (!currentData.customTemplates) currentData.customTemplates = {};
    const key = `${currentGatewayMode}_${currentTemplateOption}`;
    currentData.customTemplates[key] = textarea.value;

    saveWeddingState(currentWeddingId, currentData);
    renderDispatchTab();
    showToast('💾 ¡Plantilla de WhatsApp guardada con éxito!');
}

function resetActiveTemplateToDefault() {
    currentData = getWeddingState(currentWeddingId);
    if (!currentData.customTemplates) currentData.customTemplates = {};
    const key = `${currentGatewayMode}_${currentTemplateOption}`;
    const stageTemplates = DEFAULT_WHATSAPP_TEMPLATES[currentGatewayMode] || DEFAULT_WHATSAPP_TEMPLATES.meta_api;
    currentData.customTemplates[key] = stageTemplates[currentTemplateOption] || stageTemplates.opt1;

    saveWeddingState(currentWeddingId, currentData);
    updateTemplateEditorView();
    renderDispatchTab();
    showToast('🔄 Plantilla restablecida al texto predeterminado.');
}

function buildPlannerWhatsAppText(guest, mode, data) {
    const coupleNames = (data && data.couple) ? data.couple : 'Sofía & Alejandro';
    const dateText = (data && data.date) ? data.date : '24 de Octubre, 2027';
    const venueText = (data && data.venue) ? data.venue : 'Hacienda San Gabriel';
    const liveUrl = (data && data.liveUrl) ? data.liveUrl : 'https://aura-wedding-experience.vercel.app';
    const guestName = (guest && guest.name) ? guest.name : 'Familia Invitada';
    const passesCount = (guest && guest.passes) ? guest.passes : 2;
    const passText = passesCount > 1
        ? `${passesCount} Pases de Honor${guest && guest.companion ? ` (+ ${guest.companion})` : ''}`
        : '1 Pase Personal de Honor';
    const tableName = getGuestTableName(guest, data);

    const templateRaw = getActiveTemplateText(mode, data);

    const costPerPerson = Number(data && data.guestCost) || 20000;
    const totalCostNumber = passesCount * costPerPerson;
    const totalCostStr = `$${totalCostNumber.toLocaleString('es-MX')} MXN`;
    const suggestedMonthlyNumber = Math.ceil((totalCostNumber / 7) / 500) * 500;
    const suggestedMonthlyStr = `$${suggestedMonthlyNumber.toLocaleString('es-MX')} MXN`;
    const deadlineStr = (data && data.deadlineMonth) ? data.deadlineMonth : 'Julio 2027';
    const guestIdParam = guest && guest.id ? guest.id : 'g4';
    const linkPagosStr = `https://wedding-admin-portal.vercel.app?portal=${guestIdParam}`;

    return templateRaw
        .replace(/{nombre_familia}/g, guestName)
        .replace(/{pases}/g, passText)
        .replace(/{mesa}/g, tableName)
        .replace(/{novios}/g, coupleNames)
        .replace(/{fecha}/g, dateText)
        .replace(/{lugar}/g, venueText)
        .replace(/{link_invitacion}/g, liveUrl)
        .replace(/{costo_total}/g, totalCostStr)
        .replace(/{abono_sugerido}/g, suggestedMonthlyStr)
        .replace(/{fecha_limite}/g, deadlineStr)
        .replace(/{link_pagos}/g, linkPagosStr);
}

function renderWhatsAppPhonePreview(guest, data) {
    const titleEl = document.getElementById('waPreviewHeaderTitle');
    const subEl = document.getElementById('waPreviewHeaderSub');
    const bodyEl = document.getElementById('waPreviewMessageBody');
    const btnEl = document.getElementById('waPreviewOpenInviteBtn');

    if (!bodyEl) return;

    const targetGuest = guest || ((data && data.guests && data.guests.length > 0) ? data.guests[0] : {
        name: 'Familia Garza',
        passes: 2,
        companion: 'Acompañante',
        tableId: 't1'
    });

    const coupleNames = (data && data.couple) ? data.couple : 'Sofía & Alejandro';
    const dateText = (data && data.date) ? data.date : '24 de Octubre, 2027';
    const venueText = (data && data.venue) ? data.venue : 'Hacienda San Gabriel';
    const liveUrl = (data && data.liveUrl) ? data.liveUrl : 'https://aura-wedding-experience.vercel.app';
    const passesCount = targetGuest.passes || 2;
    const passText = passesCount > 1 ? `${passesCount} Pases de Honor` : '1 Pase Individual';
    const tableName = getGuestTableName(targetGuest, data);

    if (titleEl) titleEl.innerText = `Para: ${targetGuest.name}`;
    if (subEl) {
        subEl.innerText = currentGatewayMode === 'qr_gateway'
            ? 'Plantilla 2: Recordatorio de Cierre de Mesas'
            : currentGatewayMode === 'destination_payment'
                ? 'Plantilla 3: Abono de Estancia & SPEI Boda Destino'
                : currentGatewayMode === 'manual'
                    ? 'Plantilla 4: Pase QR y Mesa Asignada'
                    : 'Plantilla 1: Invitación Oficial & Pases';
    }
    if (btnEl) btnEl.href = liveUrl;

    const msgFormatted = buildPlannerWhatsAppText(targetGuest, currentGatewayMode, data)
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    bodyEl.innerHTML = msgFormatted;
}

function previewGuestWhatsAppMessage(guestId) {
    currentData = getWeddingState(currentWeddingId);
    const guest = (currentData.guests || []).find(g => g.id === guestId);
    if (!guest) return;
    previewedGuestId = guestId;
    renderWhatsAppPhonePreview(guest, currentData);
    const previewCard = document.querySelector('.whatsapp-mockup-card');
    if (previewCard && window.innerWidth <= 900) {
        previewCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    showToast(`👁️ Mostrando vista previa del mensaje para ${guest.name}`);
}

let dispatchSearchTerm = '';

function searchDispatchGuests(query) {
    dispatchSearchTerm = (query || '').toLowerCase().trim();
    renderDispatchTab();
}

function toggleSelectAllDispatch(isChecked) {
    currentData = getWeddingState(currentWeddingId);
    const guests = currentData.guests || [];
    guests.forEach(g => {
        if (isChecked) {
            g.dispatchStatus = 'sent';
            g.deliveryStatus = 'delivered';
            if (!g.sentDate) {
                g.sentDate = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            }
        } else {
            g.dispatchStatus = 'pending';
            g.deliveryStatus = null;
            g.sentDate = null;
        }
    });
    saveWeddingState(currentWeddingId, currentData);
    renderDispatchTab();
    showToast(isChecked ? '✓ Todas las familias marcadas como enviadas' : '↩️ Todas las familias marcadas como pendientes');
}

function renderDispatchTab() {
    currentData = getWeddingState(currentWeddingId);
    const tbody = document.getElementById('dispatchGuestsTableBody');
    if (!tbody) return;

    const isDestWedding = !!(currentData && currentData.isDestination);
    const destCard = document.getElementById('card_mode_destination_payment');
    if (destCard) {
        if (isDestWedding) {
            destCard.style.display = 'block';
            const badge = destCard.querySelector('.badge-stage-status');
            if (badge && currentGatewayMode !== 'destination_payment') {
                badge.innerText = '🏖️ Boda Destino Activa';
                badge.style.background = '#e0f2fe';
                badge.style.color = '#0369a1';
            }
        } else {
            // Si es boda local/tradicional, no saturamos a la planner pero se mantiene accesible
            const badge = destCard.querySelector('.badge-stage-status');
            if (badge && currentGatewayMode !== 'destination_payment') {
                badge.innerText = 'Solo Playa/Destino';
                badge.style.background = '#f1f5f9';
                badge.style.color = '#94a3b8';
            }
        }
    }

    // Master Metric Calculations
    const guests = (currentData && currentData.guests) ? currentData.guests : [];
    const totalFamilies = guests.length;
    const totalPax = guests.reduce((sum, g) => sum + (g.passes || 1), 0);
    const sentGuests = guests.filter(g => g.dispatchStatus === 'sent' || g.sentDate).length;
    const pendingGuests = totalFamilies - sentGuests;
    
    const confirmedGuests = guests.filter(g => g.status === 'confirmed');
    const confirmedCount = confirmedGuests.length;
    const confirmedPax = confirmedGuests.reduce((sum, g) => sum + (g.passes || 1), 0);

    const declinedGuests = guests.filter(g => g.status === 'declined');
    const declinedCount = declinedGuests.length;
    const declinedPax = declinedGuests.reduce((sum, g) => sum + (g.passes || 1), 0);

    const sentWithoutRsvp = guests.filter(g => (g.dispatchStatus === 'sent' || g.sentDate) && g.status !== 'confirmed' && g.status !== 'declined').length;
    const pendingRsvpTotal = guests.filter(g => g.status !== 'confirmed' && g.status !== 'declined').length;
    
    const responseRate = totalFamilies > 0 ? Math.round(((confirmedCount + declinedCount) / totalFamilies) * 100) : 0;
    const sentRate = totalFamilies > 0 ? Math.round((sentGuests / totalFamilies) * 100) : 0;

    // Toggle Destination Pay Header
    const thDestPay = document.getElementById('thDispatchDestinationPay');
    if (thDestPay) {
        thDestPay.style.display = isDestWedding ? 'table-cell' : 'none';
    }

    // Sync Sidebar Badge
    const sidebarBadge = document.getElementById('statDispatchPendingBadge');
    if (sidebarBadge) {
        sidebarBadge.innerText = `${pendingGuests} por mandar`;
        sidebarBadge.className = pendingGuests > 0 ? 'menu-badge badge-warning' : 'menu-badge';
    }

    // Update Master Metrics Cards
    const statTotalEl = document.getElementById('statDispatchTotal');
    const statTotalPaxEl = document.getElementById('statDispatchTotalPax');
    if (statTotalEl) statTotalEl.innerText = totalFamilies;
    if (statTotalPaxEl) statTotalPaxEl.innerText = `${totalPax} pases asignados`;

    const statSentEl = document.getElementById('statDispatchSent');
    const statSentPctEl = document.getElementById('statDispatchSentPct');
    if (statSentEl) statSentEl.innerText = sentGuests;
    if (statSentPctEl) statSentPctEl.innerText = `${sentRate}% de la lista`;

    const statPendingEl = document.getElementById('statDispatchPending');
    const statPendingHintEl = document.getElementById('statDispatchPendingHint');
    if (statPendingEl) statPendingEl.innerText = pendingGuests;
    if (statPendingHintEl) statPendingHintEl.innerText = pendingGuests === 0 ? '¡Lista al día!' : `Faltan ${pendingGuests} de enviar`;

    const statConfirmedEl = document.getElementById('statDispatchConfirmed');
    const statConfirmedPaxEl = document.getElementById('statDispatchConfirmedPax');
    if (statConfirmedEl) statConfirmedEl.innerText = confirmedCount;
    if (statConfirmedPaxEl) statConfirmedPaxEl.innerText = `${confirmedPax} pases confirmados`;

    const statDeclinedEl = document.getElementById('statDispatchDeclined');
    const statDeclinedHintEl = document.getElementById('statDispatchDeclinedHint');
    if (statDeclinedEl) statDeclinedEl.innerText = declinedCount;
    if (statDeclinedHintEl) statDeclinedHintEl.innerText = declinedPax > 0 ? `${declinedPax} pases liberados` : 'Ninguna declinación';

    const statRespRateEl = document.getElementById('statDispatchResponseRate');
    const statRespHintEl = document.getElementById('statDispatchResponseHint');
    if (statRespRateEl) statRespRateEl.innerText = `${responseRate}%`;
    if (statRespHintEl) statRespHintEl.innerText = `${pendingRsvpTotal} pendientes por responder`;

    // Update Filter Counters
    const fAll = document.getElementById('filterCountAll');
    const fPending = document.getElementById('filterCountPending');
    const fSent = document.getElementById('filterCountSent');
    const fConfirmed = document.getElementById('filterCountConfirmed');
    const fDeclined = document.getElementById('filterCountDeclined');
    if (fAll) fAll.innerText = totalFamilies;
    if (fPending) fPending.innerText = pendingGuests;
    if (fSent) fSent.innerText = sentWithoutRsvp;
    if (fConfirmed) fConfirmed.innerText = confirmedCount;
    if (fDeclined) fDeclined.innerText = declinedCount;

    // Sync template editor textarea
    updateTemplateEditorView();

    // Filter list
    let filtered = [...guests];
    if (activeDispatchFilter === 'pending') {
        filtered = filtered.filter(g => !g.dispatchStatus || g.dispatchStatus !== 'sent');
    } else if (activeDispatchFilter === 'sent') {
        filtered = filtered.filter(g => (g.dispatchStatus === 'sent' || g.sentDate) && g.status !== 'confirmed' && g.status !== 'declined');
    } else if (activeDispatchFilter === 'confirmed') {
        filtered = filtered.filter(g => g.status === 'confirmed');
    } else if (activeDispatchFilter === 'declined') {
        filtered = filtered.filter(g => g.status === 'declined');
    }

    if (dispatchSearchTerm) {
        filtered = filtered.filter(g => 
            (g.name || '').toLowerCase().includes(dispatchSearchTerm) ||
            (g.phone || '').toLowerCase().includes(dispatchSearchTerm) ||
            (g.companion || '').toLowerCase().includes(dispatchSearchTerm)
        );
    }

    // A-Z / Z-A / Passes Sorting
    if (activeDispatchSort === 'az') {
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' }));
    } else if (activeDispatchSort === 'za') {
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || '', 'es', { sensitivity: 'base' }));
    } else if (activeDispatchSort === 'passes') {
        filtered.sort((a, b) => (b.passes || 1) - (a.passes || 1));
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="${isDestWedding ? 11 : 10}" style="padding: 32px; text-align: center; color: #64748b;">
                    <div style="font-size: 2rem; margin-bottom: 8px;">📭</div>
                    <strong>No se encontraron familias con este filtro</strong>
                    <p style="font-size: 0.8rem; margin: 4px 0 0;">Intenta seleccionar "Todos" o verifica los términos de búsqueda.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(g => {
        const isSent = g.dispatchStatus === 'sent' || g.sentDate;
        const sentDateText = g.sentDate ? g.sentDate : (isSent ? 'Recientemente' : null);
        const cleanPhone = formatPhoneForWhatsAppLink(g.phone);
        const tableName = getGuestTableName(g, currentData);
        const passCount = g.passes || 1;

        const waMessage = encodeURIComponent(buildPlannerWhatsAppText(g, currentGatewayMode, currentData));
        const waLink = `https://wa.me/${cleanPhone}?text=${waMessage}`;

        // Status RSVP Badge
        let rsvpBadge = '';
        if (g.status === 'confirmed') {
            rsvpBadge = `<span style="background:#dcfce7; color:#15803d; font-size:0.72rem; font-weight:800; padding:4px 8px; border-radius:6px; border:1px solid #86efac; display:inline-flex; align-items:center; gap:4px;">✓ Confirmado</span>`;
        } else if (g.status === 'declined') {
            rsvpBadge = `<span style="background:#fee2e2; color:#991b1b; font-size:0.72rem; font-weight:800; padding:4px 8px; border-radius:6px; border:1px solid #fca5a5; display:inline-flex; align-items:center; gap:4px;">✕ Declinó</span>`;
        } else {
            rsvpBadge = `<span style="background:#fef3c7; color:#92400e; font-size:0.72rem; font-weight:800; padding:4px 8px; border-radius:6px; border:1px solid #fde68a; display:inline-flex; align-items:center; gap:4px;">⏳ Pendiente</span>`;
        }

        // Dispatch Status Text
        let dispatchStatusHtml = '';
        if (isSent) {
            dispatchStatusHtml = `
                <div>
                    <span style="color:#166534; font-weight:700; font-size:0.78rem;">✓ Enviado</span>
                    <small style="display:block; color:#64748b; font-size:0.7rem;">${sentDateText}</small>
                </div>
            `;
        } else {
            dispatchStatusHtml = `
                <span style="background:#fef2f2; color:#991b1b; border:1px solid #fecdd3; padding:2px 6px; border-radius:4px; font-size:0.72rem; font-weight:700;">
                    🚨 Por mandar
                </span>
            `;
        }

        // Dual Action Buttons: Cloud API (Background Automated) + Personal WhatsApp (Direct Link)
        let actionBtnHtml = '';
        if (!isSent) {
            actionBtnHtml = `
                <div style="display:inline-flex; gap:6px; align-items:center;">
                    <button type="button" onclick="sendAutomatedSingleMessage('${g.id}')" title="Disparar automáticamente vía Meta Cloud API en segundo plano" style="background:#0284c7; color:#ffffff; font-weight:700; font-size:0.75rem; padding:7px 11px; border-radius:6px; border:none; cursor:pointer; display:inline-flex; align-items:center; gap:4px; box-shadow:0 1px 3px rgba(2,132,199,0.3); transition:all 0.2s;" onmouseover="this.style.background='#0369a1'" onmouseout="this.style.background='#0284c7'">
                        <span>⚡ Cloud API</span>
                    </button>
                    <a href="${waLink}" target="_blank" onclick="markAsSentOnWhatsApp('${g.id}')" title="Abrir y enviar desde tu propio WhatsApp Web o App móvil" style="background:#10b981; color:#ffffff; font-weight:700; font-size:0.75rem; padding:7px 11px; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:4px; box-shadow:0 1px 3px rgba(16,185,129,0.3); transition:all 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                        <span>📲 Mi WhatsApp</span>
                    </a>
                </div>
            `;
        } else if (g.status !== 'confirmed' && g.status !== 'declined') {
            actionBtnHtml = `
                <div style="display:inline-flex; gap:6px; align-items:center;">
                    <button type="button" onclick="sendAutomatedSingleMessage('${g.id}')" title="Enviar recordatorio oficial por Meta Cloud API" style="background:#d97706; color:#ffffff; font-weight:700; font-size:0.75rem; padding:7px 11px; border-radius:6px; border:none; cursor:pointer; display:inline-flex; align-items:center; gap:4px; box-shadow:0 1px 3px rgba(217,119,6,0.3); transition:all 0.2s;" onmouseover="this.style.background='#b45309'" onmouseout="this.style.background='#d97706'">
                        <span>🔔 Recordatorio API</span>
                    </button>
                    <a href="${waLink}" target="_blank" onclick="markAsSentOnWhatsApp('${g.id}')" title="Enviar recordatorio desde tu propio WhatsApp" style="background:#f1f5f9; border:1px solid #cbd5e1; color:#0f172a; font-weight:700; font-size:0.75rem; padding:7px 11px; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:4px; transition:all 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
                        <span>💬 Chat</span>
                    </a>
                </div>
            `;
        } else if (g.status === 'confirmed') {
            actionBtnHtml = `
                <div style="display:inline-flex; gap:6px; align-items:center;">
                    <button type="button" onclick="copyGuestInviteLink('${g.id}', '${g.name}')" title="Copiar enlace de invitación" style="background:#ffffff; border:1px solid #cbd5e1; color:#0f172a; font-weight:600; font-size:0.75rem; padding:6px 10px; border-radius:6px; cursor:pointer;">
                        🔗 Enlace
                    </button>
                    <a href="${waLink}" target="_blank" onclick="markAsSentOnWhatsApp('${g.id}')" title="Reenviar información por WhatsApp" style="background:#f1f5f9; border:1px solid #cbd5e1; color:#0f172a; font-weight:700; font-size:0.75rem; padding:6px 10px; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                        💬 Reenviar
                    </a>
                </div>
            `;
        } else {
            actionBtnHtml = `
                <span style="color:#94a3b8; font-size:0.75rem; font-style:italic;">Declinó asistencia</span>
            `;
        }

        // Menu & Allergy breakdown (Individual per pass)
        const formatMenuName = (m) => {
            if (!m) return 'Filete';
            const lower = m.toLowerCase();
            if (lower.includes('filete')) return '🥩 Filete';
            if (lower.includes('salmon') || lower.includes('salmón')) return '🐟 Salmón';
            if (lower.includes('risotto')) return '🍄 Risotto';
            return m;
        };

        const g1MenuText = formatMenuName(g.guest1Menu || g.menu);
        const g1AllergyText = g.guest1Allergies || g.allergies || '';
        const hasG1Allergy = g1AllergyText && g1AllergyText.toLowerCase() !== 'ninguna' && g1AllergyText.trim() !== '';

        let menuAllergyHtml = '';
        if (g.status === 'declined') {
            menuAllergyHtml = '<span style="color:#94a3b8; font-size:0.75rem; font-style:italic;">No asiste</span>';
        } else if (g.status === 'pending') {
            menuAllergyHtml = '<span style="color:#94a3b8; font-size:0.75rem; font-style:italic;">⏳ Por elegir en invitación</span>';
        } else if (passCount === 1) {
            menuAllergyHtml = `
                <div>
                    <strong style="color:#0f172a; font-size:0.78rem;">${g1MenuText}</strong>
                    <div style="font-size:0.72rem; margin-top:2px;">
                        ${hasG1Allergy ? `<span style="background:#fee2e2; color:#991b1b; padding:1px 5px; border-radius:3px; font-weight:700;">⚠️ ${g1AllergyText}</span>` : '<span style="color:#64748b;">Sin alergias</span>'}
                    </div>
                </div>
            `;
        } else {
            const g2MenuText = formatMenuName(g.companionMenu || (g.menu === 'salmon' ? 'filete' : 'salmon'));
            const g2AllergyText = g.companionAllergies || '';
            const hasG2Allergy = g2AllergyText && g2AllergyText.toLowerCase() !== 'ninguna' && g2AllergyText.trim() !== '';

            menuAllergyHtml = `
                <div style="display:flex; flex-direction:column; gap:4px; font-size:0.74rem;">
                    <div>
                        <strong style="color:#0f172a;">1. ${g.name.split(' ')[0]}:</strong> ${g1MenuText}
                        ${hasG1Allergy ? `<span style="background:#fee2e2; color:#991b1b; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.68rem; margin-left:2px;">⚠️ ${g1AllergyText}</span>` : ''}
                    </div>
                    <div>
                        <strong style="color:#0f172a;">2. ${(g.companion || 'Acomp').split(' ')[0]}:</strong> ${g2MenuText}
                        ${hasG2Allergy ? `<span style="background:#fee2e2; color:#991b1b; padding:1px 4px; border-radius:3px; font-weight:700; font-size:0.68rem; margin-left:2px;">⚠️ ${g2AllergyText}</span>` : ''}
                    </div>
                </div>
            `;
        }

        // Passes badge
        let passBadgeHtml = '';
        if (g.status === 'declined') {
            passBadgeHtml = `<span style="background:#fee2e2; color:#991b1b; font-weight:700; font-size:0.75rem; padding:3px 8px; border-radius:6px; border:1px solid #fca5a5;">0 (${passCount} lib.)</span>`;
        } else if (g.status === 'pending') {
            passBadgeHtml = `
                <span style="background:#fef3c7; color:#92400e; font-weight:800; font-size:0.75rem; padding:3px 8px; border-radius:6px; border:1px solid #fde68a; display:inline-block;">
                    🎟️ ${passCount} reservados
                </span>
                <small style="display:block; color:#64748b; font-size:0.68rem; margin-top:2px;">Por responder</small>
            `;
        } else {
            const confirmedCount = g.confirmedPasses || passCount;
            passBadgeHtml = `
                <span style="background:#dcfce7; color:#15803d; font-weight:800; font-size:0.75rem; padding:3px 8px; border-radius:6px; border:1px solid #86efac; display:inline-block;">
                    ✓ ${confirmedCount} de ${passCount}
                </span>
            `;
        }

        // Table label
        const displayTableHtml = (g.status === 'confirmed' && g.tableId)
            ? `<span style="background:#fef3c7; color:#92400e; font-weight:700; font-size:0.74rem; padding:3px 8px; border-radius:6px; white-space:nowrap;">🪑 ${tableName}</span>`
            : `<span style="color:#94a3b8; font-size:0.74rem; font-style:italic;">Por asignar en 2D</span>`;

        // Destination Wedding Payment Math
        let destPayTd = '';
        if (isDestWedding) {
            const guestCostPerPerson = currentData.guestCost || 20000;
            const totalRequired = (g.passes || 1) * guestCostPerPerson;
            const paid = g.destinationPaid || (g.status === 'confirmed' ? (g.passes > 1 ? 20000 : 10000) : 0);
            const remaining = Math.max(0, totalRequired - paid);
            const pct = Math.min(100, Math.round((paid / totalRequired) * 100));
            const isLiquidated = paid >= totalRequired;

            destPayTd = `
                <td style="padding:12px 16px; min-width:130px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; margin-bottom:2px;">
                        <strong style="color:${isLiquidated ? '#15803d' : '#b45309'}; font-weight:800;">$${paid.toLocaleString('es-MX')}</strong>
                        <span style="color:#64748b; font-size:0.7rem;">/ $${totalRequired.toLocaleString('es-MX')}</span>
                    </div>
                    <div style="background:#e2e8f0; height:5px; border-radius:99px; overflow:hidden; margin-bottom:3px;">
                        <div style="background:${isLiquidated ? '#10b981' : '#f59e0b'}; width:${pct}%; height:100%;"></div>
                    </div>
                    <span style="font-size:0.68rem; font-weight:700; color:${isLiquidated ? '#15803d' : remaining > 0 ? '#b91c1c' : '#64748b'};">
                        ${isLiquidated ? '✓ 100% Liquidado' : `Resta: $${remaining.toLocaleString('es-MX')} (${pct}%)`}
                    </span>
                </td>
            `;
        }

        const actionsTd = `
            <td style="padding:12px 14px; text-align:center; white-space:nowrap;">
                <div style="display:inline-flex; gap:4px; align-items:center;">
                    <button type="button" class="btn-action secondary" style="padding:5px 8px; font-size:0.75rem; font-weight:700; border-radius:6px;" onclick="editGuest('${g.id}')" title="Editar datos o preferencias de la familia">
                        ✏️ Editar
                    </button>
                    <button type="button" class="btn-action secondary" style="padding:5px 7px; font-size:0.75rem; color:#dc2626; border-color:#fca5a5; background:#fff1f2; border-radius:6px;" onclick="deleteGuest('${g.id}')" title="Eliminar de la convocatoria">
                        🗑️
                    </button>
                </div>
            </td>
        `;

        return `
            <tr style="border-bottom:1px solid #f1f5f9; transition:background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding:12px 18px; text-align:center;">
                    <input type="checkbox" ${isSent ? 'checked' : ''} onchange="toggleDispatchStatus('${g.id}', this.checked)" title="Marcar como enviado">
                </td>
                <td style="padding:12px 18px;">
                    <div style="font-weight:700; color:#000000; font-size:0.88rem;">${g.name}</div>
                    ${g.companion ? `<small style="color:#64748b; font-size:0.74rem;">+ ${g.companion}</small>` : ''}
                </td>
                <td style="padding:12px 16px; color:#000000; font-weight:600; font-size:0.8rem; white-space:nowrap;">
                    ${g.phone || '<span style="color:#94a3b8;">Sin teléfono</span>'}
                </td>
                <td style="padding:12px 16px; text-align:center;">
                    ${passBadgeHtml}
                </td>
                <td style="padding:12px 16px;">
                    ${displayTableHtml}
                </td>
                <td style="padding:12px 16px;">
                    ${menuAllergyHtml}
                </td>
                ${destPayTd}
                <td style="padding:12px 16px;">
                    ${dispatchStatusHtml}
                </td>
                <td style="padding:12px 16px;">
                    ${rsvpBadge}
                </td>
                <td style="padding:12px 18px; text-align:right; white-space:nowrap;">
                    ${actionBtnHtml}
                </td>
                ${actionsTd}
            </tr>
        `;
    }).join('');

    // Sync View Visibility (Planner Console vs Couple Showroom)
    syncDispatchVisibility();
}

// ==========================================================================
// PASO 3: WHATSAPP SHOWROOM CONTROLLERS (COUPLE SIMULATOR & PLANNER TOGGLE)
// ==========================================================================

function switchDispatchView(mode) {
    currentDispatchDisplayMode = mode;
    const btnPlanner = document.getElementById('btnSubViewDispatchPlanner');
    const btnShowroom = document.getElementById('btnSubViewDispatchShowroom');
    if (btnPlanner) {
        btnPlanner.classList.toggle('active', mode === 'planner');
        btnPlanner.style.background = mode === 'planner' ? '#ffffff' : 'transparent';
        btnPlanner.style.color = mode === 'planner' ? '#0f172a' : '#64748b';
        btnPlanner.style.boxShadow = mode === 'planner' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none';
    }
    if (btnShowroom) {
        btnShowroom.classList.toggle('active', mode === 'showroom');
        btnShowroom.style.background = mode === 'showroom' ? '#ffffff' : 'transparent';
        btnShowroom.style.color = mode === 'showroom' ? '#0f172a' : '#64748b';
        btnShowroom.style.boxShadow = mode === 'showroom' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none';
    }
    syncDispatchVisibility();
}

function selectCoupleShowroomStage(stage) {
    coupleShowroomStage = stage;
    const stageIds = ['meta_api', 'qr_gateway', 'destination_payment', 'manual'];
    stageIds.forEach(id => {
        const btn = document.getElementById(`btnCStage-${id}`);
        if (btn) btn.classList.toggle('active', id === stage);
    });
    renderCoupleWhatsAppSimulator();
}

function selectCoupleShowroomTone(tone) {
    coupleShowroomTone = tone;
    const toneIds = ['opt1', 'opt2', 'opt3'];
    toneIds.forEach(id => {
        const btn = document.getElementById(`btnCTone-${id}`);
        if (btn) btn.classList.toggle('active', id === tone);
    });
    renderCoupleWhatsAppSimulator();
}

function syncDispatchVisibility() {
    const plannerConsole = document.getElementById('dispatchPlannerConsole');
    const coupleShowroom = document.getElementById('dispatchCoupleShowroom');
    const toggleWrap = document.getElementById('dispatchViewToggleWrap');
    
    // Check global role (from admin-app.js or sessionStorage)
    const isCoupleRole = (typeof activeRole !== 'undefined' && activeRole === 'couple') || 
                         (sessionStorage.getItem('antigravity_user_role') === 'couple');

    if (isCoupleRole) {
        if (plannerConsole) plannerConsole.style.display = 'none';
        if (coupleShowroom) coupleShowroom.style.display = 'block';
        if (toggleWrap) toggleWrap.style.display = 'none';
        renderCoupleWhatsAppSimulator();
        renderCoupleShowroomData();
    } else {
        if (toggleWrap) toggleWrap.style.display = 'inline-flex';
        if (currentDispatchDisplayMode === 'showroom') {
            if (plannerConsole) plannerConsole.style.display = 'none';
            if (coupleShowroom) coupleShowroom.style.display = 'block';
            renderCoupleWhatsAppSimulator();
            renderCoupleShowroomData();
        } else {
            if (plannerConsole) plannerConsole.style.display = 'block';
            if (coupleShowroom) coupleShowroom.style.display = 'none';
        }
    }
}

function renderCoupleWhatsAppSimulator() {
    currentData = getWeddingState(currentWeddingId);
    const msgEl = document.getElementById('waSimMessageBody');
    if (!msgEl) return;

    const coupleNames = (currentData && currentData.couple) ? currentData.couple : 'Sofía & Alejandro';
    const venueName = (currentData && currentData.venue) ? currentData.venue : 'Hacienda San Gabriel';
    const dateText = (currentData && currentData.date) ? currentData.date : '24 de Octubre, 2026';
    const liveUrl = (currentData && currentData.liveUrl && currentData.liveUrl.trim()) ? currentData.liveUrl.trim() : 'https://aura-wedding-experience.vercel.app';
    const guestWebUrl = `${liveUrl.replace(/\/+$/, '')}/?guest=ramon-garza`;
    const paymentsWebUrl = `https://wedding-admin-portal.vercel.app?pago=ramon-garza`;

    // Retrieve template from DEFAULT_WHATSAPP_TEMPLATES or custom
    const stageTemplates = DEFAULT_WHATSAPP_TEMPLATES[coupleShowroomStage] || DEFAULT_WHATSAPP_TEMPLATES.meta_api;
    let templateText = stageTemplates[coupleShowroomTone] || stageTemplates.opt1;

    // Check if custom was saved for this stage and tone
    if (currentData && currentData.customTemplates && currentData.customTemplates[`${coupleShowroomStage}_${coupleShowroomTone}`]) {
        templateText = currentData.customTemplates[`${coupleShowroomStage}_${coupleShowroomTone}`];
    }

    // Build sample values with realistic finished data
    const sampleReplacements = {
        '{nombre_familia}': 'Tío Ramón Garza',
        '{novios}': coupleNames,
        '{fecha}': dateText,
        '{lugar}': venueName,
        '{pases}': '2 pases de honor',
        '{mesa}': 'Mesa 10 - Imperial Oro',
        '{link_invitacion}': guestWebUrl,
        '{costo_total}': '$8,500 MXN',
        '{abono_sugerido}': '$1,700 MXN',
        '{fecha_limite}': '15 de Septiembre, 2026',
        '{link_pagos}': paymentsWebUrl
    };

    let rendered = templateText;
    for (const [key, val] of Object.entries(sampleReplacements)) {
        rendered = rendered.split(key).join(val);
    }

    // Convert WhatsApp markdown to styled HTML for realistic chat preview
    // *bold* -> <strong>bold</strong>
    // _italic_ -> <em>italic</em>
    // \n -> <br>
    // URLs -> clickable blue link
    let formattedHtml = rendered
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
        .replace(/\n/g, '<br>');

    msgEl.innerHTML = formattedHtml;

    // Update timestamp
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;
    const timeEl = document.getElementById('waSimTimestamp');
    if (timeEl) timeEl.innerText = timeStr;
}

function getFinishedCoupleSampleRawText() {
    currentData = getWeddingState(currentWeddingId);
    const coupleNames = (currentData && currentData.couple) ? currentData.couple : 'Sofía & Alejandro';
    const venueName = (currentData && currentData.venue) ? currentData.venue : 'Hacienda San Gabriel';
    const dateText = (currentData && currentData.date) ? currentData.date : '24 de Octubre, 2026';
    const liveUrl = (currentData && currentData.liveUrl && currentData.liveUrl.trim()) ? currentData.liveUrl.trim() : 'https://aura-wedding-experience.vercel.app';
    const guestWebUrl = `${liveUrl.replace(/\/+$/, '')}/?guest=ramon-garza`;
    const paymentsWebUrl = `https://wedding-admin-portal.vercel.app?pago=ramon-garza`;

    const stageTemplates = DEFAULT_WHATSAPP_TEMPLATES[coupleShowroomStage] || DEFAULT_WHATSAPP_TEMPLATES.meta_api;
    let templateText = stageTemplates[coupleShowroomTone] || stageTemplates.opt1;

    const sampleReplacements = {
        '{nombre_familia}': 'Tío Ramón Garza',
        '{novios}': coupleNames,
        '{fecha}': dateText,
        '{lugar}': venueName,
        '{pases}': '2 pases de honor',
        '{mesa}': 'Mesa 10 - Imperial Oro',
        '{link_invitacion}': guestWebUrl,
        '{costo_total}': '$8,500 MXN',
        '{abono_sugerido}': '$1,700 MXN',
        '{fecha_limite}': '15 de Septiembre, 2026',
        '{link_pagos}': paymentsWebUrl
    };

    let rendered = templateText;
    for (const [key, val] of Object.entries(sampleReplacements)) {
        rendered = rendered.split(key).join(val);
    }
    return rendered;
}

async function sendSampleToCoupleWhatsApp() {
    currentData = getWeddingState(currentWeddingId);
    const guests = (currentData && currentData.guests) ? currentData.guests : [];
    // Prioritize Luis González or first guest's phone
    const defaultPhone = guests.find(g => (g.name || '').toLowerCase().includes('luis'))?.phone || (guests[0] ? guests[0].phone : '+52 81 2219 9352');
    
    const targetPhone = prompt('📱 Ingresa el número de WhatsApp para recibir la prueba oficial de invitación:', defaultPhone || '+52 81 2219 9352');
    if (!targetPhone) return;

    const rawText = getFinishedCoupleSampleRawText();
    const liveUrl = (currentData && currentData.liveUrl) ? currentData.liveUrl : 'https://aura-wedding-experience.vercel.app';

    if (typeof showToast === 'function') {
        showToast(`🚀 Disparando prueba oficial vía Meta Cloud API a ${targetPhone}...`);
    }

    try {
        const response = await fetch('/api/send-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: targetPhone,
                name: 'Luis González (Prueba)',
                passes: 2,
                couple: currentData.couple || 'Sofía & Alejandro',
                date: currentData.date || '24 de Octubre, 2027',
                venue: currentData.venue || 'Hacienda Fundadores',
                liveUrl: liveUrl,
                message: rawText,
                template: {
                    name: 'notificacion_reservas_bodas',
                    language: 'es_MX',
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                { type: 'text', text: 'Luis González Garza' },
                                { type: 'text', text: '2 pases' },
                                { type: 'text', text: currentData.couple || 'Sofía & Alejandro' },
                                { type: 'text', text: currentData.date || '24 de Octubre, 2027' },
                                { type: 'text', text: currentData.venue || 'Hacienda Fundadores' },
                                { type: 'text', text: liveUrl }
                            ]
                        }
                    ]
                }
            })
        });

        const resJson = await response.json();
        if (resJson && resJson.success) {
            alert(`🎉 ¡Prueba oficial despachada con éxito a ${targetPhone}!\n\nℹ️ El mensaje fue emitido desde la línea oficial registrada en Meta (+1 364 212 1213 - Antigravity Web Studio).\n\nRevisa tu WhatsApp en tu teléfono. Si no lo ves en la bandeja principal, búscalo en Solicitudes de Mensaje o Números Desconocidos.`);
        } else {
            const errMsg = (resJson && resJson.error) ? resJson.error : 'Fallo en Meta API';
            alert(`⚠️ Respuesta de Meta: ${errMsg}\n\nSe abrirá WhatsApp Web/Móvil como alternativa para enviarlo directamente.`);
            const clean = formatPhoneForWhatsAppLink(targetPhone);
            window.open(`https://wa.me/${clean}?text=${encodeURIComponent(rawText)}`, '_blank');
        }
    } catch (e) {
        console.error('Error disparando muestra:', e);
        const clean = formatPhoneForWhatsAppLink(targetPhone);
        window.open(`https://wa.me/${clean}?text=${encodeURIComponent(rawText)}`, '_blank');
    }
}

function copyCoupleSampleWhatsApp() {
    const rawText = getFinishedCoupleSampleRawText();
    navigator.clipboard.writeText(rawText).then(() => {
        if (typeof showToast === 'function') {
            showToast('📋 ¡Mensaje de prueba copiado al portapapeles!');
        }
    }).catch(() => {
        if (typeof showToast === 'function') {
            showToast('✓ Mensaje listo para compartir.');
        }
    });
}

function renderCoupleShowroomData() {
    currentData = getWeddingState(currentWeddingId);
    const guests = (currentData && currentData.guests) ? currentData.guests : [];
    const totalFamilies = guests.length;
    const totalPax = guests.reduce((sum, g) => sum + (g.passes || 1), 0);
    const sentGuests = guests.filter(g => g.dispatchStatus === 'sent' || g.sentDate).length;
    const sentRate = totalFamilies > 0 ? Math.round((sentGuests / totalFamilies) * 100) : 0;
    
    const confirmedGuests = guests.filter(g => g.status === 'confirmed');
    const confirmedPax = confirmedGuests.reduce((sum, g) => sum + (g.passes || 1), 0);

    // Update Novios Hero Stats
    const pctEl = document.getElementById('cShowroomSentPct');
    const sentCountEl = document.getElementById('cShowroomSentCount');
    const paxCountEl = document.getElementById('cShowroomPaxCount');
    const paxSubEl = document.getElementById('cShowroomPaxSub');
    const badgeEl = document.getElementById('cShowroomGuestCountBadge');

    if (pctEl) pctEl.innerText = `${sentRate}%`;
    if (sentCountEl) sentCountEl.innerText = `${sentGuests} de ${totalFamilies} familias`;
    if (paxCountEl) paxCountEl.innerText = `${confirmedPax} pases`;
    if (paxSubEl) paxSubEl.innerText = `de ${totalPax} asignados`;
    if (badgeEl) badgeEl.innerText = `${totalFamilies} Familias Registradas`;

    // Render Clean Couple Guests Table
    const cTbody = document.getElementById('coupleGuestsTableBody');
    if (!cTbody) return;

    if (guests.length === 0) {
        cTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:#64748b;">No hay familias registradas todavía.</td></tr>`;
        return;
    }

    cTbody.innerHTML = guests.map(g => {
        const isSent = g.dispatchStatus === 'sent' || g.sentDate;
        const tableName = getGuestTableName(g, currentData);
        const passCount = g.passes || 1;

        let rsvpStatusHtml = '';
        let passBadgeHtml = '';
        let tableBadgeHtml = '';

        if (g.status === 'confirmed') {
            rsvpStatusHtml = `<span style="background:#dcfce7; color:#15803d; font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:6px; border:1px solid #86efac; display:inline-flex; align-items:center; gap:4px;">✅ Confirmado</span>`;
            passBadgeHtml = `<span style="background:#dcfce7; color:#15803d; font-weight:800; font-size:0.78rem; padding:3px 10px; border-radius:12px;">✓ ${g.confirmedPasses || passCount} de ${passCount}</span>`;
            tableBadgeHtml = `<span style="color:#334155; font-weight:600; font-size:0.8rem;">🪑 ${g.tableId ? tableName : 'Por asignar'}</span>`;
        } else if (g.status === 'declined') {
            rsvpStatusHtml = `<span style="background:#fee2e2; color:#991b1b; font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:6px; border:1px solid #fca5a5; display:inline-flex; align-items:center; gap:4px;">❌ Declinó</span>`;
            passBadgeHtml = `<span style="background:#fee2e2; color:#991b1b; font-weight:700; font-size:0.78rem; padding:3px 10px; border-radius:12px;">0 (${passCount} lib.)</span>`;
            tableBadgeHtml = `<span style="color:#94a3b8; font-size:0.8rem;">—</span>`;
        } else {
            rsvpStatusHtml = `<span style="background:#fef3c7; color:#92400e; font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:6px; border:1px solid #fde68a; display:inline-flex; align-items:center; gap:4px;">⏳ Pendiente</span>`;
            passBadgeHtml = `<span style="background:#fef3c7; color:#92400e; font-weight:800; font-size:0.78rem; padding:3px 10px; border-radius:12px;">🎟️ ${passCount} reservados</span>`;
            tableBadgeHtml = `<span style="color:#94a3b8; font-size:0.8rem; font-style:italic;">Por asignar</span>`;
        }

        let sentStatusHtml = isSent 
            ? `<span style="color:#166534; font-weight:800; font-size:0.8rem; display:inline-flex; align-items:center; gap:4px;"><span style="color:#10b981;">✓✓</span> Enviado</span>`
            : `<span style="color:#d97706; font-weight:700; font-size:0.75rem; background:#fef3c7; padding:2px 8px; border-radius:4px;">Programado</span>`;

        return `
            <tr style="border-bottom:1px solid #f1f5f9; transition:background 0.15s;">
                <td style="padding:12px 16px;">
                    <strong style="color:#0f172a; font-size:0.88rem; display:block;">${g.name}</strong>
                    <small style="color:#64748b; font-size:0.75rem;">${g.phone || 'Sin teléfono'}</small>
                </td>
                <td style="padding:12px 14px; text-align:center;">
                    ${passBadgeHtml}
                </td>
                <td style="padding:12px 14px;">
                    ${tableBadgeHtml}
                </td>
                <td style="padding:12px 14px; text-align:center;">
                    ${sentStatusHtml}
                </td>
                <td style="padding:12px 16px; text-align:center;">
                    ${rsvpStatusHtml}
                </td>
            </tr>
        `;
    }).join('');
}


function filterDispatch(filter) {
    activeDispatchFilter = filter;
    document.querySelectorAll('.dispatch-filter-pill').forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.target) window.event.target.classList.add('active');
    renderDispatchTab();
}

function setGatewayMode(mode) {
    currentGatewayMode = mode;
    
    // Update large cards
    const modeKeys = ['meta_api', 'qr_gateway', 'destination_payment', 'manual'];
    modeKeys.forEach(m => {
        const card = document.getElementById(`card_mode_${m}`);
        if (!card) return;
        const isActive = (m === mode);
        card.classList.toggle('active', isActive);
        card.style.border = isActive ? '2.5px solid #10b981' : '1.5px solid #cbd5e1';
        card.style.background = isActive ? '#f0fdf4' : '#ffffff';
        card.style.boxShadow = isActive ? '0 4px 14px rgba(16,185,129,0.15)' : 'none';
        
        const badge = card.querySelector('.badge-stage-status');
        if (badge) {
            badge.innerText = isActive ? 'Activa' : 'Seleccionar';
            badge.style.background = isActive ? '#10b981' : '#f1f5f9';
            badge.style.color = isActive ? '#ffffff' : '#475569';
        }
    });

    if (mode === 'meta_api') {
        showToast('💌 Etapa 1 activa: Invitación Oficial & Pases');
    } else if (mode === 'qr_gateway') {
        showToast('🔔 Etapa 2 activa: Recordatorio RSVP (Indecisos)');
    } else if (mode === 'destination_payment') {
        showToast('🏖️ Etapa 3 activa: Abono de Estancia & SPEI Boda Destino');
    } else {
        showToast('🎟️ Etapa 4 activa: Pase QR & Mesa Asignada');
    }

    updateTemplateEditorView();
    renderDispatchTab();
}

function toggleDispatchStatus(guestId, isChecked) {
    currentData = getWeddingState(currentWeddingId);
    const guest = currentData.guests.find(g => g.id === guestId);
    if (!guest) return;

    if (isChecked) {
        guest.dispatchStatus = 'sent';
        guest.deliveryStatus = 'delivered';
        guest.sentDate = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        showToast(`✓ Invitación de "${guest.name}" marcada como enviada.`);
    } else {
        guest.dispatchStatus = 'pending';
        guest.deliveryStatus = null;
        guest.sentDate = null;
        showToast(`↩️ Invitación de "${guest.name}" restablecida a pendiente.`);
    }

    saveWeddingState(currentWeddingId, currentData);
    renderDispatchTab();
}

function toggleGuestQuickRsvp(guestId) {
    currentData = getWeddingState(currentWeddingId);
    const guest = currentData.guests.find(g => g.id === guestId);
    if (!guest) return;

    if (guest.status === 'confirmed') {
        guest.status = 'pending';
        showToast(`⏳ ${guest.name} cambiado a Pendiente de Confirmar.`);
    } else {
        guest.status = 'confirmed';
        guest.dispatchStatus = 'sent';
        if (!guest.sentDate) {
            guest.sentDate = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        }
        if (!guest.menu) guest.menu = 'filete';
        showToast(`✅ ¡Asistencia de ${guest.name} (${guest.passes} pases) confirmada!`);
    }

    saveWeddingState(currentWeddingId, currentData);
    renderDispatchTab();
    if (typeof renderDashboard === 'function') renderDashboard();
}

function markAsSentOnWhatsApp(guestId) {
    currentData = getWeddingState(currentWeddingId);
    const guest = currentData.guests.find(g => g.id === guestId);
    if (!guest) return;

    const stageLabel = currentGatewayMode === 'qr_gateway'
        ? 'Recordatorio'
        : currentGatewayMode === 'manual'
            ? 'Pase QR y Mesa'
            : '1ª Invitación';

    guest.dispatchStatus = 'sent';
    guest.deliveryStatus = 'delivered';
    guest.sentDate = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ` (${stageLabel})`;
    saveWeddingState(currentWeddingId, currentData);

    setTimeout(() => {
        renderDispatchTab();
    }, 600);
}

async function sendAutomatedSingleMessage(guestId) {
    currentData = getWeddingState(currentWeddingId);
    const guest = (currentData && currentData.guests) ? currentData.guests.find(g => g.id === guestId) : null;
    if (!guest) return;

    if (!guest.phone) {
        showToast('⚠️ Este invitado no cuenta con número de teléfono registrado.');
        return;
    }

    const liveUrl = (currentData && currentData.liveUrl) ? currentData.liveUrl : 'https://aura-wedding-experience.vercel.app';
    const passCount = guest.passes || 1;
    const passText = passCount > 1 ? `${passCount} pases` : '1 pase';
    const personalizedMessage = buildPlannerWhatsAppText(guest, currentGatewayMode, currentData);

    const templatePayload = {
        name: 'notificacion_reservas_bodas',
        language: 'es_MX',
        components: [
            {
                type: 'body',
                parameters: [
                    { type: 'text', text: guest.name || 'Familia' },
                    { type: 'text', text: passText },
                    { type: 'text', text: currentData.couple || 'Sofía & Alejandro' },
                    { type: 'text', text: currentData.date || '24 de Octubre, 2027' },
                    { type: 'text', text: currentData.venue || 'Hacienda Fundadores' },
                    { type: 'text', text: liveUrl }
                ]
            }
        ]
    };

    if (typeof showToast === 'function') {
        showToast(`🚀 Disparando mensaje oficial vía Meta Cloud API a ${guest.name}...`);
    }

    try {
        const response = await fetch('/api/send-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: guest.phone,
                message: personalizedMessage,
                template: templatePayload,
                guestId: guest.id,
                name: guest.name,
                passes: guest.passes,
                couple: currentData.couple,
                date: currentData.date,
                venue: currentData.venue,
                liveUrl: liveUrl
            })
        });

        const resJson = await response.json();
        if (resJson && resJson.success) {
            guest.dispatchStatus = 'sent';
            guest.deliveryStatus = 'delivered';
            guest.sentDate = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' (Meta Cloud API)';
            saveWeddingState(currentWeddingId, currentData);
            renderDispatchTab();
            if (typeof showToast === 'function') {
                showToast(`🎉 ¡Invitación enviada con éxito a ${guest.name} (${guest.phone}) vía Meta Cloud API!`);
            }
        } else {
            const errMsg = (resJson && resJson.error) ? resJson.error : 'Fallo de entrega en Meta';
            console.error('Error Meta API:', resJson);
            alert(`⚠️ Detalle de entrega Meta Cloud API:\n\n${errMsg}\n\nPuedes abrir WhatsApp directamente con el botón "📲 Mi WhatsApp" para enviarlo desde tu app.`);
        }
    } catch (err) {
        console.error('Error enviando mensaje individual:', err);
        showToast(`⚠️ Error de conexión: ${err.message}`);
    }
}

// ==========================================================================
// BATCH DISPATCH MODAL & ENGINE
// ==========================================================================
function openBatchDispatchModal() {
    if (typeof activeRole !== 'undefined' && activeRole === 'couple') {
        showToast('🔒 Acción exclusiva de tu Wedding Planner.');
        return;
    }
    currentData = getWeddingState(currentWeddingId);

    const activePlan = localStorage.getItem('wedding_subscription_tier') || 'signature';
    if (activePlan === 'essential' || activePlan === 'basic') {
        if (typeof openSpeiUpgradeModal === 'function') {
            openSpeiUpgradeModal('intermediate');
        }
        showToast("🔒 El Envío en Lote Automático está incluido en los planes Signature Pro y Atelier Elite.");
        return;
    }

    const pendingGuests = (currentData.guests || []).filter(g => !g.dispatchStatus || g.dispatchStatus !== 'sent');

    const modal = document.getElementById('batchDispatchModal');
    if (!modal) return;

    document.getElementById('batchPendingCount').innerText = `${pendingGuests.length} familias`;
    document.getElementById('batchEstCost').innerText = `Incluido en tu Plan`;
    document.getElementById('batchProgressBarInner').style.width = '0%';
    document.getElementById('batchLogConsole').innerHTML = `
        <div style="background:#064e3b; border:1.5px solid #10b981; color:#ecfdf5; padding:10px 14px; border-radius:8px; margin-bottom:10px; font-size:0.78rem; line-height:1.45;">
            🛡️ <strong style="color:#ffffff;">Modo Anti-Bloqueo de WhatsApp Activado:</strong><br>
            <span style="color:#a7f3d0;">Para proteger tu número de WhatsApp y reputación de Meta, las invitaciones se despachan con una cadencia natural de seguridad entre cada contacto.</span>
        </div>
        <div class="log-line info">⚡ Listo para enviar a las familias pendientes. Haz clic en "Iniciar Envío Automático".</div>`;

    document.getElementById('btnStartBatchExecution').style.display = 'inline-flex';
    document.getElementById('btnCancelBatch').style.display = 'inline-flex';
    document.getElementById('btnCloseBatchModal').style.display = 'none';

    modal.classList.add('active');
}

function closeBatchDispatchModal() {
    const modal = document.getElementById('batchDispatchModal');
    if (modal) modal.classList.remove('active');
}

async function startBatchExecution() {
    currentData = getWeddingState(currentWeddingId);
    const pendingGuests = (currentData.guests || []).filter(g => !g.dispatchStatus || g.dispatchStatus !== 'sent');

    if (pendingGuests.length === 0) {
        showToast("Todos los invitados ya tienen su invitación enviada.");
        return;
    }

    isDispatchingBatch = true;
    document.getElementById('btnStartBatchExecution').style.display = 'none';
    document.getElementById('btnCancelBatch').style.display = 'none';

    const log = document.getElementById('batchLogConsole');
    const bar = document.getElementById('batchProgressBarInner');

    log.innerHTML += `<div class="log-line highlight">🚀 Enviando invitaciones personalizadas con pausa de seguridad...</div>`;

    for (let i = 0; i < pendingGuests.length; i++) {
        const guest = pendingGuests[i];
        const pct = Math.round(((i + 1) / pendingGuests.length) * 100);

        log.innerHTML += `<div class="log-line" style="color:#ffffff; font-weight:600;">⏳ Preparando mensaje WhatsApp para <strong style="color:#fbbf24;">${guest.name}</strong> (${guest.passes} pases)...</div>`;
        log.scrollTop = log.scrollHeight;

        const personalizedMessage = buildPlannerWhatsAppText(guest, currentGatewayMode, currentData);

        try {
            // Disparo oficial mediante Meta Cloud API
            const liveUrl = (currentData && currentData.liveUrl) ? currentData.liveUrl : 'https://aura-wedding-experience.vercel.app';
            const passCount = guest.passes || 1;
            const passText = passCount > 1 ? `${passCount} pases` : '1 pase';

            // Mapeo a plantillas activas y 100% aprobadas en Meta Cloud API (APPROVED)
            let templatePayload = null;
            if (currentGatewayMode === 'meta_api' && currentTemplateOption === 'opt1') {
                // Utiliza la plantilla maestra verificada notificacion_reservas_bodas (APPROVED)
                templatePayload = {
                    name: 'notificacion_reservas_bodas',
                    language: 'es_MX',
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                { type: 'text', text: guest.name || 'Familia' },
                                { type: 'text', text: passText },
                                { type: 'text', text: currentData.couple || 'Sofía & Alejandro' },
                                { type: 'text', text: currentData.date || '24 de Octubre, 2027' },
                                { type: 'text', text: currentData.venue || 'Hacienda Fundadores' },
                                { type: 'text', text: liveUrl }
                            ]
                        }
                    ]
                };
            } else if (currentGatewayMode === 'qr_gateway' && currentTemplateOption === 'opt1') {
                // Utiliza la plantilla de recordatorio verificada notificacion_reserva_boda (APPROVED)
                templatePayload = {
                    name: 'notificacion_reserva_boda',
                    language: 'es_MX',
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                { type: 'text', text: guest.name || 'Familia' },
                                { type: 'text', text: passText },
                                { type: 'text', text: liveUrl }
                            ]
                        }
                    ]
                };
            } else if (currentGatewayMode === 'manual' && currentTemplateOption === 'opt1') {
                templatePayload = {
                    name: 'notificacion_reservas_bodas',
                    language: 'es_MX',
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                { type: 'text', text: guest.name || 'Familia' },
                                { type: 'text', text: passText },
                                { type: 'text', text: currentData.couple || 'Sofía & Alejandro' },
                                { type: 'text', text: currentData.date || '24 de Octubre, 2027' },
                                { type: 'text', text: currentData.venue || 'Hacienda Fundadores' },
                                { type: 'text', text: liveUrl }
                            ]
                        }
                    ]
                };
            }

            const response = await fetch('/api/send-whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: guest.phone,
                    message: personalizedMessage,
                    template: templatePayload,
                    guestId: guest.id,
                    name: guest.name
                })
            });

            const resJson = await response.json();

            if (resJson && resJson.success) {
                guest.dispatchStatus = 'sent';
                guest.deliveryStatus = 'delivered';
                guest.sentDate = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' (Meta Cloud API)';
                log.innerHTML += `<div class="log-line success" style="color:#15803d; font-weight:700;">✓ [Meta ID: ${(resJson.messageId || 'OK').substring(0, 14)}...] ¡Entregado a ${guest.name} (${guest.phone})!</div>`;
            } else {
                const errMsg = (resJson && resJson.error) ? resJson.error : 'Fallo en pasarela';
                log.innerHTML += `<div class="log-line error" style="color:#b91c1c; font-weight:600;">⚠️ ${guest.name} (${guest.phone}): ${errMsg}</div>`;
                if (errMsg.includes('recipient') || errMsg.includes('not in allowed list') || resJson.code === 131030) {
                    log.innerHTML += `<div class="log-line" style="color:#d97706; font-size:0.75rem;">💡 Recuerda verificar que el número esté agregado en la lista de destinatarios autorizados en Meta Developers.</div>`;
                }
                guest.dispatchStatus = 'sent';
                guest.sentDate = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' (Intentado)';
            }
        } catch (fetchErr) {
            console.error('Error enviando WhatsApp:', fetchErr);
            log.innerHTML += `<div class="log-line error" style="color:#b91c1c;">⚠️ Error de conexión al disparar a ${guest.name}: ${fetchErr.message}</div>`;
        }

        bar.style.width = `${pct}%`;
        log.scrollTop = log.scrollHeight;

        // Pausa natural anti-saturación de 1.5s
        if (i < pendingGuests.length - 1) {
            await new Promise(r => setTimeout(r, 1500));
        }
    }

    saveWeddingState(currentWeddingId, currentData);
    renderDispatchTab();

    log.innerHTML += `<div class="log-line highlight" style="color:#0f172a; font-weight:800; background:#fef3c7; padding:6px; border-radius:6px; margin-top:8px;">🎉 ¡Proceso de envío finalizado! ${pendingGuests.length} mensajes procesados.</div>`;
    log.scrollTop = log.scrollHeight;
    document.getElementById('btnCloseBatchModal').style.display = 'inline-flex';
    showToast(`🎉 ¡${pendingGuests.length} invitaciones procesadas con éxito!`);
}

function simulateGuestReply(guestId) {
    toggleGuestQuickRsvp(guestId);
}

function closeWebhookModal() {
    const modal = document.getElementById('webhookInspectorModal');
    if (modal) modal.classList.remove('active');
}

function copyGuestInviteLink(guestId, name) {
    const liveUrl = (currentData && currentData.liveUrl) ? currentData.liveUrl : 'https://aura-wedding-experience.vercel.app';
    navigator.clipboard.writeText(liveUrl).then(() => {
        showToast(`📋 Enlace de invitación de "${name}" copiado al portapapeles.`);
    });
}
