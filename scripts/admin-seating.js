// ==========================================================================
// SEATING CHART & 2D FLOOR PLAN ENGINE (DECORATION, LIGHTS, TEMPLATES, IMPERIAL TABLES)
// ==========================================================================

let activeSeatingSubTab = 'guests';
let activeFloorFilter = 'waiters'; // 'waiters', 'menu', 'allergies'
let isFloorScreenLocked = false;
let selectedFloorElementId = null;

const floorPlanState = {
    venueWidth: 40,
    venueLength: 60,
    scale: 10, // 1m = 10px
    elements: [
        // Architectural & Stage
        { id: 'el_stage', type: 'rect', name: 'Escenario / Banda & DJ', icon: '🎵', x: 120, y: 25, w: 160, h: 55, color: '#7c3aed' },
        { id: 'el_dance', type: 'rect', name: 'Pista de Baile Central', icon: '💃', x: 140, y: 105, w: 120, h: 90, color: '#b45309' },
        { id: 'el_bar', type: 'rect', name: 'Barra Coctelería & Mixología', icon: '🍸', x: 25, y: 130, w: 60, h: 120, color: '#0d9488' },
        { id: 'el_honor', type: 'rect', name: 'Mesa de Honor (Novios)', icon: '👑', x: 145, y: 215, w: 110, h: 45, color: '#d97706' },
        
        // Lighting & Decor
        { id: 'el_fairy', type: 'decor', name: 'Cielo de Guirnaldas Fairy Lights', icon: '✨', x: 100, y: 80, w: 200, h: 15, color: '#f59e0b' },
        { id: 'el_arch', type: 'decor', name: 'Arco Floral Ceremonial', icon: '🌸', x: 160, y: 5, w: 80, h: 20, color: '#ec4899' },
        { id: 'el_photo', type: 'decor', name: 'Photobooth 360 & Muro Verde', icon: '📸', x: 300, y: 130, w: 65, h: 65, color: '#06b6d4' },
        { id: 'el_candy', type: 'decor', name: 'Mesa de Postres & Pastel', icon: '🍰', x: 300, y: 220, w: 70, h: 45, color: '#e11d48' },
        { id: 'el_love', type: 'decor', name: 'Letras Gigantes LOVE Iluminadas', icon: '💡', x: 30, y: 30, w: 60, h: 25, color: '#eab308' },
        
        // Guest Tables (Round & Imperial Rectangular)
        { id: 'el_t1', type: 'table', shape: 'round', tableId: 't1', tableNumber: 1, name: 'Mesa 1 - Familia Novia', x: 50, y: 280, size: 65, waiterId: 'w1' },
        { id: 'el_t2', type: 'table', shape: 'round', tableId: 't2', tableNumber: 2, name: 'Mesa 2 - Familia Novio', x: 140, y: 280, size: 65, waiterId: 'w1' },
        { id: 'el_t3', type: 'table', shape: 'round', tableId: 't3', tableNumber: 3, name: 'Mesa 3 - Padrinos & Testigos', x: 230, y: 280, size: 65, waiterId: 'w1' },
        { id: 'el_t4', type: 'table', shape: 'round', tableId: 't4', tableNumber: 4, name: 'Mesa 4 - Damas de Honor', x: 50, y: 370, size: 65, waiterId: 'w2' },
        { id: 'el_t5', type: 'table', shape: 'rect', tableId: 't5', tableNumber: 5, name: 'Mesa 5 Imperial - Amigos Universidad', x: 130, y: 370, w: 100, h: 50, waiterId: 'w2' },
        { id: 'el_t6', type: 'table', shape: 'round', tableId: 't6', tableNumber: 6, name: 'Mesa 6 - Amigos Foráneos', x: 250, y: 370, size: 65, waiterId: 'w2' }
    ],
    waiters: [
        { id: 'w1', name: 'Carlos Mendoza', phone: '+52 55 4123 9081', tables: [1, 2, 3], color: '#3b82f6' },
        { id: 'w2', name: 'Diana Soto', phone: '+52 55 8765 4321', tables: [4, 5, 6], color: '#10b981' }
    ]
};

function switchSeatingSubTab(tab) {
    activeSeatingSubTab = tab;
    const viewGuests = document.getElementById('seatingSubviewGuests');
    const viewFloor = document.getElementById('seatingSubviewFloor');
    const btnGuests = document.getElementById('btnSubtabGuests');
    const btnFloor = document.getElementById('btnSubtabFloor');

    if (!viewGuests || !viewFloor) return;

    if (tab === 'floor') {
        viewGuests.style.display = 'none';
        viewFloor.style.display = 'block';
        btnGuests.classList.remove('active');
        btnFloor.classList.add('active');
        render2DFloorPlan();
        renderWaitersStaffing();
    } else {
        viewGuests.style.display = 'grid';
        viewFloor.style.display = 'none';
        btnGuests.classList.add('active');
        btnFloor.classList.remove('active');
        renderSeatingChart();
    }
}

