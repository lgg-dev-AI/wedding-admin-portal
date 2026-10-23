// ==========================================================================
// WEDDING PLANNER INTELLIGENT COPILOT & REAL QR GENERATOR
// ==========================================================================

const KNOWLEDGE_BASE = [
    {
        keywords: ['paso a paso', 'desde cero', 'desde 0', 'programar boda', 'como empezar', 'como inicio', 'flujo', 'guia', 'guía', 'onboarding'],
        answer: `🚀 <strong>GUÍA MAESTRA: CÓMO PROGRAMAR UNA BODA DESDE 0 EN WEDDING OS</strong><br><br>
        Sigue estos <strong>7 pasos cronológicos</strong> para configurar y operar cualquier boda de punta a punta:<br><br>
        <strong>1️⃣ Registrar la Boda:</strong><br>
        Haz clic en <strong>"+ Nueva Boda"</strong> (barra superior). Ingresa los nombres de la pareja, fecha, recinto y estimado de invitados.<br><br>
        <strong>2️⃣ Briefing y Diseño Web (Invitación Digital):</strong><br>
        Haz clic en <strong>"📋 Formulario para Invitación Web"</strong> en el navbar. Completa o comparte este enlace con los novios para recopilar la historia, itinerario, código de vestimenta y datos bancarios para regalos.<br><br>
        <strong>3️⃣ Carga de Invitados (CRM):</strong><br>
        Ve a <strong>"CRM Invitados & Menú"</strong>. Puedes dar de alta a tus comensales con <em>"+ Nuevo Invitado"</em> o importar tu lista de Excel con teléfonos mexicanos (+52). Asigna pases individuales o dobles y menús.<br><br>
        <strong>4️⃣ Envío de Invitaciones por WhatsApp:</strong><br>
        Entra a <strong>"Control Envíos WhatsApp"</strong>. Selecciona la plantilla adecuada (Save the Date, Invitación Formal, Recordatorio) y presiona <em>"📲 Enviar WhatsApp"</em> para disparar mensajes personalizados con su pase digital único.<br><br>
        <strong>5️⃣ Conciliación de Regalos y Proveedores:</strong><br>
        En <strong>"Comprobantes & Regalos"</strong> valida transferencias SPEI recibidas. En <strong>"Proveedores & Pagos"</strong> registra los anticipos de banquete, flores y música para no perder de vista ningún vencimiento.<br><br>
        <strong>6️⃣ Acomodo de Salón (Plano 2D & Mesas):</strong><br>
        Entra a <strong>"Distribución de Mesas"</strong> para asignar comensales sentados y armar la vista arquitectónica 2D para el capitán de meseros. En <strong>"Álbum QR"</strong> imprime las tarjetas con QR para cada centro de mesa.<br><br>
        <strong>7️⃣ Ejecución en Vivo Día D:</strong><br>
        Usa <strong>"Control de Acceso (Hostess)"</strong> en la puerta para escanear pases QR con smartphone y <strong>"Cronograma Minuto a Minuto"</strong> para coordinar la entrada, vals, cena y barra libre.`,
        actionTab: 'dashboard'
    },
    {
        keywords: ['boda nueva', 'nueva boda', 'crear boda', 'agregar boda', 'registrar boda', 'alta de boda'],
        answer: '💍 <strong>¿Cómo dar de alta una nueva boda?</strong><br><br>1. Ve al encabezado superior (arriba a la derecha del selector de boda).<br>2. Haz clic en el botón dorado <strong>"+ Nueva Boda"</strong>.<br>3. Completa los nombres de la pareja, fecha, recinto y cantidad máxima de mesas.<br>4. Haz clic en <strong>"Guardar Boda"</strong> y el sistema la activará de inmediato en tu cartera.',
        actionTab: null
    },
    {
        keywords: ['editar boda', 'cambiar fecha', 'cambiar lugar', 'cambiar nombres', 'modificar boda'],
        answer: '✏️ <strong>¿Cómo editar la información o fecha de la boda activa?</strong><br><br>1. Ve a <strong>"Dashboard General"</strong>.<br>2. En la esquina superior derecha, haz clic en el botón <strong>"✏️ Editar Boda"</strong>.<br>3. Podrás cambiar nombres de los novios, fecha oficial, recinto sede, aforo proyectado y notas internas de coordinación.',
        actionTab: 'dashboard'
    },
    {
        keywords: ['quien confirmo', 'quién confirmó', 'confirmados', 'asistencia', 'lista de invitados', 'gente confirmo', 'confirmaron', 'rsvp'],
        answer: '👥 <strong>¿Dónde ver quién ya confirmó asistencia?</strong><br><br>Toda la trazabilidad está en la <strong>Lista Maestra de Invitados (CRM)</strong>:<br>1. En el menú de la izquierda, entra a <strong>"CRM Invitados & Menú"</strong>.<br>2. Usa las píldoras de filtro en la parte superior para hacer clic en <strong>"✓ Confirmados"</strong>.<br>3. Allí verás el número de pases aprobados, acompañantes y el menú seleccionado por cada comensal.',
        actionTab: 'guests'
    },
    {
        keywords: ['excel', 'importar excel', 'subir lista', 'csv', 'cargar invitados'],
        answer: '📊 <strong>¿Cómo importar invitados desde Excel / CSV?</strong><br><br>1. Dirígete a <strong>"CRM Invitados & Menú"</strong>.<br>2. Haz clic en el botón <strong>"📥 Importar Excel / CSV"</strong>.<br>3. Puedes descargar la plantilla modelo o pegar columnas: Nombre, Teléfono (+52), Pases, Menú y Alergias.<br>4. El sistema autovalida los números celulares y normaliza el formato internacional.',
        actionTab: 'guests'
    },
    {
        keywords: ['alergias', 'vegetariano', 'celiaco', 'intolerancia', 'menu especial', 'dietas'],
        answer: '🥗 <strong>¿Dónde consultar dietas especiales y alergias para el banquete?</strong><br><br>1. En <strong>"CRM Invitados & Menú"</strong>, filtra por <em>"Alergias / Restricciones"</em>.<br>2. El sistema clasifica celíacos, vegetarianos, veganos y alérgicos a mariscos o frutos secos.<br>3. Puedes exportar este listado en PDF para entregarlo directamente al Chef del banquete.',
        actionTab: 'guests'
    },
    {
        keywords: ['qr', 'codigo qr', 'código qr', 'descargar qr', 'qr mesas', 'imprimir qr', 'qr de mesa'],
        answer: '🖨️ <strong>¿Cómo generar y descargar el Código QR de las mesas?</strong><br><br>1. Entra a la pestaña <strong>"Álbum Colaborativo (QR)"</strong> en el menú lateral.<br>2. Haz clic en el botón <strong>"🖨️ Descargar QR para Mesas"</strong> arriba a la derecha.<br>3. Se abrirá la tarjeta de mesa de alta costura con su código QR real generado al instante para que tus invitados escaneen y suban fotos.<br>4. Puedes hacer clic en <strong>"🖨️ Imprimir Tarjeta"</strong> o <strong>"💾 Descargar PNG"</strong>.',
        actionTab: 'album'
    },
    {
        keywords: ['mesas', 'acomodo', 'plano', '2d', 'sillas', 'invitados en mesas', 'sentar'],
        answer: '🪑 <strong>¿Cómo acomodar a los invitados en las mesas?</strong><br><br>1. Dirígete a <strong>"Acomodo & Plano 2D"</strong> en el menú izquierdo.<br>2. En la subpestaña <strong>"1. Asignación & Sillas"</strong> puedes arrastrar invitados a cada mesa o hacer clic en <strong>"+ Nueva Mesa"</strong>.<br>3. En la subpestaña <strong>"2. Plano 2D & Capitán"</strong> puedes mover las mesas en el espacio métrico del salón y configurar luces y cuadrantes.',
        actionTab: 'seating'
    },
    {
        keywords: ['whatsapp', 'mandar invitacion', 'enviar invitacion', 'disparar', 'invitaciones'],
        answer: '📲 <strong>¿Cómo enviar las invitaciones por WhatsApp?</strong><br><br>1. Entra a <strong>"Control Envíos WhatsApp"</strong> en el menú izquierdo.<br>2. Verás la lista de invitados con su número telefónico.<br>3. Haz clic en el botón verde <strong>"📲 Enviar WhatsApp"</strong> en cada fila. El sistema abrirá WhatsApp con el mensaje personalizado y marcará con fecha y hora exacta que ya fue enviado con un checkbox verde.',
        actionTab: 'dispatch'
    },
    {
        keywords: ['hostess', 'puerta', 'escaner', 'scanner', 'entrada', 'check in', 'check-in'],
        answer: '📱 <strong>¿Cómo opera el Check-in de Hostess en puerta el Día D?</strong><br><br>1. En el menú de la izquierda, entra a <strong>"Check-in Hostess Día D"</strong>.<br>2. La hostess en la entrada del salón presiona <strong>"📸 Simular Escáner QR"</strong> (o apunta su cámara).<br>3. Al escanear el pase del invitado, la pantalla muestra de inmediato su nombre, número de mesa asignada y alertas de alergias, marcando su entrada en tiempo real.',
        actionTab: 'hostess'
    },
    {
        keywords: ['barra', 'alcohol', 'botellas', 'descorche', 'vino', 'licor', 'tequila'],
        answer: '🍾 <strong>¿Cómo calcular las botellas de alcohol en la barra?</strong><br><br>1. Entra a <strong>"Barra & Descorche"</strong>.<br>2. Ajusta el número de invitados y la temporada (cálida o fría).<br>3. La calculadora te indicará cuántas botellas de tequila, whisky, ron, vino y champaña necesitas, y podrás registrar remisiones para conciliar botellas abiertas vs devueltas.',
        actionTab: 'barcalc'
    },
    {
        keywords: ['escaleta', 'minuta', 'horarios', 'cronograma', 'vals', 'dia d'],
        answer: '⏱️ <strong>¿Cómo organizar el cronograma minuto a minuto (Run of Show)?</strong><br><br>1. Entra a <strong>"Run of Show & Escaleta"</strong>.<br>2. Verás cada momento del evento con su hora exacta (Getting Ready, Ceremonia, Vals, Cena).<br>3. Tienes una cuenta regresiva en vivo para el staff y puedes imprimir o compartir la minuta con el DJ, fotógrafo y banquetera.',
        actionTab: 'dayof'
    },
    {
        keywords: ['dj', 'musica', 'playlist', 'canciones', 'primer vals', 'vals', 'prohibidas'],
        answer: '🎵 <strong>¿Cómo gestionar el Briefing Musical para el DJ?</strong><br><br>1. Entra a <strong>"Briefing DJ & Playlist"</strong>.<br>2. Define las canciones icónicas (Entrada al Salón, Primer Baile, Brindis, Corte de Pastel).<br>3. Agrega la <em>Lista Negra (Do Not Play)</em> para garantizar que el DJ no toque géneros o pistas vetadas por la pareja.<br>4. Genera el PDF ejecutivo exclusivo para la cabina de audio.',
        actionTab: 'playlist'
    },
    {
        keywords: ['pdf', 'reporte pdf', 'imprimir reporte', 'descargar informe', 'exportar'],
        answer: '📄 <strong>¿Cómo generar el Reporte Ejecutivo en PDF?</strong><br><br>1. Haz clic en el botón <strong>"📄 Reporte PDF"</strong> en la esquina superior del Dashboard.<br>2. Se compilará al instante un dossier ejecutivo con métricas de confirmados, desglose presupuestal, mapa de mesas y contactos de emergencia para proveedores.',
        actionTab: 'dashboard'
    },
    {
        keywords: ['planes', 'essential', 'signature', 'atelier', 'precios', 'upgrade', 'costo'],
        answer: '⚙️ <strong>¿Cuáles son los 3 planes de Wedding OS?</strong><br><br>• <strong>🥉 Essential ($800 MXN/mes):</strong> 1-3 bodas · Hasta 50 invitados por boda · CRM, regalos y confirmaciones manuales.<br>• <strong>🥈 Signature Pro ($1,500 MXN/mes):</strong> 1-10 bodas · Hasta 100 invitados · WhatsApp masivo, Plano 2D, Check-in QR Hostess y Playlist.<br>• <strong>👑 Atelier Elite ($2,800 MXN/mes):</strong> Hasta 15 bodas · Invitados ilimitados · Minuta Día D, Barra, Proveedores y Marca Blanca.',
        actionTab: 'settings'
    },
    {
        keywords: ['regalos', 'comprobantes', 'spei', 'dinero', 'luna de miel'],
        answer: '💳 <strong>¿Cómo validar las aportaciones de la mesa de regalos?</strong><br><br>1. Entra a <strong>"Comprobantes & Regalos"</strong>.<br>2. Verás las transferencias bancarias SPEI reportadas por los invitados con su comprobante adjunto.<br>3. Haz clic en <strong>"Aprobar"</strong> para validar el depósito y sumar los fondos a la cuenta de luna de miel de los novios.',
        actionTab: 'finance'
    },
    {
        keywords: ['proveedores', 'anticipos', 'contratos', 'pagos', 'deudas'],
        answer: '🏢 <strong>¿Dónde controlo los anticipos de proveedores?</strong><br><br>1. Entra a <strong>"Proveedores & Anticipos"</strong> en el menú lateral.<br>2. Puedes dar de alta fotógrafos, flores, música, banquete con sus costos pactados.<br>3. Registra cada abono y el sistema te alertará automáticamente qué saldo queda pendiente antes del evento.',
        actionTab: 'vendors'
    },
    {
        keywords: ['novios', 'vista novios', 'que ven los novios', 'portal novios', 'pareja'],
        answer: '👰 <strong>¿Cómo funciona la Vista de los Novios?</strong><br><br>1. En la barra superior, haz clic en el botón de rol <strong>"👰 Vista Novios"</strong>.<br>2. Verás exactamente la interfaz pulida que tienen ellos: acceso a ver sus confirmados, acomodo de mesas y regalos, manteniendo ocultos los paneles internos y costos operativos de la agencia.',
        actionTab: null
    }
];

