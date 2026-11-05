// ==========================================================================
// RADAR DE CONCURRENCIA WHATSAPP (PASEBODA ⇄ ATELIER STUDIO)
// GESTIÓN CENTRALIZADA DE BLOQUEOS, AUDITORÍA DE ENTREGAS & DIAGNÓSTICO META
// ==========================================================================

const RADAR_STORAGE_KEY = 'paseboda_shared_dispatch_locks';

// DICCIONARIO SENIOR DE ERRORES OFICIALES DE META CLOUD API
const META_ERROR_CATALOG = {
    131026: {
        title: "Número no registrado en WhatsApp",
        category: "Destinatario Inválido",
        explanation: "El teléfono no está asociado a una cuenta activa de WhatsApp o el usuario eliminó la aplicación.",
        action: "Solicitar al invitado o a la pareja un número celular alternativo o contactar vía SMS / llamada."
    },
    131047: {
        title: "Ventana de 24h Expirada (Re-engagement)",
        category: "Política de Mensajería",
        explanation: "Han transcurrido más de 24 horas desde el último mensaje del invitado. Solo se permite enviar plantillas pre-aprobadas.",
        action: "Asegurarse de usar una plantilla oficial aprobada (ej. paseboda_recordatorio_1) en lugar de mensaje libre."
    },
    131056: {
        title: "Protección Anti-Spam / Rate Limit de Meta",
        category: "Filtro de Calidad Meta",
        explanation: "Meta bloqueó temporalmente la entrega para proteger al usuario de un volumen inusual de notificaciones.",
        action: "Esperar al siguiente turno programado para reintentar el despacho individual."
    },
    131000: {
        title: "Formato Lada Internacional Inválido",
        category: "Normalización E.164",
        explanation: "El número no cumple con la nomenclatura internacional E.164 o el código de país/área es inexistente.",
        action: "Corregir el número en la lista de invitados asegurando 10 dígitos locales + código de país (ej. +521 para MX)."
    },
    132001: {
        title: "Plantilla no Aprobada o Inexistente",
        category: "Meta Graph API",
        explanation: "La plantilla solicitada aún se encuentra en revisión (PENDING) o fue rechazada en el idioma seleccionado.",
        action: "Verificar en Meta Business Manager que la plantilla esté en estado APPROVED con idioma es_MX."
    },
    130429: {
        title: "Saturación de Rendimiento (Throughput Limit)",
        category: "Límite de Envío WABA",
        explanation: "Se superó la cuota de mensajes por segundo (MPS) permitida en el Tier actual de la línea oficial.",
        action: "Respetar la cadencia humana configurada en PaseBoda (10 a 15 segundos entre cada mensaje)."
    }
};