function setFloorDisplayFilter(filter) {
    activeFloorFilter = filter;
    document.querySelectorAll('.filter-layer-btn').forEach(b => b.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    render2DFloorPlan();
    showToast(`🎨 Capa activa: ${filter.toUpperCase()}`);
}

function applyFloorTemplate(tpl) {
    if (tpl === 'classic') {
        // Disposición tradicional simétrica alrededor de la pista
        floorPlanState.elements.find(e => e.id === 'el_t1').x = 50;  floorPlanState.elements.find(e => e.id === 'el_t1').y = 280;
        floorPlanState.elements.find(e => e.id === 'el_t2').x = 150; floorPlanState.elements.find(e => e.id === 'el_t2').y = 280;
        floorPlanState.elements.find(e => e.id === 'el_t3').x = 250; floorPlanState.elements.find(e => e.id === 'el_t3').y = 280;
        floorPlanState.elements.find(e => e.id === 'el_t4').x = 50;  floorPlanState.elements.find(e => e.id === 'el_t4').y = 370;
        floorPlanState.elements.find(e => e.id === 'el_t5').x = 150; floorPlanState.elements.find(e => e.id === 'el_t5').y = 370;
        floorPlanState.elements.find(e => e.id === 'el_t6').x = 250; floorPlanState.elements.find(e => e.id === 'el_t6').y = 370;
        showToast(`📐 Plantilla "Banquete Clásico Circular" aplicada.`);
    } else if (tpl === 'imperial') {
        // Disposición editorial tipo pasarela imperial
        floorPlanState.elements.find(e => e.id === 'el_t1').x = 40;  floorPlanState.elements.find(e => e.id === 'el_t1').y = 270;
        floorPlanState.elements.find(e => e.id === 'el_t2').x = 40;  floorPlanState.elements.find(e => e.id === 'el_t2').y = 350;
        floorPlanState.elements.find(e => e.id === 'el_t3').x = 40;  floorPlanState.elements.find(e => e.id === 'el_t3').y = 430;
        floorPlanState.elements.find(e => e.id === 'el_t4').x = 240; floorPlanState.elements.find(e => e.id === 'el_t4').y = 270;
        floorPlanState.elements.find(e => e.id === 'el_t5').x = 240; floorPlanState.elements.find(e => e.id === 'el_t5').y = 350;
        floorPlanState.elements.find(e => e.id === 'el_t6').x = 240; floorPlanState.elements.find(e => e.id === 'el_t6').y = 430;
        showToast(`📐 Plantilla "Imperial Editorial Paralelo" aplicada.`);
    } else if (tpl === 'cocktail') {
        // Disposición lounge & cóctel dinámico
        floorPlanState.elements.find(e => e.id === 'el_t1').x = 35;  floorPlanState.elements.find(e => e.id === 'el_t1').y = 260;
        floorPlanState.elements.find(e => e.id === 'el_t2').x = 115; floorPlanState.elements.find(e => e.id === 'el_t2').y = 340;
        floorPlanState.elements.find(e => e.id === 'el_t3').x = 35;  floorPlanState.elements.find(e => e.id === 'el_t3').y = 420;
        floorPlanState.elements.find(e => e.id === 'el_t4').x = 250; floorPlanState.elements.find(e => e.id === 'el_t4').y = 260;
        floorPlanState.elements.find(e => e.id === 'el_t5').x = 180; floorPlanState.elements.find(e => e.id === 'el_t5').y = 410;
        floorPlanState.elements.find(e => e.id === 'el_t6').x = 260; floorPlanState.elements.find(e => e.id === 'el_t6').y = 340;
        showToast(`🍸 Plantilla "Lounge & Cóctel Festivo" aplicada.`);
    } else if (tpl === 'semicircle') {
        // Disposición en herradura / semicírculo hacia novios
        floorPlanState.elements.find(e => e.id === 'el_t1').x = 30;  floorPlanState.elements.find(e => e.id === 'el_t1').y = 290;
        floorPlanState.elements.find(e => e.id === 'el_t2').x = 90;  floorPlanState.elements.find(e => e.id === 'el_t2').y = 360;
        floorPlanState.elements.find(e => e.id === 'el_t3').x = 150; floorPlanState.elements.find(e => e.id === 'el_t3').y = 390;
        floorPlanState.elements.find(e => e.id === 'el_t4').x = 210; floorPlanState.elements.find(e => e.id === 'el_t4').y = 360;
        floorPlanState.elements.find(e => e.id === 'el_t5').x = 270; floorPlanState.elements.find(e => e.id === 'el_t5').y = 290;
        floorPlanState.elements.find(e => e.id === 'el_t6').x = 150; floorPlanState.elements.find(e => e.id === 'el_t6').y = 460;
        showToast(`✨ Plantilla "Herradura Panorámica" aplicada.`);
    }
    
    // Marcar botón activo visualmente
    document.querySelectorAll('.btn-template-pill').forEach(b => {
        b.classList.remove('active');
        if (b.getAttribute('data-tpl') === tpl) b.classList.add('active');
    });

    render2DFloorPlan();
}

function addDecorElement(type) {
    let newEl = null;
    const id = 'el_dec_' + Date.now();

    if (type === 'light') {
        const count = floorPlanState.elements.filter(e => e.type === 'decor' && e.icon === '💡').length + 1;
        newEl = { id, type: 'decor', shape: 'rect', name: `Luz Uplight #${count}`, icon: '💡', x: 70 + ((count * 20) % 180), y: 160, w: 50, h: 22, color: '#f59e0b' };
    } else if (type === 'arch') {
        const count = floorPlanState.elements.filter(e => e.type === 'decor' && e.icon === '🌸').length + 1;
        newEl = { id, type: 'decor', shape: 'arch', name: `Arco Floral #${count}`, icon: '🌸', x: 80 + ((count * 30) % 150), y: 190, w: 75, h: 25, color: '#ec4899' };
    } else if (type === 'candies') {
        const count = floorPlanState.elements.filter(e => e.type === 'decor' && (e.icon === '🍹' || e.name.toLowerCase().includes('barra'))).length + 1;
        newEl = { id, type: 'decor', shape: 'rect', name: `Barra Cóctel #${count}`, icon: '🍹', x: 260, y: 260 + ((count * 40) % 160), w: 65, h: 45, color: '#06b6d4', capacity: 150 };
    } else if (type === 'photobooth') {
        const count = floorPlanState.elements.filter(e => e.type === 'decor' && e.icon === '📸').length + 1;
        newEl = { id, type: 'decor', shape: 'square', name: `Photobooth 360 #${count}`, icon: '📸', x: 290, y: 150 + ((count * 40) % 140), w: 60, h: 60, color: '#8b5cf6', capacity: 4 };
    } else if (type === 'dj') {
        const count = floorPlanState.elements.filter(e => e.type === 'decor' && e.icon === '🎵').length + 1;
        newEl = { id, type: 'decor', shape: 'rect', name: `Tarima Sonido / DJ #${count}`, icon: '🎵', x: 290, y: 40 + ((count * 30) % 120), w: 70, h: 40, color: '#6366f1' };
    } else if (type === 'dessert') {
        const count = floorPlanState.elements.filter(e => e.type === 'decor' && e.icon === '🍰').length + 1;
        newEl = { id, type: 'decor', shape: 'round', name: `Mesa de Postres #${count}`, icon: '🍰', x: 40, y: 210 + ((count * 40) % 160), w: 55, h: 55, color: '#f43f5e', capacity: 80 };
    } else if (type === 'coffee') {
        const count = floorPlanState.elements.filter(e => e.type === 'decor' && e.icon === '☕').length + 1;
        newEl = { id, type: 'decor', shape: 'rect', name: `Barra Café & Carajillos #${count}`, icon: '☕', x: 270, y: 340, w: 60, h: 40, color: '#b45309', capacity: 100 };
    } else if (type === 'lounge') {
        const count = floorPlanState.elements.filter(e => e.type === 'decor' && e.icon === '🛋️').length + 1;
        newEl = { id, type: 'decor', shape: 'square', name: `Salas Lounge VIP #${count}`, icon: '🛋️', x: 40, y: 350 + ((count * 40) % 120), w: 65, h: 65, color: '#64748b', capacity: 10 };
    }

    if (newEl) {
        floorPlanState.elements.push(newEl);
        render2DFloorPlan();
        inspectDecorElement(newEl);
        showToast(`✨ "${newEl.name}" agregado. Puedes hacer clic para cambiar su forma, capacidad o moverlo.`);
    }
}

function recalcVenueDimensions() {
    if (typeof activeRole !== 'undefined' && activeRole === 'couple') {
        showToast('🔒 Acción exclusiva de tu Wedding Planner.');
        return;
    }
    const w = parseFloat(document.getElementById('venueWidthInput').value) || 40;
    const l = parseFloat(document.getElementById('venueLengthInput').value) || 60;
    floorPlanState.venueWidth = w;
    floorPlanState.venueLength = l;
    document.getElementById('canvasScaleLabel').innerText = `📍 Salón Principal: ${w}m x ${l}m (Escala 1m = ${floorPlanState.scale}px)`;
    render2DFloorPlan();
    showToast(`📐 Dimensiones actualizadas a ${w}m x ${l}m.`);
}

function saveFloorPlanState() {
    const wId = (typeof currentWeddingId !== 'undefined' && currentWeddingId) ? currentWeddingId : 'aura';
    try {
        localStorage.setItem(`wedding_floor_plan_${wId}`, JSON.stringify({
            elements: floorPlanState.elements,
            waiters: floorPlanState.waiters,
            venueWidth: floorPlanState.venueWidth,
            venueLength: floorPlanState.venueLength
        }));
    } catch(e) {}
}

function loadFloorPlanState() {
    const wId = (typeof currentWeddingId !== 'undefined' && currentWeddingId) ? currentWeddingId : 'aura';
    try {
        const raw = localStorage.getItem(`wedding_floor_plan_${wId}`);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.elements) && parsed.elements.length > 0) {
                parsed.elements.forEach(savedEl => {
                    const match = floorPlanState.elements.find(e => e.id === savedEl.id);
                    if (match) {
                        match.x = savedEl.x;
                        match.y = savedEl.y;
                        if (savedEl.w) match.w = savedEl.w;
                        if (savedEl.h) match.h = savedEl.h;
                        if (savedEl.size) match.size = savedEl.size;
                        if (savedEl.shape) match.shape = savedEl.shape;
                    } else if (savedEl.type === 'decor') {
                        floorPlanState.elements.push(savedEl);
                    }
                });
            }
            if (parsed && Array.isArray(parsed.waiters) && parsed.waiters.length > 0) {
                floorPlanState.waiters = parsed.waiters;
            }
            if (parsed && parsed.venueWidth) floorPlanState.venueWidth = parsed.venueWidth;
            if (parsed && parsed.venueLength) floorPlanState.venueLength = parsed.venueLength;
        }
    } catch(e) {}
}

