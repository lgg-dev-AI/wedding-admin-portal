// ==========================================================================
// DAY-OF FIELD OPERATIONS & AUDIT TRAIL ENGINE
// ==========================================================================

function renderDayOfTab() {
    currentData = getWeddingState(currentWeddingId);
    const timelineList = document.getElementById('dayofTimelineList');
    const emergencyList = document.getElementById('emergencyContactsList');
    const auditList = document.getElementById('auditTimelineList');

    if (timelineList) {
        timelineList.innerHTML = '';
        (currentData.timeline || []).forEach((t, idx) => {
            const item = document.createElement('div');
            item.className = 'timeline-entry';
            item.innerHTML = `
                <div class="time-col">
                    <span class="time-badge">${t.time}</span>
                </div>
                <div class="desc-col">
                    <h4>${t.title}</h4>
                    <p>${t.desc}</p>
                    <span class="resp-tag">👤 Responsable: ${t.resp}</span>
                </div>
            `;
            timelineList.appendChild(item);
        });
    }

    if (emergencyList) {
        emergencyList.innerHTML = '';
        (currentData.vendors || []).forEach(v => {
            const row = document.createElement('div');
            row.className = 'emergency-row';
            row.innerHTML = `
                <div>
                    <strong>${v.name}</strong>
                    <div style="font-size:0.75rem; color:#64748b;">${v.category} · ${v.contactName}</div>
                </div>
                <a href="tel:${v.phone}" class="btn-speed-dial">📞 Llamar: ${v.phone}</a>
            `;
            emergencyList.appendChild(row);
        });
    }

    if (auditList) {
        auditList.innerHTML = '';
        (currentData.auditLogs || []).forEach(log => {
            const entry = document.createElement('div');
            entry.className = 'audit-entry';
            entry.innerHTML = `
                <div class="audit-ts">${log.timestamp} · IP: ${log.ip}</div>
                <div class="audit-user"><strong>${log.user}</strong> <span class="audit-role-badge ${log.role}">${log.role === 'planner' ? 'Wedding Planner' : 'Pareja'}</span></div>
                <div class="audit-action">${log.action}</div>
            `;
            auditList.appendChild(entry);
        });
    }
}
