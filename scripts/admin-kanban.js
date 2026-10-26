/**
 * Wedding Planner OS - CRM de Actividades & Roadmap (Kanban Drag & Drop)
 * Ultra-fácil de usar, cero configuración requerida, pre-cargado desde el día 1.
 */

// Master 12-Month Wedding Checklist Template (Fases Cronológicas)
const DEFAULT_WEDDING_TASKS = [
    // FASE 1: 12 A 10 MESES ANTES
    {
        id: "task_1",
        title: "Definir presupuesto general y estimación de invitados (Target Pax)",
        phase: "12-10",
        phaseLabel: "12 a 10 Meses",
        category: "locacion",
        categoryLabel: "🏛️ Locación & Presupuesto",
        assignedTo: "both",
        assignedLabel: "👥 Novios & Planner",
        priority: "high",
        status: "done",
        notes: "Establecer rango de presupuesto total y lista tentativa de invitados para cotizar recintos."
    },
    {
        id: "task_2",
        title: "Visita técnica y bloqueo oficial de recinto / Hacienda / Jardín",
        phase: "12-10",
        phaseLabel: "12 a 10 Meses",
        category: "locacion",
        categoryLabel: "🏛️ Locación & Presupuesto",
        assignedTo: "both",
        assignedLabel: "👥 Novios & Planner",
        priority: "high",
        status: "done",
        notes: "Confirmar disponibilidad de fecha y firmar contrato de exclusividad de recinto."
    },
    {
        id: "task_3",
        title: "Contratación de Fotografía Editorial y Video Cinematográfico",
        phase: "12-10",
        phaseLabel: "12 a 10 Meses",
        category: "fotovideo",
        categoryLabel: "📸 Foto & Video",
        assignedTo: "planner",
        assignedLabel: "📋 Wedding Planner",
        priority: "high",
        status: "done",
        notes: "Revisar portafolios y apartar fecha con anticipo del 30% a 50%."
    },
    {
        id: "task_4",
        title: "Definición de paleta de color, estilo y moodboard estético",
        phase: "12-10",
        phaseLabel: "12 a 10 Meses",
        category: "dia_d",
        categoryLabel: "✨ Concepto & Diseño",
        assignedTo: "couple",
        assignedLabel: "💍 Novios",
        priority: "medium",
        status: "done",
        notes: "Seleccionar colores clave, tipografías y referencias de ambientación botánica/editorial."
    },

    // FASE 2: 9 A 7 MESES ANTES
    {
        id: "task_5",
        title: "Selección y contratación de Banquete & Catering de Autor",
        phase: "9-7",
        phaseLabel: "9 a 7 Meses",
        category: "banquete",
        categoryLabel: "🍽️ Banquete & Cocina",
        assignedTo: "planner",
        assignedLabel: "📋 Wedding Planner",
        priority: "high",
        status: "inprogress",
        notes: "Definir servicio de tiempos, loza de autor y ratio de meseros por comensal."
    },
    {
        id: "task_6",
        title: "Contratación de DJ, Sistema de Iluminación y Audio de Pista",
        phase: "9-7",
        phaseLabel: "9 a 7 Meses",
        category: "musica",
        categoryLabel: "🎵 Música & Audio",
        assignedTo: "planner",
        assignedLabel: "📋 Wedding Planner",
        priority: "high",
        status: "inprogress",
        notes: "Definir audio para ceremonia, cóctel y pista de baile principal."
    },
    {
        id: "task_7",
        title: "Búsqueda y selección del Vestido de Novia y Traje de Novio",
        phase: "9-7",
        phaseLabel: "9 a 7 Meses",
        category: "vestimenta",
        categoryLabel: "👗 Moda Nupcial",
        assignedTo: "couple",
        assignedLabel: "💍 Novios",
        priority: "medium",
        status: "inprogress",
        notes: "Agendar primeras citas en ateliers y programar tiempos de confección/ajustes."
    },
    {
        id: "task_8",
        title: "Diseño y programación de Invitación Web con RSVP digital",
        phase: "9-7",
        phaseLabel: "9 a 7 Meses",
        category: "convocatoria",
        categoryLabel: "💌 Invitación & RSVP",
        assignedTo: "planner",
        assignedLabel: "📋 Wedding Planner",
        priority: "high",
        status: "inprogress",
        notes: "Cargar briefing de novios, fotos, itinerario y activar formulario de confirmación con sincronización cloud."
    },

    // FASE 3: 6 A 4 MESES ANTES
    {
        id: "task_9",
        title: "Degustación de menú con Chef y selección de 3 o 4 tiempos",
        phase: "6-4",
        phaseLabel: "6 a 4 Meses",
        category: "banquete",
        categoryLabel: "🍽️ Banquete & Cocina",
        assignedTo: "both",
        assignedLabel: "👥 Novios & Planner",
        priority: "high",
        status: "todo",
        notes: "Probar opciones de carnes, pescados y alternativas para dietas especiales (vegetarianos, celíacos)."
    },
    {
        id: "task_10",
        title: "Lanzamiento oficial de Invitación Web y apertura de RSVP WhatsApp",
        phase: "6-4",
        phaseLabel: "6 a 4 Meses",
        category: "convocatoria",
        categoryLabel: "💌 Invitación & RSVP",
        assignedTo: "planner",
        assignedLabel: "📋 Wedding Planner",
        priority: "high",
        status: "todo",
        notes: "Disparar enlaces personalizados desde el panel de envíos WhatsApp."
    },
    {
        id: "task_11",
        title: "Apertura de Cuentas CLABE para Regalos & Fondo de Luna de Miel",
        phase: "6-4",
        phaseLabel: "6 a 4 Meses",
        category: "finanzas",
        categoryLabel: "💳 Finanzas & Regalos",
        assignedTo: "couple",
        assignedLabel: "💍 Novios",
        priority: "medium",
        status: "todo",
        notes: "Configurar banco receptor, CLABE y metas de luna de miel en la invitación interactiva."
    },
    {
        id: "task_12",
        title: "Contratación de Floristería, Arco Ceremonial y Centros de Mesa",
        phase: "6-4",
        phaseLabel: "6 a 4 Meses",
        category: "locacion",
        categoryLabel: "🌿 Ambientación & Flores",
        assignedTo: "planner",
        assignedLabel: "📋 Wedding Planner",
        priority: "medium",
        status: "todo",
        notes: "Definir paleta floral, bouquet nupcial, botoniers y diseño de mesas altas y bajas."
    },
    {
        id: "task_13",
        title: "Bloqueo de habitaciones en hoteles para invitados foráneos",
        phase: "6-4",
        phaseLabel: "6 a 4 Meses",
        category: "logistica",
        categoryLabel: "✈️ Logística & Hoteles",
        assignedTo: "both",
        assignedLabel: "👥 Novios & Planner",
        priority: "low",
        status: "todo",
        notes: "Negociar tarifa preferencial de grupo con código de boda en hoteles cercanos."
    },

    // FASE 4: 3 A 1 MESES ANTES
    {
        id: "task_14",
        title: "Cálculo de botellas en Calculadora de Barra & Vinos",
        phase: "3-1",
        phaseLabel: "3 a 1 Meses",
        category: "barra",
        categoryLabel: "🍾 Barra & Vinos",
        assignedTo: "planner",
        assignedLabel: "📋 Wedding Planner",
        priority: "medium",
        status: "todo",
        notes: "Ejecutar fórmula por tipo de trago (Tequila, Whisky, Gin, Champagne) según aforo confirmado."
    },
    {
        id: "task_15",
        title: "Prueba de peinado y maquillaje nupcial (Makeup Artist)",
        phase: "3-1",
        phaseLabel: "3 a 1 Meses",
        category: "vestimenta",
        categoryLabel: "👗 Moda Nupcial",
        assignedTo: "couple",
        assignedLabel: "💍 Novios",
        priority: "medium",
        status: "todo",
        notes: "Realizar prueba con velo y accesorios para fijar tiempos del cronograma matutino."
    },
    {
        id: "task_16",
        title: "Cierre de lista de confirmados y armado de Mesas en Plano 2D",
        phase: "3-1",
        phaseLabel: "3 a 1 Meses",
        category: "mesas",
        categoryLabel: "🪑 Mesas & Asientos",
        assignedTo: "planner",
        assignedLabel: "📋 Wedding Planner",
        priority: "high",
        status: "todo",
        notes: "Asignar cada invitado confirmado a su mesa en el simulador 2D interactivo."
    },
    {
        id: "task_17",
        title: "Curaduría de Playlist musical de momentos clave (Vals, Entrada, Fiesta)",
        phase: "3-1",
        phaseLabel: "3 a 1 Meses",
        category: "musica",
        categoryLabel: "🎵 Música & Audio",
        assignedTo: "couple",
        assignedLabel: "💍 Novios",
        priority: "medium",
        status: "todo",
        notes: "Registrar temas prohibidos y canciones indispensables para entrega al DJ."
    },
    {
        id: "task_18",
        title: "Validación de comprobantes SPEI y liquidación de anticipos a proveedores",
        phase: "3-1",
        phaseLabel: "3 a 1 Meses",
        category: "finanzas",
        categoryLabel: "💳 Finanzas & Regalos",
        assignedTo: "planner",
        assignedLabel: "📋 Wedding Planner",
        priority: "high",
        status: "todo",
        notes: "Revisar saldos pendientes en el módulo de proveedores antes de la fecha límite."
    },

    // FASE 5: SEMANA DEL EVENTO & DÍA D
    {
        id: "task_19",
        title: "Emisión y entrega de Ficha Técnica Ejecutiva de Cocina al Chef",
        phase: "semana_d",
        phaseLabel: "Semana del Evento",
        category: "banquete",
        categoryLabel: "🍽️ Banquete & Cocina",
        assignedTo: "planner",
        assignedLabel: "📋 Wedding Planner",
        priority: "high",
        status: "todo",
        notes: "Generar PDF formal de cocina con desglose de dietas especiales, alergias y firma de recepción."
    },
    {
        id: "task_20",
        title: "Alineación del Cronograma Minuto a Minuto con proveedores y cortejo",
        phase: "semana_d",
        phaseLabel: "Semana del Evento",
        category: "dia_d",
        categoryLabel: "⏱️ Operación Día D",
        assignedTo: "planner",
        assignedLabel: "📋 Wedding Planner",
        priority: "high",
        status: "todo",
        notes: "Compartir minuta de tiempos de montaje, ceremonia, vals, cena y desmontaje."
    },
    {
        id: "task_21",
        title: "Confirmación de horarios de shuttles y transporte de invitados",
        phase: "semana_d",
        phaseLabel: "Semana del Evento",
        category: "logistica",
        categoryLabel: "✈️ Logística & Hoteles",
        assignedTo: "planner",
        assignedLabel: "📋 Wedding Planner",
        priority: "medium",
        status: "todo",
        notes: "Verificar rutas de salida desde hoteles sedes y retornos nocturnos."
    },
    {
        id: "task_22",
        title: "Impresión de QR Stands de Mesa para Álbum Colaborativo de Fotos",
        phase: "semana_d",
        phaseLabel: "Semana del Evento",
        category: "convocatoria",
        categoryLabel: "💌 Invitación & RSVP",
        assignedTo: "planner",
        assignedLabel: "📋 Wedding Planner",
        priority: "medium",
        status: "todo",
        notes: "Imprimir tarjetas elegantes de centro de mesa para que los invitados suban fotos en vivo."
    },
    {
        id: "task_23",
        title: "Ensayo general de ceremonia con cortejo y entrega de argollas",
        phase: "semana_d",
        phaseLabel: "Semana del Evento",
        category: "dia_d",
        categoryLabel: "⏱️ Operación Día D",
        assignedTo: "both",
        assignedLabel: "👥 Novios & Planner",
        priority: "high",
        status: "todo",
        notes: "Marcar pasos de entrada, ubicación de padrinos y entrega de símbolos."
    },
    {
        id: "task_24",
        title: "Habilitación del Módulo Hostess en vivo para control de acceso y check-in",
        phase: "semana_d",
        phaseLabel: "Semana del Evento",
        category: "dia_d",
        categoryLabel: "⏱️ Operación Día D",
        assignedTo: "planner",
        assignedLabel: "📋 Wedding Planner",
        priority: "high",
        status: "todo",
        notes: "Compartir PIN del Live Hostess al equipo de recepción en puerta."
    }
];