function togglePlannerCopilot() {
    const chatContainer = document.getElementById('plannerCopilotWindow');
    if (!chatContainer) return;
    const isVisible = chatContainer.style.display === 'flex';
    chatContainer.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) {
        setTimeout(() => {
            const input = document.getElementById('copilotChatInput');
            if (input) input.focus();
        }, 150);
    }
}

function handleCopilotSubmit(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('copilotChatInput');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    appendCopilotMessage('user', query);
    input.value = '';

    // Show typing indicator
    showCopilotTyping(true);

    setTimeout(() => {
        showCopilotTyping(false);
        const match = findBestKnowledgeMatch(query);
        if (match) {
            appendCopilotMessage('bot', match.answer, match.actionTab);
        } else {
            const defaultReply = `Entendido. Para ayudarte mejor con esa duda sobre <strong>"${escapeHtml(query)}"</strong>:<br><br>• Si buscas personas que confirmaron, ve a <strong>"CRM Invitados"</strong>.<br>• Si quieres registrar una boda, haz clic en el botón dorado superior <strong>"+ Nueva Boda"</strong>.<br>• Si buscas descargar el QR de mesas, ve a <strong>"Álbum Colaborativo (QR)"</strong>.<br><br>¿Te gustaría que te dirija a alguno de estos módulos?`;
            appendCopilotMessage('bot', defaultReply);
        }
    }, 450);
}