function render2DFloorPlan() {
    const canvas = document.getElementById('floorCanvasViewport');
    if (!canvas) return;

    loadFloorPlanState();

    const canvasW = floorPlanState.venueWidth * floorPlanState.scale;
    const canvasH = floorPlanState.venueLength * floorPlanState.scale;

    canvas.style.width = `${canvasW}px`;
    canvas.style.height = `${canvasH}px`;
    canvas.innerHTML = '';

    currentData = getWeddingState(currentWeddingId);

    // Render elements
    floorPlanState.elements.forEach(el => {
        if (el.type === 'table') {
            const tableData = (currentData.tables || []).find(t => t.id === el.tableId) || { name: el.name, capacity: el.shape === 'rect' ? 12 : 10 };
            const seated = (currentData.guests || []).filter(g => g.tableId === el.tableId);
            const totalPax = seated.reduce((s, g) => s + (g.passes || 1), 0);
            const hasAllergy = seated.some(g => g.allergies && g.allergies.toLowerCase() !== 'ninguna' && g.allergies.trim() !== '');

            const waiter = floorPlanState.waiters.find(w => w.tables.includes(el.tableNumber));
            let borderColor = waiter ? waiter.color : '#94a3b8';
            let tagText = waiter ? waiter.name.split(' ')[0] : 'Sin asignar';
            let tagBg = borderColor;

            if (activeFloorFilter === 'allergies') {
                borderColor = hasAllergy ? '#ef4444' : '#10b981';
                tagText = hasAllergy ? '⚠️ Alergia' : '✓ Estándar';
                tagBg = borderColor;
            } else if (activeFloorFilter === 'menu') {
                const predominantMenu = seated.length > 0 ? seated[0].menu : 'filete';
                borderColor = predominantMenu === 'salmon' ? '#06b6d4' : predominantMenu === 'risotto' ? '#84cc16' : '#d97706';
                tagText = predominantMenu === 'salmon' ? '🐟 Salmón' : predominantMenu === 'risotto' ? '🍄 Vegano' : '🥩 Filete';
                tagBg = borderColor;
            }

            const tableEl = document.createElement('div');
            const shapeClass = el.shape === 'rect' || el.shape === 'imperial' ? 'floor-2d-table-rect' :
                               el.shape === 'square' ? 'floor-2d-table-square' :
                               el.shape === 'triangle' ? 'floor-2d-table-triangle' :
                               el.shape === 'honor' ? 'floor-2d-table-honor' : 'floor-2d-table';
            tableEl.className = shapeClass;
            tableEl.id = el.id;
            tableEl.style.left = `${el.x}px`;
            tableEl.style.top = `${el.y}px`;

            if (el.shape === 'rect' || el.shape === 'imperial') {
                tableEl.style.width = `${el.w || 100}px`;
                tableEl.style.height = `${el.h || 50}px`;
            } else if (el.shape === 'square') {
                tableEl.style.width = `${el.w || 65}px`;
                tableEl.style.height = `${el.h || 65}px`;
            } else if (el.shape === 'triangle') {
                tableEl.style.width = `${el.w || 75}px`;
                tableEl.style.height = `${el.h || 70}px`;
            } else if (el.shape === 'honor') {
                tableEl.style.width = `${el.w || 110}px`;
                tableEl.style.height = `${el.h || 45}px`;
            } else {
                tableEl.style.width = `${el.size || 65}px`;
                tableEl.style.height = `${el.size || 65}px`;
            }
            tableEl.style.borderColor = borderColor;

            const shapeIcon = el.shape === 'rect' || el.shape === 'imperial' ? '▮ ' :
                              el.shape === 'square' ? '■ ' :
                              el.shape === 'triangle' ? '▲ ' :
                              el.shape === 'honor' ? '👑 ' : '';

            tableEl.innerHTML = `
                <div class="table-2d-inner">
                    <span class="table-2d-num">${shapeIcon}M${el.tableNumber}</span>
                    <span class="table-2d-pax">${totalPax}/${tableData.capacity}p</span>
                </div>
                ${hasAllergy ? `<span class="table-2d-allergy-alert" title="Tiene invitados con dietas especiales">⚠️</span>` : ''}
                <div class="table-2d-waiter-tag" style="background:${tagBg};">${tagText}</div>
            `;

            tableEl.addEventListener('click', (e) => {
                if (tableEl.__justDragged) {
                    tableEl.__justDragged = false;
                    return;
                }
                selectFloorElement(el);
                inspectTableElement(el, tableData, seated, waiter);
            });

            makeElementDraggable(tableEl, el);
            canvas.appendChild(tableEl);

        } else if (el.type === 'rect' || el.type === 'decor') {
            const rectEl = document.createElement('div');
            rectEl.className = el.type === 'decor' ? 'floor-2d-decor' : 'floor-2d-rect';
            rectEl.id = el.id;
            rectEl.style.left = `${el.x}px`;
            rectEl.style.top = `${el.y}px`;
            rectEl.style.width = `${el.w || 60}px`;
            rectEl.style.height = `${el.h || 45}px`;
            rectEl.style.borderColor = el.color || '#3b82f6';
            rectEl.style.backgroundColor = `${el.color || '#3b82f6'}18`;

            // Adjust border radius according to custom shape
            if (el.shape === 'round') {
                rectEl.style.borderRadius = '50%';
            } else if (el.shape === 'square') {
                rectEl.style.borderRadius = '8px';
            } else if (el.shape === 'arch') {
                rectEl.style.borderRadius = '20px 20px 4px 4px';
            } else {
                rectEl.style.borderRadius = '6px';
            }

            rectEl.innerHTML = `
                <span style="font-size:1.1rem; pointer-events:none;">${el.icon || '✨'}</span>
                <span style="font-size:0.65rem; font-weight:700; color:#1e293b; margin-top:2px; text-align:center; padding:0 3px; line-height:1.1; pointer-events:none;">${el.name}</span>
                ${el.capacity ? `<span style="font-size:0.6rem; font-weight:800; background:${el.color || '#0f172a'}; color:#ffffff; padding:1px 5px; border-radius:10px; margin-top:2px; pointer-events:none;">${el.capacity} pax/serv</span>` : ''}
            `;

            rectEl.addEventListener('click', (e) => {
                if (rectEl.__justDragged) {
                    rectEl.__justDragged = false;
                    return;
                }
                selectFloorElement(el);
                inspectDecorElement(el);
            });

            makeElementDraggable(rectEl, el);
            canvas.appendChild(rectEl);
        }
    });

    // Deselect if clicking on empty canvas
    canvas.onclick = (e) => {
        if (e.target === canvas) {
            deselectFloorElement();
        }
    };
}

// ==========================================================================
// 🔒 PANTALLA FIJA (MODO EDICIÓN MÓVIL) & ARRASTRE TÁCTIL BLINDADO
// ==========================================================================

function toggleFloorScreenLock(locked) {
    if (typeof locked === 'undefined') {
        isFloorScreenLocked = !isFloorScreenLocked;
    } else {
        isFloorScreenLocked = !!locked;
    }

    const checkbox = document.getElementById('checkLockScreenFloor');
    if (checkbox) checkbox.checked = isFloorScreenLocked;

    const labelText = document.getElementById('lockScreenFloorText');
    const noticeBadge = document.getElementById('floorCanvasNoticeBadge');

    if (isFloorScreenLocked) {
        document.body.classList.add('floor-screen-locked');
        if (labelText) {
            labelText.innerHTML = `<span class="lock-icon-state active">🔒</span> <strong>Pantalla Fija</strong> <small>(Edición Táctil Activa)</small>`;
        }
        if (noticeBadge) noticeBadge.style.display = 'flex';
        showToast('🔒 Pantalla Bloqueada: Mueve libremente las mesas, pista de baile y decoración sin que la pantalla se desplace.');
    } else {
        document.body.classList.remove('floor-screen-locked');
        if (labelText) {
            labelText.innerHTML = `<span class="lock-icon-state">🔓</span> <strong>Bloquear Pantalla</strong> <small>(Modo Edición Táctil)</small>`;
        }
        if (noticeBadge) noticeBadge.style.display = 'none';
        showToast('🔓 Pantalla Desbloqueada para navegar libremente.');
    }
}

// Listener de prevención universal de scroll cuando el modo bloqueo está activo
window.addEventListener('touchmove', (e) => {
    if (isFloorScreenLocked) {
        // Permitir scroll solo dentro de modales emergentes si existen
        if (e.target && e.target.closest('.app-modal-card')) return;
        e.preventDefault();
    }
}, { passive: false });