// Current filter state for Kanban
let currentKanbanFilterAssignee = 'all'; // 'all', 'planner', 'couple'
let currentKanbanFilterPhase = 'all';    // 'all', '12-10', '9-7', '6-4', '3-1', 'semana_d'
let currentKanbanSearchQuery = '';

/**
 * Retrieve tasks for active wedding from localStorage or fallback to defaults
 */
function getActiveWeddingTasks() {
    const weddingId = window.currentWeddingId || 'aura';
    const storageKey = `wedding_tasks_${weddingId}`;
    const raw = localStorage.getItem(storageKey);
    
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (e) {
            console.error('Error parsing wedding tasks:', e);
        }
    }
    
    // First time initializing: clone template and save to localStorage
    const initialTasks = JSON.parse(JSON.stringify(DEFAULT_WEDDING_TASKS));
    localStorage.setItem(storageKey, JSON.stringify(initialTasks));
    return initialTasks;
}

/**
 * Save tasks for active wedding to localStorage
 */
function saveActiveWeddingTasks(tasks) {
    const weddingId = window.currentWeddingId || 'aura';
    const storageKey = `wedding_tasks_${weddingId}`;
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    updateKanbanBadges();
}

/**
 * Move a task to a target status with instant feedback
 */
function moveTaskStatus(taskId, newStatus) {
    if (!['todo', 'inprogress', 'done'].includes(newStatus)) return;
    
    const tasks = getActiveWeddingTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
        const oldStatus = tasks[taskIndex].status;
        tasks[taskIndex].status = newStatus;
        saveActiveWeddingTasks(tasks);
        
        // Re-render Kanban
        renderKanbanTab();
        
        // Audio/Toast notification
        const statusNames = {
            todo: '📋 Por Hacer',
            inprogress: '⏳ En Curso',
            done: '✅ Completado'
        };
        
        if (typeof showToast === 'function') {
            showToast(`Tarea movida a: ${statusNames[newStatus]}`);
        }
    }
}

