
// Admin Weddings Multi-Tenancy & "+ Nueva Boda" Manager
(function() {
  const weddingCatalog = [
    {
      id: 'wedding-1',
      code: 'SOF-ALE-2026',
      names: 'Sofía & Alejandro',
      date: '18 Oct 2026',
      venue: 'Hacienda San José, Valle de Bravo',
      venueDim: '40m x 60m',
      budget: 850000,
      guests: 180,
      rsvpMode: 'Web Landing Editorial + Correo',
      status: 'En Proceso'
    },
    {
      id: 'wedding-2',
      code: 'VAL-MAT-2026',
      names: 'Valentina & Mateo',
      date: '14 Nov 2026',
      venue: 'Jardín Botánico Magnolia, CDMX',
      venueDim: '50m x 70m',
      budget: 1200000,
      guests: 250,
      rsvpMode: 'Concierge Offline / Manual',
      status: 'Confirmada'
    }
  ];

  window.weddingCatalog = weddingCatalog;
  window.activeWeddingId = 'wedding-1';

  window.initWeddingsManager = function() {
    renderWeddingsSelector();
  };

  function renderWeddingsSelector() {
    const selector = document.getElementById('wedding-active-select');
    if (!selector) return;

    selector.innerHTML = weddingCatalog.map(w => `
      <option value="${w.id}" ${w.id === window.activeWeddingId ? 'selected' : ''}>
        💍 ${w.names} (${w.date}) - ${w.venue.split(',')[0]}
      </option>
    `).join('');
  }

  window.changeActiveWedding = function(weddingId) {
    window.activeWeddingId = weddingId;
    const selected = weddingCatalog.find(w => w.id === weddingId);
    if (!selected) return;

    // Update Header info
    const titleEl = document.getElementById('header-wedding-title');
    if (titleEl) titleEl.innerText = `${selected.names} — ${selected.venue}`;

    alert(`Has cambiado a la boda activa: ${selected.names}. Todos los módulos se han sincronizado.`);
  };

  window.openNewWeddingModal = function() {
    const modal = document.getElementById('modal-new-wedding');
    if (modal) modal.style.display = 'flex';
  };

  window.closeNewWeddingModal = function() {
    const modal = document.getElementById('modal-new-wedding');
    if (modal) modal.style.display = 'none';
  };

  window.submitNewWedding = function(e) {
    if (e) e.preventDefault();
    const names = document.getElementById('new-w-names').value;
    const date = document.getElementById('new-w-date').value;
    const venue = document.getElementById('new-w-venue').value;
    const width = document.getElementById('new-w-width').value || '40';
    const height = document.getElementById('new-w-height').value || '60';
    const budget = parseFloat(document.getElementById('new-w-budget').value) || 500000;
    const guests = parseInt(document.getElementById('new-w-guests').value) || 150;
    const rsvpMode = document.getElementById('new-w-rsvp').value;

    if (!names || !date || !venue) {
      alert('Por favor completa los campos principales de la boda.');
      return;
    }

    const newId = 'wedding-' + (weddingCatalog.length + 1);
    const newWedding = {
      id: newId,
      code: names.substring(0, 3).toUpperCase() + '-' + date.substring(0, 4),
      names: names,
      date: date,
      venue: venue,
      venueDim: `${width}m x ${height}m`,
      budget: budget,
      guests: guests,
      rsvpMode: rsvpMode,
      status: 'Nueva Boda Creada'
    };

    weddingCatalog.push(newWedding);
    window.activeWeddingId = newId;
    renderWeddingsSelector();

    // Update Dimensions if in floor state
    if (window.weddingFloorState) {
      window.weddingFloorState.venueWidthMeters = parseFloat(width);
      window.weddingFloorState.venueHeightMeters = parseFloat(height);
    }

    closeNewWeddingModal();
    alert(`🎉 ¡Boda "${names}" creada exitosamente! Ahora es tu boda activa.`);
  };

})();
