
// Admin Seating 2D Floor Plan & Staffing Module
(function() {
  // State for Floor Plan
  const floorState = {
    venueWidthMeters: 40,
    venueHeightMeters: 60,
    scale: 10, // 1m = 10px in canvas
    activeElement: null,
    elements: [
      { id: 'stage', type: 'stage', name: 'Escenario / Banda & DJ', x: 120, y: 30, w: 160, h: 60, color: '#7c3aed', icon: '🎵' },
      { id: 'dancefloor', type: 'dancefloor', name: 'Pista de Baile Central', x: 140, y: 120, w: 120, h: 100, color: '#b45309', icon: '💃' },
      { id: 'bar1', type: 'bar', name: 'Barra Coctelería & Mixología', x: 30, y: 150, w: 60, h: 120, color: '#0d9488', icon: '🍸' },
      { id: 'honor', type: 'honor', name: 'Mesa de Honor (Novios)', x: 150, y: 250, w: 100, h: 50, color: '#d97706', icon: '👑', seats: 4 },
      // Guest Tables
      { id: 't1', type: 'table', number: 1, name: 'Mesa 1 (Familia Novia)', x: 60, y: 330, size: 60, seats: 10, waiterId: 'w1', allergies: ['1 Vegano', '1 Celíaco'] },
      { id: 't2', type: 'table', number: 2, name: 'Mesa 2 (Familia Novio)', x: 150, y: 330, size: 60, seats: 10, waiterId: 'w1', allergies: ['1 Sin Mariscos'] },
      { id: 't3', type: 'table', number: 3, name: 'Mesa 3 (Damas de Honor)', x: 240, y: 330, size: 60, seats: 10, waiterId: 'w1', allergies: [] },
      { id: 't4', type: 'table', number: 4, name: 'Mesa 4 (Best Men & Amigos)', x: 60, y: 430, size: 60, seats: 10, waiterId: 'w2', allergies: ['2 Veganos'] },
      { id: 't5', type: 'table', number: 5, name: 'Mesa 5 (Universidad & MBA)', x: 150, y: 430, size: 60, seats: 10, waiterId: 'w2', allergies: ['1 Intolerante a Lactosa'] },
      { id: 't6', type: 'table', number: 6, name: 'Mesa 6 (Amigos Foráneos)', x: 240, y: 430, size: 60, seats: 10, waiterId: 'w2', allergies: [] }
    ],
    waiters: [
      { id: 'w1', name: 'Carlos Mendoza', phone: '+52 55 4123 9081', tables: [1, 2, 3], color: '#3b82f6' },
      { id: 'w2', name: 'Diana Soto', phone: '+52 55 8765 4321', tables: [4, 5, 6], color: '#10b981' }
    ]
  };

  window.weddingFloorState = floorState;

  window.initFloorPlanModule = function() {
    renderFloorCanvas();
    renderWaitersStaffing();
    setupFloorInteractions();
  };

  window.switchSeatingSubTab = function(tab) {
    const tabGuests = document.getElementById('seating-subview-guests');
    const tabFloor = document.getElementById('seating-subview-floor');
    const btnGuests = document.getElementById('subtab-btn-guests');
    const btnFloor = document.getElementById('subtab-btn-floor');

    if (!tabGuests || !tabFloor) return;

    if (tab === 'floor') {
      tabGuests.style.display = 'none';
      tabFloor.style.display = 'block';
      btnGuests.classList.remove('active-subtab');
      btnFloor.classList.add('active-subtab');
      renderFloorCanvas();
      renderWaitersStaffing();
    } else {
      tabGuests.style.display = 'block';
      tabFloor.style.display = 'none';
      btnGuests.classList.add('active-subtab');
      btnFloor.classList.remove('active-subtab');
    }
  };

  window.updateVenueDimensions = function() {
    const wInput = document.getElementById('venue-width-input');
    const hInput = document.getElementById('venue-height-input');
    if (!wInput || !hInput) return;

    const w = parseFloat(wInput.value) || 40;
    const h = parseFloat(hInput.value) || 60;
    floorState.venueWidthMeters = w;
    floorState.venueHeightMeters = h;
    renderFloorCanvas();
  };

  function renderFloorCanvas() {
    const canvasContainer = document.getElementById('floor-canvas-viewport');
    if (!canvasContainer) return;

    const canvasW = floorState.venueWidthMeters * floorState.scale;
    const canvasH = floorState.venueHeightMeters * floorState.scale;

    canvasContainer.style.width = canvasW + 'px';
    canvasContainer.style.height = canvasH + 'px';

    let html = `
      <div class="canvas-grid-overlay" style="width: 100%; height: 100%;"></div>
      <div class="scale-ruler-tag"><i class="fas fa-ruler-combined"></i> ${floorState.venueWidthMeters}m x ${floorState.venueHeightMeters}m (Escala 1m = ${floorState.scale}px)</div>
    `;

    floorState.elements.forEach((el, idx) => {
      if (el.type === 'table') {
        const waiter = floorState.waiters.find(w => w.tables.includes(el.number));
        const waiterColor = waiter ? waiter.color : '#94a3b8';
        const waiterName = waiter ? waiter.name.split(' ')[0] : 'Sin asignar';
        const hasAllergies = el.allergies && el.allergies.length > 0;

        html += `
          <div class="floor-element floor-table draggable-element" 
               id="el-${el.id}" 
               data-id="${el.id}"
               style="left: ${el.x}px; top: ${el.y}px; width: ${el.size}px; height: ${el.size}px; border-color: ${waiterColor};"
               onclick="selectFloorElement('${el.id}')"
               title="Mesa ${el.number}: ${el.name}">
            <div class="table-inner">
              <span class="table-num">M${el.number}</span>
              <span class="table-pax">${el.seats}p</span>
            </div>
            ${hasAllergies ? '<span class="allergy-indicator" title="Tiene alergias registradas">⚠️</span>' : ''}
            <div class="table-waiter-badge" style="background: ${waiterColor};">${waiterName}</div>
          </div>
        `;
      } else if (el.type === 'stage' || el.type === 'dancefloor' || el.type === 'bar' || el.type === 'honor') {
        html += `
          <div class="floor-element floor-rect draggable-element" 
               id="el-${el.id}" 
               data-id="${el.id}"
               style="left: ${el.x}px; top: ${el.y}px; width: ${el.w}px; height: ${el.h}px; border-color: ${el.color}; background: ${el.color}15;"
               onclick="selectFloorElement('${el.id}')">
            <span class="rect-icon">${el.icon}</span>
            <span class="rect-name">${el.name}</span>
          </div>
        `;
      }
    });

    canvasContainer.innerHTML = html;
  }

  function setupFloorInteractions() {
    const canvasContainer = document.getElementById('floor-canvas-viewport');
    if (!canvasContainer) return;

    let activeDrag = null;
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

    canvasContainer.addEventListener('mousedown', (e) => {
      const target = e.target.closest('.draggable-element');
      if (!target) return;
      
      const elId = target.getAttribute('data-id');
      const elObj = floorState.elements.find(el => el.id === elId);
      if (!elObj) return;

      activeDrag = { elObj, dom: target };
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = elObj.x;
      initialTop = elObj.y;
      target.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (!activeDrag) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newX = Math.max(10, initialLeft + dx);
      let newY = Math.max(10, initialTop + dy);

      activeDrag.elObj.x = Math.round(newX);
      activeDrag.elObj.y = Math.round(newY);

      activeDrag.dom.style.left = activeDrag.elObj.x + 'px';
      activeDrag.dom.style.top = activeDrag.elObj.y + 'px';
    });

    window.addEventListener('mouseup', () => {
      if (activeDrag) {
        activeDrag.dom.classList.remove('is-dragging');
        activeDrag = null;
      }
    });
  }

  window.selectFloorElement = function(id) {
    const elObj = floorState.elements.find(el => el.id === id);
    if (!elObj) return;

    const detailBox = document.getElementById('floor-element-inspector');
    if (!detailBox) return;

    if (elObj.type === 'table') {
      const waiter = floorState.waiters.find(w => w.tables.includes(elObj.number));
      detailBox.innerHTML = `
        <div class="inspector-card">
          <div class="inspector-header">
            <h4><i class="fas fa-chair text-gold"></i> Mesa #${elObj.number}</h4>
            <span class="badge-tag">${elObj.seats} Comensales</span>
          </div>
          <p class="text-muted text-sm">${elObj.name}</p>
          <div class="inspector-field mt-3">
            <label>Mesero Asignado:</label>
            <select class="admin-input-sm" onchange="assignWaiterToTable(${elObj.number}, this.value)">
              <option value="">-- Sin Asignar --</option>
              ${floorState.waiters.map(w => `<option value="${w.id}" ${waiter && waiter.id === w.id ? 'selected' : ''}>${w.name} (${w.tables.length} mesas)</option>`).join('')}
            </select>
          </div>
          <div class="inspector-field mt-2">
            <label>Alergias / Restricciones:</label>
            <div class="allergies-list-pills">
              ${(elObj.allergies && elObj.allergies.length > 0) ? elObj.allergies.map(a => `<span class="allergy-pill"><i class="fas fa-exclamation-triangle"></i> ${a}</span>`).join('') : '<span class="text-xs text-muted">Sin restricciones registradas</span>'}
            </div>
          </div>
        </div>
      `;
    } else {
      detailBox.innerHTML = `
        <div class="inspector-card">
          <div class="inspector-header">
            <h4>${elObj.icon} ${elObj.name}</h4>
          </div>
          <p class="text-muted text-sm">Elemento arquitectónico clave del venue. Puedes arrastrarlo para ajustar la posición.</p>
        </div>
      `;
    }
  };

  window.assignWaiterToTable = function(tableNum, waiterId) {
    floorState.waiters.forEach(w => {
      w.tables = w.tables.filter(t => t !== tableNum);
      if (w.id === waiterId) {
        w.tables.push(tableNum);
      }
    });
    renderFloorCanvas();
    renderWaitersStaffing();
  };

  function renderWaitersStaffing() {
    const list = document.getElementById('waiters-staffing-list');
    if (!list) return;

    list.innerHTML = floorState.waiters.map(w => {
      const totalPax = w.tables.reduce((acc, tNum) => {
        const tObj = floorState.elements.find(el => el.number === tNum);
        return acc + (tObj ? tObj.seats : 0);
      }, 0);

      return `
        <div class="waiter-staff-card" style="border-left: 4px solid ${w.color};">
          <div class="waiter-header">
            <div class="waiter-info">
              <span class="waiter-name"><i class="fas fa-user-tie" style="color:${w.color};"></i> ${w.name}</span>
              <span class="waiter-phone text-xs text-muted">${w.phone}</span>
            </div>
            <span class="badge-tag bg-surface">${totalPax} Comensales (${w.tables.length} mesas)</span>
          </div>
          <div class="waiter-tables-chips mt-2">
            <span class="text-xs text-muted mr-1">Mesas:</span>
            ${w.tables.length > 0 ? w.tables.map(t => `<span class="table-chip" style="background:${w.color}20; color:${w.color}; border:1px solid ${w.color}40;">Mesa ${t}</span>`).join('') : '<span class="text-xs text-muted">Ninguna asignada</span>'}
          </div>
        </div>
      `;
    }).join('');
  }

  window.addNewWaiter = function() {
    const name = prompt('Nombre completo del mesero/a:');
    if (!name) return;
    const phone = prompt('Teléfono / WhatsApp de contacto:', '+52 55 ');
    const colors = ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6'];
    const newColor = colors[floorState.waiters.length % colors.length];

    const newW = {
      id: 'w' + (floorState.waiters.length + 1),
      name: name,
      phone: phone || '',
      tables: [],
      color: newColor
    };
    floorState.waiters.push(newW);
    renderWaitersStaffing();
  };

  // Printable Banqueting Sheet for Capitán de Meseros
  window.openCaptainPrintSheet = function() {
    const modal = document.getElementById('modal-captain-sheet');
    if (!modal) return;

    let tablesRows = '';
    floorState.elements.filter(el => el.type === 'table').sort((a, b) => a.number - b.number).forEach(t => {
      const waiter = floorState.waiters.find(w => w.tables.includes(t.number));
      const waiterName = waiter ? waiter.name : '<span style="color:#ef4444;">Sin asignar</span>';
      const allergiesList = t.allergies && t.allergies.length > 0 ? t.allergies.join(', ') : 'Ninguna (Menú Estándar)';

      tablesRows += `
        <tr>
          <td style="font-weight:700; font-size:14px; text-align:center;">Mesa ${t.number}</td>
          <td><strong>${t.name}</strong></td>
          <td style="text-align:center;"><strong>${t.seats}</strong></td>
          <td>${waiterName}</td>
          <td style="${t.allergies && t.allergies.length > 0 ? 'color:#b91c1c; font-weight:600;' : 'color:#64748b;'}">${allergiesList}</td>
        </tr>
      `;
    });

    let waiterSummary = '';
    floorState.waiters.forEach(w => {
      const totalPax = w.tables.reduce((acc, tNum) => {
        const tObj = floorState.elements.find(el => el.number === tNum);
        return acc + (tObj ? tObj.seats : 0);
      }, 0);
      waiterSummary += `
        <div class="waiter-summary-box">
          <h4>${w.name} (${w.phone})</h4>
          <p><strong>Mesas Asignadas:</strong> ${w.tables.map(t => 'M' + t).join(', ') || 'Ninguna'}</p>
          <p><strong>Total de Comensales:</strong> ${totalPax} pax</p>
        </div>
      `;
    });

    const printContent = document.getElementById('captain-print-content');
    if (printContent) {
      printContent.innerHTML = `
        <div class="sheet-header">
          <div class="sheet-logo-brand">
            <h2>AURA WEDDINGS • HOJA DE SERVICIO & BANQUETE</h2>
            <p>ORDEN OPERATIVA PARA CAPITÁN DE MESEROS & JEFE DE COCINA</p>
          </div>
          <div class="sheet-meta">
            <p><strong>Evento:</strong> Boda Sofía & Alejandro</p>
            <p><strong>Fecha:</strong> 18 de Octubre, 2026 | <strong>Venue:</strong> Hacienda San José</p>
            <p><strong>Dimensiones Salón:</strong> ${floorState.venueWidthMeters}m x ${floorState.venueHeightMeters}m</p>
          </div>
        </div>

        <div class="sheet-section mt-4">
          <h3 class="sheet-subtitle"><i class="fas fa-users-cog"></i> 1. DISTRIBUCIÓN DE CUADRANTES DE MESEROS</h3>
          <div class="waiters-summary-grid">
            ${waiterSummary}
          </div>
        </div>

        <div class="sheet-section mt-4">
          <h3 class="sheet-subtitle"><i class="fas fa-utensils"></i> 2. MATRIZ DE MESAS, CAPACIDAD & ALERGIAS / MENÚS ESPECIALES</h3>
          <table class="captain-table-grid">
            <thead>
              <tr>
                <th style="width: 80px;">Mesa</th>
                <th>Nombre / Grupo de Invitados</th>
                <th style="width: 60px;">Pax</th>
                <th style="width: 150px;">Mesero Responsable</th>
                <th>Restricciones Alimentarias / Alergias</th>
              </tr>
            </thead>
            <tbody>
              ${tablesRows}
            </tbody>
          </table>
        </div>

        <div class="sheet-footer mt-5">
          <div class="signature-line">
            <div class="sig-box">Firma Wedding Planner</div>
            <div class="sig-box">Firma Capitán de Meseros</div>
            <div class="sig-box">Firma Chef Ejecutivo / Banquetes</div>
          </div>
        </div>
      `;
    }

    modal.style.display = 'flex';
  };

  window.closeCaptainModal = function() {
    const modal = document.getElementById('modal-captain-sheet');
    if (modal) modal.style.display = 'none';
  };

  window.triggerPrintCaptain = function() {
    window.print();
  };

})();
