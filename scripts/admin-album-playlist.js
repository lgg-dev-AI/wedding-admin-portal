// ==========================================================================
// COLLABORATIVE LIVE PHOTO ALBUM & DJ BRIEFING HUB
// (PROTOCOL + PRE-WEDDING PARTY SUGGESTIONS + DO NOT PLAY BLACKLIST)
// WITH CONNECTED SPOTIFY PLAYER + 3-DAY NON-PAYMENT ACCOUNT AUTO-PURGE
// ==========================================================================

const SPOTIFY_CONFIG_STORAGE_KEY = 'wedding_spotify_account_config_v1';

const defaultPhotos = [
    {
        id: 'p1',
        personName: 'Mariana Garza',
        author: 'Mariana Garza (Mesa 4 - Amigos Universidad)',
        table: 'Mesa 4 - Amigos Universidad',
        time: 'Hace 10 min',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600',
        caption: '¡La mejor entrada de los novios! Los queremos muchísimo ✨'
    },
    {
        id: 'p2',
        personName: 'Valeria & Diego',
        author: 'Valeria & Diego (Mesa 4 - Amigos Universidad)',
        table: 'Mesa 4 - Amigos Universidad',
        time: 'Hace 14 min',
        url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=600',
        caption: '¡La Mesa 4 prendiendo la pista de baile desde el minuto uno! 🕺💃'
    },
    {
        id: 'p3',
        personName: 'Carlos Mendoza',
        author: 'Carlos Mendoza (Mesa 2 - Familia Novia)',
        table: 'Mesa 2 - Familia Novia',
        time: 'Hace 25 min',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600',
        caption: 'Brindis inolvidable por toda una vida juntos 🥂'
    },
    {
        id: 'p4',
        personName: 'Tía Lucía Morales',
        author: 'Tía Lucía Morales (Mesa 2 - Familia Novia)',
        table: 'Mesa 2 - Familia Novia',
        time: 'Hace 32 min',
        url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600',
        caption: 'Qué emoción ver a mi sobrina tan radiante, Dios los bendiga siempre ❤️'
    },
    {
        id: 'p5',
        personName: 'Sofía & Alejandro',
        author: 'Sofía & Alejandro (Mesa 1 - Mesa de Honor)',
        table: 'Mesa 1 - Mesa de Honor',
        time: 'Hace 1 hora',
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600',
        caption: 'Nuestra sesión de First Look antes de entrar al banquete ✨'
    },
    {
        id: 'p6',
        personName: 'Padrinos Fernando & Elena',
        author: 'Padrinos Fernando & Elena (Mesa 1 - Mesa de Honor)',
        table: 'Mesa 1 - Mesa de Honor',
        time: 'Hace 50 min',
        url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=600',
        caption: 'Un honor acompañarlos en la Mesa de Honor en este día histórico 🥂💍'
    },
    {
        id: 'p7',
        personName: 'Dr. Roberto Elizondo',
        author: 'Dr. Roberto Elizondo (Mesa 3 - Familia Novio)',
        table: 'Mesa 3 - Familia Novio',
        time: 'Hace 1 hora',
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600',
        caption: 'Decoración botánica espectacular, felicidades de parte de la familia Elizondo 🌿'
    }
];

const defaultPlaylist = [
    {
        id: 's1',
        title: 'A Sky Full of Stars',
        artist: 'Coldplay',
        album: 'Ghost Stories (Versión Estudio Exacta)',
        category: 'protocol',
        requestedBy: 'Entrada Triunfal de Novios (21:15 hrs)',
        votes: 24,
        cover: '',
        previewUrl: ''
    },
    {
        id: 's_vals',
        title: 'Perfect Symphony',
        artist: 'Ed Sheeran & Andrea Bocelli',
        album: 'Edición Orquestal Oficial',
        category: 'protocol',
        requestedBy: 'Primer Vals de Esposos (21:25 hrs)',
        votes: 22,
        cover: '',
        previewUrl: ''
    },
    {
        id: 's2',
        title: 'September',
        artist: 'Earth, Wind & Fire',
        album: 'The Best of Earth, Wind & Fire, Vol. 1',
        category: 'party',
        requestedBy: 'Familia Novia (Mesa 1 - RSVP Pre-Boda)',
        votes: 18,
        cover: '',
        previewUrl: ''
    },
    {
        id: 's3',
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        category: 'party',
        requestedBy: 'Damas de Honor (Mesa 4 - RSVP Pre-Boda)',
        votes: 15,
        cover: '',
        previewUrl: ''
    },
    {
        id: 's4',
        title: 'Vivir Mi Vida',
        artist: 'Marc Anthony',
        album: '3.0',
        category: 'party',
        requestedBy: 'Tíos y Familiares (RSVP Pre-Boda)',
        votes: 12,
        cover: '',
        previewUrl: ''
    },
    {
        id: 's5',
        title: 'Titanium',
        artist: 'David Guetta ft. Sia',
        album: 'Nothing but the Beat',
        category: 'party',
        requestedBy: 'Amigos Universidad (RSVP Pre-Boda)',
        votes: 9,
        cover: '',
        previewUrl: ''
    },
    {
        id: 's_veto1',
        title: 'Payaso de Rodeo',
        artist: 'Caballo Dorado',
        album: 'No Tocar en Ningún Momento',
        category: 'blacklist',
        requestedBy: 'Vetada por la Novia — Prohibido tocar aunque la pidan en cabina',
        votes: 0,
        cover: '',
        previewUrl: ''
    },
    {
        id: 's_veto2',
        title: 'El Ansioso',
        artist: 'Grupo Marrano',
        album: 'Restricción Estricta de Etiqueta',
        category: 'blacklist',
        requestedBy: 'Vetada por Novios & Planner — Estrictamente prohibida',
        votes: 0,
        cover: '',
        previewUrl: ''
    }
];

const initialCatalogSuggestions = [
    { trackId: 'c1', title: 'Ahora Te Puedes Marchar', artist: 'Luis Miguel', album: 'Soy Como Quiero Ser', cover: '', previewUrl: '' },
    { trackId: 'c2', title: 'Cómo Te Voy a Olvidar', artist: 'Los Ángeles Azules', album: 'Cómo Te Voy a Olvidar', cover: '', previewUrl: '' },
    { trackId: 'c3', title: 'La Boda del Huitlacoche', artist: 'Carín León', album: 'Cura Local', cover: '', previewUrl: '' },
    { trackId: 'c4', title: 'Suavemente', artist: 'Elvis Crespo', album: 'Suavemente', cover: '', previewUrl: '' },
    { trackId: 'c5', title: 'One More Time', artist: 'Daft Punk', album: 'Discovery', cover: '', previewUrl: '' },
    { trackId: 'c6', title: 'Dancing Queen', artist: 'ABBA', album: 'Arrival', cover: '', previewUrl: '' }
];

let liveSearchDebounceTimer = null;
let currentLiveSearchResults = [...initialCatalogSuggestions];
let selectedDeckTrack = null;
let savedPlaylistFilterQuery = '';
let savedPlaylistSortMode = 'votes';
let savedPlaylistCategoryFilter = 'all';
let activeAudioPlayer = null;
let activeAudioTrackId = null;
let showSpotifyConnectForm = false;

// ==========================================================================
// 1. SPOTIFY ACCOUNT CONNECTION & 3-DAY NON-PAYMENT AUTO-PURGE ENGINE
// ==========================================================================

function getSpotifyAccountConfig() {
    const raw = localStorage.getItem(SPOTIFY_CONFIG_STORAGE_KEY);
    if (!raw) {
        const defaultAcct = {
            connected: true,
            spotifyEmail: 'cabina.dj@auraweddings.mx',
            spotifyDisplayName: 'Aura Weddings Official DJ',
            customPlaylistId: '37i9dQZF1DXa2PvUpywmrr',
            connectedAt: '2026-10-01',
            daysPastDueSimulated: 0,
            purgedReason: null
        };
        localStorage.setItem(SPOTIFY_CONFIG_STORAGE_KEY, JSON.stringify(defaultAcct));
        return defaultAcct;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        return { connected: false, daysPastDueSimulated: 0 };
    }
}

function saveSpotifyAccountConfig(cfg) {
    localStorage.setItem(SPOTIFY_CONFIG_STORAGE_KEY, JSON.stringify(cfg));
}

function enforceSpotifyAccountRetentionPolicy() {
    const cfg = getSpotifyAccountConfig();

    let daysOverdue = Number(cfg.daysPastDueSimulated || 0);
    if (typeof getClientsDatabase === 'function') {
        const sessionRaw = localStorage.getItem('wedding_active_session_user');
        if (sessionRaw) {
            try {
                const sessionUser = JSON.parse(sessionRaw);
                const clients = getClientsDatabase();
                const matched = clients.find(c => c.email && sessionUser.email && c.email.toLowerCase() === sessionUser.email.toLowerCase());
                if (matched && matched.paymentStatus !== 'paid' && matched.nextDueDate) {
                    const dueMs = new Date(matched.nextDueDate).getTime();
                    const diffDays = Math.floor((Date.now() - dueMs) / (1000 * 60 * 60 * 24));
                    if (diffDays > daysOverdue) daysOverdue = diffDays;
                }
            } catch (e) {}
        }
    }

    if (daysOverdue >= 3 && cfg.connected) {
        const purgedConfig = {
            connected: false,
            spotifyEmail: '',
            spotifyDisplayName: '',
            customPlaylistId: '',
            connectedAt: null,
            daysPastDueSimulated: daysOverdue,
            purgedAt: new Date().toLocaleString('es-MX'),
            purgedReason: `Cuenta Spotify borrada automáticamente tras ${daysOverdue} días sin pago de mensualidad (límite máximo: 3 días / 72 hrs).`
        };
        saveSpotifyAccountConfig(purgedConfig);
        return purgedConfig;
    }

    return cfg;
}