/**
 * Update badges in sidebar and dashboard
 */
function updateKanbanBadges() {
    const tasks = getActiveWeddingTasks();
    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const inprogressCount = tasks.filter(t => t.status === 'inprogress').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const totalCount = tasks.length;
    const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    
    // Sidebar badge
    const sidebarBadge = document.getElementById('statKanbanPendingBadge');
    if (sidebarBadge) {
        sidebarBadge.textContent = `${todoCount + inprogressCount} pendientes`;
        if (todoCount + inprogressCount === 0) {
            sidebarBadge.style.background = '#10b981';
            sidebarBadge.textContent = '¡Todo listo!';
        }
    }

    // Dashboard mini widget if present
    const dashProgressText = document.getElementById('dashKanbanProgressText');
    if (dashProgressText) {
        dashProgressText.textContent = `${percent}% completado (${doneCount} de ${totalCount})`;
    }
    const dashProgressBar = document.getElementById('dashKanbanProgressBar');
    if (dashProgressBar) {
        dashProgressBar.style.width = `${percent}%`;
    }
}

/**
 * Render the whole Kanban Tab
 */
function renderKanbanTab() {
    const container = document.getElementById('tab-kanban');
    if (!container) return;
    
    const tasks = getActiveWeddingTasks();
    
    // Filter tasks
    const filteredTasks = tasks.filter(t => {
        // Assignee filter
        if (currentKanbanFilterAssignee !== 'all') {
            if (currentKanbanFilterAssignee === 'planner' && t.assignedTo !== 'planner' && t.assignedTo !== 'both') return false;
            if (currentKanbanFilterAssignee === 'couple' && t.assignedTo !== 'couple' && t.assignedTo !== 'both') return false;
        }
        // Phase filter
        if (currentKanbanFilterPhase !== 'all' && t.phase !== currentKanbanFilterPhase) return false;
        // Search filter
        if (currentKanbanSearchQuery.trim()) {
            const q = currentKanbanSearchQuery.toLowerCase();
            const matchTitle = t.title.toLowerCase().includes(q);
            const matchNotes = (t.notes || '').toLowerCase().includes(q);
            const matchCat = (t.categoryLabel || '').toLowerCase().includes(q);
            if (!matchTitle && !matchNotes && !matchCat) return false;
        }
        return true;
    });

    const todoTasks = filteredTasks.filter(t => t.status === 'todo');
    const inprogressTasks = filteredTasks.filter(t => t.status === 'inprogress');
    const doneTasks = filteredTasks.filter(t => t.status === 'done');

    const totalTasks = tasks.length;
    const doneTotal = tasks.filter(t => t.status === 'done').length;
    const progressPercent = totalTasks > 0 ? Math.round((doneTotal / totalTasks) * 100) : 0;
    
    const weddingName = (window.currentData && window.currentData.couple) || "Boda Activa";

    // Build DOM
    const html = `
        <div class="tab-header" style="margin-bottom: 20px;">
            <div>
                <div class="d-flex align-center gap-2 mb-1">
                    <h1 class="tab-title">CRM de Actividades & Roadmap</h1>
                    <span class="badge-accent" style="background:#fef3c7; color:#b45309; border:1px solid #fde047; font-weight:800;">12 Meses · Drag & Drop</span>
                </div>
                <p class="tab-subtitle">Checklist maestro interactivo para <strong>${weddingName}</strong>. Arrastra las tarjetas entre columnas para actualizar su estado de inmediato sin configuraciones engorrosas.</p>
            </div>
            <div class="tab-actions" style="display:flex; gap:10px; flex-wrap:wrap;">
                <button type="button" class="btn-action secondary" onclick="openNewTaskModal()" style="font-weight:700; border-color:#d97706; color:#b45309;">
                    + Nueva Actividad
                </button>
                <button type="button" class="btn-action secondary" onclick="resetMasterKanbanTasks()" style="color:#64748b; font-size:0.85rem;" title="Restaurar el checklist maestro sugerido de 12 meses">
                    🔄 Restaurar Sugeridas
                </button>
                <button type="button" class="btn-action primary" onclick="printKanbanSummaryReport()" style="background:#0f172a; border-color:#0f172a;">
                    🖨️ Imprimir Hoja de Ruta
                </button>
            </div>
        </div>

        <!-- PROGRESS BAR & KPI SUMMARY CARD -->
        <div class="section-card mb-4" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1.5px solid #e2e8f0; border-left: 5px solid #d97706; padding: 18px 24px; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
                <div style="flex:1; min-width:260px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-size:0.82rem; font-weight:800; color:#334155; text-transform:uppercase; letter-spacing:0.5px;">Avance General de Producción</span>
                        <strong style="font-size:1.15rem; color:#b45309; font-weight:800;">${progressPercent}% Completado</strong>
                    </div>
                    <div style="width:100%; height:12px; background:#e2e8f0; border-radius:10px; overflow:hidden; position:relative;">
                        <div style="width:${progressPercent}%; height:100%; background:linear-gradient(90deg, #d97706 0%, #10b981 100%); border-radius:10px; transition:width 0.4s ease;"></div>
                    </div>
                    <div style="margin-top:6px; display:flex; justify-content:space-between; font-size:0.75rem; color:#64748b;">
                        <span>${doneTotal} de ${totalTasks} hitos completados</span>
                        <span>${tasks.filter(t => t.status === 'todo').length} pendientes por iniciar</span>
                    </div>
                </div>

                <div style="display:flex; gap:12px; flex-wrap:wrap;">
                    <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:10px; padding:8px 16px; text-align:center; min-width:90px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                        <span style="display:block; font-size:0.7rem; font-weight:800; color:#64748b; text-transform:uppercase;">Por Hacer</span>
                        <strong style="font-size:1.25rem; color:#475569; font-weight:800;">${tasks.filter(t => t.status === 'todo').length}</strong>
                    </div>
                    <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:8px 16px; text-align:center; min-width:90px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                        <span style="display:block; font-size:0.7rem; font-weight:800; color:#1d4ed8; text-transform:uppercase;">En Curso</span>
                        <strong style="font-size:1.25rem; color:#2563eb; font-weight:800;">${tasks.filter(t => t.status === 'inprogress').length}</strong>
                    </div>
                    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:8px 16px; text-align:center; min-width:90px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                        <span style="display:block; font-size:0.7rem; font-weight:800; color:#15803d; text-transform:uppercase;">Listas</span>
                        <strong style="font-size:1.25rem; color:#16a34a; font-weight:800;">${doneTotal}</strong>
                    </div>
                </div>
            </div>
        </div>

        <!-- FILTER & QUICK SEARCH TOOLBAR -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; margin-bottom: 20px; background:#ffffff; padding:14px 18px; border-radius:12px; border:1px solid #e2e8f0;">
            <!-- Filter by Assignee -->
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span style="font-size:0.8rem; font-weight:800; color:#475569;">Asignado a:</span>
                <div class="btn-group" style="display:inline-flex; border:1px solid #cbd5e1; border-radius:8px; overflow:hidden;">
                    <button type="button" onclick="setKanbanFilterAssignee('all')" style="padding:6px 12px; font-size:0.78rem; font-weight:700; border:none; cursor:pointer; background:${currentKanbanFilterAssignee === 'all' ? '#0f172a' : '#ffffff'}; color:${currentKanbanFilterAssignee === 'all' ? '#ffffff' : '#475569'};">Todos</button>
                    <button type="button" onclick="setKanbanFilterAssignee('planner')" style="padding:6px 12px; font-size:0.78rem; font-weight:700; border:none; border-left:1px solid #cbd5e1; cursor:pointer; background:${currentKanbanFilterAssignee === 'planner' ? '#0f172a' : '#ffffff'}; color:${currentKanbanFilterAssignee === 'planner' ? '#ffffff' : '#475569'};">📋 Wedding Planner</button>
                    <button type="button" onclick="setKanbanFilterAssignee('couple')" style="padding:6px 12px; font-size:0.78rem; font-weight:700; border:none; border-left:1px solid #cbd5e1; cursor:pointer; background:${currentKanbanFilterAssignee === 'couple' ? '#0f172a' : '#ffffff'}; color:${currentKanbanFilterAssignee === 'couple' ? '#ffffff' : '#475569'};">💍 Solo Novios</button>
                </div>
            </div>

            <!-- Filter by Phase -->
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span style="font-size:0.8rem; font-weight:800; color:#475569;">Fase:</span>
                <select id="kanbanPhaseSelect" onchange="setKanbanFilterPhase(this.value)" style="padding:7px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.8rem; color:#1e293b; background:#f8fafc; font-weight:600; outline:none;">
                    <option value="all" ${currentKanbanFilterPhase === 'all' ? 'selected' : ''}>Todas las Fases (12 Meses)</option>
                    <option value="12-10" ${currentKanbanFilterPhase === '12-10' ? 'selected' : ''}>Fase 1: 12 a 10 Meses</option>
                    <option value="9-7" ${currentKanbanFilterPhase === '9-7' ? 'selected' : ''}>Fase 2: 9 a 7 Meses</option>
                    <option value="6-4" ${currentKanbanFilterPhase === '6-4' ? 'selected' : ''}>Fase 3: 6 a 4 Meses</option>
                    <option value="3-1" ${currentKanbanFilterPhase === '3-1' ? 'selected' : ''}>Fase 4: 3 a 1 Meses</option>
                    <option value="semana_d" ${currentKanbanFilterPhase === 'semana_d' ? 'selected' : ''}>Fase 5: Semana del Evento</option>
                </select>
            </div>

            <!-- Search Input -->
            <div style="flex:1; max-width:280px; min-width:200px;">
                <input type="text" placeholder="🔍 Buscar actividad..." value="${currentKanbanSearchQuery}" oninput="setKanbanSearch(this.value)" style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.82rem; outline:none;">
            </div>
        </div>

        <!-- 3-COLUMN KANBAN BOARD -->
        <div class="kanban-board" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:20px; align-items:start;">
            
            <!-- COLUMN 1: POR HACER (PENDIENTES) -->
            <div class="kanban-column" id="col-todo" 
                 ondragover="handleKanbanDragOver(event)" 
                 ondragleave="handleKanbanDragLeave(event)" 
                 ondrop="handleKanbanDrop(event, 'todo')"
                 style="background:#f8fafc; border:2px dashed #cbd5e1; border-radius:14px; padding:16px; min-height:480px; display:flex; flex-direction:column; transition:all 0.2s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-bottom:10px; border-bottom:2px solid #e2e8f0;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:1.1rem;">📋</span>
                        <strong style="font-size:0.95rem; color:#1e293b; text-transform:uppercase; letter-spacing:0.5px;">Por Hacer</strong>
                    </div>
                    <span style="background:#e2e8f0; color:#475569; font-weight:800; font-size:0.75rem; padding:3px 10px; border-radius:12px;">${todoTasks.length}</span>
                </div>
                <div class="kanban-cards-container" id="container-todo" style="display:flex; flex-direction:column; gap:12px; flex:1;">
                    ${todoTasks.length > 0 ? todoTasks.map(t => renderKanbanCardHtml(t)).join('') : renderEmptyColumnPlaceholder('Sin actividades pendientes aquí')}
                </div>
            </div>

            <!-- COLUMN 2: EN CURSO / EN PROCESO -->
            <div class="kanban-column" id="col-inprogress" 
                 ondragover="handleKanbanDragOver(event)" 
                 ondragleave="handleKanbanDragLeave(event)" 
                 ondrop="handleKanbanDrop(event, 'inprogress')"
                 style="background:#f0f7ff; border:2px dashed #bfdbfe; border-radius:14px; padding:16px; min-height:480px; display:flex; flex-direction:column; transition:all 0.2s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-bottom:10px; border-bottom:2px solid #dbeafe;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:1.1rem;">⏳</span>
                        <strong style="font-size:0.95rem; color:#1d4ed8; text-transform:uppercase; letter-spacing:0.5px;">En Curso</strong>
                    </div>
                    <span style="background:#dbeafe; color:#1e40af; font-weight:800; font-size:0.75rem; padding:3px 10px; border-radius:12px;">${inprogressTasks.length}</span>
                </div>
                <div class="kanban-cards-container" id="container-inprogress" style="display:flex; flex-direction:column; gap:12px; flex:1;">
                    ${inprogressTasks.length > 0 ? inprogressTasks.map(t => renderKanbanCardHtml(t)).join('') : renderEmptyColumnPlaceholder('Arrastra aquí lo que estés gestionando')}
                </div>
            </div>

            <!-- COLUMN 3: COMPLETADAS / LISTAS -->
            <div class="kanban-column" id="col-done" 
                 ondragover="handleKanbanDragOver(event)" 
                 ondragleave="handleKanbanDragLeave(event)" 
                 ondrop="handleKanbanDrop(event, 'done')"
                 style="background:#f0fdf4; border:2px dashed #bbf7d0; border-radius:14px; padding:16px; min-height:480px; display:flex; flex-direction:column; transition:all 0.2s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-bottom:10px; border-bottom:2px solid #dcfce7;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:1.1rem;">✅</span>
                        <strong style="font-size:0.95rem; color:#15803d; text-transform:uppercase; letter-spacing:0.5px;">Completado</strong>
                    </div>
                    <span style="background:#dcfce7; color:#166534; font-weight:800; font-size:0.75rem; padding:3px 10px; border-radius:12px;">${doneTasks.length}</span>
                </div>
                <div class="kanban-cards-container" id="container-done" style="display:flex; flex-direction:column; gap:12px; flex:1;">
                    ${doneTasks.length > 0 ? doneTasks.map(t => renderKanbanCardHtml(t)).join('') : renderEmptyColumnPlaceholder('Arrastra aquí las actividades terminadas')}
                </div>
            </div>

        </div>

        <!-- NEW TASK MODAL PLACEHOLDER -->
        <div id="modalNewKanbanTask" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); z-index:999999; align-items:center; justify-content:center;">
            <div style="background:#ffffff; border-radius:16px; max-width:500px; width:92%; padding:24px; box-shadow:0 20px 40px rgba(0,0,0,0.2);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
                    <h3 style="font-size:1.15rem; color:#0f172a; margin:0; font-weight:800;">+ Nueva Actividad / Hito</h3>
                    <button type="button" onclick="closeNewTaskModal()" style="background:none; border:none; font-size:1.3rem; color:#94a3b8; cursor:pointer;">✕</button>
                </div>
                <form onsubmit="handleSaveNewKanbanTask(event)">
                    <div style="margin-bottom:14px;">
                        <label style="display:block; font-size:0.78rem; font-weight:800; color:#334155; margin-bottom:6px;">Título de la Actividad *</label>
                        <input type="text" id="newTaskTitleInput" required placeholder="Ej. Contratar carrito de shots y coctelería..." style="width:100%; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.86rem; outline:none;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
                        <div>
                            <label style="display:block; font-size:0.78rem; font-weight:800; color:#334155; margin-bottom:6px;">Fase / Plazo</label>
                            <select id="newTaskPhaseInput" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.82rem; background:#fff;">
                                <option value="12-10">12 a 10 Meses</option>
                                <option value="9-7">9 a 7 Meses</option>
                                <option value="6-4" selected>6 a 4 Meses</option>
                                <option value="3-1">3 a 1 Meses</option>
                                <option value="semana_d">Semana del Evento</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:0.78rem; font-weight:800; color:#334155; margin-bottom:6px;">Responsable</label>
                            <select id="newTaskAssigneeInput" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.82rem; background:#fff;">
                                <option value="planner" selected>Wedding Planner</option>
                                <option value="couple">Novios</option>
                                <option value="both">Ambos (Colaborativo)</option>
                            </select>
                        </div>
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="display:block; font-size:0.78rem; font-weight:800; color:#334155; margin-bottom:6px;">Notas u Observaciones (Opcional)</label>
                        <textarea id="newTaskNotesInput" rows="2" placeholder="Detalles de contacto, links de referencia o presupuesto estimado..." style="width:100%; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.82rem; outline:none; resize:none;"></textarea>
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button type="button" onclick="closeNewTaskModal()" class="btn-action secondary" style="padding:8px 16px;">Cancelar</button>
                        <button type="submit" class="btn-action primary" style="background:#d97706; border-color:#d97706; padding:8px 20px; font-weight:800;">Guardar Actividad</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    container.innerHTML = html;
    updateKanbanBadges();
}

/**
 * Render single Kanban Card HTML
 */
function renderKanbanCardHtml(task) {
    const priorityColors = {
        high: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', label: 'Alta' },
        medium: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d', label: 'Media' },
        low: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', label: 'Baja' }
    };
    const pStyle = priorityColors[task.priority] || priorityColors.medium;

    const assigneeIcons = {
        planner: '📋 Planner',
        couple: '💍 Novios',
        both: '👥 Ambos'
    };

    const isDone = task.status === 'done';

    return `
        <div class="kanban-card" 
             id="card-${task.id}" 
             draggable="true" 
             ondragstart="handleKanbanDragStart(event, '${task.id}')"
             ondragend="handleKanbanDragEnd(event)"
             style="background:#ffffff; border:1px solid ${isDone ? '#86efac' : '#e2e8f0'}; border-radius:12px; padding:14px; box-shadow:0 2px 6px rgba(0,0,0,0.04); cursor:grab; transition:transform 0.15s ease, box-shadow 0.15s ease; position:relative; opacity:${isDone ? '0.88' : '1'};">
            
            <!-- Card Header: Category & Priority -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:0.7rem; font-weight:800; color:#64748b; background:#f1f5f9; padding:2px 8px; border-radius:6px; letter-spacing:0.3px;">
                    ${task.phaseLabel}
                </span>
                <span style="font-size:0.68rem; font-weight:800; background:${pStyle.bg}; color:${pStyle.text}; border:1px solid ${pStyle.border}; padding:1px 6px; border-radius:6px;">
                    ${pStyle.label}
                </span>
            </div>

            <!-- Title -->
            <h4 style="font-size:0.88rem; color:${isDone ? '#15803d' : '#0f172a'}; font-weight:700; margin:0 0 6px; line-height:1.4; text-decoration:${isDone ? 'line-through' : 'none'};">
                ${task.title}
            </h4>

            <!-- Category & Notes -->
            <div style="font-size:0.72rem; color:#b45309; font-weight:600; margin-bottom:6px;">
                ${task.categoryLabel || '📌 Actividad General'}
            </div>
            ${task.notes ? `<p style="font-size:0.73rem; color:#64748b; margin:0 0 10px; line-height:1.35; background:#f8fafc; padding:6px 8px; border-radius:6px; border-left:2px solid #cbd5e1;">${task.notes}</p>` : ''}

            <!-- Footer: Assignee & Fast Status Buttons -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:8px; border-top:1px solid #f1f5f9; font-size:0.72rem;">
                <span style="color:#475569; font-weight:700;">
                    ${assigneeIcons[task.assignedTo] || '👥 General'}
                </span>
                
                <!-- Quick Move Action Pill (for fast click without dragging) -->
                <div style="display:flex; gap:4px;">
                    ${task.status === 'todo' ? `
                        <button type="button" onclick="moveTaskStatus('${task.id}', 'inprogress')" title="Mover a En Curso" style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; border-radius:6px; padding:3px 8px; font-weight:800; font-size:0.68rem; cursor:pointer;">
                            ▶️ Iniciar
                        </button>
                    ` : ''}

                    ${task.status === 'inprogress' ? `
                        <button type="button" onclick="moveTaskStatus('${task.id}', 'done')" title="Marcar como Completado" style="background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; border-radius:6px; padding:3px 8px; font-weight:800; font-size:0.68rem; cursor:pointer;">
                            ✅ Listo
                        </button>
                    ` : ''}

                    ${task.status === 'done' ? `
                        <button type="button" onclick="moveTaskStatus('${task.id}', 'todo')" title="Reabrir actividad" style="background:#f8fafc; color:#64748b; border:1px solid #cbd5e1; border-radius:6px; padding:3px 8px; font-weight:700; font-size:0.68rem; cursor:pointer;">
                            ↩️ Reabrir
                        </button>
                    ` : ''}

                    <button type="button" onclick="deleteKanbanTask('${task.id}')" title="Eliminar actividad" style="background:none; border:none; color:#94a3b8; font-size:0.75rem; cursor:pointer; padding:2px;">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderEmptyColumnPlaceholder(text) {
    return `
        <div style="text-align:center; padding:36px 14px; color:#94a3b8; font-size:0.8rem; border:1.5px dashed #cbd5e1; border-radius:10px; margin:auto 0;">
            <div style="font-size:1.6rem; margin-bottom:6px; opacity:0.6;">📦</div>
            ${text}
        </div>
    `;
}

// -------------------------------------------------------------
// HTML5 DRAG AND DROP HANDLERS
// -------------------------------------------------------------
let draggedTaskId = null;

function handleKanbanDragStart(e, taskId) {
    draggedTaskId = taskId;
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    
    const card = document.getElementById(`card-${taskId}`);
    if (card) {
        card.style.opacity = '0.4';
        card.style.transform = 'scale(0.98)';
    }
}

function handleKanbanDragEnd(e) {
    if (draggedTaskId) {
        const card = document.getElementById(`card-${draggedTaskId}`);
        if (card) {
            card.style.opacity = '1';
            card.style.transform = 'none';
        }
    }
    draggedTaskId = null;
    document.querySelectorAll('.kanban-column').forEach(col => {
        col.style.background = '';
        col.style.borderColor = '';
    });
}

function handleKanbanDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const col = e.currentTarget;
    if (col) {
        col.style.borderColor = '#d97706';
        col.style.background = 'rgba(254, 243, 199, 0.4)';
    }
}

