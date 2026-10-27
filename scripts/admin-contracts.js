/**
 * Wedding Planner OS - Bóveda de Contratos & Expediente Digital Escaneado
 * Permite adjuntar, escanear con la cámara o subir contratos firmados en PDF/Imágenes,
 * registrar montos, cláusulas clave, contrapartes y visualizarlos en móvil, tablet y PC.
 */

const DEFAULT_SCANNED_CONTRACTS = [
    {
        id: "doc_cnt_1",
        title: "Contrato Oficial de Prestación de Servicios (Wedding Planning)",
        category: "planning",
        categoryLabel: "💍 Wedding Planning",
        counterparty: "Mariana Garza / Wedding Planner OS",
        totalAmount: 48000,
        signDate: "15 de Septiembre, 2026",
        status: "signed", // 'signed', 'review', 'pending'
        statusLabel: "✅ Firmado & Resguardado",
        fileType: "pdf",
        fileName: "Contrato_Firmado_Aura_Weddings_2027.pdf",
        fileData: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
        notes: "Contrato integral de coordinación, minuta minuto a minuto y dirección del cortejo. Incluye cláusula de exclusividad y garantía de asistencia presencial de 2 coordinadoras el Día D.",
        uploadedAt: "2026-09-15 14:30"
    },
    {
        id: "doc_cnt_2",
        title: "Contrato de Arrendamiento y Uso de Recinto (Finca Bell Recó)",
        category: "venue",
        categoryLabel: "🏛️ Recinto & Hacienda",
        counterparty: "Administración Finca Bell Recó",
        totalAmount: 320000,
        signDate: "20 de Agosto, 2026",
        status: "signed",
        statusLabel: "✅ Firmado & Resguardado",
        fileType: "image",
        fileName: "Escaneo_Contrato_Finca_BellReco.jpg",
        fileData: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
        notes: "Uso exclusivo de jardines, terraza y área de banquete de 11:00 AM a 05:00 AM del día siguiente. Incluye planta de luz de emergencia y descorche libre con cobro único de loza.",
        uploadedAt: "2026-08-20 11:15"
    },
    {
        id: "doc_cnt_3",
        title: "Contrato de Banquete & Catering de Autor (Chef Marc Fosh)",
        category: "catering",
        categoryLabel: "🍽️ Banquete & Cocina",
        counterparty: "Haute Cuisine Mallorca · Chef Marc Fosh",
        totalAmount: 180000,
        signDate: "05 de Octubre, 2026",
        status: "signed",
        statusLabel: "✅ Firmado & Resguardado",
        fileType: "image",
        fileName: "Contrato_Catering_Chef_MarcFosh_Firmado.jpg",
        fileData: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        notes: "Menú de 4 tiempos para 180 comensales. Incluye degustación previa para 4 personas, 18 meseros uniformados y protocolo estricto para invitados celíacos y alérgicos a mariscos.",
        uploadedAt: "2026-10-05 16:45"
    }
];