function renderSpotifyAccountBanner() {
    const banner = document.getElementById('spotifyAccountStatusBanner');
    if (!banner) return;

    const cfg = enforceSpotifyAccountRetentionPolicy();

    if (!cfg.connected) {
        banner.innerHTML = `
            <div class="spotify-banner-card disconnected">
                <div class="spotify-banner-left">
                    <span class="spotify-banner-icon">⚠️</span>
                    <div>
                        <div class="d-flex align-center gap-2" style="flex-wrap:wrap;">
                            <strong style="color:#991b1b; font-size:0.92rem;">Cuenta de Spotify Desvinculada / Borrada</strong>
                            <span class="badge-purge-rule">⏳ Regla Automática: Borrado a los 3 Días de Impago</span>
                        </div>
                        <p style="margin:3px 0 0; font-size:0.78rem; color:#7f1d1d;">
                            ${cfg.purgedReason || 'El Wedding Planner debe conectar su cuenta de Spotify para sincronizar listas personalizadas. Si su mensualidad vence y pasan 3 días sin pago, el sistema borra la cuenta configurada automáticamente.'}
                        </p>
                    </div>
                </div>
                <div class="spotify-banner-actions">
                    <button type="button" class="btn-spotify-connect" onclick="toggleSpotifyConnectForm()">🔗 Conectar Cuenta Spotify</button>
                </div>
            </div>
            ${showSpotifyConnectForm ? renderSpotifyConnectFormHtml(cfg) : ''}
        `;
        return;
    }

    banner.innerHTML = `
        <div class="spotify-banner-card connected">
            <div class="spotify-banner-left">
                <span class="spotify-banner-icon">🟢</span>
                <div>
                    <div class="d-flex align-center gap-2" style="flex-wrap:wrap;">
                        <strong style="color:#065f46; font-size:0.92rem;">Spotify Conectado: ${escapeHtmlText(cfg.spotifyDisplayName)} (${escapeHtmlText(cfg.spotifyEmail)})</strong>
                        <span class="badge-purge-rule active">🛡️ Protección SaaS: Se borra automáticamente a los 3 días de no pagar mensualidad</span>
                    </div>
                    <p style="margin:3px 0 0; font-size:0.78rem; color:#047857;">
                        El buscador de abajo está enlazado con la Cabina de Pre-Escucha y tu reproductor de Spotify. Al vencer el plan mensual, si pasan <strong>3 días (72h) sin pago</strong>, esta cuenta se elimina del sistema automáticamente.
                    </p>
                </div>
            </div>
            <div class="spotify-banner-actions">
                <button type="button" class="btn-spotify-config" onclick="toggleSpotifyConnectForm()">⚙️ Configurar Cuenta</button>
                <button type="button" class="btn-spotify-purge-test" onclick="simulateThreeDayNonPaymentPurge()" title="Probar cómo el sistema borra la cuenta al cumplir 3 días sin pagar">🧪 Simular 3 Días Sin Pago</button>
            </div>
        </div>
        ${showSpotifyConnectForm ? renderSpotifyConnectFormHtml(cfg) : ''}
    `;
}

function renderSpotifyConnectFormHtml(cfg) {
    return `
        <div class="spotify-connect-drawer mt-2">
            <h4 style="margin:0 0 8px; font-size:0.88rem; color:#0f172a;">🔗 Vincular Cuenta Oficial de Spotify del Wedding Planner</h4>
            <div class="spotify-connect-grid">
                <div>
                    <label style="font-size:0.72rem; font-weight:800; color:#475569; display:block; margin-bottom:4px;">Correo o Usuario de Spotify:</label>
                    <input type="email" id="inputSpotifyEmail" class="form-input" placeholder="planner@spotify.com" value="${escapeHtmlText(cfg.spotifyEmail || '')}">
                </div>
                <div>
                    <label style="font-size:0.72rem; font-weight:800; color:#475569; display:block; margin-bottom:4px;">Nombre del Perfil / Cabina DJ:</label>
                    <input type="text" id="inputSpotifyName" class="form-input" placeholder="Ej. Eventos Exclusivos DJ" value="${escapeHtmlText(cfg.spotifyDisplayName || '')}">
                </div>
                <div>
                    <label style="font-size:0.72rem; font-weight:800; color:#475569; display:block; margin-bottom:4px;">Link o ID de Playlist Spotify (Opcional):</label>
                    <input type="text" id="inputSpotifyPlaylistUrl" class="form-input" placeholder="https://open.spotify.com/playlist/..." value="${escapeHtmlText(cfg.customPlaylistId || '37i9dQZF1DXa2PvUpywmrr')}">
                </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; flex-wrap:wrap; gap:8px;">
                <small style="color:#64748b; font-size:0.74rem;">🔒 Cláusula Automática: En caso de suspensión o atraso mayor a <strong>3 días posteriores al corte mensual</strong>, estos datos se autodestruyen.</small>
                <div style="display:flex; gap:8px;">
                    <button type="button" class="btn-action secondary" onclick="toggleSpotifyConnectForm()">Cancelar</button>
                    <button type="button" class="btn-action primary" onclick="savePlannerSpotifyConnection()">💾 Guardar y Conectar Spotify</button>
                </div>
            </div>
        </div>
    `;
}

function toggleSpotifyConnectForm() {
    showSpotifyConnectForm = !showSpotifyConnectForm;
    renderSpotifyAccountBanner();
}

function savePlannerSpotifyConnection() {
    const email = (document.getElementById('inputSpotifyEmail')?.value || '').trim();
    const name = (document.getElementById('inputSpotifyName')?.value || '').trim() || 'Wedding Planner Spotify';
    const rawPlaylist = (document.getElementById('inputSpotifyPlaylistUrl')?.value || '').trim();

    if (!email) {
        showToast('⚠️ Ingresa el correo o usuario de la cuenta de Spotify del Wedding Planner.');
        return;
    }

    const extractedId = extractSpotifyPlaylistId(rawPlaylist) || '37i9dQZF1DXa2PvUpywmrr';

    const newCfg = {
        connected: true,
        spotifyEmail: email,
        spotifyDisplayName: name,
        customPlaylistId: extractedId,
        connectedAt: new Date().toISOString().slice(0, 10),
        daysPastDueSimulated: 0,
        purgedReason: null
    };

    saveSpotifyAccountConfig(newCfg);
    showSpotifyConnectForm = false;
    renderSpotifyAccountBanner();
    changeSpotifyWidgetPlaylist(extractedId);
    showToast(`🟢 Cuenta Spotify (${email}) vinculada con éxito.`);
}

function simulateThreeDayNonPaymentPurge() {
    const cfg = getSpotifyAccountConfig();
    cfg.daysPastDueSimulated = 3;
    saveSpotifyAccountConfig(cfg);
    enforceSpotifyAccountRetentionPolicy();
    renderSpotifyAccountBanner();
    showToast('🧹 Simulación ejecutada: Pasaron 3 días sin pago y la cuenta de Spotify fue borrada automáticamente.');
}

function extractSpotifyPlaylistId(input) {
    if (!input) return '';
    const match = input.match(/playlist\/([a-zA-Z0-9]+)/);
    if (match && match[1]) return match[1];
    return input.replace(/[^a-zA-Z0-9]/g, '');
}

// ==========================================================================
// 2. UNIFIED SEARCH <-> ACTIVE PLAYER DECK CONNECTION
// ==========================================================================

let albumAutoSyncTimer = null;
let activeAlbumTableFilter = 'ALL';
let activeAlbumPersonFilter = 'ALL';

const albumBroadcastChannel = (typeof window !== 'undefined' && 'BroadcastChannel' in window)
    ? new BroadcastChannel('wedding_live_album_sync')
    : null;

if (albumBroadcastChannel) {
    albumBroadcastChannel.onmessage = (evt) => {
        if (evt.data && evt.data.type === 'NEW_ALBUM_PHOTO') {
            renderAlbumTab();
            showToast('📸 ¡Nueva foto recibida en vivo desde el QR de mesa!');
        }
    };
}

if (typeof window !== 'undefined') {
    window.addEventListener('storage', (evt) => {
        if (evt.key && evt.key.startsWith('wedding_album_photos_')) {
            renderAlbumTab();
        }
    });
}

function getActiveAlbumStorageKey() {
    const wId = (typeof currentWeddingId !== 'undefined' && currentWeddingId) ? currentWeddingId : 'aura';
    return `wedding_album_photos_${wId}`;
}

// =========================================================================
// GESTOR DE VENTANA DE TIEMPO DEL ÁLBUM QR (VARIANTES: 1H, 2H, 3H, 5H, ILIMITADO)
// =========================================================================
let albumWindowCountdownInterval = null;

function getAlbumTimeWindowConfig() {
    const wId = (typeof currentWeddingId !== 'undefined' && currentWeddingId) ? currentWeddingId : 'aura';
    const raw = localStorage.getItem(`wedding_album_window_${wId}`);
    if (raw) {
        try { return JSON.parse(raw); } catch (e) {}
    }
    return {
        mode: '2', // Default 2 horas
        startTime: Date.now(),
        durationHours: 2,
        isClosed: false
    };
}

function saveAlbumTimeWindowConfig(cfg) {
    const wId = (typeof currentWeddingId !== 'undefined' && currentWeddingId) ? currentWeddingId : 'aura';
    localStorage.setItem(`wedding_album_window_${wId}`, JSON.stringify(cfg));
    if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('wedding_live_album_sync');
        bc.postMessage({ type: 'ALBUM_WINDOW_CHANGED', weddingId: wId, config: cfg });
    }
}

function setAlbumTimeWindow(val) {
    let cfg = getAlbumTimeWindowConfig();
    cfg.mode = val;
    cfg.startTime = Date.now();
    if (val === 'closed') {
        cfg.isClosed = true;
        cfg.durationHours = 0;
        showToast('🔒 Recepción de fotos cerrada manualmente.');
    } else if (val === 'unlimited') {
        cfg.isClosed = false;
        cfg.durationHours = null;
        showToast('♾️ Recepción de fotos abierta de forma ilimitada durante toda la boda.');
    } else {
        cfg.isClosed = false;
        cfg.durationHours = parseFloat(val);
        showToast(`⏱️ Ventana de recepción establecida en ${val} hora(s).`);
    }
    saveAlbumTimeWindowConfig(cfg);
    updateAlbumWindowTimerDisplay();
}

