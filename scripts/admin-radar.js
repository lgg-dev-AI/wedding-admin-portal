// ==========================================================================
// RADAR DE CONCURRENCIA WHATSAPP (PASEBODA ⇄ ATELIER STUDIO)
// GESTIÓN CENTRALIZADA DE BLOQUEOS, TURNOS Y PREVENCIÓN DE COLISIÓN DE LÍNEA
// ==========================================================================

const RADAR_STORAGE_KEY = 'paseboda_shared_dispatch_locks';

function getRadarLocks() {
    try {
        const raw = localStorage.getItem(RADAR_STORAGE_KEY);
        let list = raw ? JSON.parse(raw) : null;
        
        // Limpiar registros antiguos que contuvieran simulaciones residuales no deseadas
        if (Array.isArray(list)) {
            list = list.filter(item => !item.id || !item.id.startsWith('lock_atelier_legacy'));
        }

        if (!list || list.length === 0) {
            // Inicializar con la programación oficial de prueba de PASEBODA
            const targetStart = Date.now() + (10 * 60 * 1000); // Programado para dentro de 10 min
            const initialList = [
                {
                    id: 'lock_paseboda_demo',
                    source: 'paseboda',
                    weddingName: 'Boda Valentina & Sebastián (Convocatoria)',
                    startTimestamp: targetStart,
                    endTimestamp: targetStart + (60 * 60 * 1000), // 1 hora de bloqueo preventivo
                    guestsCount: 42
                }
            ];
            localStorage.setItem(RADAR_STORAGE_KEY, JSON.stringify(initialList));
            return initialList;
        }

        localStorage.setItem(RADAR_STORAGE_KEY, JSON.stringify(list));
        return list;
    } catch (e) {
        return [];
    }
}

function saveRadarLocks(list) {
    localStorage.setItem(RADAR_STORAGE_KEY, JSON.stringify(list));
}

