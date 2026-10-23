// ==========================================================================
// RUN OF SHOW & ESCALETA MAESTRA (DÍA D & MULTI-DÍA) ENGINE
// ==========================================================================

const timelineDaysData = {
    day1: {
        title: 'Día 1: Cóctel Rompehielos & Bienvenida (Viernes)',
        milestones: [
            { id: 'd1_m1', phase: 'setup', time: '16:00 - 18:00', title: 'Montaje de Barra & Lounge de Terraza', lead: 'Coordinador de Montaje', status: 'completed', notes: 'Instalación de mobiliario tipo sala y guirnaldas de luces cálidas.' },
            { id: 'd1_m2', phase: 'cocktail', time: '19:00 - 20:30', title: 'Recepción de Invitados & Barra de Margaritas', lead: 'Capitán de Mixología', status: 'completed', notes: 'Música acústica en vivo (guitarra y saxofón).' },
            { id: 'd1_m3', phase: 'dinner', time: '20:30 - 22:30', title: 'Cena Casual de Tacos Gourmet & Mariscos', lead: 'Chef Taquería Gourmet', status: 'pending', notes: 'Estaciones interactivas de tacos y cazuelas.' },
            { id: 'd1_m4', phase: 'party', time: '22:30 - 00:00', title: 'Brindis de Bienvenida & Cierre Rompehielos', lead: 'Lead Planner', status: 'pending', notes: 'Palabras de bienvenida de los novios a invitados foráneos.' }
        ]
    },
    day2: {
        title: 'Día 2: Boda & Recepción de Gala - Día D (Sábado)',
        milestones: [
            { id: 'd2_m1', phase: 'setup', time: '10:00 - 13:00', title: 'Montaje de Carpa, Audio & Pista de Madera', lead: 'Coordinador Técnico / DJ', status: 'completed', notes: 'Pruebas de planta de luz de 60kW y tiro de cables.' },
            { id: 'd2_m2', phase: 'setup', time: '13:00 - 15:00', title: 'Montaje Floral & Decoración de Mesas', lead: 'Diseñadora Floral', status: 'completed', notes: 'Colocación de centros de mesa altos y velas aromáticas.' },
            { id: 'd2_m3', phase: 'prep', time: '14:00 - 16:00', title: 'Getting Ready & Sesión First Look Novios', lead: 'Lead Planner & Fotógrafo', status: 'in_progress', notes: 'Entrega de ramo de novia y prendidos para papás.' },
            { id: 'd2_m4', phase: 'ceremony', time: '16:30 - 17:30', title: 'Ceremonia Religiosa / Simbólica en Jardín', lead: 'Asistente 1 & Cuarteto', status: 'pending', notes: 'Música de entrada con cuarteto de cuerdas en vivo.' },
            { id: 'd2_m5', phase: 'cocktail', time: '17:30 - 19:00', title: 'Cocktail de Bienvenida & Barra de Mixología', lead: 'Capitán de Banquetes', status: 'pending', notes: 'Pase de canapés gourmet fríos y calientes.' },
            { id: 'd2_m6', phase: 'protocol', time: '19:00 - 19:30', title: 'Apertura de Salón & Entrada Triunfal de Novios', lead: 'Lead Planner & DJ', status: 'pending', notes: 'Canción: Coldplay - A Sky Full of Stars con chispas frías.' },
            { id: 'd2_m7', phase: 'dinner', time: '19:30 - 21:15', title: 'Servicio de Banquete de 4 Tiempos', lead: 'Chef Ejecutivo & Capitán', status: 'pending', notes: 'Control estricto de dietas de celíacos y veganos.' },
            { id: 'd2_m8', phase: 'protocol', time: '21:15 - 21:35', title: 'Primer Baile de Novios (Vals) & Baile con Padres', lead: 'Lead Planner', status: 'pending', notes: 'Efecto de bruma baja sobre la pista de baile.' },
            { id: 'd2_m9', phase: 'party', time: '21:35 - 02:00', title: 'Apertura de Pista & Fiesta con DJ / Banda', lead: 'DJ & Barman', status: 'pending', notes: 'Rondas de shots y kit de animación a las 23:30 hrs.' },
            { id: 'd2_m10', phase: 'late', time: '02:00 - 03:30', title: 'Tornaboda (Chilaquiles & Tacos al Pastor)', lead: 'Coordinador de Banquete', status: 'pending', notes: 'Servicio en estación buffet caliente.' },
            { id: 'd2_m11', phase: 'teardown', time: '03:30 - 05:00', title: 'Desmontaje de Equipos & Devolución de Alcohol', lead: 'Coordinador de Cierre', status: 'pending', notes: 'Inventario final de botellas cerradas y entrega a novios.' }
        ]
    },
    day3: {
        title: 'Día 3: Tornaboda & Brunch Post-Boda (Domingo)',
        milestones: [
            { id: 'd3_m1', phase: 'prep', time: '11:00 - 12:00', title: 'Montaje de Estación de Mimosas & Clamatos', lead: 'Staff de Barra', status: 'pending', notes: 'Barra de curación con jugos naturales y cerveza artesanal.' },
            { id: 'd3_m2', phase: 'dinner', time: '12:00 - 15:00', title: 'Brunch Campestre & Barbacoa Tradicional', lead: 'Capitán de Alimentos', status: 'pending', notes: 'Música ambiental chill out acústica.' },
            { id: 'd3_m3', phase: 'teardown', time: '15:00 - 17:00', title: 'Despedida de Invitados & Cierre de Finca', lead: 'Lead Planner', status: 'pending', notes: 'Entrega final del venue y depósitos de garantía.' }
        ]
    }
};