function resetAlbumWindowTimer() {
    let cfg = getAlbumTimeWindowConfig();
    cfg.startTime = Date.now();
    cfg.isClosed = false;
    saveAlbumTimeWindowConfig(cfg);
    updateAlbumWindowTimerDisplay();
    showToast('🔄 Temporizador de recepción reiniciado desde este momento.');
}

function updateAlbumWindowTimerDisplay() {
    const selectEl = document.getElementById('albumTimeWindowSelect');
    const badgeEl = document.getElementById('albumWindowStatusBadge');
    const remainEl = document.getElementById('albumWindowRemainingText');
    if (!badgeEl || !remainEl) return;

    const cfg = getAlbumTimeWindowConfig();
    if (selectEl && selectEl.value !== cfg.mode) {
        selectEl.value = cfg.mode;
    }

    if (cfg.mode === 'closed' || cfg.isClosed) {
        badgeEl.style.background = '#fee2e2';
        badgeEl.style.color = '#991b1b';
        badgeEl.style.borderColor = '#fca5a5';
        badgeEl.innerText = '🔒 Recepción Cerrada';
        remainEl.innerHTML = '🚫 <strong>La recepción de fotos está finalizada.</strong> Los invitados ya no pueden subir más imágenes.';
        return;
    }

    if (cfg.mode === 'unlimited' || !cfg.durationHours) {
        badgeEl.style.background = '#dcfce7';
        badgeEl.style.color = '#15803d';
        badgeEl.style.borderColor = '#86efac';
        badgeEl.innerText = '♾️ Recepción Continua';
        remainEl.innerHTML = '✨ <strong>Recepción abierta permanentemente:</strong> Los invitados pueden subir fotos en cualquier momento del evento.';
        return;
    }

    const elapsedMs = Date.now() - (cfg.startTime || Date.now());
    const totalMs = cfg.durationHours * 3600 * 1000;
    const remainingMs = totalMs - elapsedMs;

    if (remainingMs <= 0) {
        badgeEl.style.background = '#fee2e2';
        badgeEl.style.color = '#991b1b';
        badgeEl.style.borderColor = '#fca5a5';
        badgeEl.innerText = '⌛ Tiempo Concluido';
        remainEl.innerHTML = `⌛ <strong>El lapso de ${cfg.durationHours} hora(s) ha finalizado.</strong> Puedes descargar el archivo ZIP final o reiniciar el conteo.`;
    } else {
        const hours = Math.floor(remainingMs / (3600 * 1000));
        const minutes = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
        const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);

        badgeEl.style.background = '#dcfce7';
        badgeEl.style.color = '#15803d';
        badgeEl.style.borderColor = '#86efac';
        badgeEl.innerText = '🟢 Recepción Abierta';
        remainEl.innerHTML = `⏳ Tiempo restante de subida activa: <strong>${hours}h ${minutes}m ${seconds}s</strong> (Ventana: ${cfg.durationHours} hrs)`;
    }
}

function canonicalizeTableName(rawTable, rawAuthor) {
    let t = (rawTable || '').trim();
    if (!t && rawAuthor) {
        const m = String(rawAuthor).match(/\((Mesa[^)]+)\)/i);
        if (m) t = m[1].trim();
    }
    if (!t) t = 'Mesa 1 - Mesa de Honor';

    const lower = t.toLowerCase();
    if (lower === 'mesa 1' || lower === 't1' || lower.startsWith('mesa 1 ')) return 'Mesa 1 - Mesa de Honor';
    if (lower === 'mesa 2' || lower === 't2' || lower.startsWith('mesa 2 ')) return 'Mesa 2 - Familia Novia';
    if (lower === 'mesa 3' || lower === 't3' || lower.startsWith('mesa 3 ')) return 'Mesa 3 - Familia Novio';
    if (lower === 'mesa 4' || lower === 't4' || lower.startsWith('mesa 4 ')) return 'Mesa 4 - Amigos Universidad';
    if (lower === 'mesa 5' || lower === 't5' || lower.startsWith('mesa 5 ')) return 'Mesa 5 - Amigos Empresa';
    return t;
}

function normalizeAlbumPhoto(p) {
    if (!p) return null;
    const table = canonicalizeTableName(p.table, p.author);
    let personName = (p.personName || '').trim();
    if (!personName) {
        personName = String(p.author || 'Invitado')
            .replace(/\s*\([^)]*\)\s*/g, '')
            .trim() || 'Invitado';
    }
    return {
        ...p,
        table,
        personName,
        author: `${personName} (${table})`
    };
}

function getStoredAlbumPhotos() {
    const key = getActiveAlbumStorageKey();
    try {
        const raw = localStorage.getItem(key);
        const localList = raw ? JSON.parse(raw) : [];
        const mergedMap = new Map();
        [...localList, ...defaultPhotos].forEach(rawP => {
            const p = normalizeAlbumPhoto(rawP);
            if (p && p.id && !mergedMap.has(p.id)) {
                mergedMap.set(p.id, p);
            }
        });
        return Array.from(mergedMap.values());
    } catch (e) {
        return defaultPhotos.map(normalizeAlbumPhoto).filter(Boolean);
    }
}

function savePhotoToPortalAlbum(photoObj) {
    const key = getActiveAlbumStorageKey();
    try {
        const normalized = normalizeAlbumPhoto(photoObj);
        const raw = localStorage.getItem(key);
        const localList = raw ? JSON.parse(raw) : [];
        if (!localList.some(p => p.id === normalized.id)) {
            localList.unshift(normalized);
            if (localList.length > 45) localList.pop();
            localStorage.setItem(key, JSON.stringify(localList));
        }
    } catch (e) {
        console.warn('Album localStorage warning:', e);
    }
}

function getAllWeddingTablesList(photos) {
    const data = typeof getWeddingState === 'function' ? getWeddingState(currentWeddingId) : (window.currentData || {});
    const baseTables = (data && Array.isArray(data.tables) && data.tables.length > 0)
        ? data.tables.map(t => canonicalizeTableName(t.name))
        : [
            'Mesa 1 - Mesa de Honor',
            'Mesa 2 - Familia Novia',
            'Mesa 3 - Familia Novio',
            'Mesa 4 - Amigos Universidad'
        ];

    const tableSet = new Set(baseTables);
    (photos || []).forEach(p => {
        if (p && p.table) tableSet.add(p.table);
    });
    return Array.from(tableSet);
}

function getPeopleForSelectedTable(tableName, photos) {
    const peopleMap = new Map(); // personName -> photoCount

    // 1. Add all authors who uploaded photos in this specific table
    (photos || []).filter(p => p.table === tableName).forEach(p => {
        const name = p.personName || 'Invitado';
        peopleMap.set(name, (peopleMap.get(name) || 0) + 1);
    });

    // 2. Also include CRM guests assigned to this table (with 0 photos if they haven't uploaded yet)
    const data = typeof getWeddingState === 'function' ? getWeddingState(currentWeddingId) : (window.currentData || {});
    if (data && Array.isArray(data.tables) && Array.isArray(data.guests)) {
        const matchedTableObj = data.tables.find(t => canonicalizeTableName(t.name) === tableName);
        if (matchedTableObj) {
            data.guests.filter(g => g.tableId === matchedTableObj.id).forEach(g => {
                if (g.name && !peopleMap.has(g.name)) {
                    peopleMap.set(g.name, 0);
                }
            });
        }
    }

    return Array.from(peopleMap.entries()).map(([name, count]) => ({ name, count }));
}

function onAlbumTableFilterChange(tableValue) {
    activeAlbumTableFilter = tableValue || 'ALL';
    activeAlbumPersonFilter = 'ALL'; // Reset dependent person filter whenever table changes
    renderAlbumGridAndBanner(getStoredAlbumPhotos());
}

function onAlbumPersonFilterChange(personValue) {
    activeAlbumPersonFilter = personValue || 'ALL';
    renderAlbumGridAndBanner(getStoredAlbumPhotos());
}

function resetAlbumFilters() {
    activeAlbumTableFilter = 'ALL';
    activeAlbumPersonFilter = 'ALL';
    renderAlbumGridAndBanner(getStoredAlbumPhotos());
    showToast('🔄 Mostrando todas las mesas y todas las personas.');
}

async function syncLiveAlbumFromServer(showFeedback = false) {
    const wId = (typeof currentWeddingId !== 'undefined' && currentWeddingId) ? currentWeddingId : 'aura';
    try {
        const res = await fetch(`/api/album?wedding=${encodeURIComponent(wId)}&t=${Date.now()}`);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.photos)) {
                const key = getActiveAlbumStorageKey();
                const raw = localStorage.getItem(key);
                const localList = raw ? JSON.parse(raw) : [];
                let newCount = 0;

                data.photos.forEach(sp => {
                    const norm = normalizeAlbumPhoto(sp);
                    const existsInDefault = defaultPhotos.some(dp => dp.id === norm.id);
                    const existsInLocal = localList.some(lp => lp.id === norm.id);
                    if (!existsInDefault && !existsInLocal) {
                        localList.unshift(norm);
                        newCount++;
                    }
                });

                if (newCount > 0) {
                    localStorage.setItem(key, JSON.stringify(localList.slice(0, 45)));
                }
                renderAlbumGridAndBanner(getStoredAlbumPhotos());
                if (showFeedback) {
                    showToast(newCount > 0
                        ? `📸 ¡${newCount} foto(s) nueva(s) sincronizada(s) desde los códigos QR!`
                        : `✅ Álbum sincronizado al día con los códigos QR de las mesas.`);
                }
                return;
            }
        }
    } catch (e) {}

    renderAlbumGridAndBanner(getStoredAlbumPhotos());
    if (showFeedback) {
        showToast(`✅ Álbum actualizado.`);
    }
}