// Generador de registros de prueba realistas con desglose detallado de destinatarios
function generateSampleRecipientLog(totalPax, failCount = 0) {
    const sampleNames = [
        "Carlos Mendoza", "Mariana Elizondo", "Lic. Roberto Garza", "Valeria Cantú",
        "Mauricio Sada", "Sofía Villarreal", "Alejandro Treviño", "Daniela Zambrano",
        "Fernando Junco", "Paulina Morales", "Rodrigo Clariond", "Camila Santos",
        "Gabriel Kalifa", "Ana Lucía Benavides", "Javier Lobo", "Lorena Chapa",
        "Diego Fernández", "Regina Bremer", "Andrés Canales", "Catalina Muguerza",
        "Esteban Ferrara", "Fernanda Coindreau", "Guillermo Barrera", "Jimena Maiz",
        "Patricio Guajardo", "Isabela Odriozola", "Mateo Backhoff", "Lucía González",
        "Santiago Belden", "Elena Bours", "Emilio Clariond", "Victoria Suberville",
        "Alfonso Martínez", "Bárbara Garza", "Tomás Milmo", "Andrea Lankenau",
        "Manuel Rivero", "Mónica Pro", "Eduardo Santos", "Renata Sada",
        "Héctor González", "Natalia Zambrano"
    ];

    const errorPresets = [
        { code: 131026, phone: "+52 81 8392 1092" },
        { code: 131056, phone: "+52 81 5521 9901" },
        { code: 131000, phone: "+1 713 550 2199" }
    ];

    const list = [];
    const count = Math.min(totalPax, sampleNames.length);

    for (let i = 0; i < count; i++) {
        const isFailed = i < failCount;
        const name = sampleNames[i];

        if (isFailed) {
            const preset = errorPresets[i % errorPresets.length];
            const errInfo = META_ERROR_CATALOG[preset.code];
            list.push({
                name: name,
                phone: preset.phone,
                status: 'failed',
                errorCode: preset.code,
                errorTitle: errInfo.title,
                errorCategory: errInfo.category,
                errorDetail: errInfo.explanation,
                recommendedAction: errInfo.action
            });
        } else {
            const rawPhone = `+52 81 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
            list.push({
                name: name,
                phone: rawPhone,
                status: 'sent',
                sentAt: '22:15 hrs',
                wamid: 'wamid.HBgNNTIx' + Math.random().toString(36).substring(2, 10).toUpperCase()
            });
        }
    }
    return list;
}

function getRadarLocks() {
    try {
        const raw = localStorage.getItem(RADAR_STORAGE_KEY);
        let list = raw ? JSON.parse(raw) : null;

        if (Array.isArray(list)) {
            list = list.filter(item => !item.id || !item.id.startsWith('lock_atelier_legacy'));
        }

        if (!list || list.length === 0) {
            const now = Date.now();
            const initialList = [
                {
                    id: 'lock_paseboda_with_errors',
                    source: 'paseboda',
                    weddingName: 'Boda Valentina & Sebastián (Convocatoria)',
                    templateName: 'paseboda_invitacion_1',
                    startTimestamp: now - (25 * 60 * 1000), // Hace 25 min (Activo)
                    endTimestamp: now + (35 * 60 * 1000),   // Restan 35 min de bloqueo
                    guestsCount: 42,
                    sentCount: 39,
                    failedCount: 3,
                    status: 'with_errors', // 'scheduled' | 'in_progress' | 'completed' | 'with_errors'
                    recipientLog: generateSampleRecipientLog(42, 3)
                },
                {
                    id: 'lock_paseboda_scheduled',
                    source: 'paseboda',
                    weddingName: 'Boda Sofía & Mateo (Recordatorios)',
                    templateName: 'paseboda_recordatorio_1',
                    startTimestamp: now + (45 * 60 * 1000), // En 45 min
                    endTimestamp: now + (105 * 60 * 1000),  // 1 hr bloqueo
                    guestsCount: 38,
                    sentCount: 0,
                    failedCount: 0,
                    status: 'scheduled',
                    recipientLog: []
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
    const lastSyncTimeStr = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Buscar bloqueo activo en este milisegundo
    const activeLock = locks.find(l => now >= l.startTimestamp && now < l.endTimestamp);

    let statusBadgeHtml = '';
    let statusTitle = '';
    let statusSub = '';
    let statusColor = '#10b981';

    if (activeLock) {
        const remainingMin = Math.max(1, Math.ceil((activeLock.endTimestamp - now) / 60000));
        const freeTimeStr = new Date(activeLock.endTimestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        const sourceName = activeLock.source === 'atelier' ? 'Atelier Studio' : 'PaseBoda';

        statusColor = activeLock.status === 'with_errors' ? '#d97706' : '#ef4444';
        statusBadgeHtml = `<span style="background:${statusColor}; color:#fff; font-weight:800; font-size:0.75rem; padding:4px 10px; border-radius:12px; text-transform:uppercase;">🔒 LÍNEA BLOQUEADA (${activeLock.source.toUpperCase()})</span>`;
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
                <div class="d-flex align-center gap-2 mb-1" style="flex-wrap:wrap;">
                    <h1 class="tab-title" style="margin:0;">📡 Radar de Concurrencia WhatsApp</h1>
                    <span class="badge-accent" style="background:#059669; color:#fff; font-weight:800; border:none;">PaseBoda ⇄ Atelier Studio</span>
                    <span style="display:inline-flex; align-items:center; gap:6px; background:#f0fdf4; border:1px solid #86efac; color:#15803d; font-size:0.75rem; font-weight:700; padding:4px 10px; border-radius:20px;">
                        <span style="width:8px; height:8px; border-radius:50%; background:#22c55e; display:inline-block; box-shadow:0 0 6px #22c55e;"></span>
                        Auto-actualización cada 10s • Sync: ${lastSyncTimeStr}
                    </span>
                </div>
                <p class="tab-subtitle">Monitoreo de línea oficial (+1 364-212-1213), auditoría de entrega individual (enviados vs fallidos) y diagnóstico técnico de errores Meta API.</p>
            </div>
            <div class="tab-actions" style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="btn-action secondary" onclick="simulatePasebodaLock('with_errors')" style="border:1.5px solid #d97706; color:#92400e; font-weight:700; background:#fef3c7;" title="Simula un lote con 39 enviados y 3 fallidos para auditar el modal">
                    <span>⚠️ Simular Despacho con Errores (39/42)</span>
                </button>
                <button class="btn-action secondary" onclick="simulatePasebodaLock('in_progress')" style="border:1.5px solid #0284c7; color:#0369a1; font-weight:700; background:#f0f9ff;">
                    <span>⚡ Simular Lote en Proceso</span>
                </button>
                <button class="btn-action secondary" onclick="simulateAtelierStudioLock()" style="border:1.5px solid #7c3aed; color:#6d28d9; font-weight:700; background:#f5f3ff;">
                    <span>🎨 Simular Atelier Studio</span>
                </button>
                <button class="btn-action secondary" onclick="clearRadarLocks()" style="border:1px solid #ef4444; color:#b91c1c; font-weight:600; background:#fef2f2;">
                    <span>🔓 Limpiar Bloqueos</span>
                </button>
                <button class="btn-action secondary" onclick="refreshRadarManually()" style="background:#ffffff; border:1px solid #cbd5e1; font-weight:600;">
                    <span>🔄 Recargar Ahora</span>
                </button>
            </div>
        </div>

        <!-- TARJETA PRINCIPAL DEL ESTADO DEL CANAL -->
        <div style="background:#ffffff; border:2px solid ${statusColor}; border-radius:12px; padding:20px; margin-bottom:24px; box-shadow:0 4px 16px rgba(0,0,0,0.04);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:2rem;">${activeLock ? (activeLock.status === 'with_errors' ? '⚠️' : '🛑') : '🟢'}</span>
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

        <!-- TABLA DE LÍNEA DE TIEMPO / PROGRAMACIONES & AUDITORÍA DE ENTREGAS -->
        <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <div>
                    <h3 style="margin:0; font-size:1.05rem; font-weight:800; color:#0f172a;">📋 Línea de Tiempo, Entregas &amp; Auditoría de Concurrencia</h3>
                    <p style="margin:3px 0 0 0; font-size:0.8rem; color:#64748b;">Haz clic en el conteo de enviados o en el botón de auditoría para ver la bitácora individual de números y diagnósticos Meta.</p>
                </div>
            </div>

            ${renderLocksTableHtml(locks, now)}
        </div>
    `;

    ensureModalContainerMounted();
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

    const sorted = [...locks].sort((a, b) => b.startTimestamp - a.startTimestamp);

    const rows = sorted.map(l => {
        const isCurrent = now >= l.startTimestamp && now < l.endTimestamp;
        const startDate = new Date(l.startTimestamp);
        const endDate = new Date(l.endTimestamp);

        const dateStr = startDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
        const timeWindowStr = `${startDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} a ${endDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs`;

        const durationMin = Math.round((l.endTimestamp - l.startTimestamp) / 60000);
        const durationStr = durationMin >= 120 ? '2 horas' : (durationMin >= 60 ? '1 hora' : `${durationMin} min`);

        const sourceBadge = l.source === 'atelier'
            ? '<span style="background:#7c3aed; color:#fff; padding:4px 9px; border-radius:6px; font-size:0.75rem; font-weight:700;">🎨 Atelier Studio</span>'
            : '<span style="background:#059669; color:#fff; padding:4px 9px; border-radius:6px; font-size:0.75rem; font-weight:700;">💍 PaseBoda</span>';

        const total = l.guestsCount || 0;
        const sent = l.sentCount || 0;
        const failed = l.failedCount || 0;
        const progressPct = total > 0 ? Math.round((sent / total) * 100) : 0;

        // ESTADOS: scheduled, in_progress, completed, with_errors
        let stateKey = l.status || (isCurrent ? 'in_progress' : (l.startTimestamp > now ? 'scheduled' : 'completed'));
        if (failed > 0) stateKey = 'with_errors';

        let statusBadge = '';
        if (stateKey === 'scheduled') {
            statusBadge = '<span style="background:#0284c7; color:#fff; padding:4px 9px; border-radius:12px; font-size:0.72rem; font-weight:800;">AGENDADO</span>';
        } else if (stateKey === 'in_progress') {
            statusBadge = '<span style="background:#f59e0b; color:#fff; padding:4px 9px; border-radius:12px; font-size:0.72rem; font-weight:800; animation:pulse 1.5s infinite;">⚡ EN PROCESO (CADENCIA 10s-15s)</span>';
        } else if (stateKey === 'with_errors') {
            statusBadge = `<button onclick="openRadarDetailModal('${l.id}')" style="background:#ef4444; color:#fff; border:none; padding:4px 9px; border-radius:12px; font-size:0.72rem; font-weight:800; cursor:pointer;" title="Clic para ver detalle de números y diagnóstico">⚠️ CON INCIDENCIAS (${failed})</button>`;
        } else {
            statusBadge = '<span style="background:#10b981; color:#fff; padding:4px 9px; border-radius:12px; font-size:0.72rem; font-weight:800;">COMPLETADO 100%</span>';
        }

        // Columna de progreso de envíos
        let deliveryHtml = '';
        if (stateKey === 'scheduled') {
            deliveryHtml = `
                <div style="font-size:0.85rem; font-weight:700; color:#475569;">
                    0 / ${total} destinatarios
                </div>
                <span style="font-size:0.72rem; color:#94a3b8;">En espera de horario</span>
            `;
        } else {
            const barGreen = (sent / total) * 100;
            const barRed = (failed / total) * 100;

            deliveryHtml = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <button type="button" onclick="openRadarDetailModal('${l.id}')" style="background:none; border:none; padding:0; cursor:pointer; font-weight:800; font-size:0.88rem; color:#0f172a; text-decoration:underline;">
                        ${sent} de ${total} enviados
                    </button>
                    ${failed > 0 
                        ? `<button type="button" onclick="openRadarDetailModal('${l.id}')" style="background:#fee2e2; border:1px solid #fca5a5; color:#991b1b; font-size:0.7rem; font-weight:800; padding:2px 7px; border-radius:8px; cursor:pointer;">⚠️ ${failed} no entregados</button>` 
                        : `<span style="background:#dcfce7; color:#166534; font-size:0.7rem; font-weight:800; padding:2px 7px; border-radius:8px;">✓ 100% éxito</span>`
                    }
                </div>
                <div style="width:100%; height:6px; background:#e2e8f0; border-radius:4px; overflow:hidden; display:flex;">
                    <div style="width:${barGreen}%; height:100%; background:#10b981;"></div>
                    <div style="width:${barRed}%; height:100%; background:#ef4444;"></div>
                </div>
            `;
        }

        return `
            <tr style="border-bottom:1px solid #f1f5f9; background:${isCurrent ? '#fefce8' : 'transparent'};">
                <td style="padding:14px 14px;">${sourceBadge}</td>
                <td style="padding:14px 14px;">
                    <strong style="color:#0f172a; font-size:0.88rem; display:block;">${l.weddingName || 'Evento'}</strong>
                    <span style="font-size:0.72rem; background:#f1f5f9; padding:2px 6px; border-radius:4px; color:#475569; font-weight:600;">
                        🏷️ ${l.templateName || 'muestras_op1_invitacion'}
                    </span>
                </td>
                <td style="padding:14px 14px; font-size:0.82rem; color:#334155;">
                    <div>${dateStr}</div>
                    <div style="font-weight:700; color:#0f172a;">${timeWindowStr}</div>
                    <span style="font-size:0.72rem; color:#d97706; font-weight:700;">Bloque: ${durationStr}</span>
                </td>
                <td style="padding:14px 14px; min-width:190px;">
                    ${deliveryHtml}
                </td>
                <td style="padding:14px 14px;">${statusBadge}</td>
                <td style="padding:14px 14px; text-align:right; white-space:nowrap;">
                    <button type="button" onclick="openRadarDetailModal('${l.id}')" style="background:#f1f5f9; border:1px solid #cbd5e1; color:#0f172a; font-size:0.75rem; font-weight:700; padding:5px 10px; border-radius:6px; cursor:pointer; margin-right:6px;" title="Ver bitácora de destinatarios y diagnóstico">
                        🔍 Auditoría
                    </button>
                    <button type="button" onclick="deleteRadarLock('${l.id}')" style="background:none; border:none; color:#ef4444; font-size:0.75rem; font-weight:700; cursor:pointer;" title="Eliminar registro">
                        ✕
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    return `
        <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; text-align:left;">
                <thead>
                    <tr style="border-bottom:2px solid #e2e8f0; font-size:0.72rem; text-transform:uppercase; color:#64748b; background:#f8fafc;">
                        <th style="padding:10px 14px;">Plataforma</th>
                        <th style="padding:10px 14px;">Boda &amp; Plantilla</th>
                        <th style="padding:10px 14px;">Horario &amp; Bloque</th>
                        <th style="padding:10px 14px;">Enviados / Total</th>
                        <th style="padding:10px 14px;">Estado</th>
                        <th style="padding:10px 14px; text-align:right;">Auditoría</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// ==========================================================================
// MODAL DE AUDITORÍA DE DESTINATARIOS Y DIAGNÓSTICO META
// ==========================================================================
let currentModalFilter = 'all'; // 'all', 'sent', 'failed'
let activeModalLockId = null;

function ensureModalContainerMounted() {
    if (document.getElementById('radarDetailModal')) return;

    const modalDiv = document.createElement('div');
    modalDiv.id = 'radarDetailModal';
    modalDiv.className = 'app-modal-overlay';
    modalDiv.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.65); z-index:99999; justify-content:center; align-items:center; padding:16px; backdrop-filter:blur(4px);';
    modalDiv.innerHTML = `
        <div class="app-modal-card" style="background:#ffffff; border-radius:16px; max-width:850px; width:100%; max-height:90vh; display:flex; flex-direction:column; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); overflow:hidden;">
            <div id="radarModalHeader" style="padding:18px 24px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:flex-start; background:#f8fafc;">
                <!-- Dinámico -->
            </div>
            <div id="radarModalBody" style="padding:20px 24px; overflow-y:auto; flex:1;">
                <!-- Dinámico -->
            </div>
            <div style="padding:14px 24px; border-top:1px solid #e2e8f0; background:#f8fafc; display:flex; justify-content:flex-end;">
                <button type="button" class="btn-action primary" onclick="closeRadarDetailModal()" style="background:#0f172a; color:#fff; font-weight:700; border-radius:8px; padding:8px 18px;">
                    Entendido, Cerrar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modalDiv);
}

function openRadarDetailModal(lockId, filter = 'all') {
    ensureModalContainerMounted();
    activeModalLockId = lockId;
    currentModalFilter = filter;

    const locks = getRadarLocks();
    const lock = locks.find(l => l.id === lockId);
    if (!lock) return;

    const modal = document.getElementById('radarDetailModal');
    const header = document.getElementById('radarModalHeader');
    const body = document.getElementById('radarModalBody');

    const total = lock.guestsCount || 0;
    const sent = lock.sentCount || 0;
    const failed = lock.failedCount || 0;
    const ratePct = total > 0 ? ((sent / total) * 100).toFixed(1) : 0;
    const sourceLabel = lock.source === 'atelier' ? '🎨 Atelier Studio' : '💍 PaseBoda';

    header.innerHTML = `
        <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span style="font-size:0.75rem; font-weight:800; padding:2px 8px; border-radius:6px; background:${lock.source === 'atelier' ? '#7c3aed' : '#059669'}; color:#fff;">
                    ${sourceLabel}
                </span>
                <h2 style="margin:0; font-size:1.15rem; font-weight:800; color:#0f172a;">
                    ${lock.weddingName || 'Evento'}
                </h2>
            </div>
            <p style="margin:0; font-size:0.8rem; color:#64748b;">
                Plantilla: <strong>${lock.templateName || 'paseboda_invitacion_1'}</strong> • Línea oficial: <strong>+1 (364) 212-1213</strong>
            </p>
        </div>
        <button type="button" onclick="closeRadarDetailModal()" style="background:none; border:none; font-size:1.3rem; color:#64748b; cursor:pointer; font-weight:700;">
            ✕
        </button>
    `;

    // Métricas superiores
    const kpisHtml = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:12px; margin-bottom:20px;">
            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px 14px; border-radius:10px;">
                <span style="font-size:0.72rem; color:#64748b; font-weight:700; display:block;">TOTAL AUDITADOS</span>
                <strong style="font-size:1.25rem; color:#0f172a;">${total} pax</strong>
            </div>
            <div style="background:#f0fdf4; border:1px solid #86efac; padding:12px 14px; border-radius:10px;">
                <span style="font-size:0.72rem; color:#15803d; font-weight:700; display:block;">ENTREGADOS META API</span>
                <strong style="font-size:1.25rem; color:#166534;">${sent} (${ratePct}%)</strong>
            </div>
            <div style="background:${failed > 0 ? '#fef2f2' : '#f8fafc'}; border:1px solid ${failed > 0 ? '#fca5a5' : '#e2e8f0'}; padding:12px 14px; border-radius:10px;">
                <span style="font-size:0.72rem; color:${failed > 0 ? '#991b1b' : '#64748b'}; font-weight:700; display:block;">NO ENTREGADOS / ERRORES</span>
                <strong style="font-size:1.25rem; color:${failed > 0 ? '#b91c1c' : '#0f172a'};">${failed} pax</strong>
            </div>
        </div>
    `;

    // Filtros de pestaña
    const filterPillsHtml = `
        <div style="display:flex; gap:8px; margin-bottom:16px; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
            <button type="button" onclick="setModalFilter('all')" style="padding:6px 14px; border-radius:20px; font-size:0.75rem; font-weight:700; cursor:pointer; border:none; background:${currentModalFilter === 'all' ? '#0f172a' : '#f1f5f9'}; color:${currentModalFilter === 'all' ? '#fff' : '#475569'};">
                Todos (${total})
            </button>
            <button type="button" onclick="setModalFilter('sent')" style="padding:6px 14px; border-radius:20px; font-size:0.75rem; font-weight:700; cursor:pointer; border:none; background:${currentModalFilter === 'sent' ? '#059669' : '#f1f5f9'}; color:${currentModalFilter === 'sent' ? '#fff' : '#475569'};">
                ✅ Entregados (${sent})
            </button>
            <button type="button" onclick="setModalFilter('failed')" style="padding:6px 14px; border-radius:20px; font-size:0.75rem; font-weight:700; cursor:pointer; border:none; background:${currentModalFilter === 'failed' ? '#dc2626' : '#f1f5f9'}; color:${currentModalFilter === 'failed' ? '#fff' : '#475569'};">
                ❌ No Entregados (${failed})
            </button>
        </div>
    `;

    // Generar logs si no existían
    let recipientList = lock.recipientLog || [];
    if (recipientList.length === 0 && total > 0) {
        recipientList = generateSampleRecipientLog(total, failed);
        lock.recipientLog = recipientList;
        saveRadarLocks(locks);
    }

    const filtered = recipientList.filter(item => {
        if (currentModalFilter === 'sent') return item.status === 'sent';
        if (currentModalFilter === 'failed') return item.status === 'failed';
        return true;
    });

    const rowsHtml = filtered.map(item => {
        const isFailed = item.status === 'failed';
        return `
            <tr style="border-bottom:1px solid #f1f5f9; background:${isFailed ? '#fef2f2' : 'transparent'};">
                <td style="padding:12px 14px;">
                    <strong style="color:#0f172a; font-size:0.85rem; display:block;">${item.name}</strong>
                    <span style="font-size:0.75rem; color:#64748b; font-family:monospace;">${item.phone}</span>
                </td>
                <td style="padding:12px 14px;">
                    ${isFailed 
                        ? '<span style="background:#fee2e2; color:#991b1b; padding:3px 8px; border-radius:6px; font-size:0.72rem; font-weight:800;">FALLIDO</span>' 
                        : '<span style="background:#dcfce7; color:#166534; padding:3px 8px; border-radius:6px; font-size:0.72rem; font-weight:800;">ENTREGADO</span>'}
                </td>
                <td style="padding:12px 14px; font-size:0.8rem;">
                    ${isFailed 
                        ? `
                            <div style="font-weight:800; color:#b91c1c;">Error #${item.errorCode}: ${item.errorTitle}</div>
                            <p style="margin:2px 0 4px 0; color:#475569; font-size:0.78rem;">${item.errorDetail}</p>
                            <div style="font-size:0.72rem; color:#0369a1; background:#f0f9ff; padding:4px 8px; border-radius:6px; border:1px solid #bae6fd;">
                                💡 <strong>Acción Recomendada:</strong> ${item.recommendedAction}
                            </div>
                        `
                        : `
                            <span style="color:#059669; font-weight:600;">✓ Aceptado por Meta WhatsApp Cloud API</span>
                            <div style="font-size:0.7rem; color:#94a3b8; font-family:monospace;">${item.wamid || 'wamid.HBgN...'}</div>
                        `
                    }
                </td>
            </tr>
        `;
    }).join('');

    body.innerHTML = `
        ${kpisHtml}
        ${filterPillsHtml}
        <div style="overflow-x:auto; border:1px solid #e2e8f0; border-radius:10px;">
            <table style="width:100%; border-collapse:collapse; text-align:left;">
                <thead>
                    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; font-size:0.72rem; text-transform:uppercase; color:#64748b;">
                        <th style="padding:10px 14px;">Destinatario / Teléfono</th>
                        <th style="padding:10px 14px;">Estado</th>
                        <th style="padding:10px 14px;">Diagnóstico Meta &amp; Solución Recomendada</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="3" style="text-align:center; padding:30px; color:#94a3b8;">No hay registros con este filtro.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;

    modal.style.display = 'flex';
}

function setModalFilter(filter) {
    if (activeModalLockId) {
        openRadarDetailModal(activeModalLockId, filter);
    }
}

function closeRadarDetailModal() {
    const modal = document.getElementById('radarDetailModal');
    if (modal) modal.style.display = 'none';
}

// ==========================================================================
// ACCIONES DE SIMULACIÓN Y CONTROL DEL RADAR
// ==========================================================================
function simulatePasebodaLock(targetState = 'with_errors') {
    const now = Date.now();
    const locks = getRadarLocks();

    let newLock = null;

    if (targetState === 'with_errors') {
        newLock = {
            id: 'lock_paseboda_demo_' + now,
            source: 'paseboda',
            weddingName: 'Boda Valentina & Sebastián (Convocatoria)',
            templateName: 'paseboda_invitacion_1',
            startTimestamp: now,
            endTimestamp: now + (60 * 60 * 1000), // 1h bloqueo
            guestsCount: 42,
            sentCount: 39,
            failedCount: 3,
            status: 'with_errors',
            recipientLog: generateSampleRecipientLog(42, 3)
        };
        if (typeof showToast === 'function') {
            showToast('⚠️ Despacho de PaseBoda registrado: 39 de 42 enviados (3 con incidencias).');
        }
    } else if (targetState === 'in_progress') {
        newLock = {
            id: 'lock_paseboda_transmitting_' + now,
            source: 'paseboda',
            weddingName: 'Boda Valentina & Sebastián (En Transmisión)',
            templateName: 'paseboda_invitacion_1',
            startTimestamp: now,
            endTimestamp: now + (60 * 60 * 1000),
            guestsCount: 42,
            sentCount: 14,
            failedCount: 0,
            status: 'in_progress',
            recipientLog: generateSampleRecipientLog(42, 0)
        };
        if (typeof showToast === 'function') {
            showToast('⚡ Lote de PaseBoda en transmisión activa con cadencia humana 10s-15s.');
        }
    } else {
        newLock = {
            id: 'lock_paseboda_sched_' + now,
            source: 'paseboda',
            weddingName: 'Boda Valentina & Sebastián (Agendada)',
            templateName: 'paseboda_invitacion_1',
            startTimestamp: now + (20 * 60 * 1000),
            endTimestamp: now + (80 * 60 * 1000),
            guestsCount: 42,
            sentCount: 0,
            failedCount: 0,
            status: 'scheduled',
            recipientLog: []
        };
        if (typeof showToast === 'function') {
            showToast('💍 Despacho de PaseBoda agendado para dentro de 20 min.');
        }
    }

    locks.unshift(newLock);
    saveRadarLocks(locks);
    renderDevRadarTab();
}

function simulateAtelierStudioLock() {
    const now = Date.now();
    const startMs = now + (15 * 60 * 1000);
    const endMs = startMs + (60 * 60 * 1000);

    const lock = {
        id: 'lock_atelier_' + Date.now(),
        source: 'atelier',
        weddingName: 'Campaña Muestras Otoño 2027',
        templateName: 'muestras_op1_invitacion',
        startTimestamp: startMs,
        endTimestamp: endMs,
        guestsCount: 45,
        sentCount: 0,
        failedCount: 0,
        status: 'scheduled',
        recipientLog: []
    };

    const locks = getRadarLocks();
    locks.push(lock);
    saveRadarLocks(locks);

    if (typeof showToast === 'function') {
        showToast('🎨 Bloque de Atelier Studio programado para dentro de 15 min.');
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

async function fetchRadarLocksFromCloud() {
    try {
        const res = await fetch('/api/radar-locks', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.locks)) {
                localStorage.setItem(RADAR_STORAGE_KEY, JSON.stringify(data.locks));
                const container = document.getElementById('tab-dev-radar');
                if (container && container.classList.contains('active')) {
                    renderDevRadarTab();
                }
            }
        }
    } catch (e) {
        // Fallback offline a localStorage
    }
}

function refreshRadarManually() {
    fetchRadarLocksFromCloud();
    renderDevRadarTab();
    if (typeof showToast === 'function') {
        showToast('🔄 Radar sincronizado con la nube en tiempo real.');
    }
}

// Bucle de auto-actualización cada 10 segundos conectado a la nube
let radarPollInterval = null;
function startRadarAutoPoll() {
    if (radarPollInterval) clearInterval(radarPollInterval);
    radarPollInterval = setInterval(() => {
        fetchRadarLocksFromCloud();
    }, 10000);
    fetchRadarLocksFromCloud();
}

// Exportar globalmente
window.renderDevRadarTab = renderDevRadarTab;
window.refreshRadarManually = refreshRadarManually;
window.fetchRadarLocksFromCloud = fetchRadarLocksFromCloud;
window.simulatePasebodaLock = simulatePasebodaLock;
window.simulateAtelierStudioLock = simulateAtelierStudioLock;
window.clearRadarLocks = clearRadarLocks;
window.deleteRadarLock = deleteRadarLock;
window.openRadarDetailModal = openRadarDetailModal;
window.closeRadarDetailModal = closeRadarDetailModal;
window.setModalFilter = setModalFilter;

startRadarAutoPoll();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof renderDevRadarTab === 'function') renderDevRadarTab();
    });
} else {
    setTimeout(() => {
        if (typeof renderDevRadarTab === 'function') renderDevRadarTab();
    }, 100);
}