function makeElementDraggable(domEl, stateObj) {
    let startPointerX, startPointerY;
    let elemStartLeft, elemStartTop;
    let isDragging = false;
    let hasMoved = false;

    // Direct inline enforcement of touch-action none
    domEl.style.touchAction = 'none';

    function initDrag(clientX, clientY) {
        const canvas = document.getElementById('floorCanvasViewport');
        if (!canvas) return;

        startPointerX = clientX;
        startPointerY = clientY;
        elemStartLeft = stateObj.x || 0;
        elemStartTop = stateObj.y || 0;
        isDragging = true;
        hasMoved = false;
        domEl.classList.add('dragging-2d');

        // Seleccionar inmediatamente el elemento para mostrar flechas de ajuste
        selectFloorElement(stateObj);
    }

    function processDrag(clientX, clientY) {
        if (!isDragging) return;

        const deltaX = clientX - startPointerX;
        const deltaY = clientY - startPointerY;

        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            hasMoved = true;
            domEl.__justDragged = true;
        }

        const canvas = document.getElementById('floorCanvasViewport');
        if (!canvas) return;

        const maxW = Math.max(50, canvas.clientWidth - (domEl.offsetWidth || 60));
        const maxH = Math.max(50, canvas.clientHeight - (domEl.offsetHeight || 50));

        stateObj.x = Math.max(5, Math.min(maxW, Math.round(elemStartLeft + deltaX)));
        stateObj.y = Math.max(5, Math.min(maxH, Math.round(elemStartTop + deltaY)));

        domEl.style.left = `${stateObj.x}px`;
        domEl.style.top = `${stateObj.y}px`;

        // Actualizar coordenadas en el D-Pad si está visible
        const titleEl = document.getElementById('dpadItemTitle');
        if (titleEl && selectedFloorElementId === stateObj.id) {
            const icon = stateObj.icon || (stateObj.type === 'table' ? '🍽️' : '✨');
            const name = stateObj.name || (stateObj.tableNumber ? `Mesa #${stateObj.tableNumber}` : 'Elemento');
            titleEl.innerHTML = `${icon} <strong>${name}</strong> <small>(${stateObj.x}, ${stateObj.y})</small>`;
        }
    }

    function finishDrag() {
        if (!isDragging) return;
        isDragging = false;
        domEl.classList.remove('dragging-2d');

        if (hasMoved) {
            saveFloorPlanState();
            setTimeout(() => {
                domEl.__justDragged = false;
            }, 300);
        } else {
            domEl.__justDragged = false;
        }
    }

    // 1. POINTER EVENTS (Chrome Mobile Android, iOS Safari 13+, Edge & Desktop)
    domEl.addEventListener('pointerdown', (e) => {
        if (e.button && e.button !== 0) return;
        e.stopPropagation();
        e.preventDefault(); // Impide que el navegador móvil active el desplazamiento de página

        try {
            domEl.setPointerCapture(e.pointerId);
        } catch(err) {}

        initDrag(e.clientX, e.clientY);

        function onPointerMove(moveEv) {
            if (moveEv.pointerId !== e.pointerId) return;
            moveEv.preventDefault();
            moveEv.stopPropagation();
            processDrag(moveEv.clientX, moveEv.clientY);
        }

        function onPointerUp(upEv) {
            if (upEv.pointerId !== e.pointerId) return;
            try {
                domEl.releasePointerCapture(e.pointerId);
            } catch(err) {}
            domEl.removeEventListener('pointermove', onPointerMove);
            domEl.removeEventListener('pointerup', onPointerUp);
            domEl.removeEventListener('pointercancel', onPointerUp);
            finishDrag();
        }

        domEl.addEventListener('pointermove', onPointerMove);
        domEl.addEventListener('pointerup', onPointerUp);
        domEl.addEventListener('pointercancel', onPointerUp);
    }, { passive: false });

    // 2. TOUCH EVENTS (Blindaje total para Android WebViews que ignoren Pointer Events)
    domEl.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        e.stopPropagation();
        e.preventDefault();

        const touch = e.touches[0];
        initDrag(touch.clientX, touch.clientY);

        function onTouchMove(moveEv) {
            if (!moveEv.touches || moveEv.touches.length !== 1) return;
            moveEv.preventDefault();
            moveEv.stopPropagation();
            const t = moveEv.touches[0];
            processDrag(t.clientX, t.clientY);
        }

        function onTouchEnd() {
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchcancel', onTouchEnd);
            finishDrag();
        }

        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);
        window.addEventListener('touchcancel', onTouchEnd);
    }, { passive: false });
}

// ==========================================================================
// 🕹️ SELECCIÓN DE ELEMENTOS Y CONTROLADOR D-PAD (FLECHAS MÓVILES)
// ==========================================================================
// 🕹️ SELECCIÓN DE ELEMENTOS, REDIMENSIONAR (AMPLIAR/ACHICAR) & D-PAD
// ==========================================================================

function toggleFloorDrawer(drawerName) {
    const drawers = ['elements', 'templates', 'layers', 'dimensions'];
    drawers.forEach(d => {
        const panel = document.getElementById(`drawerFloor_${d}`);
        const btn = document.getElementById(`btnToggleFloor_${d}`);
        if (d === drawerName) {
            const isCurrentlyOpen = panel && panel.style.display !== 'none';
            if (panel) panel.style.display = isCurrentlyOpen ? 'none' : 'block';
            if (btn) btn.classList.toggle('active', !isCurrentlyOpen);
        } else {
            if (panel) panel.style.display = 'none';
            if (btn) btn.classList.remove('active');
        }
    });
}

function closeAllFloorDrawers() {
    const drawers = ['elements', 'templates', 'layers', 'dimensions'];
    drawers.forEach(d => {
        const panel = document.getElementById(`drawerFloor_${d}`);
        const btn = document.getElementById(`btnToggleFloor_${d}`);
        if (panel) panel.style.display = 'none';
        if (btn) btn.classList.remove('active');
    });
}

function selectFloorElement(stateObj) {
    if (!stateObj) return;
    selectedFloorElementId = stateObj.id;

    // Resaltar elemento activo en el DOM
    document.querySelectorAll('#floorCanvasViewport > *').forEach(node => {
        node.classList.remove('selected-floor-element');
    });
    const targetNode = document.getElementById(stateObj.id);
    if (targetNode) {
        targetNode.classList.add('selected-floor-element');
    }

    // Mostrar panel D-Pad de flechas y redimensión
    const dpadBar = document.getElementById('floorElementDpadBar');
    const titleEl = document.getElementById('dpadItemTitle');
    const sizeBadgeEl = document.getElementById('dpadItemSizeBadge');

    if (dpadBar && titleEl) {
        dpadBar.style.display = 'flex';
        const icon = stateObj.icon || (stateObj.type === 'table' ? '🍽️' : '✨');
        const name = stateObj.name || (stateObj.tableNumber ? `Mesa #${stateObj.tableNumber}` : 'Elemento');
        titleEl.innerHTML = `${icon} <strong>${name}</strong>`;

        if (sizeBadgeEl) {
            if (stateObj.type === 'table') {
                if (stateObj.shape === 'rect' || stateObj.shape === 'imperial') {
                    const w = stateObj.w || 100;
                    const h = stateObj.h || 50;
                    sizeBadgeEl.textContent = `${(w / 10).toFixed(1)}m × ${(h / 10).toFixed(1)}m (${w}×${h}px)`;
                } else {
                    const sz = stateObj.size || stateObj.w || 65;
                    sizeBadgeEl.textContent = `Ø ${(sz / 10).toFixed(1)}m (${sz}px)`;
                }
            } else {
                const w = stateObj.w || 60;
                const h = stateObj.h || 45;
                sizeBadgeEl.textContent = `${(w / 10).toFixed(1)}m × ${(h / 10).toFixed(1)}m (${w}×${h}px)`;
            }
        }
    }
}

function deselectFloorElement() {
    selectedFloorElementId = null;
    document.querySelectorAll('#floorCanvasViewport > *').forEach(node => {
        node.classList.remove('selected-floor-element');
    });
    const dpadBar = document.getElementById('floorElementDpadBar');
    if (dpadBar) dpadBar.style.display = 'none';
}

function resizeSelectedElement(delta, dimension) {
    if (!selectedFloorElementId) {
        showToast('💡 Selecciona primero un objeto para cambiar su tamaño.');
        return;
    }
    const el = floorPlanState.elements.find(e => e.id === selectedFloorElementId);
    if (!el) return;

    const domEl = document.getElementById(el.id);
    const canvas = document.getElementById('floorCanvasViewport');
    if (!domEl || !canvas) return;

    if (el.type === 'table') {
        if (el.shape === 'rect' || el.shape === 'imperial') {
            if (dimension === 'w') {
                el.w = Math.max(50, Math.min(260, (el.w || 100) + delta));
            } else if (dimension === 'h') {
                el.h = Math.max(30, Math.min(180, (el.h || 50) + delta));
            } else {
                el.w = Math.max(50, Math.min(260, (el.w || 100) + delta));
                el.h = Math.max(30, Math.min(180, (el.h || 50) + Math.round(delta * 0.5)));
            }
            domEl.style.width = `${el.w}px`;
            domEl.style.height = `${el.h}px`;
            showToast(`📐 Mesa Imperial: ${el.w}x${el.h}px (${(el.w / 10).toFixed(1)}m × ${(el.h / 10).toFixed(1)}m)`);
        } else {
            // Mesa redonda o cuadrada
            const currentSize = el.size || el.w || 65;
            const newSize = Math.max(45, Math.min(160, currentSize + delta));
            el.size = newSize;
            el.w = newSize;
            el.h = newSize;
            domEl.style.width = `${newSize}px`;
            domEl.style.height = `${newSize}px`;
            showToast(`📐 Mesa redimensionada: ${newSize}px (Ø ${(newSize / 10).toFixed(1)}m)`);
        }
    } else {
        // Decoración o elemento arquitectónico (Pista de baile, Mesa de Honor, Photobooth, etc.)
        if (dimension === 'w') {
            el.w = Math.max(30, Math.min(350, (el.w || 60) + delta));
            domEl.style.width = `${el.w}px`;
            showToast(`↔️ Ancho de "${el.name}": ${el.w}px (${(el.w / 10).toFixed(1)}m)`);
        } else if (dimension === 'h') {
            el.h = Math.max(20, Math.min(300, (el.h || 45) + delta));
            domEl.style.height = `${el.h}px`;
            showToast(`↕️ Largo de "${el.name}": ${el.h}px (${(el.h / 10).toFixed(1)}m)`);
        } else {
            // Redimensión proporcional
            const currentW = el.w || 60;
            const currentH = el.h || 45;
            const ratio = currentH / currentW;
            el.w = Math.max(30, Math.min(350, currentW + delta));
            el.h = Math.max(20, Math.min(300, Math.round(el.w * ratio)));
            domEl.style.width = `${el.w}px`;
            domEl.style.height = `${el.h}px`;
            showToast(`📐 "${el.name}" redimensionado: ${el.w}×${el.h}px (${(el.w / 10).toFixed(1)}m × ${(el.h / 10).toFixed(1)}m)`);
        }
    }

    // Mantener dentro del salón
    const maxW = canvas.clientWidth - (domEl.offsetWidth || 50);
    const maxH = canvas.clientHeight - (domEl.offsetHeight || 50);
    el.x = Math.max(5, Math.min(maxW, el.x || 0));
    el.y = Math.max(5, Math.min(maxH, el.y || 0));
    domEl.style.left = `${el.x}px`;
    domEl.style.top = `${el.y}px`;

    saveFloorPlanState();
    selectFloorElement(el);
}