function renderAlbumTab() {
    const photos = getStoredAlbumPhotos();
    renderAlbumGridAndBanner(photos);
    syncLiveAlbumFromServer(false);
    updateAlbumWindowTimerDisplay();

    if (albumWindowCountdownInterval) clearInterval(albumWindowCountdownInterval);
    albumWindowCountdownInterval = setInterval(() => {
        updateAlbumWindowTimerDisplay();
    }, 1000);

    if (albumAutoSyncTimer) clearInterval(albumAutoSyncTimer);
    albumAutoSyncTimer = setInterval(() => {
        const tabEl = document.getElementById('tab-album');
        if (tabEl && tabEl.classList.contains('active')) {
            syncLiveAlbumFromServer(false);
        }
    }, 6000);
}

function renderAlbumGridAndBanner(photos) {
    const grid = document.getElementById('albumLiveGrid');
    const banner = document.getElementById('albumStorageStatusBanner');
    const tablesSummaryGrid = document.getElementById('albumTablesDownloadSummaryGrid');
    const tableSelect = document.getElementById('albumFilterTableSelect');
    const personSelect = document.getElementById('albumFilterPersonSelect');
    const filterFeedback = document.getElementById('albumActiveFilterFeedback');
    const btnDownloadFiltered = document.getElementById('btnDownloadFilteredSelectionZip');

    if (!grid) return;

    const allTables = getAllWeddingTablesList(photos);
    const uploadedQrCount = photos.filter(p => p.uploadedViaQr || String(p.id).startsWith('qr_')).length;
    const approxTotalKb = photos.reduce((acc, p) => {
        if (p.url && p.url.startsWith('data:image')) {
            return acc + Math.round((p.url.length * 3) / 4 / 1024);
        }
        return acc + 65;
    }, 0);

    // 1. Render Top Storage & QR Service Status Banner
    if (banner) {
        const origin = (window.location.origin && window.location.origin.startsWith('http'))
            ? window.location.origin
            : 'https://wedding-admin-portal.vercel.app';
        const sampleQrUrl = `${origin}/album.html?wedding=${encodeURIComponent(currentWeddingId || 'aura')}&table=t1`;

        banner.innerHTML = `
            <div style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color:#ffffff; border-radius:16px; padding:16px 20px; border:1px solid #334155; box-shadow:0 8px 24px rgba(15,23,42,0.12);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
                    <div>
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px;">
                            <span style="background:#10b981; color:#052e16; font-size:0.7rem; font-weight:800; padding:3px 10px; border-radius:99px; text-transform:uppercase;">🟢 Servicio QR Activo</span>
                            <span style="background:rgba(245,158,11,0.2); border:1px solid rgba(245,158,11,0.5); color:#fde68a; font-size:0.7rem; font-weight:700; padding:3px 10px; border-radius:99px;">⚡ Compresión HTML5 Canvas (~80 KB/foto)</span>
                            <span style="background:rgba(239,68,68,0.2); border:1px solid rgba(248,113,113,0.45); color:#fecaca; font-size:0.7rem; font-weight:700; padding:3px 10px; border-radius:99px;">🧹 Regla SaaS: Auto-Borrado 15 Días Post-Boda</span>
                        </div>
                        <h3 style="margin:0 0 4px; font-size:0.98rem; color:#ffffff;">Motor de Recepción Fotográfica por Mesa (QR &rarr; Hasta 5 Fotos por Envío &rarr; Descarga Masiva por Mesa)</h3>
                        <p style="margin:0; font-size:0.78rem; color:#cbd5e1; line-height:1.45;">
                            Al escanear el QR de cada mesa se abre la cámara web móvil en <a href="${sampleQrUrl}" target="_blank" style="color:#38bdf8; text-decoration:underline; font-weight:700;">/album.html</a>. Cada foto queda etiquetada automáticamente con la <strong>Mesa</strong>, el <strong>Nombre/Familia</strong> y su <strong>Dedicatoria</strong>.
                        </p>
                    </div>
                    <div style="display:flex; gap:14px; background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:12px; border:1px solid rgba(255,255,255,0.12);">
                        <div style="text-align:center;">
                            <span style="display:block; font-size:0.68rem; color:#94a3b8; text-transform:uppercase;">Total Fotos</span>
                            <strong style="font-size:1.1rem; color:#ffffff;">${photos.length}</strong>
                        </div>
                        <div style="text-align:center; border-left:1px solid rgba(255,255,255,0.12); padding-left:14px;">
                            <span style="display:block; font-size:0.68rem; color:#94a3b8; text-transform:uppercase;">Mesas con Fotos</span>
                            <strong style="font-size:1.1rem; color:#34d399;">${allTables.length}</strong>
                        </div>
                        <div style="text-align:center; border-left:1px solid rgba(255,255,255,0.12); padding-left:14px;">
                            <span style="display:block; font-size:0.68rem; color:#94a3b8; text-transform:uppercase;">Peso Optimizado</span>
                            <strong style="font-size:1.1rem; color:#fbbf24;">~${approxTotalKb} KB</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 2. Render Table Summary Cards with Direct Per-Table Bulk Download (.ZIP)
    if (tablesSummaryGrid) {
        tablesSummaryGrid.innerHTML = allTables.map(tName => {
            const tablePhotos = photos.filter(p => p.table === tName);
            const isSelected = activeAlbumTableFilter === tName;
            const uniqueAuthors = [...new Set(tablePhotos.map(p => p.personName))];
            const safeTName = escapeHtmlText(tName);
            const jsSafeTName = tName.replace(/'/g, "\\'");

            return `
                <div style="background:${isSelected ? '#fef3c7' : '#f8fafc'}; border:2px solid ${isSelected ? '#d97706' : '#e2e8f0'}; border-radius:12px; padding:12px 14px; display:flex; flex-direction:column; justify-content:space-between; gap:8px; transition:all 0.2s;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:4px;">
                            <strong style="font-size:0.82rem; color:#0f172a;">📍 ${safeTName}</strong>
                            <span style="background:${tablePhotos.length > 0 ? '#059669' : '#94a3b8'}; color:#ffffff; font-size:0.68rem; font-weight:800; padding:2px 8px; border-radius:99px;">
                                ${tablePhotos.length} foto${tablePhotos.length === 1 ? '' : 's'}
                            </span>
                        </div>
                        <p style="margin:0; font-size:0.72rem; color:#64748b;">
                            ${uniqueAuthors.length > 0
                                ? `👥 ${uniqueAuthors.slice(0, 2).map(escapeHtmlText).join(', ')}${uniqueAuthors.length > 2 ? ` +${uniqueAuthors.length - 2} más` : ''}`
                                : 'Sin fotos subidas aún'}
                        </p>
                    </div>
                    <div style="display:flex; gap:6px; margin-top:4px;">
                        <button type="button" onclick="onAlbumTableFilterChange('${jsSafeTName}')" style="flex:1; background:${isSelected ? '#d97706' : '#ffffff'}; color:${isSelected ? '#ffffff' : '#334155'}; border:1px solid ${isSelected ? '#d97706' : '#cbd5e1'}; padding:6px 8px; border-radius:8px; font-size:0.72rem; font-weight:700; cursor:pointer;">
                            ${isSelected ? '✓ Viendo Mesa' : '🔍 Ver Mesa'}
                        </button>
                        <button type="button" onclick="downloadBulkPhotosByTableZip('${jsSafeTName}')" ${tablePhotos.length === 0 ? 'disabled' : ''} style="flex:1; background:${tablePhotos.length > 0 ? '#0f172a' : '#e2e8f0'}; color:${tablePhotos.length > 0 ? '#ffffff' : '#94a3b8'}; border:none; padding:6px 8px; border-radius:8px; font-size:0.72rem; font-weight:700; cursor:${tablePhotos.length > 0 ? 'pointer' : 'not-allowed'};">
                            📥 Descargar (${tablePhotos.length})
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 3. Populate Filter 1 (Mesa) & Dependent Filter 2 (Persona in that Mesa)
    if (tableSelect) {
        tableSelect.innerHTML = `<option value="ALL">📋 Todas las Mesas (${photos.length} fotos en total)</option>` +
            allTables.map(tName => {
                const count = photos.filter(p => p.table === tName).length;
                const selectedAttr = activeAlbumTableFilter === tName ? 'selected' : '';
                return `<option value="${escapeHtmlText(tName)}" ${selectedAttr}>📍 ${escapeHtmlText(tName)} (${count} foto${count === 1 ? '' : 's'})</option>`;
            }).join('');
    }

    if (personSelect) {
        if (activeAlbumTableFilter === 'ALL') {
            personSelect.disabled = true;
            personSelect.style.background = '#f1f5f9';
            personSelect.style.cursor = 'not-allowed';
            personSelect.innerHTML = `<option value="ALL">👈 Selecciona primero una Mesa en el Paso 1</option>`;
        } else {
            personSelect.disabled = false;
            personSelect.style.background = '#ffffff';
            personSelect.style.cursor = 'pointer';

            const peopleInTable = getPeopleForSelectedTable(activeAlbumTableFilter, photos);
            const tablePhotoCount = photos.filter(p => p.table === activeAlbumTableFilter).length;

            personSelect.innerHTML = `<option value="ALL">👥 Todas las personas de ${escapeHtmlText(activeAlbumTableFilter)} (${tablePhotoCount} fotos)</option>` +
                peopleInTable.map(person => {
                    const selectedAttr = activeAlbumPersonFilter === person.name ? 'selected' : '';
                    return `<option value="${escapeHtmlText(person.name)}" ${selectedAttr}>👤 ${escapeHtmlText(person.name)} (${person.count} foto${person.count === 1 ? '' : 's'})</option>`;
                }).join('');
        }
    }

    // 4. Filter Photos Based on Active Cascade (Mesa -> Persona)
    let filteredPhotos = photos;
    if (activeAlbumTableFilter !== 'ALL') {
        filteredPhotos = filteredPhotos.filter(p => p.table === activeAlbumTableFilter);
        if (activeAlbumPersonFilter !== 'ALL') {
            filteredPhotos = filteredPhotos.filter(p => p.personName === activeAlbumPersonFilter);
        }
    }

    if (btnDownloadFiltered) {
        if (activeAlbumTableFilter !== 'ALL' && filteredPhotos.length > 0) {
            btnDownloadFiltered.style.display = 'inline-flex';
            btnDownloadFiltered.innerText = activeAlbumPersonFilter !== 'ALL'
                ? `📥 Descargar Fotos de ${activeAlbumPersonFilter} (${filteredPhotos.length}) (.ZIP)`
                : `📥 Descargar ${activeAlbumTableFilter} (${filteredPhotos.length}) (.ZIP)`;
        } else {
            btnDownloadFiltered.style.display = 'none';
        }
    }

    if (filterFeedback) {
        if (activeAlbumTableFilter === 'ALL') {
            filterFeedback.innerHTML = `Mostrando <strong>todas las ${photos.length} fotos</strong> de todas las mesas. Selecciona una <strong>Mesa</strong> arriba para habilitar el filtro de <strong>Personas de esa mesa</strong> y ver sus dedicatorias.`;
        } else if (activeAlbumPersonFilter === 'ALL') {
            filterFeedback.innerHTML = `📍 Viendo <strong>${escapeHtmlText(activeAlbumTableFilter)}</strong> (${filteredPhotos.length} foto${filteredPhotos.length === 1 ? '' : 's'}). Ahora puedes elegir una <strong>Persona / Familia</strong> en el Paso 2 para ver exactamente qué mensaje les dejó.`;
        } else {
            const messagesList = filteredPhotos.map(p => `"${escapeHtmlText(p.caption)}"`).join(' &bull; ');
            filterFeedback.innerHTML = `
                <div style="background:#fef3c7; border:1px solid #f59e0b; color:#92400e; padding:10px 14px; border-radius:10px; margin-top:4px;">
                    <strong>💌 Dedicatoria de ${escapeHtmlText(activeAlbumPersonFilter)} (${escapeHtmlText(activeAlbumTableFilter)}):</strong><br>
                    <span style="font-size:0.84rem; color:#78350f;">${messagesList || 'Sin fotos subidas todavía por este invitado.'}</span>
                </div>
            `;
        }
    }

    // 5. Render Photo Cards Grid
    if (filteredPhotos.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding:40px 20px; background:#ffffff; border:1px dashed #cbd5e1; border-radius:16px; color:#64748b;">
                <div style="font-size:2.2rem; margin-bottom:8px;">📸</div>
                <strong style="display:block; color:#0f172a; font-size:0.95rem; margin-bottom:4px;">No hay fotos para este filtro todavía</strong>
                <p style="margin:0 0 12px; font-size:0.82rem;">Este invitado o mesa aún no ha subido fotografías desde su código QR.</p>
                <button type="button" class="btn-action secondary" onclick="resetAlbumFilters()">🔄 Ver Todas las Mesas</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredPhotos.map(p => `
        <div class="photo-album-card" style="position:relative;">
            <div style="position:absolute; top:10px; left:10px; right:10px; display:flex; justify-content:space-between; align-items:center; gap:6px; pointer-events:none;">
                <span style="background:rgba(15,23,42,0.85); color:#fde68a; font-size:0.68rem; font-weight:800; padding:4px 10px; border-radius:99px; box-shadow:0 2px 8px rgba(0,0,0,0.25);">
                    📍 ${escapeHtmlText(p.table)}
                </span>
                ${p.uploadedViaQr || String(p.id).startsWith('qr_') ? `
                    <span style="background:#059669; color:#ffffff; font-size:0.66rem; font-weight:800; padding:3px 9px; border-radius:99px; box-shadow:0 2px 8px rgba(0,0,0,0.25);">📱 QR en Vivo</span>
                ` : ''}
            </div>
            <img src="${p.url}" alt="${escapeHtmlText(p.caption)}" class="photo-album-img" loading="lazy">
            <div class="photo-album-meta">
                <p class="photo-caption" style="font-weight:600; color:#0f172a; margin-bottom:8px;">"💌 ${escapeHtmlText(p.caption)}"</p>
                <div class="photo-author-row" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap;">
                    <span style="font-size:0.8rem; color:#1e293b;">👤 <strong>${escapeHtmlText(p.personName)}</strong></span>
                    <span class="text-xs text-muted">${escapeHtmlText(p.time || 'Hace un momento')}</span>
                </div>
                <div style="display:flex; justify-content:space-between; gap:6px; border-top:1px solid #f1f5f9; padding-top:8px;">
                    <a href="${p.url}" download="Foto-${sanitizeFileName(p.table)}-${sanitizeFileName(p.personName)}.jpg" target="_blank" style="font-size:0.72rem; font-weight:700; color:#0f172a; text-decoration:none; background:#f1f5f9; padding:5px 10px; border-radius:6px;">⬇️ Individual</a>
                    <button type="button" onclick="onAlbumTableFilterChange('${p.table.replace(/'/g, "\\'")}'); onAlbumPersonFilterChange('${p.personName.replace(/'/g, "\\'")}');" style="font-size:0.72rem; font-weight:700; color:#b45309; background:#fef3c7; border:1px solid #fde68a; padding:5px 10px; border-radius:6px; cursor:pointer;">👤 Ver de ${escapeHtmlText(p.personName.split(' ')[0])}</button>
                    <button type="button" onclick="deleteAlbumPhoto('${p.id}')" style="font-size:0.72rem; font-weight:700; color:#dc2626; background:#fef2f2; border:1px solid #fecaca; padding:5px 8px; border-radius:6px; cursor:pointer;" title="Eliminar foto">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}

function sanitizeFileName(str) {
    return String(str || 'Foto')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

async function fetchPhotoAsBase64Jpg(url) {
    if (!url) return null;
    if (url.startsWith('data:image')) {
        const commaIdx = url.indexOf(',');
        return commaIdx !== -1 ? url.substring(commaIdx + 1) : null;
    }

    try {
        const response = await fetch(url, { mode: 'cors' });
        const blob = await response.blob();
        return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = String(reader.result || '');
                const commaIdx = res.indexOf(',');
                resolve(commaIdx !== -1 ? res.substring(commaIdx + 1) : null);
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        return null;
    }
}

async function downloadBulkPhotosByTableZip(targetTable = 'ALL', targetPerson = 'ALL') {
    const allPhotos = getStoredAlbumPhotos();
    let photosToPack = allPhotos;

    if (targetTable !== 'ALL') {
        photosToPack = photosToPack.filter(p => p.table === targetTable);
    }
    if (targetPerson !== 'ALL') {
        photosToPack = photosToPack.filter(p => p.personName === targetPerson);
    }

    if (photosToPack.length === 0) {
        showToast('⚠️ No hay fotos en esta mesa o selección para descargar.');
        return;
    }

    if (typeof window.JSZip === 'undefined') {
        showToast('⚠️ Cargando motor de compresión ZIP, intenta en un segundo...');
        return;
    }

    showToast(`📦 Empaquetando ${photosToPack.length} foto(s) organizadas por Mesa en archivo .ZIP...`);

    const zip = new window.JSZip();
    const data = typeof getWeddingState === 'function' ? getWeddingState(currentWeddingId) : (window.currentData || {});
    const coupleName = (data && data.couple) ? data.couple : 'Sofia_y_Alejandro';

    // Group photos by Table
    const groupedByTable = {};
    photosToPack.forEach(p => {
        const tName = p.table || 'Mesa 1 - Mesa de Honor';
        if (!groupedByTable[tName]) groupedByTable[tName] = [];
        groupedByTable[tName].push(p);
    });

    let masterSummaryText = `=================================================================\n`;
    masterSummaryText += `ÁLBUM COLABORATIVO DE BODA: ${coupleName.toUpperCase()}\n`;
    masterSummaryText += `REPORTE DE FOTOS Y DEDICATORIAS SEPARADO POR MESAS\n`;
    masterSummaryText += `=================================================================\n\n`;

    for (const [tableName, tablePhotos] of Object.entries(groupedByTable)) {
        const folderName = sanitizeFileName(tableName);
        const tableFolder = zip.folder(folderName);

        let tableDedicationsText = `📍 ${tableName.toUpperCase()} — (${tablePhotos.length} FOTOS SUBIDAS)\n`;
        tableDedicationsText += `-----------------------------------------------------------------\n`;

        masterSummaryText += `\n📍 ${tableName.toUpperCase()} (${tablePhotos.length} fotos):\n`;

        for (let i = 0; i < tablePhotos.length; i++) {
            const p = tablePhotos[i];
            const indexNum = String(i + 1).padStart(2, '0');
            const cleanPerson = sanitizeFileName(p.personName || 'Invitado');
            const fileName = `${indexNum}_${cleanPerson}.jpg`;

            tableDedicationsText += `${indexNum}. Invitado/Familia: ${p.personName}\n`;
            tableDedicationsText += `    Hora: ${p.time || 'En vivo'}\n`;
            tableDedicationsText += `    Dedicatoria: "${p.caption}"\n`;
            tableDedicationsText += `    Archivo de foto: ${fileName}\n\n`;

            masterSummaryText += `   - [${fileName}] ${p.personName}: "${p.caption}" (${p.time || 'En vivo'})\n`;

            const base64Data = await fetchPhotoAsBase64Jpg(p.url);
            if (base64Data && tableFolder) {
                tableFolder.file(fileName, base64Data, { base64: true });
            }
        }

        if (tableFolder) {
            tableFolder.file(`Dedicatorias_${folderName}.txt`, tableDedicationsText);
        }
    }

    zip.file(`Resumen_General_Dedicatorias_Por_Mesa.txt`, masterSummaryText);

    try {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const downloadUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;

        if (targetTable === 'ALL') {
            a.download = `Album_Por_Mesas_${sanitizeFileName(coupleName)}.zip`;
        } else if (targetPerson !== 'ALL') {
            a.download = `Fotos_${sanitizeFileName(targetTable)}_${sanitizeFileName(targetPerson)}.zip`;
        } else {
            a.download = `Fotos_${sanitizeFileName(targetTable)}.zip`;
        }

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 4000);

        showToast(`✅ ¡Descarga masiva lista! (${photosToPack.length} fotos separadas por mesa con sus dedicatorias).`);
    } catch (err) {
        console.error('Error generating ZIP:', err);
        showToast('⚠️ No se pudo generar el archivo ZIP.');
    }
}

function downloadCurrentFilteredPhotosZip() {
    downloadBulkPhotosByTableZip(activeAlbumTableFilter, activeAlbumPersonFilter);
}

function compressPortalImageFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(evt) {
            const img = new Image();
            img.onload = function() {
                const MAX_DIM = 900;
                let width = img.width;
                let height = img.height;

                if (width > height && width > MAX_DIM) {
                    height = Math.round((height * MAX_DIM) / width);
                    width = MAX_DIM;
                } else if (height > MAX_DIM) {
                    width = Math.round((width * MAX_DIM) / height);
                    height = MAX_DIM;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', 0.78));
            };
            img.onerror = () => resolve(null);
            img.src = evt.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}

async function handlePortalPhotoUpload(inputEl) {
    const rawFiles = Array.from((inputEl && inputEl.files) || []);
    if (rawFiles.length === 0) return;

    const files = rawFiles.slice(0, 5);
    if (rawFiles.length > 5) {
        showToast('⚠️ Se seleccionaron las primeras 5 fotos (máximo 5 por envío).');
    }

    const chosenTable = activeAlbumTableFilter !== 'ALL' ? activeAlbumTableFilter : 'Mesa 1 - Mesa de Honor';
    const chosenPerson = activeAlbumPersonFilter !== 'ALL'
        ? activeAlbumPersonFilter
        : (activeRole === 'couple' ? 'Sofía & Alejandro' : (activeRole === 'developer' ? 'Master Developer' : 'Wedding Planner'));

    const wId = (typeof currentWeddingId !== 'undefined' && currentWeddingId) ? currentWeddingId : 'aura';
    const timeLabel = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) + ' hrs (En Vivo)';

    for (let i = 0; i < files.length; i++) {
        const compressedDataUrl = await compressPortalImageFile(files[i]);
        if (!compressedDataUrl) continue;

        const newPhoto = {
            id: 'qr_' + Date.now() + '_' + i,
            personName: chosenPerson,
            author: `${chosenPerson} (${chosenTable})`,
            table: chosenTable,
            time: timeLabel,
            url: compressedDataUrl,
            caption: files.length > 1
                ? `¡Momento compartido en el Álbum Colaborativo! (${i + 1}/${files.length}) 📸✨`
                : '¡Momento compartido en el Álbum Colaborativo! 📸✨',
            uploadedViaQr: true
        };

        savePhotoToPortalAlbum(newPhoto);

        try {
            await fetch(`/api/album?wedding=${encodeURIComponent(wId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weddingId: wId,
                    id: newPhoto.id,
                    personName: newPhoto.personName,
                    author: newPhoto.author,
                    table: newPhoto.table,
                    caption: newPhoto.caption,
                    url: newPhoto.url
                })
            });
        } catch (e) {}
    }

    renderAlbumGridAndBanner(getStoredAlbumPhotos());
    showToast(`📸 ¡${files.length} foto(s) agregada(s) en ${chosenTable} (${chosenPerson})!`);
    inputEl.value = '';
}

