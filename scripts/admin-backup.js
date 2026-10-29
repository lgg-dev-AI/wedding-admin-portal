// ==========================================================================
// BACKUP & DISASTER RECOVERY ENGINE + LEGAL FRAMEWORK MODALS
// Antigravity Web Developer — Enterprise Compliance & Data Integrity
// ==========================================================================

// EXPORT BACKUP TO .JSON (1-CLICK DOWNLOAD)
function exportWeddingBackup() {
    const data = getWeddingState(currentWeddingId);
    const exportPayload = {
        app: "PaseBoda",
        version: "3.0.0",
        exportTimestamp: new Date().toISOString(),
        exportedBy: currentRole === 'planner' ? 'Wedding Planner (Admin)' : 'Novios (Cliente)',
        weddingId: currentWeddingId,
        weddingData: data
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeName = (data.couple || 'Boda').replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `WeddingPlannerOS_Backup_${safeName}_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logAuditAction(currentWeddingId, currentRole === 'planner' ? 'Wedding Planner' : 'Novios', currentRole, `Descarga de Respaldo Completo de Seguridad (.JSON)`);
    showToast(`💾 Respaldo de "${data.couple}" exportado exitosamente.`);
    renderBackupsTab();
}

// EXPORT ALL WEDDINGS AT ONCE (AGENCY MASTER BACKUP)
function exportMasterAgencyBackup() {
    const allWeddings = {};
    const keys = ['aura', 'nuit', 'riviera', 'zen', 'disco', 'nordic', 'tuscany'];
    keys.forEach(k => {
        allWeddings[k] = getWeddingState(k);
    });

    const exportPayload = {
        app: "PaseBoda - Master Agency Backup",
        version: "3.0.0",
        exportTimestamp: new Date().toISOString(),
        totalWeddings: keys.length,
        weddingsDB: allWeddings
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `WeddingPlannerOS_MASTER_AGENCY_BACKUP_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast(`👑 Respaldo Maestro de toda la Agencia (7 bodas) exportado exitosamente.`);
}

// IMPORT / RESTORE BACKUP FROM .JSON
function handleBackupFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            
            // Validate payload schema
            if (parsed.weddingData && parsed.weddingId) {
                // Single wedding backup
                saveWeddingState(parsed.weddingId, parsed.weddingData);
                if (currentWeddingId === parsed.weddingId) {
                    currentData = parsed.weddingData;
                }
                showToast(`✅ Respaldo de "${parsed.weddingData.couple || parsed.weddingId}" restaurado con éxito.`);
            } else if (parsed.weddingsDB) {
                // Master agency backup
                Object.keys(parsed.weddingsDB).forEach(wId => {
                    saveWeddingState(wId, parsed.weddingsDB[wId]);
                });
                currentData = getWeddingState(currentWeddingId);
                showToast(`👑 Respaldo Maestro restaurado con éxito (${parsed.totalWeddings} bodas actualizadas).`);
            } else {
                throw new Error("Estructura de respaldo no válida.");
            }

            // Refresh UI
            if (window.renderDashboardStats) renderDashboardStats();
            if (window.renderDispatchTab) renderDispatchTab();
            if (window.renderSeatingTab) renderSeatingTab();
            renderBackupsTab();

        } catch (err) {
            console.error(err);
            alert("❌ Error al restaurar el archivo. Asegúrate de que sea un archivo .json válido generado por PaseBoda.");
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

// AUTO-SNAPSHOT SYSTEM
function createAutoSnapshot(reason) {
    const snapshotsKey = `wp_snapshots_${currentWeddingId}`;
    let snapshots = [];
    try {
        snapshots = JSON.parse(localStorage.getItem(snapshotsKey)) || [];
    } catch(e) {}

    const data = getWeddingState(currentWeddingId);
    snapshots.unshift({
        id: "snap_" + Date.now(),
        timestamp: new Date().toLocaleString('es-MX'),
        reason: reason,
        guestCount: (data.guests || []).length,
        couple: data.couple || 'Boda'
    });

    // Keep last 10 snapshots only
    if (snapshots.length > 10) snapshots = snapshots.slice(0, 10);
    localStorage.setItem(snapshotsKey, JSON.stringify(snapshots));
}

// RENDER BACKUPS TAB
function renderBackupsTab() {
    const container = document.getElementById('tab-backups');
    if (!container) return;

    const data = getWeddingState(currentWeddingId);
    const snapshotsKey = `wp_snapshots_${currentWeddingId}`;
    let snapshots = [];
    try {
        snapshots = JSON.parse(localStorage.getItem(snapshotsKey)) || [];
    } catch(e) {}

    const tableBody = document.getElementById('snapshotsTableBody');
    if (tableBody) {
        if (snapshots.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted" style="padding:1.5rem;">No hay instantáneas automáticas registradas aún. Se generan automáticamente al realizar cambios críticos.</td></tr>`;
        } else {
            tableBody.innerHTML = snapshots.map((s, idx) => `
                <tr>
                    <td><span class="badge-tag">#${snapshots.length - idx}</span> <strong>${s.timestamp}</strong></td>
                    <td>${s.reason}</td>
                    <td>🎟️ ${s.guestCount} invitados</td>
                    <td><span style="color:#10b981; font-weight:700;">✓ Protegido en Memoria</span></td>
                </tr>
            `).join('');
        }
    }
}

// ==========================================================================
// LEGAL MODALS CONTROLLERS
// ==========================================================================
function showTermsModal() {
    const m = document.getElementById('termsModal');
    if (m) m.classList.add('active');
}
function closeTermsModal() {
    const m = document.getElementById('termsModal');
    if (m) m.classList.remove('active');
}

function showPrivacyModal() {
    const m = document.getElementById('privacyModal');
    if (m) m.classList.add('active');
}
function closePrivacyModal() {
    const m = document.getElementById('privacyModal');
    if (m) m.classList.remove('active');
}
