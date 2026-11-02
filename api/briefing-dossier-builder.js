// ==========================================================================
// PASEBODA EXECUTIVE BRIEFING DOSSIER GENERATOR
// Compiles complete briefing into a self-contained luxury printable document (.html)
// ==========================================================================

function buildDossierHtml(data = {}, audit = {}) {
    const {
        couple = 'Pareja de Gala',
        date = 'Fecha por Definir',
        cityVenue = 'Recinto Principal',
        planner = 'Wedding Planner',
        plannerEmail = 'contacto@agencia.com',
        phone = 'Sin número',
        theme = 'Tuscany Gold',
        customThemeDetails = null,
        masterDrive = '',
        photos = {},
        itinerary = {},
        dressCode = {},
        giftRegistry = {},
        rsvp = {},
        transport = {}
    } = data;

    const cerem = itinerary?.ceremony || {};
    const recep = itinerary?.reception || {};
    const multi = itinerary?.multiDay || {};

    const cleanCouple = couple.replace(/[^\w\s-]/g, '').trim();

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expediente de Boda · ${couple} · PaseBoda</title>
    <style>
        :root {
            --bg-dark: #0b0f19;
            --card-dark: #111827;
            --border-dark: #1f2937;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --gold: #d97706;
            --rose: #e2a891;
            --success: #10b981;
            --warning: #f59e0b;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 32px 16px;
            background: #090d16;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: var(--text-main);
            line-height: 1.5;
        }
        .container {
            max-width: 860px;
            margin: 0 auto;
            background: var(--card-dark);
            border: 1px solid var(--border-dark);
            border-radius: 20px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.6);
            overflow: hidden;
        }
        .top-accent {
            height: 6px;
            background: linear-gradient(90deg, #d97706 0%, #e2a891 50%, #d97706 100%);
        }
        .header {
            padding: 36px 36px 24px;
            border-bottom: 1px solid var(--border-dark);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 18px;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .brand-logo {
            font-size: 2rem;
        }
        .brand-title {
            font-size: 1.4rem;
            font-weight: 800;
            color: #fff;
            letter-spacing: -0.5px;
        }
        .brand-subtitle {
            font-size: 0.75rem;
            color: var(--rose);
            letter-spacing: 2px;
            text-transform: uppercase;
            font-weight: 700;
        }
        .badge-status {
            padding: 8px 16px;
            border-radius: 999px;
            font-size: 0.82rem;
            font-weight: 800;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid #10b981;
            color: #34d399;
        }
        .hero {
            padding: 32px 36px;
            background: linear-gradient(180deg, rgba(217,119,6,0.08) 0%, rgba(17,24,39,0) 100%);
            border-bottom: 1px solid var(--border-dark);
        }
        .hero h1 {
            margin: 0 0 10px;
            font-size: 2rem;
            color: #ffffff;
            font-family: Georgia, serif;
            letter-spacing: -0.5px;
        }
        .hero-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            font-size: 0.9rem;
            color: var(--text-muted);
        }
        .hero-meta strong {
            color: #fff;
        }
        .audit-card {
            margin: 24px 36px;
            padding: 20px;
            background: #0d1322;
            border: 1px solid #1e293b;
            border-radius: 14px;
        }
        .audit-title {
            font-size: 0.95rem;
            font-weight: 800;
            color: var(--gold);
            margin: 0 0 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .audit-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 10px;
        }
        .audit-pill {
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.78rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 6px;
            background: #131d31;
            border: 1px solid #1f2e4d;
            color: #cbd5e1;
        }
        .audit-pill.ok {
            border-color: rgba(16, 185, 129, 0.4);
            color: #a7f3d0;
        }
        .audit-pill.warn {
            border-color: rgba(245, 158, 11, 0.5);
            color: #fde68a;
        }
        .section {
            padding: 24px 36px;
            border-bottom: 1px solid var(--border-dark);
        }
        .section-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
        }
        .section-num {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: linear-gradient(135deg, var(--gold) 0%, var(--rose) 100%);
            color: #0b0f19;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 0.85rem;
        }
        .section-title {
            font-size: 1.15rem;
            font-weight: 700;
            color: #fff;
            margin: 0;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 14px;
        }
        .info-box {
            background: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 10px;
            padding: 12px 16px;
        }
        .info-label {
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-muted);
            margin-bottom: 4px;
            font-weight: 700;
        }
        .info-value {
            font-size: 0.92rem;
            color: #f1f5f9;
            font-weight: 600;
            word-break: break-word;
        }
        .btn-link {
            display: inline-block;
            background: #2563eb;
            color: #fff;
            padding: 6px 12px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 0.8rem;
            font-weight: 700;
            margin-top: 6px;
        }
        .footer {
            padding: 28px 36px;
            background: #0b0f19;
            text-align: center;
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        @media print {
            body { background: #fff; color: #000; padding: 0; }
            .container { box-shadow: none; border: none; max-width: 100%; }
            .info-box, .audit-card { background: #f8fafc; border-color: #cbd5e1; }
            .info-value { color: #0f172a; }
            .hero h1, .section-title { color: #0f172a; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="top-accent"></div>
        
        <!-- Header -->
        <div class="header">
            <div class="brand">
                <div class="brand-logo">💍</div>
                <div>
                    <div class="brand-title">PaseBoda</div>
                    <div class="brand-subtitle">Expediente Oficial de Briefing</div>
                </div>
            </div>
            <div class="badge-status">
                <span>✓</span> ${audit.status || 'LISTO PARA PRODUCCIÓN'} (${audit.score || '8/8'})
            </div>
        </div>

        <!-- Hero -->
        <div class="hero">
            <h1>${couple}</h1>
            <div class="hero-meta">
                <div>📅 <strong>Fecha Oficial:</strong> ${date}</div>
                <div>🏰 <strong>Recinto:</strong> ${cityVenue}</div>
                <div>✨ <strong>Planner:</strong> ${planner}</div>
                <div>📱 <strong>WhatsApp:</strong> ${phone}</div>
            </div>
        </div>

        <!-- 8 Blocks Audit Matrix -->
        <div class="audit-card">
            <div class="audit-title">
                <span>🧠 Resumen de Auditoría Automatizada</span>
                <span style="font-size:0.8rem; color:#a7f3d0;">Score: ${audit.score || '8/8'} Aprobados</span>
            </div>
            <div class="audit-grid">
                ${(audit.blocks || []).map(b => `
                    <div class="audit-pill ${b.ok ? 'ok' : 'warn'}">
                        <span>${b.ok ? '✓' : '⚠️'}</span>
                        <span>${b.num}. ${b.title}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Bloque 1: Datos Generales -->
        <div class="section">
            <div class="section-header">
                <div class="section-num">1</div>
                <h2 class="section-title">Datos Generales & Contacto</h2>
            </div>
            <div class="info-grid">
                <div class="info-box">
                    <div class="info-label">Pareja / Novios</div>
                    <div class="info-value">${couple}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Fecha de la Boda</div>
                    <div class="info-value">${date}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Wedding Planner / Agencia</div>
                    <div class="info-value">${planner}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">WhatsApp de Contacto</div>
                    <div class="info-value">${phone}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Correo Oficial</div>
                    <div class="info-value">${plannerEmail}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Ciudad & Recinto</div>
                    <div class="info-value">${cityVenue}</div>
                </div>
            </div>
        </div>

        <!-- Bloque 2: Temática -->
        <div class="section">
            <div class="section-header">
                <div class="section-num">2</div>
                <h2 class="section-title">Temática & Estilo Visual</h2>
            </div>
            <div class="info-grid">
                <div class="info-box">
                    <div class="info-label">Línea de Diseño</div>
                    <div class="info-value">${theme.toUpperCase()}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Notas de Estilo</div>
                    <div class="info-value">${customThemeDetails?.notes || 'Diseño estándar curado por PaseBoda'}</div>
                </div>
            </div>
        </div>

        <!-- Bloque 3: Fotos -->
        <div class="section">
            <div class="section-header">
                <div class="section-num">3</div>
                <h2 class="section-title">Blueprint Fotográfico (15 Fotografías)</h2>
            </div>
            <div class="info-grid">
                <div class="info-box" style="grid-column: 1 / -1;">
                    <div class="info-label">Carpeta Nube / Google Drive</div>
                    <div class="info-value">
                        ${masterDrive 
                            ? `<a href="${masterDrive}" target="_blank" class="btn-link">📁 Abrir Carpeta en Google Drive</a> <span style="font-size:0.8rem; color:#94a3b8; margin-left:8px;">${masterDrive}</span>`
                            : '<span style="color:#f59e0b;">⚠️ Pendiente de adjuntar por la planner</span>'}
                    </div>
                </div>
                <div class="info-box">
                    <div class="info-label">01. Portada Hero</div>
                    <div class="info-value">${photos?.hero || 'foto_01_hero.jpg'}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">02-05. Historia de Amor</div>
                    <div class="info-value">${Array.isArray(photos?.story) ? photos.story.filter(Boolean).join(', ') : '4 fotos'}</div>
                </div>
            </div>
        </div>

        <!-- Bloque 4: Itinerario -->
        <div class="section">
            <div class="section-header">
                <div class="section-num">4</div>
                <h2 class="section-title">Itinerario & Cronograma Oficial</h2>
            </div>
            <div class="info-grid">
                <div class="info-box">
                    <div class="info-label">Ceremonia Religiosa / Civil</div>
                    <div class="info-value">${cerem.start || '--:--'} a ${cerem.end || '--:--'}</div>
                    <div style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">${cerem.venue || cityVenue}</div>
                    ${cerem.map ? `<a href="${cerem.map}" target="_blank" class="btn-link" style="background:#059669;">📍 Ver Ubicación en Maps</a>` : ''}
                </div>
                <div class="info-box">
                    <div class="info-label">Banquete & Fiesta</div>
                    <div class="info-value">Cóctel ${recep.cocktail || '--'} | Cena ${recep.dinner || '--'} | Cierre ${recep.partyEnd || '--'}</div>
                    <div style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">${recep.venue || cityVenue}</div>
                    ${recep.map ? `<a href="${recep.map}" target="_blank" class="btn-link" style="background:#059669;">📍 Ver Ubicación en Maps</a>` : ''}
                </div>
                ${multi.icebreaker || multi.tornaboda ? `
                <div class="info-box" style="grid-column: 1 / -1;">
                    <div class="info-label">Eventos Adicionales (Icebreaker / Tornaboda)</div>
                    <div class="info-value">${multi.icebreaker ? 'Icebreaker: ' + multi.icebreaker : ''} ${multi.tornaboda ? ' | Tornaboda: ' + multi.tornaboda : ''}</div>
                </div>` : ''}
            </div>
        </div>

        <!-- Bloque 5: Dress Code -->
        <div class="section">
            <div class="section-header">
                <div class="section-num">5</div>
                <h2 class="section-title">Código de Vestimenta (Dress Code)</h2>
            </div>
            <div class="info-grid">
                <div class="info-box">
                    <div class="info-label">Nivel de Etiqueta</div>
                    <div class="info-value">${dressCode?.type || 'Formal'}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Colores Reservados</div>
                    <div class="info-value" style="color:#ef4444;">${dressCode?.reserved || 'Blanco novias reservado'}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Paleta Sugerida</div>
                    <div class="info-value">${dressCode?.suggested || 'Colores libres de gala'}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Nota de Calzado</div>
                    <div class="info-value">${dressCode?.shoeNote || 'Pasto y áreas verdes (tacón ancho)'}</div>
                </div>
            </div>
        </div>

        <!-- Bloque 6: Mesa de Regalos -->
        <div class="section">
            <div class="section-header">
                <div class="section-num">6</div>
                <h2 class="section-title">Mesa de Regalos & CLABE Interbancaria</h2>
            </div>
            <div class="info-grid">
                <div class="info-box">
                    <div class="info-label">Banco & Beneficiario</div>
                    <div class="info-value">${giftRegistry?.bank || 'N/A'} · ${giftRegistry?.owner || 'N/A'}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">CLABE Interbancaria (18 dígitos)</div>
                    <div class="info-value" style="font-family:monospace; color:#38bdf8;">${giftRegistry?.clabe || 'No configurada'}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Tiendas Departamentales / Amazon</div>
                    <div class="info-value">${giftRegistry?.store || 'N/A'} | Amazon: ${giftRegistry?.amazon || 'N/A'}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Lluvia de Sobres</div>
                    <div class="info-value">${giftRegistry?.envelope ? '✓ Activada en la recepción' : 'No'}</div>
                </div>
            </div>
        </div>

        <!-- Bloque 7: Menú & RSVP -->
        <div class="section">
            <div class="section-header">
                <div class="section-num">7</div>
                <h2 class="section-title">RSVP, Menú & Alergias Clínicas</h2>
            </div>
            <div class="info-grid">
                <div class="info-box">
                    <div class="info-label">Fecha Límite de Confirmación</div>
                    <div class="info-value" style="color:#f59e0b;">${rsvp?.deadline || 'Por definir'}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Política de Niños</div>
                    <div class="info-value">${rsvp?.kidsPolicy === 'adults_only' ? '🚫 Solo Adultos' : '👶 Niños Bienvenidos'}</div>
                </div>
                <div class="info-box" style="grid-column: 1 / -1;">
                    <div class="info-label">Modalidad de Banquete</div>
                    <div class="info-value">
                        ${rsvp?.menuType === 'fixed' 
                            ? 'Menú Único de Autor: ' + (rsvp?.fixedMenuDesc || '4 tiempos gourmet')
                            : `Selección: [A] ${rsvp?.menuOptions?.a || 'Res'} | [B] ${rsvp?.menuOptions?.b || 'Ave/Pescado'} | [C] ${rsvp?.menuOptions?.c || 'Vegano'}`}
                    </div>
                </div>
            </div>
        </div>

        <!-- Bloque 8: Transporte & Hoteles -->
        <div class="section">
            <div class="section-header">
                <div class="section-num">8</div>
                <h2 class="section-title">Transporte (Shuttles) & Hoteles Sede</h2>
            </div>
            <div class="info-grid">
                <div class="info-box">
                    <div class="info-label">Servicio de Shuttles</div>
                    <div class="info-value">${transport?.hasShuttle === 'yes' ? '✓ Sí, servicio activo' : 'No programado'}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">Punto de Salida & Horarios</div>
                    <div class="info-value">${transport?.pickup || 'N/A'} (Ida: ${transport?.departures || '--'} | Retorno: ${transport?.returns || '--'})</div>
                </div>
                <div class="info-box" style="grid-column: 1 / -1;">
                    <div class="info-label">Hoteles Sede Recomendados</div>
                    <div class="info-value">Hotel 1: ${transport?.hotel1 || 'N/A'} | Hotel 2: ${transport?.hotel2 || 'N/A'}</div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin:0 0 6px;">PaseBoda · Plataforma de Gestión Nupcial &amp; Control Operativo</p>
            <p style="margin:0; font-size:0.75rem;">Generado automáticamente por Antigravity Studio · <a href="https://paseboda.com" style="color:#94a3b8;">paseboda.com</a></p>
        </div>
    </div>
</body>
</html>`;
}

module.exports = {
    buildDossierHtml
};