async function deleteAlbumPhoto(photoId) {
    const key = getActiveAlbumStorageKey();
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const list = JSON.parse(raw).filter(p => p.id !== photoId);
            localStorage.setItem(key, JSON.stringify(list));
        }
    } catch (e) {}

    const idx = defaultPhotos.findIndex(p => p.id === photoId);
    if (idx !== -1) defaultPhotos.splice(idx, 1);

    const wId = (typeof currentWeddingId !== 'undefined' && currentWeddingId) ? currentWeddingId : 'aura';
    try {
        await fetch(`/api/album?wedding=${encodeURIComponent(wId)}&id=${encodeURIComponent(photoId)}`, {
            method: 'DELETE'
        });
    } catch (e) {}

    renderAlbumGridAndBanner(getStoredAlbumPhotos());
    showToast('🗑️ Foto eliminada del álbum.');
}

function simulateUploadPhoto() {
    const fileInput = document.getElementById('portalRealPhotoUploadInput');
    if (fileInput) {
        fileInput.click();
    }
}

function renderPlaylistTab() {
    renderSpotifyAccountBanner();
    renderSavedDJPlaylist();
    const resultsContainer = document.getElementById('liveSongSearchResults');
    if (resultsContainer && resultsContainer.children.length === 0) {
        fetchLiveMusicCatalog('Luis Miguel Dua Lipa Coldplay');
    } else {
        renderActivePlayerDeck();
    }
}