function getWeddingContracts() {
    const wId = window.currentWeddingId || 'aura';
    const key = `wedding_scanned_contracts_${wId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
    }
    const initial = JSON.parse(JSON.stringify(DEFAULT_SCANNED_CONTRACTS));
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
}

function saveWeddingContracts(contracts) {
    const wId = window.currentWeddingId || 'aura';
    const key = `wedding_scanned_contracts_${wId}`;
    localStorage.setItem(key, JSON.stringify(contracts));
    updateContractsBadges();
}

function updateContractsBadges() {
    const contracts = getWeddingContracts();
    const count = contracts.length;
    const badge = document.getElementById('badgeContractsCount');
    if (badge) {
        badge.textContent = `${count} documentos`;
        badge.style.background = '#0f172a';
        badge.style.color = '#fff';
    }
}

/**
 * Render the whole Scanned Contracts / Document Vault Tab
 */
function renderContractsTab() {
    const container = document.getElementById('tab-contracts');
    if (!container) return;

    const contracts = getWeddingContracts();
    const data = (typeof getWeddingState === 'function' ? getWeddingState(window.currentWeddingId) : window.currentData) || {};
    const coupleName = data.couple || "Novios";
    const totalCommitted = contracts.reduce((sum, c) => sum + (parseFloat(c.totalAmount) || 0), 0);

    container.innerHTML = `
        <div class="tab-header" style="margin-bottom: 20px;">
            <div>
                <div class="d-flex align-center gap-2 mb-1">
                    <h1 class="tab-title">Expediente de Contratos &amp; Documentación</h1>
                    <span class="badge-accent" style="background:#fef3c7; color:#b45309; border:1px solid #fde047; font-weight:800;">Bóveda Digital Legal</span>
                </div>
                <p class="tab-subtitle">Resguardo centralizado de contratos escaneados, pólizas y convenios firmados para <strong>${coupleName}</strong>. Accede a los documentos originales desde celular, tablet o PC.</p>
            </div>
            <div class="tab-actions" style="display:flex; gap:10px; flex-wrap:wrap;">
                <button type="button" class="btn-action primary" onclick="openUploadContractModal()" style="background:#0f172a; border-color:#0f172a; font-weight:700; display:flex; align-items:center; gap:6px;">
                    <span>📤 Adjuntar / Escanear Contrato</span>
                </button>
            </div>
        </div>

        <!-- PLATFORM LEGAL WAIVER BANNER -->
        <div class="section-card mb-4" style="background:#f8fafc; border:1.5px solid #cbd5e1; border-left:5px solid #0284c7; border-radius:12px; padding:14px 18px;">
            <div style="display:flex; align-items:flex-start; gap:12px;">
                <span style="font-size:1.4rem;">⚖️</span>
                <div style="font-size:0.78rem; color:#475569; line-height:1.5;">
                    <strong style="color:#0f172a; display:block; margin-bottom:2px;">Deslinde Legal de la Plataforma (SaaS Vault Disclaimer):</strong>
                    Wedding OS y su equipo desarrollador actúan estrictamente como un repositorio tecnológico de almacenamiento y consulta privada de documentos para la Wedding Planner y los Novios. Wedding OS no redacta ni certifica la validez intrínseca de los contratos adjuntos, ni asume responsabilidad civil, mercantil, laboral o fiscal alguna sobre los acuerdos celebrados entre los firmantes y sus proveedores.
                </div>
            </div>
        </div>

        <!-- SUMMARY STATS BAR -->
        <div class="section-card mb-4" style="background:linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border:1.5px solid #e2e8f0; border-radius:14px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            <div style="display:flex; align-items:center; gap:14px;">
                <div style="width:44px; height:44px; border-radius:10px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
                    📁
                </div>
                <div>
                    <strong style="font-size:0.95rem; color:#0f172a; display:block;">Total de Documentos Resguardados</strong>
                    <span style="font-size:0.75rem; color:#64748b;">${contracts.length} contratos firmados registrados en este expediente</span>
                </div>
            </div>
            <div style="text-align:right;">
                <span style="font-size:0.7rem; color:#64748b; text-transform:uppercase; font-weight:800; display:block;">Monto Total Amparado en Contratos</span>
                <strong style="font-size:1.25rem; color:#b45309; font-weight:800;">${formatMXNCurrency(totalCommitted)}</strong>
            </div>
        </div>

        <!-- CONTRACTS GRID (RESPONSIVE PC / TABLET / CELULAR) -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
            ${contracts.map(c => renderScannedContractCard(c)).join('')}
        </div>

        <!-- MODAL UPLOAD / SCAN CONTRACT -->
        <div id="modalUploadContract" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.65); backdrop-filter:blur(4px); z-index:999999; align-items:center; justify-content:center;">
            <div style="background:#ffffff; border-radius:16px; max-width:600px; width:92%; padding:24px; box-shadow:0 20px 40px rgba(0,0,0,0.25); max-height:90vh; overflow-y:auto;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
                    <div>
                        <h3 style="font-size:1.15rem; color:#0f172a; margin:0; font-weight:800;">📤 Adjuntar Contrato Escaneado / PDF</h3>
                        <small style="color:#64748b; font-size:0.75rem;">Sube el PDF firmado o toma una foto desde tu celular</small>
                    </div>
                    <button type="button" onclick="closeUploadContractModal()" style="background:none; border:none; font-size:1.3rem; color:#94a3b8; cursor:pointer;">✕</button>
                </div>
                
                <form onsubmit="handleSaveUploadedContract(event)">
                    <div style="margin-bottom:12px;">
                        <label style="display:block; font-size:0.78rem; font-weight:800; color:#334155; margin-bottom:4px;">Nombre / Concepto del Contrato *</label>
                        <input type="text" id="upContractTitle" required placeholder="Ej. Contrato de Fotografía & Cinematografía" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.84rem; outline:none;">
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.78rem; font-weight:800; color:#334155; margin-bottom:4px;">Categoría</label>
                            <select id="upContractCategory" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.84rem; background:#fff;">
                                <option value="planning">💍 Wedding Planning</option>
                                <option value="venue">🏛️ Recinto & Hacienda</option>
                                <option value="catering">🍽️ Banquete & Catering</option>
                                <option value="photo">📸 Fotografía & Video</option>
                                <option value="music">🎵 DJ, Audio & Pista</option>
                                <option value="flowers">🌸 Flores & Ambientación</option>
                                <option value="other">📄 Otro Documento / Póliza</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:0.78rem; font-weight:800; color:#334155; margin-bottom:4px;">Proveedor / Contraparte *</label>
                            <input type="text" id="upContractCounterparty" required placeholder="Ej. Lumière Cinema" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.84rem; outline:none;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.78rem; font-weight:800; color:#334155; margin-bottom:4px;">Monto Total Pactado ($ MXN)</label>
                            <input type="number" id="upContractAmount" placeholder="Ej. 65000" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.84rem; outline:none;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.78rem; font-weight:800; color:#334155; margin-bottom:4px;">Fecha de Firma / Acuerdo</label>
                            <input type="text" id="upContractDate" placeholder="Ej. 24 de Octubre, 2026" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.84rem; outline:none;">
                        </div>
                    </div>

                    <!-- ARCHIVO / ESCANEAR CON CÁMARA DEL CELULAR -->
                    <div style="margin-bottom:14px; background:#f8fafc; border:2px dashed #94a3b8; border-radius:12px; padding:16px; text-align:center;">
                        <span style="font-size:2rem; display:block; margin-bottom:6px;">📸 📄</span>
                        <label for="upContractFileInput" style="cursor:pointer; display:inline-block; background:#0f172a; color:#ffffff; padding:8px 16px; border-radius:8px; font-size:0.82rem; font-weight:700;">
                            Seleccionar Archivo o Tomar Foto con Cámara
                        </label>
                        <input type="file" id="upContractFileInput" accept="image/*,.pdf" capture="environment" onchange="handleFilePreview(this)" style="display:none;">
                        <span id="upContractFileLabel" style="display:block; font-size:0.72rem; color:#64748b; margin-top:8px;">Formatos aceptados: PDF, JPG, PNG o fotografía directa del documento en papel.</span>
                        
                        <!-- Mini Preview -->
                        <div id="fileUploadPreviewBox" style="display:none; margin-top:10px; max-height:140px; overflow:hidden; border-radius:8px; border:1px solid #cbd5e1;">
                            <img id="fileUploadPreviewImg" src="" style="width:100%; height:140px; object-fit:cover;" alt="Preview">
                        </div>
                    </div>

                    <div style="margin-bottom:16px;">
                        <label style="display:block; font-size:0.78rem; font-weight:800; color:#334155; margin-bottom:4px;">Cláusulas Clave u Observaciones Operativas</label>
                        <textarea id="upContractNotes" rows="2" placeholder="Ej. Horario de carga: 10:00 AM, penalización por retraso, etc..." style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.82rem; outline:none; resize:none;"></textarea>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button type="button" onclick="closeUploadContractModal()" class="btn-action secondary" style="padding:8px 16px;">Cancelar</button>
                        <button type="submit" class="btn-action primary" style="background:#0f172a; border-color:#0f172a; padding:8px 20px; font-weight:800;">Guardar en Expediente</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- MODAL PREVIEW DOCUMENTO / ESCANEO COMPLETO -->
        <div id="modalViewContractScan" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.85); backdrop-filter:blur(6px); z-index:999999; align-items:center; justify-content:center;">
            <div style="background:#ffffff; border-radius:16px; max-width:840px; width:94%; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px rgba(0,0,0,0.3);">
                <div style="background:#0f172a; color:#ffffff; padding:14px 20px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong id="viewModalTitle" style="font-size:1rem; display:block;">Visor de Documento Escaneado</strong>
                        <span id="viewModalMeta" style="font-size:0.75rem; color:#cbd5e1;"></span>
                    </div>
                    <button type="button" onclick="closeViewContractScanModal()" style="background:none; border:none; color:#cbd5e1; font-size:1.4rem; cursor:pointer;">✕</button>
                </div>
                <div id="viewModalBody" style="flex:1; padding:16px; overflow-y:auto; background:#1e293b; display:flex; align-items:center; justify-content:center;">
                    <!-- Rendered Image or PDF Embed -->
                </div>
                <div style="padding:12px 20px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <div id="viewModalNotes" style="font-size:0.75rem; color:#475569; max-width:550px;"></div>
                    <a id="btnDownloadOriginalScan" href="#" download target="_blank" class="btn-action primary" style="background:#0f172a; font-size:0.78rem; text-decoration:none; padding:8px 16px;">
                        📥 Descargar Archivo Original
                    </a>
                </div>
            </div>
        </div>
    `;

    updateContractsBadges();
}

/**
 * Render single Scanned Contract Card
 */
function renderScannedContractCard(c) {
    const isImage = c.fileType === 'image' || (c.fileData && c.fileData.startsWith('data:image'));
    return `
        <div class="section-card" style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:14px; padding:18px; box-shadow:0 4px 14px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
                <!-- BADGE & AMOUNT -->
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:12px;">
                    <span style="font-size:0.7rem; font-weight:800; background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; padding:2px 8px; border-radius:8px;">
                        ${c.statusLabel || '✅ Resguardado'}
                    </span>
                    <strong style="font-size:1.05rem; color:#0f172a; font-weight:800;">${formatMXNCurrency(c.totalAmount)}</strong>
                </div>

                <!-- TITLE & CATEGORY -->
                <h3 style="font-size:0.95rem; color:#0f172a; font-weight:800; margin:0 0 4px; line-height:1.4;">${c.title}</h3>
                <span style="display:inline-block; font-size:0.72rem; color:#b45309; font-weight:700; margin-bottom:10px;">${c.categoryLabel || '📄 Documento Legal'}</span>

                <!-- PREVIEW THUMBNAIL (FOTO DEL ESCANEO) -->
                <div onclick="openViewContractScanModal('${c.id}')" style="height:140px; border-radius:10px; overflow:hidden; background:#0f172a; position:relative; cursor:pointer; margin-bottom:12px; border:1px solid #cbd5e1;" title="Haz clic para ampliar el documento escaneado">
                    ${isImage ? `
                        <img src="${c.fileData}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='none'" alt="Escaneo">
                    ` : `
                        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#cbd5e1;">
                            <span style="font-size:2.5rem; margin-bottom:4px;">📄</span>
                            <span style="font-size:0.75rem; font-weight:700;">Documento PDF Certificado</span>
                        </div>
                    `}
                    <div style="position:absolute; bottom:6px; right:6px; background:rgba(15,23,42,0.85); color:#ffffff; font-size:0.68rem; padding:3px 8px; border-radius:6px; font-weight:700;">
                        🔍 Ver Documento
                    </div>
                </div>

                <!-- DETAILS -->
                <div style="font-size:0.75rem; color:#475569; margin-bottom:10px;">
                    <div><strong>Proveedor / Contraparte:</strong> ${c.counterparty}</div>
                    <div><strong>Fecha de Firma:</strong> ${c.signDate || 'No especificada'}</div>
                </div>

                <!-- NOTES -->
                ${c.notes ? `<p style="font-size:0.73rem; color:#64748b; background:#f8fafc; padding:8px 10px; border-radius:8px; border-left:3px solid #cbd5e1; margin:0 0 12px; line-height:1.35;">${c.notes}</p>` : ''}
            </div>

            <!-- ACTIONS -->
            <div style="display:flex; gap:8px; flex-wrap:wrap; padding-top:10px; border-top:1px solid #f1f5f9;">
                <button type="button" class="btn-action primary" onclick="openViewContractScanModal('${c.id}')" style="flex:1; background:#0f172a; border-color:#0f172a; font-size:0.78rem; font-weight:700; padding:8px 12px; display:flex; align-items:center; justify-content:center; gap:6px;">
                    <span>🔍 Ver Escaneo</span>
                </button>
                <button type="button" class="btn-action secondary" onclick="shareContractWhatsApp('${c.id}')" style="font-size:0.75rem; padding:8px 10px; font-weight:700; border-color:#22c55e; color:#15803d;" title="Compartir detalle por WhatsApp">
                    📲 WhatsApp
                </button>
                <button type="button" onclick="deleteScannedContract('${c.id}')" style="background:none; border:none; color:#94a3b8; font-size:0.85rem; cursor:pointer; padding:6px;" title="Eliminar contrato">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