function nudgeSelectedElement(dx, dy) {
    if (!selectedFloorElementId) {
        showToast('💡 Toca primero una mesa o elemento para moverlo.');
        return;
    }
    const el = floorPlanState.elements.find(e => e.id === selectedFloorElementId);
    if (!el) return;

    const canvas = document.getElementById('floorCanvasViewport');
    const domEl = document.getElementById(el.id);
    if (!canvas || !domEl) return;

    const maxW = Math.max(50, canvas.clientWidth - (domEl.offsetWidth || 60));
    const maxH = Math.max(50, canvas.clientHeight - (domEl.offsetHeight || 50));

    el.x = Math.max(5, Math.min(maxW, (el.x || 0) + dx));
    el.y = Math.max(5, Math.min(maxH, (el.y || 0) + dy));

    domEl.style.left = `${el.x}px`;
    domEl.style.top = `${el.y}px`;

    saveFloorPlanState();
    selectFloorElement(el);
}

function rotateOrShapeSelectedElement() {
    if (!selectedFloorElementId) return;
    const el = floorPlanState.elements.find(e => e.id === selectedFloorElementId);
    if (!el) return;

    if (el.type === 'decor' || el.type === 'rect') {
        // Rotar 90 grados intercambiando ancho y alto
        const curW = el.w || 60;
        const curH = el.h || 45;
        el.w = curH;
        el.h = curW;
        showToast(`🔄 "${el.name}" rotado 90° (${el.w}x${el.h}m)`);
    } else if (el.type === 'table') {
        // Cambiar forma de mesa: redonda -> imperial (rect) -> cuadrada -> redonda
        if (el.shape === 'round') el.shape = 'rect';
        else if (el.shape === 'rect') el.shape = 'square';
        else el.shape = 'round';
        showToast(`🔄 Mesa #${el.tableNumber} cambiada a ${el.shape.toUpperCase()}`);
    }

    saveFloorPlanState();
    render2DFloorPlan();
    selectFloorElement(el);
}

function deleteSelectedDecorElement() {
    if (!selectedFloorElementId) return;
    const el = floorPlanState.elements.find(e => e.id === selectedFloorElementId);
    if (!el) return;

    if (el.type === 'table') {
        showToast('⚠️ Las mesas numeradas no se pueden borrar del plano; retíralas desde el botón "+ Nueva Mesa".');
        return;
    }

    if (confirm(`¿Quitar "${el.name}" del plano de distribución?`)) {
        floorPlanState.elements = floorPlanState.elements.filter(e => e.id !== el.id);
        deselectFloorElement();
        saveFloorPlanState();
        render2DFloorPlan();
        showToast(`🗑️ Elemento "${el.name}" retirado.`);
    }
}

function inspectTableElement(el, tableData, seated, waiter) {
    const inspector = document.getElementById('floorInspectorCard');
    const allergies = seated.filter(g => g.allergies && g.allergies.toLowerCase() !== 'ninguna' && g.allergies.trim() !== '');

    inspector.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h4 class="inspector-title" style="margin:0;">🍽️ Mesa #${el.tableNumber} ${el.shape === 'rect' ? '(Imperial)' : '(Circular)'}</h4>
            <span style="font-size:0.75rem; font-weight:700; background:#f1f5f9; padding:2px 8px; border-radius:12px;">${seated.reduce((s, g) => s + (g.passes || 1), 0)} / ${tableData.capacity} pax</span>
        </div>
        <p style="font-size:0.8rem; font-weight:600; color:#1e293b; margin:6px 0 10px;">${tableData.name}</p>
        
        <div style="margin-bottom:10px;">
            <label style="display:block; font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">Mesero Responsable de Cuadrante:</label>
            <select class="select-inspector-waiter" onchange="assignWaiterToTableNumber(${el.tableNumber}, this.value)">
                <option value="">-- Sin Asignar --</option>
                ${floorPlanState.waiters.map(w => `<option value="${w.id}" ${waiter && waiter.id === w.id ? 'selected' : ''}>${w.name} (${w.tables.length} mesas)</option>`).join('')}
            </select>
        </div>

        <div style="margin-bottom:10px;">
            <button class="btn-edit-table-shape" style="width:100%; justify-content:center; padding:8px 12px; font-size:0.8rem;" onclick="openEditTableModal('${el.tableId}')">⚙️ Cambiar Forma &amp; Capacidad</button>
        </div>

        <div style="margin-top:10px; border-top:1px solid #f1f5f9; padding-top:8px;">
            <label style="font-size:0.75rem; font-weight:700; color:#b91c1c;">⚠️ Alergias & Menús Especiales:</label>
            ${allergies.length > 0 ? allergies.map(a => `
                <div style="font-size:0.75rem; color:#991b1b; background:#fef2f2; padding:3px 6px; border-radius:4px; margin-top:4px;">
                    <strong>${a.name}:</strong> ${a.allergies} (${getMenuLabel(a.menu)})
                </div>
            `).join('') : '<p style="font-size:0.75rem; color:#64748b; margin:4px 0 0;">Sin restricciones especiales en esta mesa.</p>'}
        </div>
    `;
}

function inspectDecorElement(el) {
    const inspector = document.getElementById('floorInspectorCard');
    if (!inspector) return;

    const shapeLabel = el.shape === 'round' ? 'Circular' : el.shape === 'square' ? 'Cuadrada' : el.shape === 'arch' ? 'Arco / Lineal' : 'Rectangular';

    inspector.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h4 class="inspector-title" style="margin:0;">${el.icon || '✨'} ${el.name}</h4>
            <span style="font-size:0.75rem; font-weight:700; background:#f1f5f9; padding:2px 8px; border-radius:12px;">${shapeLabel}</span>
        </div>
        <p style="font-size:0.8rem; color:#475569; margin:6px 0 10px;">Elemento de montaje y experiencia. Dimensiones actuales: <strong>${el.w || 60}px x ${el.h || 45}px</strong>.</p>
        
        ${el.capacity ? `
        <div style="margin-bottom:10px; background:#ecfdf5; border:1px solid #a7f3d0; padding:6px 10px; border-radius:6px;">
            <span style="font-size:0.75rem; font-weight:700; color:#065f46;">🍸 Rendimiento / Capacidad:</span>
            <div style="font-size:0.8rem; font-weight:800; color:#047857;">${el.capacity} personas / copas por turno</div>
        </div>` : ''}

        <div style="margin-bottom:8px;">
            <button class="btn-edit-table-shape" style="width:100%; justify-content:center; padding:8px 12px; font-size:0.8rem;" onclick="openEditDecorModal('${el.id}')">⚙️ Cambiar Forma, Dimensiones & Capacidad</button>
        </div>

        <button class="btn-modal danger" style="width:100%; justify-content:center; padding:6px 10px; font-size:0.75rem; background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; border-radius:6px; cursor:pointer;" onclick="deleteDecorElementDirect('${el.id}')">🗑️ Quitar del Plano</button>
    `;
}

function openEditDecorModal(decorId) {
    const el = floorPlanState.elements.find(e => e.id === decorId);
    if (!el) return;

    document.getElementById('editDecorId').value = el.id;
    document.getElementById('editDecorName').value = el.name || '';
    document.getElementById('editDecorWidth').value = el.w || 60;
    document.getElementById('editDecorHeight').value = el.h || 45;
    document.getElementById('editDecorCapacity').value = el.capacity || '';
    document.getElementById('editDecorModalTitle').innerText = `Configurar ${el.name}`;
    document.getElementById('editDecorModalIcon').innerText = el.icon || '✨';

    const iconSelect = document.getElementById('editDecorIcon');
    if (iconSelect && el.icon) {
        iconSelect.value = el.icon;
    }

    const shape = el.shape || 'rect';
    const radio = document.querySelector(`input[name="decorShapeOption"][value="${shape}"]`);
    if (radio) radio.checked = true;

    const modal = document.getElementById('modalEditDecorElement');
    if (modal) modal.classList.add('active');
}

function closeEditDecorModal() {
    const modal = document.getElementById('modalEditDecorElement');
    if (modal) modal.classList.remove('active');
}