function focusLiveSongSearch() {
    const input = document.getElementById('liveSongSearchInput');
    if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => input.focus(), 200);
    }
}

function clearLiveSongSearch() {
    const input = document.getElementById('liveSongSearchInput');
    const clearBtn = document.getElementById('btnClearLiveSearch');
    if (input) input.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    fetchLiveMusicCatalog('Fiesta Boda Hits');
}

function quickSearchMusicVibe(query) {
    const input = document.getElementById('liveSongSearchInput');
    const clearBtn = document.getElementById('btnClearLiveSearch');
    if (input) input.value = query;
    if (clearBtn) clearBtn.style.display = 'flex';
    fetchLiveMusicCatalog(query);
}

function handleLiveSongSearchInput(value) {
    const q = (value || '').trim();
    const clearBtn = document.getElementById('btnClearLiveSearch');
    if (clearBtn) clearBtn.style.display = q.length > 0 ? 'flex' : 'none';

    if (liveSearchDebounceTimer) clearTimeout(liveSearchDebounceTimer);

    if (q.length === 0) {
        renderLiveSearchResults(initialCatalogSuggestions);
        return;
    }

    if (q.includes('open.spotify.com/')) {
        handlePastedSpotifyLink(q);
        return;
    }

    const resultsBox = document.getElementById('liveSongSearchResults');
    if (resultsBox) {
        resultsBox.innerHTML = `
            <div class="dj-search-loading">
                <span>⏳ Filtrando <strong>"${escapeHtmlText(q)}"</strong> y conectando con el reproductor...</span>
            </div>
        `;
    }

    liveSearchDebounceTimer = setTimeout(() => {
        fetchLiveMusicCatalog(q);
    }, 250);
}

function handlePastedSpotifyLink(url) {
    const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/);
    const playlistMatch = url.match(/playlist\/([a-zA-Z0-9]+)/);
    const iframe = document.getElementById('spotifyEmbedIframe');
    if (trackMatch && trackMatch[1] && iframe) {
        iframe.src = `https://open.spotify.com/embed/track/${trackMatch[1]}?utm_source=generator&theme=0`;
        showToast('🟢 Canción de Spotify cargada directamente en el Reproductor Oficial.');
    } else if (playlistMatch && playlistMatch[1] && iframe) {
        iframe.src = `https://open.spotify.com/embed/playlist/${playlistMatch[1]}?utm_source=generator&theme=0`;
        showToast('🟢 Playlist de Spotify cargada directamente en el Reproductor Oficial.');
    }
}