function handleKanbanDragLeave(e) {
    const col = e.currentTarget;
    if (col) {
        col.style.borderColor = '';
        col.style.background = '';
    }
}

function handleKanbanDrop(e, targetStatus) {
    e.preventDefault();
    const col = e.currentTarget;
    if (col) {
        col.style.borderColor = '';
        col.style.background = '';
    }
    
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId && targetStatus) {
        moveTaskStatus(taskId, targetStatus);
    }
}

// -------------------------------------------------------------
// FILTERS & QUICK CONTROLS
// -------------------------------------------------------------
function setKanbanFilterAssignee(val) {
    currentKanbanFilterAssignee = val;
    renderKanbanTab();
}

function setKanbanFilterPhase(val) {
    currentKanbanFilterPhase = val;
    renderKanbanTab();
}

function setKanbanSearch(val) {
    currentKanbanSearchQuery = val;
    renderKanbanTab();
}

// -------------------------------------------------------------
// CREATE & DELETE TASKS
// -------------------------------------------------------------
function openNewTaskModal() {
    const modal = document.getElementById('modalNewKanbanTask');
    if (modal) {
        modal.style.display = 'flex';
        const titleInput = document.getElementById('newTaskTitleInput');
        if (titleInput) {
            titleInput.value = '';
            titleInput.focus();
        }
    }
}