let activeDayTab = 'day2';
let activePhaseFilter = 'all';
let draggedItemIndex = null;

// Standard Preset Templates Library
const timelinePresetsLibrary = [
    {
        key: 'preset_ceremony',
        title: '⛪ Ceremonia Religiosa / Simbólica',
        time: '16:30 - 17:30',
        phase: 'ceremony',
        lead: 'Lead Planner, Sacerdote & Cuarteto',
        notes: 'Cortejo nupcial, entrega de anillos, arras, lazo y marcha nupcial.'
    },
    {
        key: 'preset_cocktail',
        title: '🍸 Cocktail de Bienvenida & Canapés Gourmet',
        time: '17:30 - 19:00',
        phase: 'cocktail',
        lead: 'Capitán de Barra & Hostess',
        notes: 'Cocteles signature de autor y pase de 4 bocadillos por comensal.'
    },
    {
        key: 'preset_entrance',
        title: '👑 Gran Entrada Triunfal & Efectos Especiales',
        time: '19:00 - 19:15',
        phase: 'protocol',
        lead: 'Lead Planner & DJ',
        notes: 'Coordinación con DJ para entrada enérgica con fuentes de pirotecnia fría.'
    },
    {
        key: 'preset_vals',
        title: '💃 Primer Baile de Novios (Vals) & Baile Familiar',
        time: '21:15 - 21:35',
        phase: 'protocol',
        lead: 'DJ & Lead Planner',
        notes: 'Canción especial de pareja, seguida por baile de novia con papá y novio con mamá.'
    },
    {
        key: 'preset_dinner',
        title: '🍽️ Banquete Formal de 3 Tiempos & Maridaje',
        time: '19:30 - 21:15',
        phase: 'dinner',
        lead: 'Chef Ejecutivo & Capitán de Meseros',
        notes: 'Entrada, plato fuerte y postre con sincronización de tiempos por mesa.'
    },
    {
        key: 'preset_toast',
        title: '🥂 Brindis de Honor & Palabras de Padrinos',
        time: '21:00 - 21:15',
        phase: 'protocol',
        lead: 'Maestro de Ceremonias & Asistente 1',
        notes: 'Copas servidas de Champaña y micrófono inalámbrico desinfectado.'
    },
    {
        key: 'preset_party',
        title: '🎵 Apertura de Pista de Baile & DJ Set Explosivo',
        time: '21:35 - 01:30',
        phase: 'party',
        lead: 'DJ & Animadores',
        notes: 'Encendido de luces robóticas y entrega de props de animación a invitados.'
    },
    {
        key: 'preset_bouquet',
        title: '💐 Lanzamiento de Ramo & Liga',
        time: '23:30 - 23:45',
        phase: 'protocol',
        lead: 'Lead Planner & DJ',
        notes: 'Llamado a solteras y solteros en pista con dinámica musical divertida.'
    },
    {
        key: 'preset_late',
        title: '🌮 Tornaboda Trasnochadora (Tacos / Chilaquiles)',
        time: '01:30 - 03:00',
        phase: 'late',
        lead: 'Capitán de Banquete',
        notes: 'Estación de tacos de pastor y chilaquiles con salsas mexicanas.'
    },
    {
        key: 'preset_sendoff',
        title: '🎆 Salida Triunfal con Luces de Bengala & Despedida',
        time: '03:00 - 03:30',
        phase: 'teardown',
        lead: 'Asistente 2 & Seguridad',
        notes: 'Pasillo de honor con bengalas gigantes de 1 metro y auto nupcial listo.'
    }
];