async function fetchLiveMusicCatalog(query) {
    const resultsBox = document.getElementById('liveSongSearchResults');
    if (!resultsBox) return;

    try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=6&country=MX`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response error');
        const data = await response.json();

        if (data && Array.isArray(data.results) && data.results.length > 0) {
            currentLiveSearchResults = data.results.map(item => ({
                trackId: String(item.trackId || ('t_' + Math.random().toString(36).slice(2, 8))),
                title: item.trackName || query,
                artist: item.artistName || 'Artista',
                album: item.collectionName || 'Edición Estudio',
                cover: (item.artworkUrl100 || '').replace('100x100bb', '300x300bb'),
                previewUrl: item.previewUrl || ''
            }));
            selectedDeckTrack = currentLiveSearchResults[0];
            renderLiveSearchResults(currentLiveSearchResults, query);
            renderActivePlayerDeck();
        } else {
            currentLiveSearchResults = [{
                trackId: 'custom_' + Date.now(),
                title: query,
                artist: 'Canción Personalizada / Especial',
                album: 'Solicitud Directa al DJ',
                cover: '',
                previewUrl: ''
            }];
            selectedDeckTrack = currentLiveSearchResults[0];
            renderLiveSearchResults(currentLiveSearchResults, query);
            renderActivePlayerDeck();
        }
    } catch (err) {
        const lower = query.toLowerCase();
        const filtered = initialCatalogSuggestions.filter(
            s => s.title.toLowerCase().includes(lower) || s.artist.toLowerCase().includes(lower)
        );
        currentLiveSearchResults = filtered.length > 0 ? filtered : [{
            trackId: 'custom_' + Date.now(),
            title: query,
            artist: 'Solicitud Directa para Cabina DJ',
            album: 'Setlist Personalizado',
            cover: '',
            previewUrl: ''
        }];
        selectedDeckTrack = currentLiveSearchResults[0];
        renderLiveSearchResults(currentLiveSearchResults, query);
        renderActivePlayerDeck();
    }
}

function renderLiveSearchResults(results) {
    const resultsBox = document.getElementById('liveSongSearchResults');
    if (!resultsBox) return;

    resultsBox.innerHTML = results.map((track, idx) => {
        const alreadyInList = defaultPlaylist.find(
            s => s.title.toLowerCase() === track.title.toLowerCase() && s.artist.toLowerCase() === track.artist.toLowerCase()
        );
        const isSelectedInDeck = selectedDeckTrack && selectedDeckTrack.trackId === track.trackId;
        const isPlaying = activeAudioTrackId === track.trackId && activeAudioPlayer && !activeAudioPlayer.paused;

        return `
            <div class="dj-live-track-card ${alreadyInList ? 'in-playlist' : ''} ${isSelectedInDeck ? 'selected-in-deck' : ''}" onclick="loadTrackIntoVerificationDeck(${idx}, false)" style="cursor:pointer;">
                <div class="dj-live-track-left">
                    ${track.cover
                        ? `<img src="${track.cover}" alt="${escapeHtmlText(track.title)}" class="dj-track-cover">`
                        : `<div class="dj-track-cover-fallback">🎵</div>`
                    }
                    <div class="dj-live-track-meta">
                        <strong class="dj-live-track-title">${escapeHtmlText(track.title)}</strong>
                        <span class="dj-live-track-artist">${escapeHtmlText(track.artist)}</span>
                        <small style="display:block; font-size:0.68rem; color:#94a3b8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">💿 ${escapeHtmlText(track.album || 'Versión Oficial')}</small>
                        <div class="dj-live-track-platforms">
                            <button type="button" class="btn-track-preview ${isPlaying ? 'playing' : ''}" onclick="event.stopPropagation(); loadTrackIntoVerificationDeck(${idx}, true)">
                                ${isPlaying ? '⏸ Sonando en Cabina' : '🎧 Probar en Reproductor'}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="dj-live-track-right">
                    <button type="button" class="btn-add-track-instant ${alreadyInList ? 'added' : ''}" onclick="event.stopPropagation(); addTrackFromSearchByIndex(${idx})">
                        ${alreadyInList ? `❤️ +1 Voto` : `➕ Clasificar`}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function loadTrackIntoVerificationDeck(idx, autoPlay = true) {
    const track = currentLiveSearchResults[idx];
    if (!track) return;

    selectedDeckTrack = track;
    renderLiveSearchResults(currentLiveSearchResults);
    renderActivePlayerDeck(autoPlay);

    if (autoPlay && track.previewUrl) {
        toggleTrackPreview(track.trackId, track.previewUrl, true);
    }

    if (autoPlay && window.innerWidth <= 900) {
        const deckEl = document.getElementById('djActivePlayerDeck');
        if (deckEl) deckEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function renderActivePlayerDeck() {
    const deck = document.getElementById('djActivePlayerDeck');
    if (!deck) return;

    const track = selectedDeckTrack || currentLiveSearchResults[0] || defaultPlaylist[0];
    if (!track) {
        deck.innerHTML = `<div style="padding:14px; color:#64748b; font-size:0.82rem;">Selecciona cualquier canción en el buscador para cargarla aquí y verificar su audio.</div>`;
        return;
    }

    const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(track.title + ' ' + track.artist)}`;
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(track.title + ' ' + track.artist)}`;

    deck.innerHTML = `
        <div class="dj-deck-inner">
            <div class="dj-deck-top">
                ${track.cover
                    ? `<img src="${track.cover}" alt="${escapeHtmlText(track.title)}" class="dj-deck-cover-lg">`
                    : `<div class="dj-deck-cover-fallback">💿</div>`
                }
                <div class="dj-deck-info">
                    <span class="dj-deck-status-pill">🎯 CANCIÓN CARGADA PARA VERIFICAR VERSIÓN</span>
                    <h4 class="dj-deck-title">${escapeHtmlText(track.title)}</h4>
                    <p class="dj-deck-artist">${escapeHtmlText(track.artist)}</p>
                    <small class="dj-deck-album">Álbum / Versión: <strong>${escapeHtmlText(track.album || 'Original')}</strong></small>
                </div>
            </div>

            ${track.previewUrl ? `
                <div class="dj-deck-audio-box">
                    <audio id="djDeckNativeAudio" controls preload="none" src="${track.previewUrl}" style="width:100%; height:36px;"></audio>
                </div>
            ` : `
                <div style="font-size:0.75rem; color:#94a3b8; padding:6px 0;">Sin fragmento directo — puedes verificarla en Spotify o YouTube:</div>
            `}

            <div style="margin-bottom:8px;">
                <span style="font-size:0.68rem; font-weight:800; color:#fbbf24; text-transform:uppercase; display:block; margin-bottom:5px;">⚡ Agregar esta versión verificada como:</span>
                <div class="dj-deck-3cat-grid">
                    <button type="button" class="btn-deck-cat protocol" onclick="addCurrentlyLoadedDeckTrack('protocol')">
                        👑 Protocolo / Vals
                    </button>
                    <button type="button" class="btn-deck-cat party" onclick="addCurrentlyLoadedDeckTrack('party')">
                        🔥 Sugerencia Pista
                    </button>
                    <button type="button" class="btn-deck-cat blacklist" onclick="addCurrentlyLoadedDeckTrack('blacklist')">
                        🚫 Vetar (Do Not Play)
                    </button>
                </div>
            </div>

            <div class="dj-deck-actions-row">
                <div class="dj-deck-ext-btns" style="width:100%;">
                    <a href="${spotifySearchUrl}" target="_blank" rel="noopener" class="btn-platform-pill spotify" style="flex:1; text-align:center;">🟢 Abrir en Spotify</a>
                    <a href="${youtubeSearchUrl}" target="_blank" rel="noopener" class="btn-platform-pill youtube" style="flex:1; text-align:center;">🔴 Ver en YouTube</a>
                </div>
            </div>
        </div>
    `;
}

function addCurrentlyLoadedDeckTrack(forcedCategory = null) {
    if (!selectedDeckTrack) return;
    const catSelect = document.getElementById('liveSongCategorySelect');
    const chosenCat = forcedCategory || (catSelect ? catSelect.value : 'party');
    const idx = currentLiveSearchResults.findIndex(t => t.trackId === selectedDeckTrack.trackId);
    if (idx >= 0) {
        addTrackFromSearchByIndex(idx, chosenCat);
    } else {
        const requesterInput = document.getElementById('liveSongRequesterInput');
        const defaultNote = chosenCat === 'protocol'
            ? 'Momento de Protocolo Oficial'
            : chosenCat === 'blacklist'
                ? 'Vetada por los Novios — Prohibido tocar'
                : 'Sugerencia Pre-Boda (RSVP)';
        const requestedBy = (requesterInput && requesterInput.value.trim()) ? requesterInput.value.trim() : defaultNote;

        defaultPlaylist.unshift({
            id: 's_' + Date.now(),
            title: selectedDeckTrack.title,
            artist: selectedDeckTrack.artist,
            album: selectedDeckTrack.album || 'Versión Oficial',
            category: chosenCat,
            requestedBy,
            votes: chosenCat === 'blacklist' ? 0 : 1,
            cover: selectedDeckTrack.cover || '',
            previewUrl: selectedDeckTrack.previewUrl || ''
        });
        renderSavedDJPlaylist();
        renderActivePlayerDeck();
        showToast(getCategoryToastMessage(selectedDeckTrack.title, chosenCat));
    }
}

function getCategoryToastMessage(title, category) {
    if (category === 'protocol') return `👑 "${title}" registrada en Momentos de Protocolo Oficial.`;
    if (category === 'blacklist') return `🚫 "${title}" agregada a la Lista Negra (Prohibido Tocar).`;
    return `🔥 "${title}" agregada a Sugerencias Pre-Boda para Pista.`;
}

function toggleTrackPreview(trackId, previewUrl, forcePlay = false) {
    if (!previewUrl) return;

    const deckAudio = document.getElementById('djDeckNativeAudio');
    if (deckAudio && deckAudio.src === previewUrl) {
        if (deckAudio.paused || forcePlay) {
            deckAudio.play().catch(() => {});
            activeAudioTrackId = trackId;
            activeAudioPlayer = deckAudio;
        } else {
            deckAudio.pause();
            activeAudioTrackId = null;
        }
        renderLiveSearchResults(currentLiveSearchResults);
        return;
    }

    if (activeAudioPlayer && activeAudioTrackId === trackId && !forcePlay) {
        if (activeAudioPlayer.paused) {
            activeAudioPlayer.play();
        } else {
            activeAudioPlayer.pause();
        }
        renderLiveSearchResults(currentLiveSearchResults);
        renderSavedDJPlaylist();
        return;
    }

    if (activeAudioPlayer) {
        activeAudioPlayer.pause();
    }

    activeAudioTrackId = trackId;
    activeAudioPlayer = new Audio(previewUrl);
    activeAudioPlayer.volume = 0.85;
    activeAudioPlayer.play().catch(() => {});

    activeAudioPlayer.onended = () => {
        activeAudioTrackId = null;
        renderLiveSearchResults(currentLiveSearchResults);
        renderSavedDJPlaylist();
    };

    renderLiveSearchResults(currentLiveSearchResults);
    renderSavedDJPlaylist();
}

function addTrackFromSearchByIndex(idx, forcedCategory = null) {
    const track = currentLiveSearchResults[idx];
    if (!track) return;

    selectedDeckTrack = track;
    const catSelect = document.getElementById('liveSongCategorySelect');
    const chosenCat = forcedCategory || (catSelect ? catSelect.value : 'party');

    const requesterInput = document.getElementById('liveSongRequesterInput');
    let requestedBy = (requesterInput && requesterInput.value.trim()) ? requesterInput.value.trim() : 'Novios (Briefing Pre-Boda)';
    if (chosenCat === 'blacklist' && requestedBy === 'Novios (Briefing Pre-Boda)') {
        requestedBy = 'Vetada por los Novios — Prohibido tocar en cabina';
    } else if (chosenCat === 'protocol' && requestedBy === 'Novios (Briefing Pre-Boda)') {
        requestedBy = 'Protocolo Oficial — Reproducir versión exacta';
    }

    const existing = defaultPlaylist.find(
        s => s.title.toLowerCase() === track.title.toLowerCase() && s.artist.toLowerCase() === track.artist.toLowerCase()
    );

    if (existing) {
        existing.category = chosenCat;
        if (chosenCat !== 'blacklist') existing.votes = (existing.votes || 0) + 1;
        if (!existing.cover && track.cover) existing.cover = track.cover;
        if (!existing.previewUrl && track.previewUrl) existing.previewUrl = track.previewUrl;
        showToast(getCategoryToastMessage(track.title, chosenCat));
    } else {
        defaultPlaylist.unshift({
            id: 's_' + Date.now(),
            title: track.title,
            artist: track.artist,
            album: track.album || 'Versión Oficial',
            category: chosenCat,
            requestedBy: requestedBy,
            votes: chosenCat === 'blacklist' ? 0 : 1,
            cover: track.cover || '',
            previewUrl: track.previewUrl || ''
        });
        showToast(getCategoryToastMessage(track.title, chosenCat));
    }

    renderLiveSearchResults(currentLiveSearchResults);
    renderActivePlayerDeck();
    renderSavedDJPlaylist();
}

function changeSpotifyWidgetPlaylist(playlistId) {
    const iframe = document.getElementById('spotifyEmbedIframe');
    if (!iframe || !playlistId) return;
    iframe.src = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
    showToast('🎧 Playlist de referencia cargada en el reproductor de Spotify.');
}

// ==========================================================================
// 3. SAVED DJ PLAYLIST LISTING, 3-CATEGORY TABS & INSTANT FILTERING
// ==========================================================================

function setSavedPlaylistCategoryFilter(cat) {
    savedPlaylistCategoryFilter = cat || 'all';
    document.querySelectorAll('#djCategoryTabsBar .dj-cat-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === savedPlaylistCategoryFilter);
    });
    renderSavedDJPlaylist();
}

function changeSongCategoryInline(songId, newCat) {
    const s = defaultPlaylist.find(item => item.id === songId);
    if (!s) return;
    s.category = newCat;
    if (newCat === 'blacklist') {
        s.votes = 0;
        if (!s.requestedBy.toLowerCase().includes('vetada')) {
            s.requestedBy = `Vetada por Novios (Antes: ${s.requestedBy})`;
        }
    }
    renderSavedDJPlaylist();
    showToast(getCategoryToastMessage(s.title, newCat));
}

function filterSavedDJPlaylist(query) {
    savedPlaylistFilterQuery = (query || '').trim().toLowerCase();
    renderSavedDJPlaylist();
}

function setSavedPlaylistSort(mode) {
    savedPlaylistSortMode = mode || 'votes';
    renderSavedDJPlaylist();
}

function previewSavedSongInDeck(songId) {
    const s = defaultPlaylist.find(item => item.id === songId);
    if (!s) return;
    if (!s.previewUrl) {
        fetchLiveMusicCatalog(`${s.title} ${s.artist}`);
        showToast(`🎧 Cargando "${s.title}" en la Cabina de Pre-Escucha...`);
    } else {
        selectedDeckTrack = {
            trackId: s.id,
            title: s.title,
            artist: s.artist,
            album: s.album || 'Setlist Oficial',
            cover: s.cover,
            previewUrl: s.previewUrl
        };
        renderActivePlayerDeck();
        toggleTrackPreview(s.id, s.previewUrl, true);
    }
}

function updateCategoryCounters() {
    const total = defaultPlaylist.length;
    const protocolCount = defaultPlaylist.filter(s => s.category === 'protocol').length;
    const partyCount = defaultPlaylist.filter(s => (!s.category || s.category === 'party')).length;
    const blacklistCount = defaultPlaylist.filter(s => s.category === 'blacklist').length;

    const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };
    setEl('djTotalSongsCount', total);
    setEl('countCatAll', total);
    setEl('countCatProtocol', protocolCount);
    setEl('countCatParty', partyCount);
    setEl('countCatBlacklist', blacklistCount);
}