function closeNewTaskModal() {
    const modal = document.getElementById('modalNewKanbanTask');
    if (modal) modal.style.display = 'none';
}

function handleSaveNewKanbanTask(e) {
    e.preventDefault();
    const titleInput = document.getElementById('newTaskTitleInput');
    const phaseInput = document.getElementById('newTaskPhaseInput');
    const assigneeInput = document.getElementById('newTaskAssigneeInput');
    const notesInput = document.getElementById('newTaskNotesInput');

    if (!titleInput || !titleInput.value.trim()) return;

    const phaseLabels = {
        '12-10': '12 a 10 Meses',
        '9-7': '9 a 7 Meses',
        '6-4': '6 a 4 Meses',
        '3-1': '3 a 1 Meses',
        'semana_d': 'Semana del Evento'
    };

    const assigneeLabels = {
        planner: '📋 Wedding Planner',
        couple: '💍 Novios',
        both: '👥 Novios & Planner'
    };

    const newTask = {
        id: `task_custom_${Date.now()}`,
        title: titleInput.value.trim(),
        phase: phaseInput.value,
        phaseLabel: phaseLabels[phaseInput.value] || 'Fase General',
        category: 'custom',
        categoryLabel: '📌 Actividad Personalizada',
        assignedTo: assigneeInput.value,
        assignedLabel: assigneeLabels[assigneeInput.value] || '👥 General',
        priority: 'medium',
        status: 'todo',
        notes: notesInput ? notesInput.value.trim() : ''
    };

    const tasks = getActiveWeddingTasks();
    tasks.unshift(newTask);
    saveActiveWeddingTasks(tasks);

    closeNewTaskModal();
    renderKanbanTab();

    if (typeof showToast === 'function') {
        showToast('✅ Nueva actividad agregada al tablero');
    }
}