// -------------------------------------------------------------
// FILE UPLOAD & PREVIEW HANDLERS
// -------------------------------------------------------------
let currentUploadedBase64 = null;
let currentUploadedFileName = null;
let currentUploadedFileType = null;

function handleFilePreview(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        currentUploadedFileName = file.name;
        currentUploadedFileType = file.type.includes('pdf') ? 'pdf' : 'image';
        
        const label = document.getElementById('upContractFileLabel');
        if (label) label.textContent = `Archivo seleccionado: ${file.name} (${Math.round(file.size/1024)} KB)`;

        const reader = new FileReader();
        reader.onload = function(e) {
            currentUploadedBase64 = e.target.result;
            const previewBox = document.getElementById('fileUploadPreviewBox');
            const previewImg = document.getElementById('fileUploadPreviewImg');
            if (previewBox && previewImg) {
                if (currentUploadedFileType === 'image') {
                    previewImg.src = currentUploadedBase64;
                    previewBox.style.display = 'block';
                } else {
                    previewBox.style.display = 'none';
                }
            }
        };
        reader.readAsDataURL(file);
    }
}

function openUploadContractModal() {
    currentUploadedBase64 = null;
    currentUploadedFileName = null;
    currentUploadedFileType = null;

    const modal = document.getElementById('modalUploadContract');
    if (modal) {
        modal.style.display = 'flex';
        const form = modal.querySelector('form');
        if (form) form.reset();
        const previewBox = document.getElementById('fileUploadPreviewBox');
        if (previewBox) previewBox.style.display = 'none';
        const label = document.getElementById('upContractFileLabel');
        if (label) label.textContent = 'Formatos aceptados: PDF, JPG, PNG o fotografía directa del documento en papel.';
    }
}