function findBestKnowledgeMatch(userText) {
    const textNorm = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let bestMatch = null;
    let maxHits = 0;

    KNOWLEDGE_BASE.forEach(item => {
        let hits = 0;
        item.keywords.forEach(kw => {
            const kwNorm = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (textNorm.includes(kwNorm)) {
                hits++;
            }
        });
        if (hits > maxHits) {
            maxHits = hits;
            bestMatch = item;
        }
    });

    return maxHits > 0 ? bestMatch : null;
}

function appendCopilotMessage(sender, htmlText, actionTab = null) {
    const messagesBox = document.getElementById('copilotMessagesBox');
    if (!messagesBox) return;

    const row = document.createElement('div');
    row.className = `copilot-msg-row ${sender}`;
    row.style.cssText = `margin-bottom: 12px; display: flex; flex-direction: column; align-items: ${sender === 'user' ? 'flex-end' : 'flex-start'};`;

    const bubble = document.createElement('div');
    bubble.className = `copilot-bubble ${sender}`;
    bubble.style.cssText = `
        max-width: 85%;
        padding: 10px 14px;
        border-radius: ${sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px'};
        background: ${sender === 'user' ? '#0f172a' : '#f1f5f9'};
        color: ${sender === 'user' ? '#ffffff' : '#1e293b'};
        font-size: 0.86rem;
        line-height: 1.45;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    `;
    bubble.innerHTML = htmlText;

    if (actionTab && typeof showTab === 'function') {
        const btnNav = document.createElement('button');
        btnNav.style.cssText = 'margin-top: 8px; background: #d97706; color: #fff; border: none; padding: 5px 10px; border-radius: 6px; font-size: 0.76rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;';
        btnNav.innerHTML = `Ir a esa pantalla &rarr;`;
        btnNav.onclick = () => {
            showTab(actionTab);
            togglePlannerCopilot();
        };
        bubble.appendChild(document.createElement('br'));
        bubble.appendChild(btnNav);
    }

    row.appendChild(bubble);
    messagesBox.appendChild(row);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

function showCopilotTyping(isTyping) {
    let indicator = document.getElementById('copilotTypingEl');
    if (isTyping) {
        if (!indicator) {
            const messagesBox = document.getElementById('copilotMessagesBox');
            indicator = document.createElement('div');
            indicator.id = 'copilotTypingEl';
            indicator.style.cssText = 'font-size: 0.75rem; color: #94a3b8; font-style: italic; margin-bottom: 8px;';
            indicator.innerText = 'Asistente escribiendo respuesta...';
            messagesBox.appendChild(indicator);
            messagesBox.scrollTop = messagesBox.scrollHeight;
        }
    } else if (indicator) {
        indicator.remove();
    }
}

function quickCopilotQuestion(question) {
    const input = document.getElementById('copilotChatInput');
    if (input) {
        input.value = question;
        handleCopilotSubmit();
    }
}

function escapeHtml(string) {
    return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ==========================================================================
// REAL QR CODE GENERATOR & PRINT MODAL FOR TABLES (BY TABLE)
// ==========================================================================

let activeSelectedQrTable = null;

function openTableQrModal() {
    const modal = document.getElementById('modalTableQrViewer');
    if (!modal) return;

    // Get current wedding data
    const data = typeof getWeddingState === 'function' ? getWeddingState(currentWeddingId) : (window.currentData || {});
    const couple = data.couple || 'Sofía & Alejandro';
    const tables = (data.tables && data.tables.length > 0) ? data.tables : [
        { id: "t1", name: "Mesa 1 - Mesa de Honor" },
        { id: "t2", name: "Mesa 2 - Familia Novia" },
        { id: "t3", name: "Mesa 3 - Familia Novio" },
        { id: "t4", name: "Mesa 4 - Amigos Universidad" },
        { id: "t5", name: "Mesa 5 - Amigos Empresa" }
    ];

    // Populate Couple Name
    document.getElementById('tableQrCoupleDisplay').innerText = couple;
    document.getElementById('tableQrCountBadge').innerText = `${tables.length} Mesas`;

    // Render Table Buttons List
    const listEl = document.getElementById('tableQrSelectList');
    if (listEl) {
        listEl.innerHTML = '';
        tables.forEach((t, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `table-qr-select-btn ${idx === 0 ? 'active' : ''}`;
            btn.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                padding: 10px 12px;
                border: 1px solid ${idx === 0 ? '#d97706' : '#cbd5e1'};
                background: ${idx === 0 ? '#fef3c7' : '#ffffff'};
                border-radius: 10px;
                text-align: left;
                cursor: pointer;
                font-size: 0.84rem;
                font-weight: 700;
                color: ${idx === 0 ? '#92400e' : '#1e293b'};
                transition: all 0.2s ease;
            `;
            btn.innerHTML = `
                <span>📍 ${escapeHtml(t.name || `Mesa ${idx + 1}`)}</span>
                <span style="font-size:0.75rem; color:#64748b;">${idx === 0 ? '● Seleccionada' : 'Seleccionar'}</span>
            `;
            btn.onclick = () => selectQrTable(t, btn);
            listEl.appendChild(btn);
        });
    }

    // Default select first table
    selectQrTable(tables[0]);

    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
    modal.style.zIndex = '999999';
}

function buildLiveTableQrUrl(tableObj) {
    const data = typeof getWeddingState === 'function' ? getWeddingState(currentWeddingId) : (window.currentData || {});
    const couple = data.couple || 'Sofía & Alejandro';
    const wId = (typeof currentWeddingId !== 'undefined' && currentWeddingId) ? currentWeddingId : 'aura';
    const tId = (tableObj && tableObj.id) ? tableObj.id : 't1';
    const tName = (tableObj && tableObj.name) ? tableObj.name : 'Mesa 1 - Mesa de Honor';

    const origin = (window.location.origin && window.location.origin.startsWith('http'))
        ? window.location.origin
        : 'https://wedding-admin-portal.vercel.app';

    return `${origin}/album.html?wedding=${encodeURIComponent(wId)}&couple=${encodeURIComponent(couple)}&table=${encodeURIComponent(tId)}&tableName=${encodeURIComponent(tName)}`;
}

function openLiveTableQrPage() {
    const url = buildLiveTableQrUrl(activeSelectedQrTable || { id: 't1', name: 'Mesa 1 - Mesa de Honor' });
    window.open(url, '_blank');
}

function selectQrTable(tableObj, clickedBtn = null) {
    if (!tableObj) return;
    activeSelectedQrTable = tableObj;

    // Update active button styling
    if (clickedBtn) {
        document.querySelectorAll('.table-qr-select-btn').forEach(b => {
            b.style.borderColor = '#cbd5e1';
            b.style.background = '#ffffff';
            b.style.color = '#1e293b';
            const sub = b.querySelectorAll('span')[1];
            if (sub) sub.innerText = 'Seleccionar';
        });
        clickedBtn.style.borderColor = '#d97706';
        clickedBtn.style.background = '#fef3c7';
        clickedBtn.style.color = '#92400e';
        const sub = clickedBtn.querySelectorAll('span')[1];
        if (sub) sub.innerText = '● Seleccionada';
    }

    // Update displayed table title
    const nameEl = document.getElementById('tableQrTableNameDisplay');
    if (nameEl) {
        nameEl.innerText = tableObj.name || 'Mesa del Banquete';
    }

    // Generate real QR code image specifically encoded with live album.html URL + table identifier
    const targetUrl = buildLiveTableQrUrl(tableObj);
    const qrImg = document.getElementById('tableQrRealImg');
    if (qrImg) {
        qrImg.src = `https://quickchart.io/qr?text=${encodeURIComponent(targetUrl)}&size=300&margin=1`;
    }

    const urlPreviewEl = document.getElementById('tableQrLiveUrlDisplay');
    if (urlPreviewEl) {
        urlPreviewEl.href = targetUrl;
        urlPreviewEl.innerText = targetUrl;
    }
}

function closeTableQrModal() {
    const modal = document.getElementById('modalTableQrViewer');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
    }
}

function printTableQrStand() {
    const data = typeof getWeddingState === 'function' ? getWeddingState(currentWeddingId) : (window.currentData || {});
    const couple = data.couple || 'Sofía & Alejandro';
    const tableObj = activeSelectedQrTable || { id: 't1', name: 'Mesa 1 - Mesa de Honor' };
    const tableName = tableObj.name || 'Mesa 1 - Mesa de Honor';
    const targetUrl = buildLiveTableQrUrl(tableObj);
    const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(targetUrl)}&size=360&margin=1`;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${couple} - ${tableName}</title>
            <style>
                @page {
                    size: letter portrait;
                    margin: 0; /* Suprime encabezados y pies de página del navegador como about:blank y fecha */
                }
                * { box-sizing: border-box; }
                body {
                    margin: 0;
                    padding: 0;
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #ffffff;
                    font-family: 'Playfair Display', Georgia, serif;
                }
                .qr-stand-card {
                    width: 440px;
                    border: 3px solid #d97706;
                    border-radius: 24px;
                    padding: 48px 32px 36px;
                    text-align: center;
                    background: #ffffff;
                }
                h1 {
                    font-size: 34px;
                    color: #0f172a;
                    margin: 0 0 10px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }
                .table-tag {
                    display: inline-block;
                    background: #fef3c7;
                    color: #b45309;
                    font-family: sans-serif;
                    font-weight: 800;
                    font-size: 16px;
                    padding: 6px 20px;
                    border-radius: 30px;
                    margin-bottom: 24px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .qr-wrap {
                    display: inline-block;
                    padding: 12px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    margin-bottom: 24px;
                }
                .qr-wrap img {
                    width: 280px;
                    height: 280px;
                    display: block;
                }
                .hint-text {
                    font-family: sans-serif;
                    font-size: 11px;
                    color: #64748b;
                    margin: 0;
                    line-height: 1.4;
                }
            </style>
        </head>
        <body>
            <div class="qr-stand-card">
                <h1>${escapeHtml(couple)}</h1>
                <div class="table-tag">${escapeHtml(tableName)}</div>
                <div class="qr-wrap">
                    <img src="${qrUrl}" alt="QR">
                </div>
                <p class="hint-text">Apunta con la cámara de tu smartphone para compartir tus fotos del evento en vivo.</p>
            </div>
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.close();
                    }, 350);
                };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function printAllTablesQrStands() {
    const data = typeof getWeddingState === 'function' ? getWeddingState(currentWeddingId) : (window.currentData || {});
    const couple = data.couple || 'Sofía & Alejandro';
    const tables = (data.tables && data.tables.length > 0) ? data.tables : [
        { id: "t1", name: "Mesa 1 - Mesa de Honor" },
        { id: "t2", name: "Mesa 2 - Familia Novia" },
        { id: "t3", name: "Mesa 3 - Familia Novio" },
        { id: "t4", name: "Mesa 4 - Amigos Universidad" },
        { id: "t5", name: "Mesa 5 - Amigos Empresa" }
    ];

    const cardsHtml = tables.map(t => {
        const targetUrl = buildLiveTableQrUrl(t);
        const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(targetUrl)}&size=340&margin=1`;
        return `
            <div class="page-container">
                <div class="qr-stand-card">
                    <h1>${escapeHtml(couple)}</h1>
                    <div class="table-tag">${escapeHtml(t.name || 'Mesa')}</div>
                    <div class="qr-wrap">
                        <img src="${qrUrl}" alt="QR">
                    </div>
                    <p class="hint-text">Apunta con la cámara de tu smartphone para compartir tus fotos del evento en vivo.</p>
                </div>
            </div>
        `;
    }).join('');

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${couple} - Todas las Mesas</title>
            <style>
                @page {
                    size: letter portrait;
                    margin: 0; /* Suprime encabezados y pies de página como about:blank, fecha y número de página */
                }
                * { box-sizing: border-box; }
                body {
                    margin: 0;
                    padding: 0;
                    background: #ffffff;
                    font-family: 'Playfair Display', Georgia, serif;
                }
                .page-container {
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    page-break-after: always;
                }
                .qr-stand-card {
                    width: 440px;
                    border: 3px solid #d97706;
                    border-radius: 24px;
                    padding: 48px 32px 36px;
                    text-align: center;
                    background: #ffffff;
                }
                h1 {
                    font-size: 34px;
                    color: #0f172a;
                    margin: 0 0 10px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }
                .table-tag {
                    display: inline-block;
                    background: #fef3c7;
                    color: #b45309;
                    font-family: sans-serif;
                    font-weight: 800;
                    font-size: 16px;
                    padding: 6px 20px;
                    border-radius: 30px;
                    margin-bottom: 24px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .qr-wrap {
                    display: inline-block;
                    padding: 12px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    margin-bottom: 24px;
                }
                .qr-wrap img {
                    width: 280px;
                    height: 280px;
                    display: block;
                }
                .hint-text {
                    font-family: sans-serif;
                    font-size: 11px;
                    color: #64748b;
                    margin: 0;
                    line-height: 1.4;
                }
            </style>
        </head>
        <body>
            ${cardsHtml}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.close();
                    }, 500);
                };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}