function renderSavedDJPlaylist() {
    const list = document.getElementById('djPlaylistList');
    if (!list) return;

    updateCategoryCounters();

    let items = [...defaultPlaylist];

    if (savedPlaylistCategoryFilter !== 'all') {
        items = items.filter(s => (s.category || 'party') === savedPlaylistCategoryFilter);
    }

    if (savedPlaylistFilterQuery) {
        items = items.filter(s =>
            (s.title || '').toLowerCase().includes(savedPlaylistFilterQuery) ||
            (s.artist || '').toLowerCase().includes(savedPlaylistFilterQuery) ||
            (s.requestedBy || '').toLowerCase().includes(savedPlaylistFilterQuery)
        );
    }

    if (savedPlaylistSortMode === 'votes') {
        // Order: Protocol first, then Party by votes, then Blacklist
        const catWeight = { protocol: 1, party: 2, blacklist: 3 };
        items.sort((a, b) => {
            if (savedPlaylistCategoryFilter === 'all') {
                const wA = catWeight[a.category || 'party'] || 2;
                const wB = catWeight[b.category || 'party'] || 2;
                if (wA !== wB) return wA - wB;
            }
            return (b.votes || 0) - (a.votes || 0);
        });
    } else if (savedPlaylistSortMode === 'alpha') {
        items.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    if (items.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding:24px; color:#64748b; background:#f8fafc; border-radius:10px; border:1px dashed #cbd5e1;">
                <p style="margin:0; font-weight:700; color:#0f172a;">No hay canciones registradas en esta categoría o filtro.</p>
                <small>Usa el buscador de arriba para buscar una canción, verificarla en cabina y clasificarla con 1 clic.</small>
            </div>
        `;
        return;
    }

    list.innerHTML = items.map(s => {
        const cat = s.category || 'party';
        const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(s.title + ' ' + s.artist)}`;
        const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(s.title + ' ' + s.artist)}`;

        let catBadgeHtml = '';
        if (cat === 'protocol') {
            catBadgeHtml = `<span class="dj-row-cat-badge protocol">👑 PROTOCOLO OFICIAL (VERSIÓN EXACTA)</span>`;
        } else if (cat === 'blacklist') {
            catBadgeHtml = `<span class="dj-row-cat-badge blacklist">🚫 LISTA NEGRA — PROHIBIDO TOCAR (DO NOT PLAY)</span>`;
        } else {
            catBadgeHtml = `<span class="dj-row-cat-badge party">🔥 SUGERENCIA PRE-BODA PARA PISTA</span>`;
        }

        return `
            <div class="playlist-song-row cat-row-${cat}">
                <div class="song-info">
                    ${s.cover
                        ? `<img src="${s.cover}" alt="${escapeHtmlText(s.title)}" class="dj-saved-song-cover">`
                        : `<span class="song-disc-icon">${cat === 'protocol' ? '👑' : cat === 'blacklist' ? '🚫' : '🎵'}</span>`
                    }
                    <div>
                        <div style="margin-bottom:3px;">${catBadgeHtml}</div>
                        <h4 class="song-title" style="${cat === 'blacklist' ? 'text-decoration:line-through; color:#991b1b;' : ''}">${escapeHtmlText(s.title)}</h4>
                        <p class="song-artist">
                            <strong>${escapeHtmlText(s.artist)}</strong>
                            ${s.album ? ` · <span style="color:#475569;">💿 ${escapeHtmlText(s.album)}</span>` : ''}
                            · <small style="color:${cat === 'blacklist' ? '#dc2626' : '#d97706'}; font-weight:700;">${escapeHtmlText(s.requestedBy)}</small>
                        </p>
                        <div class="song-quick-links">
                            <button type="button" class="btn-saved-preview" onclick="previewSavedSongInDeck('${s.id}')">
                                🎧 Verificar en Cabina
                            </button>
                            <a href="${spotifyUrl}" target="_blank" rel="noopener" class="song-ext-link spotify">🟢 Spotify</a>
                            <a href="${youtubeUrl}" target="_blank" rel="noopener" class="song-ext-link youtube">🔴 YouTube</a>
                        </div>
                    </div>
                </div>
                <div class="song-actions">
                    <select class="dj-inline-cat-switch" onchange="changeSongCategoryInline('${s.id}', this.value)" title="Cambiar clasificación de esta canción">
                        <option value="protocol" ${cat === 'protocol' ? 'selected' : ''}>👑 Protocolo</option>
                        <option value="party" ${cat === 'party' ? 'selected' : ''}>🔥 Pista</option>
                        <option value="blacklist" ${cat === 'blacklist' ? 'selected' : ''}>🚫 Prohibida</option>
                    </select>
                    ${cat !== 'blacklist' ? `
                        <span class="badge-votes">❤️ ${s.votes} votos</span>
                        <button class="btn-xs-gold" onclick="upvoteSong('${s.id}')">+1 Voto</button>
                    ` : `
                        <span class="badge-veto-alert">⛔ VETADA EN CABINA</span>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function upvoteSong(songId) {
    const s = defaultPlaylist.find(item => item.id === songId);
    if (s) {
        s.votes += 1;
        renderSavedDJPlaylist();
        renderLiveSearchResults(currentLiveSearchResults);
        renderActivePlayerDeck();
        showToast(`❤️ Voto registrado para "${s.title}".`);
    }
}

function addSongPrompt() {
    focusLiveSongSearch();
}

function exportDJPlaylist() {
    const protocolList = defaultPlaylist.filter(s => s.category === 'protocol');
    const partyList = defaultPlaylist.filter(s => (!s.category || s.category === 'party')).sort((a, b) => b.votes - a.votes);
    const blackList = defaultPlaylist.filter(s => s.category === 'blacklist');

    let text = "AURA WEDDINGS • BRIEFING MUSICAL OFICIAL PARA CABINA DE DJ\n";
    text += "==============================================================\n\n";

    text += "👑 1. CANCIONES DE PROTOCOLO OFICIAL (VERSIÓN EXACTA OBLIGATORIA):\n";
    protocolList.forEach((s, i) => {
        text += `   ${i + 1}. ${s.title} - ${s.artist} [${s.album || 'Versión Original'}] -> ${s.requestedBy}\n`;
    });

    text += "\n🔥 2. SUGERENCIAS PRE-BODA DE INVITADOS PARA PISTA DE BAILE:\n";
    partyList.forEach((s, i) => {
        text += `   ${i + 1}. ${s.title} - ${s.artist} (${s.votes} votos | ${s.requestedBy})\n`;
    });

    text += "\n🚫 3. LISTA NEGRA (DO NOT PLAY — ESTRICTAMENTE PROHIBIDO TOCAR):\n";
    blackList.forEach((s, i) => {
        text += `   ⛔ ${i + 1}. PROHIBIDA: ${s.title} - ${s.artist} (${s.requestedBy})\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
        showToast(`📋 Briefing Musical (Protocolo + Pista + Prohibidas) copiado al portapapeles.`);
    });
}

function escapeHtmlText(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