function getActiveTimelineData() {
    const wId = (typeof currentWeddingId !== 'undefined' && currentWeddingId) ? currentWeddingId : 'aura';
    const key = `wedding_timeline_${wId}`;
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                return parsed;
            }
        }
    } catch(e) {}
    return timelineDaysData;
}

function saveActiveTimelineData(data) {
    const wId = (typeof currentWeddingId !== 'undefined' && currentWeddingId) ? currentWeddingId : 'aura';
    const key = `wedding_timeline_${wId}`;
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch(e) {}
}

// Initialize and Render
function renderDayOfTab() {
    const list = document.getElementById('dayOfTimelineList');
    if (!list) return;

    const allData = getActiveTimelineData();
    const currentDay = allData[activeDayTab];
    if (!currentDay) return;

    let items = currentDay.milestones || [];
    if (activePhaseFilter !== 'all') {
        items = items.filter(m => m.phase === activePhaseFilter);
    }

    if (items.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding:3rem 1rem; background:#ffffff; border:1px dashed #cbd5e1; border-radius:12px;">
                <div style="font-size:2.5rem; margin-bottom:0.5rem;">⏱️</div>
                <h4 style="font-size:1.1rem; color:#0f172a; margin-bottom:0.25rem;">No hay hitos registrados en este filtro</h4>
                <p style="color:#64748b; font-size:0.85rem; margin-bottom:1rem;">Usa los botones superiores para agregar o insertar bloques estándar predefinidos.</p>
                <button class="btn-action primary" onclick="openPresetModal()">📦 Insertar Bloque Predefinido</button>
            </div>
        `;
        return;
    }

    list.innerHTML = items.map((m, idx) => {
        const isDone = m.status === 'completed';
        const isCurrent = m.status === 'in_progress';
        const itemNumber = String(idx + 1).padStart(2, '0');

        return `
            <div class="timeline-row-card ${isDone ? 'done-row' : isCurrent ? 'current-row' : ''}" 
                 draggable="true"
                 data-id="${m.id}"
                 data-index="${idx}"
                 ondragstart="handleTimelineDragStart(event, ${idx})"
                 ondragover="handleTimelineDragOver(event)"
                 ondragenter="handleTimelineDragEnter(event)"
                 ondragleave="handleTimelineDragLeave(event)"
                 ondrop="handleTimelineDrop(event, ${idx})"
                 ondragend="handleTimelineDragEnd(event)">
                
                <div class="drag-handle-col" title="Arrastra para reordenar la secuencia">
                    <span class="drag-icon">⠿</span>
                    <span class="timeline-order-badge">#${itemNumber}</span>
                </div>

                <div class="timeline-status-checkbox" onclick="toggleMilestoneStatus('${m.id}')" title="Clic para alternar estado">
                    <div class="checkbox-circle ${isDone ? 'checked' : isCurrent ? 'pulse-active' : ''}">
                        ${isDone ? '✓' : isCurrent ? '⚡' : ''}
                    </div>
                </div>

                <div class="timeline-time-badge">${m.time}</div>

                <div class="timeline-main-content">
                    <div class="timeline-title-row">
                        <h4 class="timeline-title">${m.title}</h4>
                        <span class="timeline-phase-pill ${m.phase}">${getPhaseLabel(m.phase)}</span>
                    </div>
                    <p class="timeline-notes">📝 ${m.notes}</p>
                    <div class="timeline-meta-row">
                        <span>👤 <strong>Responsable:</strong> ${m.lead}</span>
                        <span class="timeline-status-label ${m.status}">${getStatusLabel(m.status)}</span>
                    </div>
                </div>

                <div class="timeline-item-actions">
                    <button class="btn-icon-action" onclick="openEditMilestoneModal('${m.id}')" title="Editar Hito">✏️</button>
                    <button class="btn-icon-action danger" onclick="deleteMilestone('${m.id}')" title="Eliminar Hito">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

// Switch Day Tabs
function switchDayTab(dayKey) {
    activeDayTab = dayKey;
    document.querySelectorAll('.day-selector-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.day === dayKey);
    });
    
    // Update banner text
    const bannerTitle = document.getElementById('dayOfBannerTitle');
    if (bannerTitle && timelineDaysData[dayKey]) {
        bannerTitle.innerText = timelineDaysData[dayKey].title;
    }
    renderDayOfTab();
}

// Phase Filter
function filterTimelinePhase(phase) {
    activePhaseFilter = phase;
    document.querySelectorAll('.phase-filter-pill').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    renderDayOfTab();
}

function getPhaseLabel(phase) {
    const map = {
        setup: '🛠️ Montaje',
        prep: '💄 Getting Ready',
        ceremony: '⛪ Ceremonia',
        cocktail: '🍸 Coctel',
        protocol: '👑 Protocolo',
        dinner: '🍽️ Banquete',
        party: '🎉 Fiesta & DJ',
        late: '🌮 Tornaboda',
        teardown: '📦 Desmontaje'
    };
    return map[phase] || phase;
}

function getStatusLabel(status) {
    if (status === 'completed') return '✓ Concluido';
    if (status === 'in_progress') return '⚡ En Curso';
    return '⏳ Programado';
}

function toggleMilestoneStatus(id) {
    const allData = getActiveTimelineData();
    const list = (allData[activeDayTab] && allData[activeDayTab].milestones) ? allData[activeDayTab].milestones : [];
    const item = list.find(m => m.id === id);
    if (!item) return;

    if (item.status === 'completed') item.status = 'pending';
    else if (item.status === 'pending') item.status = 'in_progress';
    else item.status = 'completed';

    saveActiveTimelineData(allData);
    renderDayOfTab();
    if (typeof showToast === 'function') {
        showToast(`⏱️ Estatus de "${item.title}" actualizado a ${getStatusLabel(item.status)}.`);
    }
}

// Drag and Drop implementation
function handleTimelineDragStart(e, index) {
    draggedItemIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
}

function handleTimelineDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleTimelineDragEnter(e) {
    e.preventDefault();
    const card = e.currentTarget;
    if (card && !card.classList.contains('dragging')) {
        card.classList.add('drag-over');
    }
}

function handleTimelineDragLeave(e) {
    const card = e.currentTarget;
    if (card) card.classList.remove('drag-over');
}

function handleTimelineDrop(e, targetIndex) {
    e.preventDefault();
    e.stopPropagation();
    const card = e.currentTarget;
    if (card) card.classList.remove('drag-over');

    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const allData = getActiveTimelineData();
    const list = (allData[activeDayTab] && allData[activeDayTab].milestones) ? allData[activeDayTab].milestones : [];
    const [movedItem] = list.splice(draggedItemIndex, 1);
    list.splice(targetIndex, 0, movedItem);

    saveActiveTimelineData(allData);
    draggedItemIndex = null;
    renderDayOfTab();
    if (typeof showToast === 'function') {
        showToast(`🔄 Secuencia de Run of Show reordenada.`);
    }
}

function handleTimelineDragEnd(e) {
    draggedItemIndex = null;
    document.querySelectorAll('.timeline-row-card').forEach(el => {
        el.classList.remove('dragging', 'drag-over');
    });
}

// ==========================================================================
// PRESETS CATALOG MODAL
// ==========================================================================
function openPresetModal() {
    const grid = document.getElementById('presetsListGrid');
    if (grid) {
        grid.innerHTML = timelinePresetsLibrary.map(p => `
            <div class="preset-milestone-card" onclick="insertPresetMilestone('${p.key}')">
                <div class="preset-card-top">
                    <span class="preset-card-time">${p.time}</span>
                    <span class="timeline-phase-pill ${p.phase}">${getPhaseLabel(p.phase)}</span>
                </div>
                <h4 class="preset-card-title">${p.title}</h4>
                <p class="preset-card-notes">${p.notes}</p>
                <div class="preset-card-foot">
                    <span>👤 ${p.lead}</span>
                    <span class="preset-add-btn">+ Insertar</span>
                </div>
            </div>
        `).join('');
    }
    const m = document.getElementById('modalPresetMilestones');
    if (m) m.classList.add('active');
}

function closePresetModal() {
    const m = document.getElementById('modalPresetMilestones');
    if (m) m.classList.remove('active');
}

function getMilestoneSortWeight(timeStr) {
    if (!timeStr) return 9999;
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return 9999;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    // Times between 00:00 and 06:00 belong to the late night / tornaboda of the event
    if (h < 6) h += 24;
    return h * 60 + m;
}

function insertPresetMilestone(presetKey) {
    const preset = timelinePresetsLibrary.find(p => p.key === presetKey);
    if (!preset) return;

    // Close preset library modal
    closePresetModal();

    // Extract start and end times from preset
    let startVal = '19:00';
    let endVal = '20:00';
    if (preset.time) {
        const timesMatch = preset.time.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
        if (timesMatch) {
            startVal = timesMatch[1];
            endVal = timesMatch[2];
        }
    }

    const startInput = document.getElementById('newMileTimeStart');
    const endInput = document.getElementById('newMileTimeEnd');
    if (startInput) startInput.value = startVal;
    if (endInput) endInput.value = endVal;

    const phaseInput = document.getElementById('newMilePhase');
    if (phaseInput) phaseInput.value = preset.phase || 'protocol';

    const titleInput = document.getElementById('newMileTitle');
    if (titleInput) titleInput.value = preset.title || '';

    const leadInput = document.getElementById('newMileLead');
    if (leadInput) leadInput.value = preset.lead || '';

    const notesInput = document.getElementById('newMileNotes');
    if (notesInput) notesInput.value = preset.notes || '';

    const modalTitle = document.querySelector('#modalNewMilestone .modal-title');
    if (modalTitle) modalTitle.innerText = `Personalizar e Insertar: ${preset.title}`;

    const m = document.getElementById('modalNewMilestone');
    if (m) m.classList.add('active');
}

function formatTime12h(time24) {
    if (!time24) return '';
    const parts = time24.split(':');
    if (parts.length < 2) return time24;
    let hour = parseInt(parts[0], 10);
    const min = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${min} ${ampm}`;
}

function parseAndFormatTime(start, end) {
    if (!start && !end) return '19:00 - 19:30';
    if (start && end) {
        return `${start} - ${end}`;
    }
    return `${start || end}`;
}

// ==========================================================================
// NEW & EDIT MILESTONE MODALS
// ==========================================================================
function openNewMilestoneModal() {
    const startInput = document.getElementById('newMileTimeStart');
    const endInput = document.getElementById('newMileTimeEnd');
    if (startInput) startInput.value = '19:00';
    if (endInput) endInput.value = '19:30';
    
    document.getElementById('newMilePhase').value = 'protocol';
    document.getElementById('newMileTitle').value = '';
    document.getElementById('newMileLead').value = 'Wedding Planner & DJ';
    document.getElementById('newMileNotes').value = '';

    const modalTitle = document.querySelector('#modalNewMilestone .modal-title');
    if (modalTitle) modalTitle.innerText = 'Agregar Nuevo Hito a la Escaleta';

    const m = document.getElementById('modalNewMilestone');
    if (m) m.classList.add('active');
}

function closeNewMilestoneModal() {
    const m = document.getElementById('modalNewMilestone');
    if (m) m.classList.remove('active');
}

function saveNewMilestone() {
    const start = document.getElementById('newMileTimeStart') ? document.getElementById('newMileTimeStart').value : '19:00';
    const end = document.getElementById('newMileTimeEnd') ? document.getElementById('newMileTimeEnd').value : '19:30';
    const time = parseAndFormatTime(start, end);
    const phase = document.getElementById('newMilePhase').value || 'protocol';
    const title = document.getElementById('newMileTitle').value.trim();
    const lead = document.getElementById('newMileLead').value.trim() || 'Wedding Planner';
    const notes = document.getElementById('newMileNotes').value.trim() || 'Sin notas especiales.';

    if (!title) {
        alert('Por favor especifica un título para el protocolo o momento.');
        return;
    }

    const newMilestone = {
        id: 'm_' + Date.now(),
        phase: phase,
        time: time,
        title: title,
        lead: lead,
        status: 'pending',
        notes: notes
    };

    const allData = getActiveTimelineData();
    if (!allData[activeDayTab]) allData[activeDayTab] = { title: 'Día de Evento', milestones: [] };
    const list = allData[activeDayTab].milestones || [];
    const newWeight = getMilestoneSortWeight(newMilestone.time);
    let inserted = false;
    for (let i = 0; i < list.length; i++) {
        if (getMilestoneSortWeight(list[i].time) > newWeight) {
            list.splice(i, 0, newMilestone);
            inserted = true;
            break;
        }
    }
    if (!inserted) {
        list.push(newMilestone);
    }

    saveActiveTimelineData(allData);
    closeNewMilestoneModal();
    renderDayOfTab();
    if (typeof showToast === 'function') {
        showToast(`⏱️ "${title}" programado para las ${time}.`);
    }
}

let editingMilestoneId = null;

function openEditMilestoneModal(id) {
    const allData = getActiveTimelineData();
    const list = (allData[activeDayTab] && allData[activeDayTab].milestones) ? allData[activeDayTab].milestones : [];
    const item = list.find(m => m.id === id);
    if (!item) return;

    editingMilestoneId = id;
    
    // Extract start and end times if formatted
    const timesMatch = item.time.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
    const startInput = document.getElementById('editMileTimeStart');
    const endInput = document.getElementById('editMileTimeEnd');
    if (timesMatch && startInput && endInput) {
        startInput.value = timesMatch[1];
        endInput.value = timesMatch[2];
    } else if (startInput && endInput) {
        startInput.value = '19:00';
        endInput.value = '20:00';
    }

    document.getElementById('editMilePhase').value = item.phase;
    document.getElementById('editMileTitle').value = item.title;
    document.getElementById('editMileLead').value = item.lead;
    document.getElementById('editMileStatus').value = item.status;
    document.getElementById('editMileNotes').value = item.notes;

    const m = document.getElementById('modalEditMilestone');
    if (m) m.classList.add('active');
}

function closeEditMilestoneModal() {
    editingMilestoneId = null;
    const m = document.getElementById('modalEditMilestone');
    if (m) m.classList.remove('active');
}

function saveEditMilestone() {
    if (!editingMilestoneId) return;
    const allData = getActiveTimelineData();
    const list = (allData[activeDayTab] && allData[activeDayTab].milestones) ? allData[activeDayTab].milestones : [];
    const item = list.find(m => m.id === editingMilestoneId);
    if (!item) return;

    const start = document.getElementById('editMileTimeStart') ? document.getElementById('editMileTimeStart').value : '19:00';
    const end = document.getElementById('editMileTimeEnd') ? document.getElementById('editMileTimeEnd').value : '20:00';
    item.time = parseAndFormatTime(start, end);
    item.phase = document.getElementById('editMilePhase').value;
    item.title = document.getElementById('editMileTitle').value.trim() || item.title;
    item.lead = document.getElementById('editMileLead').value.trim();
    item.status = document.getElementById('editMileStatus').value;
    item.notes = document.getElementById('editMileNotes').value.trim();

    list.sort((a, b) => getMilestoneSortWeight(a.time) - getMilestoneSortWeight(b.time));

    saveActiveTimelineData(allData);
    closeEditMilestoneModal();
    renderDayOfTab();
    if (typeof showToast === 'function') {
        showToast(`✓ Hito "${item.title}" actualizado correctamente.`);
    }
}

function deleteMilestone(id) {
    const allData = getActiveTimelineData();
    const list = (allData[activeDayTab] && allData[activeDayTab].milestones) ? allData[activeDayTab].milestones : [];
    const itemIdx = list.findIndex(m => m.id === id);
    if (itemIdx === -1) return;

    const name = list[itemIdx].title;
    if (confirm(`¿Estás seguro de eliminar "${name}" del Run of Show?`)) {
        list.splice(itemIdx, 1);
        saveActiveTimelineData(allData);
        renderDayOfTab();
        if (typeof showToast === 'function') {
            showToast(`🗑️ "${name}" eliminado.`);
        }
    }
}

// Print View
// Multi-Day Comprehensive Production Print View
function printDayOfSheet() {
    const activeDaysKeys = Object.keys(timelineDaysData).filter(k => timelineDaysData[k] && timelineDaysData[k].milestones && timelineDaysData[k].milestones.length > 0);
    
    if (activeDaysKeys.length === 0) {
        alert('No hay hitos registrados en la escaleta para imprimir.');
        return;
    }

    let sectionsHtml = activeDaysKeys.map((dayKey, dayIndex) => {
        const dayObj = timelineDaysData[dayKey];
        const rows = dayObj.milestones.map((m, idx) => `
            <tr>
                <td style="font-weight:800; text-align:center; padding:7px 8px; border:1px solid #cbd5e1; background:#f8fafc;">#${String(idx + 1).padStart(2, '0')}</td>
                <td style="font-weight:800; text-align:center; padding:7px 8px; border:1px solid #cbd5e1; white-space:nowrap; color:#0f172a;">${m.time}</td>
                <td style="padding:7px 10px; border:1px solid #cbd5e1;">
                    <strong style="color:#0f172a; font-size:0.86rem;">${m.title}</strong>
                    ${m.notes ? `<div style="font-size:0.75rem; color:#475569; margin-top:2px; line-height:1.25;">${m.notes}</div>` : ''}
                </td>
                <td style="padding:7px 8px; border:1px solid #cbd5e1; font-weight:600; color:#334155;">${m.lead}</td>
                <td style="padding:7px 8px; border:1px solid #cbd5e1; text-align:center; font-weight:700; font-size:0.75rem;">${getPhaseLabel(m.phase)}</td>
                <td style="padding:7px 8px; border:1px solid #cbd5e1; text-align:center; font-size:0.75rem;">${getStatusLabel(m.status)}</td>
            </tr>
        `).join('');

        return `
            <div class="day-print-section" style="${dayIndex > 0 ? 'page-break-before: always; margin-top: 2rem;' : ''}">
                <div class="day-section-banner">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; font-size:1.15rem; color:#0f172a; text-transform:uppercase; letter-spacing:0.04em; display:flex; align-items:center; gap:8px;">
                            <span style="background:#0f172a; color:#fff; padding:3px 8px; border-radius:4px; font-size:0.75rem;">BLOQUE ${dayIndex + 1}</span>
                            ${dayObj.title}
                        </h2>
                        <span style="font-size:0.78rem; font-weight:700; color:#64748b; background:#f1f5f9; padding:3px 10px; border-radius:12px;">${dayObj.milestones.length} Hitos Programados</span>
                    </div>
                </div>

                <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:0.8rem;">
                    <thead>
                        <tr>
                            <th class="center" style="width:40px;">#</th>
                            <th class="center" style="width:110px;">Horario</th>
                            <th>Hito / Protocolo &amp; Instrucciones Clave</th>
                            <th style="width:160px;">Responsable / Lead</th>
                            <th class="center" style="width:115px;">Fase</th>
                            <th class="center" style="width:95px;">Estatus</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Por favor permite las ventanas emergentes para imprimir la escaleta completa.');
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>AURA WEDDINGS • ESCALETA MAESTRA DE PRODUCCIÓN COMPLETA</title>
            <style>
                @page { size: letter portrait; margin: 15mm; }
                body { font-family: 'Segoe UI', -apple-system, Arial, sans-serif; padding: 15px; color: #0f172a; margin: 0; background: #ffffff; }
                .master-header { border-bottom: 3px solid #0f172a; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-end; }
                .brand-title { margin: 0; font-size: 1.45rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 800; color: #0f172a; }
                .brand-sub { margin: 4px 0 0; color: #d97706; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.04em; text-transform: uppercase; }
                .day-section-banner { background: #f8fafc; border: 1.5px solid #e2e8f0; border-left: 5px solid #0f172a; padding: 10px 14px; border-radius: 6px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                th { background: #0f172a; color: #ffffff; padding: 8px; text-align: left; font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.04em; }
                th.center { text-align: center; }
                .print-footer-info { margin-top: 25px; border-top: 1px dashed #cbd5e1; padding-top: 10px; display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; }
                @media print {
                    button { display: none; }
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="master-header">
                <div>
                    <h1 class="brand-title">AURA WEDDINGS • RUN OF SHOW MAESTRO</h1>
                    <p class="brand-sub">CRONOGRAMA GENERAL COMPLETO DE PRODUCCIÓN &amp; PROTOCOLO (${activeDaysKeys.length} DÍAS)</p>
                </div>
                <div style="text-align:right; font-size:0.8rem; color:#475569;">
                    <strong>Documento Oficial de Producción</strong><br>
                    Generado: ${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            ${sectionsHtml}

            <div class="print-footer-info">
                <span>Wedding Planner OS • Antigravity Enterprise</span>
                <span>Firma de Conformidad: ____________________________________ (Lead Planner)</span>
            </div>

            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// ==========================================================================
// PUNTO 7: AJUSTE GLOBAL DE HORARIOS EN ESCALETA (+15 / +30 / -15 MINUTOS)
// ==========================================================================
function shiftActiveDaySchedule(minutes) {
    const day = timelineDaysData[activeDayTab];
    if (!day || !day.milestones || day.milestones.length === 0) {
        if (typeof showToast === 'function') showToast("No hay hitos en el día seleccionado para ajustar.");
        return;
    }

    function addMinutesToTimeStr(timeStr, delta) {
        const parts = timeStr.trim().split(':');
        if (parts.length < 2) return timeStr;
        let h = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        if (isNaN(h) || isNaN(m)) return timeStr;
        
        let totalMinutes = h * 60 + m + delta;
        if (totalMinutes < 0) totalMinutes += 24 * 60;
        totalMinutes = totalMinutes % (24 * 60);

        let newH = Math.floor(totalMinutes / 60);
        let newM = totalMinutes % 60;
        return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    }

    day.milestones.forEach(m => {
        if (m.time && m.time.includes('-')) {
            const range = m.time.split('-');
            const newStart = addMinutesToTimeStr(range[0], minutes);
            const newEnd = addMinutesToTimeStr(range[1], minutes);
            m.time = `${newStart} - ${newEnd}`;
        }
    });

    renderDayOfTab();
    const sign = minutes > 0 ? `+${minutes}` : `${minutes}`;
    if (typeof showToast === 'function') {
        showToast(`⏱️ Escaleta ajustada (${sign} min) en todos los hitos de ${day.title.split(':')[0]}.`);
    }
}