function saveDecorElementConfig() {
    const decorId = document.getElementById('editDecorId').value;
    const el = floorPlanState.elements.find(e => e.id === decorId);
    if (!el) return;

    const newName = document.getElementById('editDecorName').value.trim() || el.name;
    const newW = parseInt(document.getElementById('editDecorWidth').value, 10) || 60;
    const newH = parseInt(document.getElementById('editDecorHeight').value, 10) || 45;
    const newCap = parseInt(document.getElementById('editDecorCapacity').value, 10) || 0;
    const newIcon = document.getElementById('editDecorIcon').value || el.icon;
    const selectedShape = document.querySelector('input[name="decorShapeOption"]:checked')?.value || 'rect';

    el.name = newName;
    el.w = newW;
    el.h = selectedShape === 'round' || selectedShape === 'square' ? newW : newH;
    el.shape = selectedShape;
    el.icon = newIcon;
    el.capacity = newCap > 0 ? newCap : null;

    closeEditDecorModal();
    render2DFloorPlan();
    inspectDecorElement(el);
    showToast(`✅ "${newName}" configurado: Forma ${selectedShape.toUpperCase()} (${newW}x${el.h}px).`);
}

function deleteDecorElementDirect(decorId) {
    if (!confirm('¿Seguro que deseas eliminar este elemento del plano?')) return;
    floorPlanState.elements = floorPlanState.elements.filter(e => e.id !== decorId);
    render2DFloorPlan();
    const inspector = document.getElementById('floorInspectorCard');
    if (inspector) {
        inspector.innerHTML = `
            <h4 class="inspector-title">Selecciona un elemento</h4>
            <p style="font-size:0.8rem; color:#475569; margin:6px 0;">Haz clic en cualquier mesa o elemento decorativo para inspeccionarlo o modificar su forma.</p>
        `;
    }
    showToast(`🗑️ Elemento eliminado del plano.`);
}

function deleteDecorElementFromModal() {
    const decorId = document.getElementById('editDecorId').value;
    closeEditDecorModal();
    deleteDecorElementDirect(decorId);
}

function assignWaiterToTableNumber(tableNum, waiterId) {
    floorPlanState.waiters.forEach(w => {
        w.tables = w.tables.filter(t => t !== tableNum);
        if (w.id === waiterId) {
            w.tables.push(tableNum);
        }
    });
    render2DFloorPlan();
    renderWaitersStaffing();
    showToast(`👨‍🍳 Cuadrante actualizado: Mesa ${tableNum} asignada.`);
}

function renderWaitersStaffing() {
    const list = document.getElementById('waitersStaffingList');
    if (!list) return;

    currentData = getWeddingState(currentWeddingId);

    list.innerHTML = floorPlanState.waiters.map(w => {
        let totalPax = 0;
        w.tables.forEach(tNum => {
            const tableObj = (currentData.tables || [])[tNum - 1];
            if (tableObj) {
                const seated = (currentData.guests || []).filter(g => g.tableId === tableObj.id);
                totalPax += seated.reduce((s, g) => s + (g.passes || 1), 0);
            } else {
                totalPax += 10;
            }
        });

        return `
            <div class="waiter-item-row" style="border-left: 4px solid ${w.color};">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="font-size:0.85rem; color:#0f172a;">${w.name}</strong>
                        <div style="font-size:0.7rem; color:#64748b;">${w.phone}</div>
                    </div>
                    <span style="font-size:0.75rem; font-weight:800; color:#1e293b; background:#f1f5f9; padding:2px 8px; border-radius:10px;">${totalPax} pax</span>
                </div>
                <div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
                    <span style="font-size:0.7rem; color:#64748b;">Mesas:</span>
                    ${w.tables.length > 0 ? w.tables.map(t => `<span class="badge-table-chip" style="background:${w.color}20; color:${w.color}; border:1px solid ${w.color}40;">Mesa ${t}</span>`).join('') : '<span style="font-size:0.7rem; color:#94a3b8;">Sin mesas</span>'}
                </div>
            </div>
        `;
    }).join('');
}

function addNewWaiterPrompt() {
    if (typeof activeRole !== 'undefined' && activeRole === 'couple') {
        showToast('🔒 Acción exclusiva de tu Wedding Planner.');
        return;
    }
    const name = prompt('Nombre completo del mesero/a:');
    if (!name) return;
    const phone = prompt('Teléfono / WhatsApp de contacto:', '+52 55 ');
    const colors = ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6'];
    const newColor = colors[floorPlanState.waiters.length % colors.length];

    const newW = {
        id: 'w' + (floorPlanState.waiters.length + 1),
        name: name,
        phone: phone || '',
        tables: [],
        color: newColor
    };
    floorPlanState.waiters.push(newW);
    renderWaitersStaffing();
    showToast(`✅ Mesero ${name} registrado en la brigada de servicio.`);
}

// CAPTAIN PRINT MODAL
function openCaptainPrintModal() {
    if (typeof activeRole !== 'undefined' && activeRole === 'couple') {
        showToast('🔒 Acción exclusiva de tu Wedding Planner.');
        return;
    }
    currentData = getWeddingState(currentWeddingId);
    const paper = document.getElementById('captainPrintPaper');
    if (!paper) return;

    let tableRows = '';
    (currentData.tables || []).forEach((t, idx) => {
        const tableNum = idx + 1;
        const waiter = floorPlanState.waiters.find(w => w.tables.includes(tableNum));
        const waiterName = waiter ? waiter.name : '<span style="color:#ef4444; font-weight:700;">Sin Asignar</span>';

        const seated = (currentData.guests || []).filter(g => g.tableId === t.id);
        const pax = seated.reduce((s, g) => s + (g.passes || 1), 0);
        const allergies = seated.filter(g => g.allergies && g.allergies.toLowerCase() !== 'ninguna' && g.allergies.trim() !== '');
        const allergiesText = allergies.length > 0 ? allergies.map(a => `${a.name}: ${a.allergies}`).join('; ') : 'Menú Estándar (Sin Alergias)';

        tableRows += `
            <tr>
                <td style="text-align:center; font-weight:800;">Mesa ${tableNum}</td>
                <td><strong>${t.name}</strong></td>
                <td style="text-align:center; font-weight:700;">${pax} / ${t.capacity}</td>
                <td>${waiterName}</td>
                <td style="${allergies.length > 0 ? 'color:#b91c1c; font-weight:700;' : 'color:#64748b;'}">${allergiesText}</td>
            </tr>
        `;
    });

    let waiterBoxes = '';
    floorPlanState.waiters.forEach(w => {
        let totalPax = 0;
        w.tables.forEach(tNum => {
            const tableObj = (currentData.tables || [])[tNum - 1];
            if (tableObj) {
                const seated = (currentData.guests || []).filter(g => g.tableId === tableObj.id);
                totalPax += seated.reduce((s, g) => s + (g.passes || 1), 0);
            }
        });
        waiterBoxes += `
            <div style="border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px; background:#f8fafc;">
                <h4 style="margin:0; font-size:0.85rem; font-weight:800; color:#0f172a;">${w.name} (${w.phone})</h4>
                <div style="font-size:0.75rem; color:#475569; margin-top:3px;"><strong>Mesas Asignadas:</strong> ${w.tables.map(t => 'M' + t).join(', ') || 'Ninguna'}</div>
                <div style="font-size:0.75rem; color:#475569;"><strong>Carga de Comensales:</strong> ${totalPax} personas</div>
            </div>
        `;
    });

    paper.innerHTML = `
        <div style="border-bottom: 2px solid #0f172a; padding-bottom:12px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <h2 style="font-family:'Playfair Display', serif; font-size:1.4rem; color:#0f172a; margin:0;">AURA WEDDINGS • HOJA DE SERVICIO & BANQUETES</h2>
                    <p style="font-size:0.75rem; font-weight:800; color:#d97706; margin:3px 0 0; letter-spacing:0.05em;">ORDEN DE OPERACIÓN PARA CAPITÁN DE MESEROS & CHEF EJECUTIVO</p>
                </div>
                <div style="text-align:right; font-size:0.8rem; color:#475569;">
                    <div><strong>Boda:</strong> ${currentData.couple}</div>
                    <div><strong>Fecha:</strong> ${currentData.date} | <strong>Venue:</strong> ${currentData.venue}</div>
                    <div><strong>Salón:</strong> ${floorPlanState.venueWidth}m x ${floorPlanState.venueLength}m</div>
                </div>
            </div>
        </div>

        <div style="margin-bottom:16px;">
            <h3 style="font-size:0.95rem; font-weight:800; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:8px;">
                1. DISTRIBUCIÓN DE CUADRANTES DE MESEROS
            </h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:10px;">
                ${waiterBoxes}
            </div>
        </div>

        <div>
            <h3 style="font-size:0.95rem; font-weight:800; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:8px;">
                2. MATRIZ DE MESAS, CAPACIDAD & ALERGIAS / MENÚS ESPECIALES
            </h3>
            <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                <thead>
                    <tr style="background:#0f172a; color:#ffffff;">
                        <th style="padding:6px 8px; text-align:center; width:70px;">Mesa</th>
                        <th style="padding:6px 8px; text-align:left;">Nombre / Grupo de Invitados</th>
                        <th style="padding:6px 8px; text-align:center; width:80px;">Pax</th>
                        <th style="padding:6px 8px; text-align:left; width:150px;">Mesero Responsable</th>
                        <th style="padding:6px 8px; text-align:left;">Restricciones Alimentarias / Alergias</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>

        <div style="margin-top:30px; display:flex; justify-content:space-between; gap:20px;">
            <div style="flex:1; border-top:1px solid #0f172a; text-align:center; padding-top:6px; font-size:0.75rem; font-weight:700; color:#475569;">Firma Wedding Planner</div>
            <div style="flex:1; border-top:1px solid #0f172a; text-align:center; padding-top:6px; font-size:0.75rem; font-weight:700; color:#475569;">Firma Capitán de Meseros</div>
            <div style="flex:1; border-top:1px solid #0f172a; text-align:center; padding-top:6px; font-size:0.75rem; font-weight:700; color:#475569;">Firma Chef de Banquetes</div>
        </div>
    `;

    document.getElementById('modalCaptainPrint').classList.add('show');
}

