/**
 * ==========================================================================
 * ANTIGRAVITY WEDDING SAAS - LIVE WEB RSVP SYNC ENGINE
 * Sincroniza en tiempo real las confirmaciones recibidas en las invitaciones
 * digitales con la base de datos de comensales y el Seating Chart.
 * ==========================================================================
 */

let isSyncingRsvps = false;

/**
 * Consulta el endpoint /api/rsvp y actualiza la lista de invitados local
 */
async function syncLiveWebRsvps(isManualTrigger = false) {
    if (isSyncingRsvps) return;
    
    const weddingId = (typeof currentWeddingId !== 'undefined' && currentWeddingId) ? currentWeddingId : 'aleypablo';
    if (!weddingId) return;

    const syncBtnIcon = document.getElementById('syncRsvpIcon');
    if (syncBtnIcon) syncBtnIcon.classList.add('fa-spin', 'spinning-loader');

    isSyncingRsvps = true;

    try {
        const apiUrl = `/api/rsvp?wedding=${encodeURIComponent(weddingId)}&t=${Date.now()}`;
        const res = await fetch(apiUrl);
        if (!res.ok) {
            if (isManualTrigger) {
                console.warn('API /api/rsvp no disponible aún o en entorno local.');
            }
            return;
        }

        const data = await res.json();
        if (!data || !Array.isArray(data.rsvps) || data.rsvps.length === 0) {
            if (isManualTrigger) {
                if (typeof showToast === 'function') {
                    showToast('ℹ️ No hay nuevas confirmaciones pendientes por sincronizar.', 'info');
                }
            }
            return;
        }

        // Obtener estado fresco
        if (typeof getWeddingState === 'function') {
            currentData = getWeddingState(weddingId);
        }
        if (!currentData) return;
        if (!Array.isArray(currentData.guests)) {
            currentData.guests = [];
        }

        let updatedCount = 0;
        let createdCount = 0;

        data.rsvps.forEach(rsvp => {
            const cleanName = (rsvp.name || '').trim();
            const cleanPhone = (rsvp.phone || '').trim().replace(/[\s\-\(\)]/g, '');
            if (!cleanName) return;

            // Buscar si ya existe por nombre o teléfono
            const existingGuest = currentData.guests.find(g => {
                const gPhone = (g.phone || '').replace(/[\s\-\(\)]/g, '');
                const phoneMatch = cleanPhone && gPhone && (cleanPhone === gPhone || cleanPhone.endsWith(gPhone) || gPhone.endsWith(cleanPhone));
                const nameMatch = (g.name || '').trim().toLowerCase() === cleanName.toLowerCase();
                return phoneMatch || nameMatch;
            });

            const newStatus = (rsvp.attendance === 'yes') ? 'confirmed' : 'declined';
            const passes = (rsvp.attendance === 'yes') ? (parseInt(rsvp.passes, 10) || 1) : 0;

            if (existingGuest) {
                // Actualizar estatus y preferencias si cambiaron
                let changed = false;
                if (existingGuest.status !== newStatus) {
                    existingGuest.status = newStatus;
                    changed = true;
                }
                if (existingGuest.passes !== passes && passes > 0) {
                    existingGuest.passes = passes;
                    changed = true;
                }
                if (rsvp.allergies && rsvp.allergies !== 'Ninguna') {
                    existingGuest.allergies = rsvp.allergies;
                    existingGuest.guest1Allergies = rsvp.allergies;
                    changed = true;
                }
                if (rsvp.companion) {
                    existingGuest.companion = rsvp.companion;
                    changed = true;
                }
                if (rsvp.menu) {
                    existingGuest.menu = rsvp.menu;
                    changed = true;
                }
                if (changed) updatedCount++;
            } else {
                // Registrar nuevo invitado confirmado vía web
                const newGuest = {
                    id: 'g_web_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                    name: cleanName,
                    phone: rsvp.phone || '',
                    email: rsvp.email || '',
                    passes: passes,
                    companion: rsvp.companion || '',
                    menu: rsvp.menu || 'filete',
                    allergies: rsvp.allergies || 'Ninguna',
                    guest1Menu: rsvp.menu || 'filete',
                    guest1Allergies: rsvp.allergies || 'Ninguna',
                    status: newStatus,
                    tableId: null, // Sin mesa asignada para que la planner lo ubique en el Seating Chart
                    source: 'web_invitation',
                    registeredAt: rsvp.createdAt || new Date().toISOString()
                };
                currentData.guests.push(newGuest);
                createdCount++;
            }
        });

        if (updatedCount > 0 || createdCount > 0) {
            if (typeof saveWeddingData === 'function') {
                saveWeddingData(weddingId, currentData);
            }
            if (typeof renderGuestTable === 'function') {
                renderGuestTable();
            }
            if (typeof updateHeaderMetrics === 'function') {
                updateHeaderMetrics();
            }
            if (typeof renderSeatingChart === 'function') {
                renderSeatingChart();
            }

            const totalChanges = updatedCount + createdCount;
            if (typeof showToast === 'function') {
                showToast(`🎉 ¡Sincronizado! ${totalChanges} confirmacion(es) actualizada(s) desde la web.`, 'success');
            }
        } else if (isManualTrigger) {
            if (typeof showToast === 'function') {
                showToast('✓ La lista de invitados ya está al día con la web.', 'info');
            }
        }
    } catch (err) {
        console.error('Error sincronizando RSVPs:', err);
    } finally {
        isSyncingRsvps = false;
        if (syncBtnIcon) syncBtnIcon.classList.remove('fa-spin', 'spinning-loader');
    }
}

// Inicialización automática periódica cada 45 segundos
setInterval(() => {
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab && (activeTab.getAttribute('data-tab') === 'guests' || activeTab.getAttribute('data-tab') === 'seating')) {
        syncLiveWebRsvps(false);
    }
}, 45000);