function deleteKanbanTask(taskId) {
    if (!confirm('¿Deseas eliminar esta actividad del tablero?')) return;
    
    let tasks = getActiveWeddingTasks();
    tasks = tasks.filter(t => t.id !== taskId);
    saveActiveWeddingTasks(tasks);
    renderKanbanTab();
    
    if (typeof showToast === 'function') {
        showToast('🗑️ Actividad eliminada');
    }
}

function resetMasterKanbanTasks() {
    if (!confirm('¿Deseas restablecer el tablero con la Hoja de Ruta Maestra de 12 meses? (Tus tareas personalizadas se reiniciarán a las recomendadas).')) return;
    
    const weddingId = window.currentWeddingId || 'aura';
    const storageKey = `wedding_tasks_${weddingId}`;
    const initialTasks = JSON.parse(JSON.stringify(DEFAULT_WEDDING_TASKS));
    localStorage.setItem(storageKey, JSON.stringify(initialTasks));
    renderKanbanTab();
    
    if (typeof showToast === 'function') {
        showToast('🔄 Hoja de Ruta Maestra de 12 meses restablecida');
    }
}

/**
 * Printable Roadmap Report for Planner and Couple meeting
 */
function printKanbanSummaryReport() {
    const tasks = getActiveWeddingTasks();
    const weddingName = (window.currentData && window.currentData.couple) || "Boda Activa";
    const venue = (window.currentData && window.currentData.venue) || "Recinto";
    const date = (window.currentData && window.currentData.date) || "Fecha";

    const todo = tasks.filter(t => t.status === 'todo');
    const inprogress = tasks.filter(t => t.status === 'inprogress');
    const done = tasks.filter(t => t.status === 'done');

    const printWin = window.open('', '_blank');
    if (!printWin) {
        alert('Por favor habilita las ventanas emergentes para imprimir.');
        return;
    }

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Hoja de Ruta & Checklist Maestro - ${weddingName}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 30px; margin: 0; }
                .header { border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
                h1 { margin: 0; font-size: 1.6rem; color: #0f172a; }
                .meta { color: #64748b; font-size: 0.9rem; margin-top: 4px; }
                .kpis { display: flex; gap: 20px; margin-bottom: 24px; }
                .kpi-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 18px; flex: 1; }
                .section-title { font-size: 1.1rem; color: #0f172a; margin: 20px 0 10px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 0.85rem; }
                th, td { padding: 8px 10px; border: 1px solid #e2e8f0; text-align: left; }
                th { background: #f1f5f9; font-weight: 700; }
                .done { text-decoration: line-through; color: #64748b; }
                @media print {
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1>Hoja de Ruta & CRM de Actividades (12 Meses)</h1>
                    <div class="meta">Pareja: <strong>${weddingName}</strong> · Fecha: ${date} · Lugar: ${venue}</div>
                </div>
                <div>
                    <button onclick="window.print()" style="padding: 8px 16px; background:#0f172a; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:700;">🖨️ Imprimir PDF</button>
                </div>
            </div>

            <div class="kpis">
                <div class="kpi-box"><strong>Total Actividades:</strong> ${tasks.length}</div>
                <div class="kpi-box"><strong>Completadas:</strong> ${done.length} (${Math.round((done.length/tasks.length)*100)}%)</div>
                <div class="kpi-box"><strong>En Proceso:</strong> ${inprogress.length}</div>
                <div class="kpi-box"><strong>Pendientes:</strong> ${todo.length}</div>
            </div>

            <div class="section-title">⏳ Actividades en Curso (${inprogress.length})</div>
            <table>
                <thead>
                    <tr>
                        <th style="width:45%;">Actividad</th>
                        <th>Fase</th>
                        <th>Responsable</th>
                        <th>Prioridad</th>
                    </tr>
                </thead>
                <tbody>
                    ${inprogress.map(t => `
                        <tr>
                            <td><strong>${t.title}</strong><br><small style="color:#64748b;">${t.notes || ''}</small></td>
                            <td>${t.phaseLabel}</td>
                            <td>${t.assignedLabel || t.assignedTo}</td>
                            <td>${t.priority.toUpperCase()}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">Sin actividades en este bloque</td></tr>'}
                </tbody>
            </table>

            <div class="section-title">📋 Actividades Pendientes por Iniciar (${todo.length})</div>
            <table>
                <thead>
                    <tr>
                        <th style="width:45%;">Actividad</th>
                        <th>Fase</th>
                        <th>Responsable</th>
                        <th>Prioridad</th>
                    </tr>
                </thead>
                <tbody>
                    ${todo.map(t => `
                        <tr>
                            <td><strong>${t.title}</strong><br><small style="color:#64748b;">${t.notes || ''}</small></td>
                            <td>${t.phaseLabel}</td>
                            <td>${t.assignedLabel || t.assignedTo}</td>
                            <td>${t.priority.toUpperCase()}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">Sin actividades en este bloque</td></tr>'}
                </tbody>
            </table>

            <div class="section-title">✅ Actividades Completadas (${done.length})</div>
            <table>
                <thead>
                    <tr>
                        <th style="width:45%;">Actividad</th>
                        <th>Fase</th>
                        <th>Responsable</th>
                    </tr>
                </thead>
                <tbody>
                    ${done.map(t => `
                        <tr class="done">
                            <td>${t.title}</td>
                            <td>${t.phaseLabel}</td>
                            <td>${t.assignedLabel || t.assignedTo}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">Sin actividades en este bloque</td></tr>'}
                </tbody>
            </table>
        </body>
        </html>
    `;

    printWin.document.write(html);
    printWin.document.close();
}

// Expose globally
window.renderKanbanTab = renderKanbanTab;
window.moveTaskStatus = moveTaskStatus;
window.updateKanbanBadges = updateKanbanBadges;
window.handleKanbanDragStart = handleKanbanDragStart;
window.handleKanbanDragEnd = handleKanbanDragEnd;
window.handleKanbanDragOver = handleKanbanDragOver;
window.handleKanbanDragLeave = handleKanbanDragLeave;
window.handleKanbanDrop = handleKanbanDrop;
window.setKanbanFilterAssignee = setKanbanFilterAssignee;
window.setKanbanFilterPhase = setKanbanFilterPhase;
window.setKanbanSearch = setKanbanSearch;
window.openNewTaskModal = openNewTaskModal;
window.closeNewTaskModal = closeNewTaskModal;
window.handleSaveNewKanbanTask = handleSaveNewKanbanTask;
window.deleteKanbanTask = deleteKanbanTask;
window.resetMasterKanbanTasks = resetMasterKanbanTasks;
window.printKanbanSummaryReport = printKanbanSummaryReport;