// Traditional Drag & Drop Seating (uses global currentWeddingId & currentData)

function renderSeatingChart() {
    currentData = getWeddingState(currentWeddingId);
    const unassignedList = document.getElementById('unassignedList');
    const tablesGrid = document.getElementById('tablesGrid');
    if (!unassignedList || !tablesGrid) return;

    unassignedList.innerHTML = '';
    tablesGrid.innerHTML = '';

    if (!currentData || !Array.isArray(currentData.guests)) {
        const uCount = document.getElementById('unassignedCount');
        if (uCount) uCount.innerText = '0';
        const badgeSeating = document.getElementById('badgeSeatingPending');
        if (badgeSeating) badgeSeating.innerText = '0 pendientes';
        tablesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding:3rem; color:#64748b; background:#ffffff; border:1px dashed #cbd5e1; border-radius:12px;">
                <div style="font-size:2rem; margin-bottom:8px;">🍽️</div>
                <strong style="color:#0f172a; font-size:1rem; display:block;">Sin plano de mesas</strong>
                <span style="font-size:0.85rem;">Crea o selecciona una boda para distribuir mesas e invitados.</span>
            </div>
        `;
        return;
    }

    const unassigned = currentData.guests.filter(g => !g.tableId && g.status === 'confirmed');
    document.getElementById('unassignedCount').innerText = unassigned.length;
    const badgeSeating = document.getElementById('badgeSeatingPending');
    if (badgeSeating) badgeSeating.innerText = `${unassigned.length} pendientes`;

    // Render Unassigned Pool
    unassigned.forEach(g => {
        const item = document.createElement('div');
        item.className = 'draggable-guest';
        item.draggable = true;
        item.id = `guest_${g.id}`;
        item.dataset.guestId = g.id;

        const hasAllergy = g.allergies && g.allergies.toLowerCase() !== 'ninguna' && g.allergies.trim() !== '';
        item.innerHTML = `
            <div class="drag-guest-name">
                <span>${g.name}</span>
                <span class="drag-guest-passes">🎟️ ${g.passes} ${g.passes > 1 ? '(+1)' : ''}</span>
            </div>
            <div class="drag-guest-menu">Platillo: ${getMenuLabel(g.menu)}</div>
            ${hasAllergy ? `<span class="guest-allergy-badge">⚠️ ${g.allergies}</span>` : ''}
        `;

        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        unassignedList.appendChild(item);
    });

    // Render Tables
    currentData.tables.forEach(t => {
        const seatedGuests = currentData.guests.filter(g => g.tableId === t.id);
        const totalPax = seatedGuests.reduce((sum, g) => sum + (g.passes || 1), 0);
        const isFull = totalPax >= t.capacity;
        const tableAllergies = seatedGuests.filter(g => g.allergies && g.allergies.toLowerCase() !== 'ninguna' && g.allergies.trim() !== '');

        const tableCard = document.createElement('div');
        tableCard.className = `table-dropzone ${isFull ? 'table-full' : ''} ${tableAllergies.length > 0 ? 'has-allergies' : ''}`;
        tableCard.dataset.tableId = t.id;
        tableCard.dataset.capacity = t.capacity;
        tableCard.dataset.currentPax = totalPax;

        tableCard.innerHTML = `
            <div class="table-card-header">
                <div>
                    <span class="table-title">${t.name}</span>
                    <small style="display:block; color:#64748b; font-weight:600;">${t.shape === 'rect' || t.shape === 'imperial' ? '🔲 Rectangular / Imperial' : t.shape === 'square' ? '⬛ Cuadrangular' : t.shape === 'honor' ? '👑 Mesa de Honor' : '⚪ Circular'}</small>
                </div>
                <span class="table-occupancy ${isFull ? 'occupancy-full' : 'occupancy-open'}">
                    ${totalPax} / ${t.capacity} pax ${isFull ? '(Llena)' : ''}
                </span>
            </div>

            ${tableAllergies.length > 0 ? `
                <div class="table-allergy-warning">
                    <span>⚠️</span>
                    <span><strong>${tableAllergies.length} Menús Especiales:</strong> ${tableAllergies.map(a => a.allergies).join(', ')}</span>
                </div>
            ` : ''}

            <div class="table-seats-list" id="seatList_${t.id}"></div>
        `;

        const seatList = tableCard.querySelector(`#seatList_${t.id}`);
        seatedGuests.forEach(g => {
            const guestRow = document.createElement('div');
            guestRow.className = 'seated-guest-row';
            const hasAllergy = g.allergies && g.allergies.toLowerCase() !== 'ninguna' && g.allergies.trim() !== '';
            guestRow.innerHTML = `
                <div>
                    <strong>${g.name}</strong> ${g.passes > 1 ? `<small>(+1: ${g.companion || 'Acompañante'})</small>` : ''}
                    <div style="font-size:0.7rem; color:#64748b;">${getMenuLabel(g.menu)} ${hasAllergy ? `<span style="color:#b91c1c; font-weight:700;">⚠️ ${g.allergies}</span>` : ''}</div>
                </div>
                <button class="btn-unseat" title="Remover de mesa" onclick="unseatGuest('${g.id}')">✕</button>
            `;
            seatList.appendChild(guestRow);
        });

        tableCard.addEventListener('dragover', handleDragOver);
        tableCard.addEventListener('dragleave', handleDragLeave);
        tableCard.addEventListener('drop', handleDropToTable);

        tablesGrid.appendChild(tableCard);
    });
}

function getMenuLabel(menuKey) {
    if (menuKey === 'filete') return '🥩 Filete Mignon';
    if (menuKey === 'salmon') return '🐟 Salmón Rosé';
    if (menuKey === 'risotto') return '🍄 Risotto Vegano';
    return menuKey || 'Estándar';
}

let draggedGuestId = null;

function handleDragStart(e) {
    draggedGuestId = this.dataset.guestId;
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', draggedGuestId);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDropToTable(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    const tableId = this.dataset.tableId;
    const capacity = parseInt(this.dataset.capacity);
    const currentPax = parseInt(this.dataset.currentPax);

    const guest = currentData.guests.find(g => g.id === draggedGuestId);
    if (!guest) return;

    const tableObj = (currentData.tables || []).find(t => t.id === tableId);
    const isHonorTable = (tableObj && (tableObj.shape === 'honor' || tableObj.name.toLowerCase().includes('honor')));

    // VALIDACIÓN ESTRICTA: MESA DE HONOR MÁXIMO 6 INVITADOS
    if (isHonorTable && (currentPax + neededPax > 6)) {
        alert(`👑 Validación Mesa de Honor: La Mesa de Honor solo acepta un máximo de 6 invitados en total.`);
        return;
    }

    if (currentPax + neededPax > capacity) {
        showToast(`⚠️ Capacidad insuficiente en esta mesa (requiere ${neededPax} lugares, disponibles: ${capacity - currentPax})`);
        return;
    }

    guest.tableId = tableId;
    saveWeddingState(currentWeddingId, currentData);
    renderSeatingChart();
    renderDashboard();
    showToast(`✅ ${guest.name} asignado a ${this.querySelector('.table-title').innerText}`);
}

function allowDrop(e) {
    e.preventDefault();
}

function dropToUnassigned(e) {
    e.preventDefault();
    if (!draggedGuestId) return;
    unseatGuest(draggedGuestId);
}

function unseatGuest(guestId) {
    const guest = currentData.guests.find(g => g.id === guestId);
    if (guest) {
        guest.tableId = null;
        saveWeddingState(currentWeddingId, currentData);
        renderSeatingChart();
        renderDashboard();
        showToast(`↩️ ${guest.name} desasignado de la mesa`);
    }
}