function renderDevRadarTab() {
    const container = document.getElementById('tab-dev-radar');
    if (!container) return;

    const locks = getRadarLocks();
    const now = Date.now();

    // Buscar bloqueo activo en este milisegundo
    const activeLock = locks.find(l => now >= l.startTimestamp && now < l.endTimestamp);

    // Calcular estadísticas
    let statusBadgeHtml = '';
    let statusTitle = '';
    let statusSub = '';
    let statusColor = '#10b981';

    if (activeLock) {
        const remainingMin = Math.max(1, Math.ceil((activeLock.endTimestamp - now) / 60000));
        const freeTimeStr = new Date(activeLock.endTimestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        const sourceName = activeLock.source === 'atelier' ? 'Atelier Studio' : 'PaseBoda';
        const sourceBadge = activeLock.source === 'atelier' 
            ? '<span style="background:#7c3aed; color:#fff; padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">🎨 Atelier Studio</span>'
            : '<span style="background:#059669; color:#fff; padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">💍 PaseBoda</span>';

        statusColor = '#ef4444';
        statusBadgeHtml = `<span style="background:#ef4444; color:#fff; font-weight:800; font-size:0.75rem; padding:4px 10px; border-radius:12px; text-transform:uppercase;">🔒 CANAL EN USO (BLOQUEADO)</span>`;
        statusTitle = `Línea reservada por ${sourceName} (${activeLock.weddingName || 'Evento'})`;
        statusSub = `Tiempo restante de protección: <strong>${remainingMin} minutos</strong>. Próximo turno libre a las <strong>${freeTimeStr} hrs</strong>. Durante este tiempo ninguna plataforma puede procesar otro envío.`;
    } else {
        statusColor = '#10b981';
        statusBadgeHtml = `<span style="background:#10b981; color:#fff; font-weight:800; font-size:0.75rem; padding:4px 10px; border-radius:12px; text-transform:uppercase;">🟢 CANAL DISPONIBLE (EN REPOSO)</span>`;
        statusTitle = 'Línea de WhatsApp libre para programar o enviar';
        statusSub = 'Ambas plataformas (PaseBoda y Atelier Studio) pueden agendar o iniciar despachos respetando la regla de bloques de 1 o 2 horas.';
    }

    container.innerHTML = `
        <div class="tab-header" style="margin-bottom:20px;">
            <div>
                <div class="d-flex align-center gap-2 mb-1">
                    <h1 class="tab-title">📡 Radar de Concurrencia WhatsApp</h1>
                    <span class="badge-accent" style="background:#059669; color:#fff; font-weight:800; border:none;">PaseBoda ⇄ Atelier Studio</span>
                </div>
                <p class="tab-subtitle">Monitorea en tiempo real el uso de la línea oficial (+1 364-212-1213), bloqueos activos y programaciones futuras de ambas plataformas para garantizar 0% colisiones.</p>
            </div>
            <div class="tab-actions" style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="btn-action secondary" onclick="simulatePasebodaLock()" style="border:1.5px solid #059669; color:#065f46; font-weight:700; background:#ecfdf5;">
                    <span>💍 Programar Prueba PaseBoda</span>
                </button>
                <button class="btn-action secondary" onclick="simulateAtelierStudioLock()" style="border:1.5px solid #7c3aed; color:#6d28d9; font-weight:700; background:#f5f3ff;">
                    <span>🎨 Simular Atelier Studio</span>
                </button>
                <button class="btn-action secondary" onclick="clearRadarLocks()" style="border:1px solid #ef4444; color:#b91c1c; font-weight:600; background:#fef2f2;">
                    <span>🔓 Limpiar Bloqueos</span>
                </button>
                <button class="btn-action secondary" onclick="renderDevRadarTab()" style="background:#ffffff; border:1px solid #cbd5e1; font-weight:600;">
                    <span>🔄 Recargar</span>
                </button>
            </div>
        </div>

        <!-- TARJETA PRINCIPAL DEL ESTADO DEL CANAL -->
        <div style="background:#ffffff; border:2px solid ${statusColor}; border-radius:12px; padding:20px; margin-bottom:24px; box-shadow:0 4px 16px rgba(0,0,0,0.04);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:2rem;">${activeLock ? '🛑' : '🟢'}</span>
                    <div>
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                            <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#0f172a;">${statusTitle}</h3>
                            ${statusBadgeHtml}
                        </div>
                        <p style="margin:0; font-size:0.85rem; color:#475569;">${statusSub}</p>
                    </div>
                </div>
                <div style="text-align:right;">
                    <span style="font-size:0.75rem; color:#64748b; font-weight:700; display:block;">LÍNEA OFICIAL CONECTADA</span>
                    <strong style="font-size:1.05rem; color:#0f172a;">+1 (364) 212-1213</strong>
                </div>
            </div>

            <!-- MINI KPIS -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-top:16px; padding-top:16px; border-top:1px solid #e2e8f0;">
                <div style="background:#f8fafc; padding:10px 14px; border-radius:8px; border:1px solid #e2e8f0;">
                    <span style="font-size:0.72rem; color:#64748b; font-weight:700; display:block;">CUOTA META (TIER ESTÁNDAR)</span>
                    <strong style="color:#0f172a; font-size:0.95rem;">250 conversaciones / día</strong>
                </div>
                <div style="background:#f8fafc; padding:10px 14px; border-radius:8px; border:1px solid #e2e8f0;">
                    <span style="font-size:0.72rem; color:#64748b; font-weight:700; display:block;">CADENCIA HUMANA BLINDADA</span>
                    <strong style="color:#0284c7; font-size:0.95rem;">10 a 15 seg / mensaje</strong>
                </div>
                <div style="background:#f8fafc; padding:10px 14px; border-radius:8px; border:1px solid #e2e8f0;">
                    <span style="font-size:0.72rem; color:#64748b; font-weight:700; display:block;">PREVENCIÓN DE EMPALMES</span>
                    <strong style="color:#10b981; font-size:0.95rem;">1h (≤50 pax) / 2h (&gt;50 pax)</strong>
                </div>
            </div>
        </div>

        <!-- TABLA DE LÍNEA DE TIEMPO / PROGRAMACIONES -->
        <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h3 style="margin:0; font-size:1rem; font-weight:800; color:#0f172a;">📋 Línea de Tiempo de Despachos &amp; Bloqueos Programados</h3>
                <span style="font-size:0.75rem; color:#64748b; font-weight:600;">Historial y citas activas</span>
            </div>

            ${renderLocksTableHtml(locks, now)}
        </div>
    `;
}

function renderLocksTableHtml(locks, now) {
    if (!locks || locks.length === 0) {
        return `
            <div style="text-align:center; padding:40px 20px; background:#f8fafc; border-radius:8px; border:1.5px dashed #cbd5e1;">
                <span style="font-size:2rem; display:block; margin-bottom:8px;">☕</span>
                <strong style="color:#0f172a; font-size:0.95rem; display:block;">No hay bloqueos ni despachos programados en este momento</strong>
                <p style="margin:4px 0 0 0; font-size:0.8rem; color:#64748b;">Cuando un wedding planner en PaseBoda o en Atelier Studio programe un envío, aparecerá registrado automáticamente aquí.</p>
            </div>
        `;
    }

    // Ordenar por fecha de inicio descendente
    const sorted = [...locks].sort((a, b) => b.startTimestamp - a.startTimestamp);

    const rows = sorted.map(l => {
        const isCurrent = now >= l.startTimestamp && now < l.endTimestamp;
        const isFuture = l.startTimestamp > now;
        const isPast = l.endTimestamp <= now;

        const startDate = new Date(l.startTimestamp);
        const endDate = new Date(l.endTimestamp);

        const dateStr = startDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
        const timeWindowStr = `${startDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} a ${endDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs`;

        const durationMin = Math.round((l.endTimestamp - l.startTimestamp) / 60000);
        const durationStr = durationMin >= 120 ? '2 horas' : (durationMin >= 60 ? '1 hora' : `${durationMin} min`);

        const sourceBadge = l.source === 'atelier'
            ? '<span style="background:#7c3aed; color:#fff; padding:4px 9px; border-radius:6px; font-size:0.75rem; font-weight:700;">🎨 Atelier Studio</span>'
            : '<span style="background:#059669; color:#fff; padding:4px 9px; border-radius:6px; font-size:0.75rem; font-weight:700;">💍 PaseBoda</span>';

        let statusBadge = '';
        if (isCurrent) {
            statusBadge = '<span style="background:#ef4444; color:#fff; padding:3px 8px; border-radius:12px; font-size:0.7rem; font-weight:800; animation:pulse 1.5s infinite;">EN CURSO</span>';
        } else if (isFuture) {
            statusBadge = '<span style="background:#0284c7; color:#fff; padding:3px 8px; border-radius:12px; font-size:0.7rem; font-weight:800;">AGENDADO</span>';
        } else {
            statusBadge = '<span style="background:#64748b; color:#fff; padding:3px 8px; border-radius:12px; font-size:0.7rem; font-weight:800;">FINALIZADO</span>';
        }

        return `
            <tr style="border-bottom:1px solid #f1f5f9; background:${isCurrent ? '#fef2f2' : 'transparent'};">
                <td style="padding:12px 14px;">${sourceBadge}</td>
                <td style="padding:12px 14px;">
                    <strong style="color:#0f172a; font-size:0.85rem; display:block;">${l.weddingName || 'Evento'}</strong>
                    <span style="font-size:0.72rem; color:#64748b;">${l.guestsCount || 0} destinatarios</span>
                </td>
                <td style="padding:12px 14px; font-size:0.82rem; color:#334155;">
                    <div>${dateStr}</div>
                    <div style="font-weight:700; color:#0f172a;">${timeWindowStr}</div>
                </td>
                <td style="padding:12px 14px; font-size:0.82rem; font-weight:700; color:#d97706;">
                    ${durationStr}
                </td>
                <td style="padding:12px 14px;">${statusBadge}</td>
                <td style="padding:12px 14px; text-align:right;">
                    <button type="button" onclick="deleteRadarLock('${l.id}')" style="background:none; border:none; color:#ef4444; font-size:0.75rem; font-weight:700; cursor:pointer;">
                        ✕ Eliminar
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    return `
        <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; text-align:left;">
                <thead>
                    <tr style="border-bottom:2px solid #e2e8f0; font-size:0.72rem; text-transform:uppercase; color:#64748b;">
                        <th style="padding:10px 14px;">Plataforma</th>
                        <th style="padding:10px 14px;">Boda / Campaña</th>
                        <th style="padding:10px 14px;">Horario Programado</th>
                        <th style="padding:10px 14px;">Bloque Reserva</th>
                        <th style="padding:10px 14px;">Estado</th>
                        <th style="padding:10px 14px; text-align:right;">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

function simulatePasebodaLock() {
    const now = Date.now();
    // Programar para dentro de 10 minutos por 1 hora
    const startMs = now + (10 * 60 * 1000);
    const endMs = startMs + (60 * 60 * 1000);

    const lock = {
        id: 'lock_paseboda_' + Date.now(),
        source: 'paseboda',
        weddingName: 'Boda Valentina & Sebastián (Convocatoria)',
        startTimestamp: startMs,
        endTimestamp: endMs,
        guestsCount: 42
    };

    const locks = getRadarLocks();
    locks.push(lock);
    saveRadarLocks(locks);

    const timeStartStr = new Date(startMs).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const timeEndStr = new Date(endMs).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    if (typeof showToast === 'function') {
        showToast(`💍 PaseBoda: Despacho programado con éxito de ${timeStartStr} a ${timeEndStr} hrs.`);
    }

    renderDevRadarTab();
}

function simulateAtelierStudioLock() {
    const now = Date.now();
    // Programar para dentro de 15 minutos por 1 hora
    const startMs = now + (15 * 60 * 1000);
    const endMs = startMs + (60 * 60 * 1000);

    const lock = {
        id: 'lock_atelier_' + Date.now(),
        source: 'atelier',
        weddingName: 'Campaña Muestras Otoño 2027',
        startTimestamp: startMs,
        endTimestamp: endMs,
        guestsCount: 45
    };

    const locks = getRadarLocks();
    locks.push(lock);
    saveRadarLocks(locks);

    const timeStartStr = new Date(startMs).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const timeEndStr = new Date(endMs).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    if (typeof showToast === 'function') {
        showToast(`🧪 Bloque simulado de Atelier Studio registrado de ${timeStartStr} a ${timeEndStr} hrs.`);
    }

    renderDevRadarTab();
}

function clearRadarLocks() {
    localStorage.removeItem(RADAR_STORAGE_KEY);
    if (typeof showToast === 'function') {
        showToast('🔓 Todos los bloqueos y programaciones han sido eliminados.');
    }
    renderDevRadarTab();
}

function deleteRadarLock(id) {
    let locks = getRadarLocks();
    locks = locks.filter(l => l.id !== id);
    saveRadarLocks(locks);
    if (typeof showToast === 'function') {
        showToast('✓ Bloqueo eliminado correctamente.');
    }
    renderDevRadarTab();
}

// Exportar globalmente
window.renderDevRadarTab = renderDevRadarTab;
window.simulatePasebodaLock = simulatePasebodaLock;
window.simulateAtelierStudioLock = simulateAtelierStudioLock;
window.clearRadarLocks = clearRadarLocks;
window.deleteRadarLock = deleteRadarLock;

// Renderizar inmediatamente si el contenedor ya existe en el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof renderDevRadarTab === 'function') renderDevRadarTab();
    });
} else {
    setTimeout(() => {
        if (typeof renderDevRadarTab === 'function') renderDevRadarTab();
    }, 100);
}