function closeUploadContractModal() {
    const modal = document.getElementById('modalUploadContract');
    if (modal) modal.style.display = 'none';
}

function handleSaveUploadedContract(e) {
    e.preventDefault();
    const title = document.getElementById('upContractTitle').value.trim();
    const categorySelect = document.getElementById('upContractCategory');
    const category = categorySelect.value;
    const categoryLabel = categorySelect.options[categorySelect.selectedIndex].text;
    const counterparty = document.getElementById('upContractCounterparty').value.trim();
    const amount = parseFloat(document.getElementById('upContractAmount').value) || 0;
    const signDate = document.getElementById('upContractDate').value.trim() || new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const notes = document.getElementById('upContractNotes').value.trim();

    // Fallback image if no file was picked
    const defaultImg = "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80";

    const newContract = {
        id: `doc_cnt_${Date.now()}`,
        title: title,
        category: category,
        categoryLabel: categoryLabel,
        counterparty: counterparty,
        totalAmount: amount,
        signDate: signDate,
        status: "signed",
        statusLabel: "✅ Firmado & Resguardado",
        fileType: currentUploadedFileType || "image",
        fileName: currentUploadedFileName || "Documento_Escaneado.jpg",
        fileData: currentUploadedBase64 || defaultImg,
        notes: notes,
        uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const contracts = getWeddingContracts();
    contracts.unshift(newContract);
    saveWeddingContracts(contracts);

    closeUploadContractModal();
    renderContractsTab();

    if (typeof showToast === 'function') {
        showToast('📁 Contrato firmado y escaneado guardado en la bóveda.');
    }
}

function openViewContractScanModal(contractId) {
    const contracts = getWeddingContracts();
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;

    const modal = document.getElementById('modalViewContractScan');
    if (!modal) return;

    document.getElementById('viewModalTitle').innerText = contract.title;
    document.getElementById('viewModalMeta').innerText = `Contraparte: ${contract.counterparty} · Importe: ${formatMXNCurrency(contract.totalAmount)} · Firmado: ${contract.signDate}`;
    document.getElementById('viewModalNotes').innerHTML = contract.notes ? `<strong>Condiciones clave:</strong> ${contract.notes}` : '';
    
    const downloadBtn = document.getElementById('btnDownloadOriginalScan');
    if (downloadBtn) {
        downloadBtn.href = contract.fileData || '#';
        downloadBtn.download = contract.fileName || 'Contrato_Escaneado';
    }

    const body = document.getElementById('viewModalBody');
    if (body) {
        if (contract.fileType === 'pdf' && !contract.fileData.startsWith('data:image')) {
            body.innerHTML = `
                <iframe src="${contract.fileData}" style="width:100%; height:70vh; border:none; border-radius:8px; background:#fff;"></iframe>
            `;
        } else {
            body.innerHTML = `
                <img src="${contract.fileData}" style="max-width:100%; max-height:75vh; object-fit:contain; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.5);" alt="Escaneo del Contrato">
            `;
        }
    }

    modal.style.display = 'flex';
}

function closeViewContractScanModal() {
    const modal = document.getElementById('modalViewContractScan');
    if (modal) modal.style.display = 'none';
}

function shareContractWhatsApp(contractId) {
    const contracts = getWeddingContracts();
    const c = contracts.find(item => item.id === contractId);
    if (!c) return;

    const data = (typeof getWeddingState === 'function' ? getWeddingState(window.currentWeddingId) : window.currentData) || {};
    const couple = data.couple || "Novios";

    const text = `📋 *Resguardo de Contrato Firmado*\nBoda: *${couple}*\nDocumento: *${c.title}*\nProveedor: *${c.counterparty}*\nImporte: *${formatMXNCurrency(c.totalAmount)}*\nFecha de Firma: *${c.signDate}*\n\nNotas clave: ${c.notes || 'En resguardo en Wedding OS'}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function deleteScannedContract(id) {
    if (!confirm('¿Deseas eliminar este contrato escaneado del expediente?')) return;
    let contracts = getWeddingContracts();
    contracts = contracts.filter(c => c.id !== id);
    saveWeddingContracts(contracts);
    renderContractsTab();
    if (typeof showToast === 'function') showToast('🗑️ Contrato eliminado del expediente');
}

// Global exposure
window.renderContractsTab = renderContractsTab;
window.openUploadContractModal = openUploadContractModal;
window.closeUploadContractModal = closeUploadContractModal;
window.handleFilePreview = handleFilePreview;
window.handleSaveUploadedContract = handleSaveUploadedContract;
window.openViewContractScanModal = openViewContractScanModal;
window.closeViewContractScanModal = closeViewContractScanModal;
window.shareContractWhatsApp = shareContractWhatsApp;
window.deleteScannedContract = deleteScannedContract;
window.updateContractsBadges = updateContractsBadges;