function filterUnassigned(query) {
    const items = document.querySelectorAll('.draggable-guest');
    const q = query.toLowerCase();
    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(q) ? 'block' : 'none';
    });
}


// ==========================================================================
// DYNAMIC TABLE EDITOR & SHAPE SWITCHER (CIRCULAR, CUADRADA, IMPERIAL, TRIANGULAR)
// ==========================================================================

function onTableShapeOptionChange(shape) {
    const capSelect = document.getElementById('editTableCapacity');
    const notice = document.getElementById('editTableCapacityNotice');
    if (!capSelect) return;

    if (shape === 'honor') {
        if (notice) notice.style.display = 'block';
        // Limit options or enforce 2 to 6
        Array.from(capSelect.options).forEach(opt => {
            const val = parseInt(opt.value, 10);
            if (val >= 2 && val <= 6) {
                opt.disabled = false;
                opt.style.display = 'block';
            } else {
                opt.disabled = true;
                opt.style.display = 'none';
            }
        });
        const currentVal = parseInt(capSelect.value, 10);
        if (currentVal < 2 || currentVal > 6) {
            capSelect.value = "4";
        }
    } else {
        if (notice) notice.style.display = 'none';
        Array.from(capSelect.options).forEach(opt => {
            opt.disabled = false;
            opt.style.display = 'block';
        });
        if (shape === 'square') {
            const currentVal = parseInt(capSelect.value, 10);
            if (currentVal < 8 || currentVal > 10) capSelect.value = "8";
        } else if (shape === 'rect' || shape === 'imperial') {
            const currentVal = parseInt(capSelect.value, 10);
            if (currentVal < 12) capSelect.value = "14";
        }
    }
}

function onNewTableShapeChange(shape) {
    const capInput = document.getElementById('newTableCapacity');
    const notice = document.getElementById('newTableCapacityNotice');
    if (!capInput) return;

    if (shape === 'honor') {
        if (notice) notice.style.display = 'block';
        capInput.min = "2";
        capInput.max = "6";
        const val = parseInt(capInput.value, 10);
        if (val < 2 || val > 6) capInput.value = "4";
    } else {
        if (notice) notice.style.display = 'none';
        capInput.min = "2";
        capInput.max = "24";
        if (shape === 'square') capInput.value = "8";
        else if (shape === 'rect' || shape === 'imperial') capInput.value = "14";
        else capInput.value = "10";
    }
}

function openEditTableModal(tableId) {
    currentData = getWeddingState(currentWeddingId);
    const table = (currentData.tables || []).find(t => t.id === tableId);
    if (!table) return;

    document.getElementById('editTableId').value = table.id;
    document.getElementById('editTableName').value = table.name || '';
    document.getElementById('editTableCapacity').value = table.capacity || 10;
    document.getElementById('editTableModalTitle').innerText = `Editar ${table.name}`;

    const shape = table.shape || 'round';
    const radio = document.querySelector(`input[name="tableShapeOption"][value="${shape}"]`);
    if (radio) radio.checked = true;

    onTableShapeOptionChange(shape);

    const modal = document.getElementById('modalEditTable');
    if (modal) modal.classList.add('active');
}

function closeEditTableModal() {
    const modal = document.getElementById('modalEditTable');
    if (modal) modal.classList.remove('active');
}

function saveTableConfig() {
    currentData = getWeddingState(currentWeddingId);
    const tableId = document.getElementById('editTableId').value;
    const table = (currentData.tables || []).find(t => t.id === tableId);
    if (!table) return;

    const newName = document.getElementById('editTableName').value.trim() || table.name;
    let newCapacity = parseInt(document.getElementById('editTableCapacity').value, 10) || 10;
    const selectedShape = document.querySelector('input[name="tableShapeOption"]:checked')?.value || 'round';

    // VALIDACIÓN ESTRICTA: MESA DE HONOR SOLO ACEPTA DE 2 A 6 INVITADOS
    if (selectedShape === 'honor' || newName.toLowerCase().includes('honor')) {
        if (newCapacity < 2) {
            newCapacity = 2;
            showToast('⚠️ La Mesa de Honor requiere un mínimo de 2 invitados.');
        } else if (newCapacity > 6) {
            alert('👑 Validación Mesa de Honor: La Mesa de Honor solo acepta un máximo de 6 invitados (Novios, Padrinos o Padres de los novios).');
            return;
        }
    }

    // Check if seated guests already exceed the new capacity
    const seated = (currentData.guests || []).filter(g => g.tableId === table.id);
    const currentPax = seated.reduce((s, g) => s + (g.passes || 1), 0);
    if (currentPax > newCapacity) {
        alert(`⚠️ No se puede reducir la capacidad a ${newCapacity} pax porque actualmente hay ${currentPax} invitados sentados en esta mesa. Reubica invitados antes de reducir.`);
        return;
    }

    table.name = newName;
    table.capacity = newCapacity;
    table.shape = selectedShape;

    // Synchronize 2D Floor Plan element
    let el = floorPlanState.elements.find(e => e.tableId === table.id);
    if (!el) {
        // If element didn't exist in floorPlanState, create it so 2D plan immediately updates
        const tableIndex = (currentData.tables || []).findIndex(t => t.id === table.id);
        const tableNum = tableIndex >= 0 ? tableIndex + 1 : 1;
        el = {
            id: 'el_' + table.id,
            type: 'table',
            shape: selectedShape,
            tableId: table.id,
            tableNumber: tableNum,
            name: newName,
            x: 50 + ((tableNum % 3) * 100),
            y: 280 + (Math.floor(tableNum / 3) * 90),
            size: 65,
            waiterId: 'w1'
        };
        floorPlanState.elements.push(el);
    }

    if (el) {
        el.name = newName;
        el.shape = selectedShape;
        if (selectedShape === 'rect' || selectedShape === 'imperial') {
            el.w = 100;
            el.h = 50;
            el.size = 65;
        } else if (selectedShape === 'square') {
            el.size = 65;
            el.w = 65;
            el.h = 65;
        } else if (selectedShape === 'honor') {
            el.size = 65;
            el.w = 110;
            el.h = 45;
        } else {
            el.size = 65;
            el.w = 65;
            el.h = 65;
        }
    }

    saveWeddingState(currentWeddingId, currentData);
    closeEditTableModal();
    renderSeatingChart();
    if (typeof render2DFloorPlan === 'function') render2DFloorPlan();
    showToast(`✅ "${newName}" actualizada: Forma ${selectedShape.toUpperCase()}, ${newCapacity} sillas.`);
}

function openNewTableModal() {
    const modal = document.getElementById('modalNewTable');
    if (modal) modal.classList.add('active');
    const shapeSel = document.getElementById('newTableShape');
    if (shapeSel) onNewTableShapeChange(shapeSel.value);
}

function closeNewTableModal() {
    const modal = document.getElementById('modalNewTable');
    if (modal) modal.classList.remove('active');
}

function createNewTable() {
    currentData = getWeddingState(currentWeddingId);
    if (!currentData.tables) currentData.tables = [];

    const tableNum = currentData.tables.length + 1;
    const name = document.getElementById('newTableName').value.trim() || `Mesa ${tableNum} - Grupo de Invitados`;
    const shape = document.getElementById('newTableShape').value || 'round';
    let capacity = parseInt(document.getElementById('newTableCapacity').value, 10) || 10;

    // VALIDACIÓN ESTRICTA: MESA DE HONOR SOLO ACEPTA DE 2 A 6 INVITADOS
    if (shape === 'honor' || name.toLowerCase().includes('honor')) {
        if (capacity < 2 || capacity > 6) {
            alert('👑 Validación Mesa de Honor: La Mesa de Honor solo acepta de 2 a 6 invitados.');
            return;
        }
    }

    const newId = 't' + Date.now();

    currentData.tables.push({
        id: newId,
        name: name,
        capacity: capacity,
        shape: shape,
        guests: []
    });

    // Add to 2D Floor plan
    const newX = 50 + ((tableNum % 3) * 100);
    const newY = 280 + (Math.floor(tableNum / 3) * 90);
    floorPlanState.elements.push({
        id: 'el_' + newId,
        type: 'table',
        shape: shape,
        tableId: newId,
        tableNumber: tableNum,
        name: name,
        x: newX,
        y: newY,
        size: 65,
        w: (shape === 'rect' || shape === 'imperial') ? 100 : (shape === 'honor' ? 110 : 65),
        h: (shape === 'rect' || shape === 'imperial') ? 50 : (shape === 'honor' ? 45 : 65),
        waiterId: 'w1'
    });

    saveWeddingState(currentWeddingId, currentData);
    closeNewTableModal();
    renderSeatingChart();
    if (typeof render2DFloorPlan === 'function') render2DFloorPlan();
    showToast(`🎉 Nueva "${name}" agregada con éxito al plano.`);
}
