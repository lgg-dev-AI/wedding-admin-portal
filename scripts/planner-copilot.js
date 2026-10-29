// ==========================================================================
// WEDDING PLANNER INTELLIGENT COPILOT & REAL QR GENERATOR
// ==========================================================================

const KNOWLEDGE_BASE = [
    {
        keywords: ['paso a paso', 'desde cero', 'desde 0', 'programar boda', 'como empezar', 'como inicio', 'flujo', 'guia', 'guía', 'onboarding', 'proceso wedding planner'],
        answer: `🚀 <strong>GUÍA MAESTRA: PROCESO COMPLETO DE LA WEDDING PLANNER</strong><br><br>
        Sigue estos <strong>7 pasos cronológicos</strong> para configurar, cotizar y operar cualquier boda de punta a punta:<br><br>
        <strong>1️⃣ Registrar la Boda (+ Nueva Boda):</strong><br>
        Haz clic en <strong>"+ Nueva Boda"</strong> (barra superior). Ingresa los nombres de la pareja, fecha, recinto y se generará su usuario y contraseña automáticamente.<br><br>
        <strong>2️⃣ Personalizar Portal de Novios & Servicios Extra:</strong><br>
        Entra a <strong>"⚙️ Configuración & Planes"</strong>. Ahí defines qué módulos verá la pareja en su portal, asignas tus precios de venta (ej: WhatsApp $1,000, Mesas $2,500) y copias la propuesta para WhatsApp con 1 clic.<br><br>
        <strong>3️⃣ Carga de Invitados (Lista Maestra):</strong><br>
        Ve a <strong>"👥 Lista de Invitados & Menú"</strong>. Da de alta comensales o importa tu Excel con teléfonos mexicanos (+52). Asigna pases individuales o dobles y restricciones alimentarias.<br><br>
        <strong>4️⃣ Envío de Invitaciones por WhatsApp:</strong><br>
        Entra a <strong>"📲 Envíos WhatsApp"</strong>. Selecciona la plantilla (Save the Date, Invitación Formal, Recordatorio) y presiona <em>"📲 Enviar WhatsApp"</em> para disparar invitaciones personalizadas.<br><br>
        <strong>5️⃣ Plano 2D y Tarjetas QR de Mesas:</strong><br>
        En <strong>"🪑 Distribución de Mesas 2D"</strong> acomoda los invitados sentados. En <strong>"📸 Álbum Colaborativo (QR)"</strong> descarga e imprime las tarjetas QR para cada centro de mesa.<br><br>
        <strong>6️⃣ Conciliación de Pagos y Proveedores:</strong><br>
        En <strong>"💳 Comprobantes & SPEI"</strong> valida transferencias de regalos. En <strong>"🏢 Proveedores & Anticipos"</strong> controla pagos a fotógrafos, banquete y música.<br><br>
        <strong>7️⃣ Operación en Vivo Día D:</strong><br>
        Usa <strong>"📱 Control Acceso (Hostess)"</strong> para escanear pases QR en puerta y <strong>"⏱️ Cronograma Minuto a Minuto"</strong> para coordinar entrada, vals, cena y fiesta.`,
        actionTab: 'dashboard'
    },
    {
        keywords: ['novios', 'vista novios', 'que ven los novios', 'portal novios', 'pareja', 'proceso novios', 'como entran'],
        answer: `👰🤵 <strong>PROCESO Y EXPERIENCIA PARA LOS NOVIOS</strong><br><br>
        <strong>¿Cómo funciona su acceso?</strong><br>
        1. La wedding planner les entrega su link exclusivo (<em>https://paseboda.com</em>) con su usuario y contraseña personalizados.<br>
        2. Al iniciar sesión, la pareja entra directamente a su <strong>Portal de Novios</strong> sin ver controles de administración.<br><br>
        <strong>¿Qué pueden ver y hacer los novios?</strong><br>
        ✓ Consultar su <strong>Lista de Invitados</strong> y ver quién ya confirmó en tiempo real.<br>
        ✓ Ver o colaborar en la <strong>Distribución de Mesas 2D</strong> del banquete.<br>
        ✓ Revisar su <strong>Mesa de Regalos / Cuenta SPEI</strong> con los depósitos recibidos.<br>
        ✓ Entrar al <strong>Álbum QR</strong> para ver las fotos que van subiendo sus invitados.<br>
        ✓ Sugerir y votar canciones en la <strong>Playlist para el DJ</strong>.<br><br>
        🔒 <strong>Totalmente Blindado:</strong> Los novios <strong>NUNCA</strong> ven "Configuración & Planes", costos de proveedores, tarifas SaaS ni paneles internos de la planner.`,
        actionTab: 'settings',
        actionModal: 'openEditActiveWeddingModal',
        actionLabel: '✏️ Ver Accesos de los Novios'
    },
    {
        keywords: ['vender', 'cotizar', 'servicios digitales', 'cuanto cobrar', 'precios novios', 'servicios extra', 'empaquetar'],
        answer: `💡 <strong>CÓMO VENDER Y COTIZAR SERVICIOS DIGITALES A LOS NOVIOS</strong><br><br>
        Wedding OS te permite monetizar cada boda como un producto digital:<br><br>
        1. Ve a <strong>"⚙️ Configuración & Planes"</strong> &rarr; sección <strong>"Personalizar Portal de Novios"</strong>.<br>
        2. Configura los precios que cobrarás por cada servicio adicional (ej: WhatsApp masivo $1,000 MXN, Acomodo 2D $2,500 MXN, Álbum QR $1,000 MXN, o $0 si se lo incluyes de cortesía).<br>
        3. El sistema calcula en vivo la <strong>Inversión Total Cotizada</strong>.<br>
        4. Haz clic en <strong>"📲 Copiar Propuesta para WhatsApp"</strong> para generar un mensaje formal listo para enviar a la pareja.`,
        actionTab: 'settings'
    },
    {
        keywords: ['nombres', 'secciones', 'mapa', 'ventanas', 'pantallas', 'donde esta', 'menu'],
        answer: `🧭 <strong>MAPA COMPLETO DE VENTANAS Y MÓDULOS DE WEDDING OS</strong><br><br>
        • <strong>📊 Torre de Control (Dash):</strong> Resumen ejecutivo, métricas clave y botón para editar datos de la boda.<br><br>
        <strong>Fase 1: Convocatoria & Mesas</strong><br>
        • <strong>👥 Lista de Invitados & Menú:</strong> CRM de confirmaciones, platillos y dietas.<br>
        • <strong>📲 Envíos WhatsApp:</strong> Disparador de invitaciones con pases digitales.<br>
        • <strong>🪑 Distribución de Mesas 2D:</strong> Plano arquitectónico y sillas para banquete.<br><br>
        <strong>Fase 2: Presupuesto & Contratos</strong><br>
        • <strong>🏢 Proveedores & Anticipos:</strong> Directorio confidencial, contratos y saldos.<br>
        • <strong>💳 Comprobantes & SPEI:</strong> Validación de transferencias y mesa de regalos.<br>
        • <strong>🍾 Cálculo de Barra & Vinos:</strong> Estimador de botellas y remisiones de descorche.<br><br>
        <strong>Fase 3: Operación Día D (Sábado)</strong><br>
        • <strong>⏱️ Cronograma Minuto a Minuto:</strong> Minuta en vivo y cuenta regresiva de coordinación.<br>
        • <strong>📱 Control Acceso (Hostess):</strong> Escáner QR en puerta para check-in de invitados.<br>
        • <strong>✈️ Logística, Hoteles & Shuttles:</strong> Habitaciones y transporte para foráneos.<br><br>
        <strong>Fase 4: Experiencia & Recuerdos</strong><br>
        • <strong>📸 Álbum Colaborativo (QR):</strong> Galería en vivo y descarga de tarjetas QR para mesas.<br>
        • <strong>🎵 Playlist para el DJ:</strong> Briefing musical, canciones clave y lista negra.<br><br>
        • <strong>⚙️ Configuración & Planes:</strong> Credenciales de novios, precios de cotización y planes SaaS.`,
        actionTab: 'dashboard'
    },
    {
        keywords: ['crm', 'kanban', 'actividades', 'tareas', 'checklist', 'roadmap', 'hoja de ruta', 'arrastrar', 'estatus', '12 meses', 'pendientes'],
        answer: '📋 <strong>¿Cómo funciona el CRM y Tablero Kanban de Actividades?</strong><br><br>• Viene <strong>pre-cargado desde el día 1</strong> con el Checklist Maestro de 12 meses (24 hitos esenciales de boda).<br>• Puedes <strong>arrastrar y soltar (drag & drop)</strong> cualquier tarjeta entre las 3 columnas (<em>Por Hacer</em>, <em>En Curso</em> y <em>Completado</em>) para cambiar su estatus al instante.<br>• También cuenta con botones de 1 clic para mover rápido desde tu celular o tablet.<br>• Puedes filtrar por responsable (<em>Solo Planner</em> o <em>Novios</em>), por fase cronológica (12-10 meses, 9-7 meses, etc.) o agregar actividades personalizadas con el botón <strong>"+ Nueva Actividad"</strong>.<br>• Al final, puedes generar un reporte formal impreso para reuniones con los novios.',
        actionTab: 'kanban',
        actionLabel: '📋 Ir al Tablero Kanban'
    },
    {
        keywords: ['contrato', 'contratos', 'firma', 'firma digital', 'firmar', 'legal', 'deslinde', 'responsabilidad'],
        answer: '📑 <strong>¿Cómo funciona el módulo de Contratos & Firma Digital?</strong><br><br>• Permite formalizar acuerdos entre la Wedding Planner y los Novios o Proveedores con <strong>validez legal en México (Art. 89-95 Código de Comercio)</strong>.<br>• El firmante traza su firma manuscrita con el dedo en su celular o con el ratón.<br>• Registra automáticamente el <strong>rastro de auditoría</strong>: IP, fecha/hora UTC y sello Hash criptográfico.<br>• Incluye la <strong>cláusula de deslinde SaaS</strong> para proteger al desarrollador web de cualquier controversia.',
        actionTab: 'contracts',
        actionLabel: '📑 Ir a Contratos'
    },
    {
        keywords: ['design studio', 'estudio de diseno', 'diseno', 'diseño', 'moodboard', 'paleta', 'colores', 'hex', 'estilo'],
        answer: '🎨 <strong>¿Cómo funciona el Design Studio & Ficha de Estilo?</strong><br><br>• <strong>Paleta Oficial:</strong> Muestra los colores clave de la boda con selector y copia de código HEX en 1 clic.<br>• <strong>Moodboard por Zonas:</strong> Tableros visuales para <em>Flores</em>, <em>Mobiliario & Loza</em>, <em>Iluminación</em> y <em>Detalles & Pastel</em>.<br>• <strong>Dossier PDF:</strong> Genera con 1 clic un PDF elegante para enviarle por WhatsApp al florista o decorador.',
        actionTab: 'designstudio',
        actionLabel: '🎨 Ir a Design Studio'
    },
    {
        keywords: ['boda nueva', 'nueva boda', 'crear boda', 'agregar boda', 'registrar boda', 'alta de boda'],
        answer: '💍 <strong>¿Cómo dar de alta una nueva boda?</strong><br><br>1. Ve al encabezado superior (arriba a la derecha del selector de boda).<br>2. Haz clic en el botón dorado <strong>"+ Nueva Boda"</strong>.<br>3. Completa los nombres de la pareja, fecha, recinto y revisa el usuario y contraseña sugeridos para los novios.<br>4. Haz clic en <strong>"💍 Registrar & Activar Boda"</strong> y el sistema la activará de inmediato en tu cartera.',
        actionTab: null
    },
    {
        keywords: ['editar boda', 'cambiar fecha', 'cambiar lugar', 'cambiar nombres', 'modificar boda'],
        answer: '✏️ <strong>¿Cómo editar los datos de la boda activa o accesos?</strong><br><br>Tienes dos formas directas:<br>1. En el menú lateral, debajo del nombre de la boda activa, haz clic en el botón <strong>"✏️ Datos & Accesos Novios"</strong>.<br>2. O en la esquina superior derecha de <strong>"Torre de Control"</strong>, haz clic en <strong>"✏️ Editar Boda"</strong>.<br><br>Podrás cambiar nombres, fecha, recinto, CLABE interbancaria y usuario/contraseña de los novios.',
        actionTab: 'dashboard',
        actionModal: 'openEditActiveWeddingModal',
        actionLabel: '✏️ Abrir Ventana de Edición'
    },
    {
        keywords: ['quien confirmo', 'quién confirmó', 'confirmados', 'asistencia', 'lista de invitados', 'gente confirmo', 'confirmaron', 'rsvp'],
        answer: '👥 <strong>¿Dónde ver quién ya confirmó asistencia?</strong><br><br>Toda la trazabilidad está en la <strong>Lista de Invitados & Menú</strong>:<br>1. En el menú de la izquierda, entra a <strong>"Lista de Invitados & Menú"</strong>.<br>2. Usa las píldoras de filtro en la parte superior para hacer clic en <strong>"✓ Confirmados"</strong>.<br>3. Allí verás el número de pases aprobados, acompañantes y el menú seleccionado por cada comensal.',
        actionTab: 'guests'
    },
    {
        keywords: ['excel', 'importar excel', 'subir lista', 'csv', 'cargar invitados'],
        answer: '📊 <strong>¿Cómo importar invitados desde Excel / CSV?</strong><br><br>1. Dirígete a <strong>"Lista de Invitados & Menú"</strong>.<br>2. Haz clic en el botón <strong>"📥 Importar Excel / CSV"</strong>.<br>3. Puedes descargar la plantilla modelo o pegar columnas: Nombre, Teléfono (+52), Pases, Menú y Alergias.<br>4. El sistema autovalida los números celulares y normaliza el formato internacional.',
        actionTab: 'guests'
    },
    {
        keywords: ['alergias', 'vegetariano', 'celiaco', 'intolerancia', 'menu especial', 'dietas'],
        answer: '🥗 <strong>¿Dónde consultar dietas especiales y alergias para el banquete?</strong><br><br>1. En <strong>"Lista de Invitados & Menú"</strong>, filtra por <em>"Alergias / Restricciones"</em>.<br>2. El sistema clasifica celíacos, vegetarianos, veganos y alérgicos a mariscos o frutos secos.<br>3. Puedes exportar este listado en PDF para entregarlo directamente al Chef del banquete.',
        actionTab: 'guests'
    },
    {
        keywords: ['qr', 'codigo qr', 'código qr', 'descargar qr', 'qr mesas', 'imprimir qr', 'qr de mesa'],
        answer: '🖨️ <strong>¿Cómo generar y descargar el Código QR de las mesas?</strong><br><br>1. Entra a la pestaña <strong>"Álbum Colaborativo (QR)"</strong> en el menú lateral.<br>2. Haz clic en el botón <strong>"🖨️ Descargar QR para Mesas"</strong> arriba a la derecha.<br>3. Se abrirá la tarjeta de mesa de alta costura con su código QR real generado al instante para que tus invitados escaneen y suban fotos.<br>4. Puedes hacer clic en <strong>"🖨️ Imprimir Tarjeta"</strong> o <strong>"💾 Descargar PNG"</strong>.',
        actionTab: 'album'
    },
    {
        keywords: ['mesas', 'acomodo', 'plano', '2d', 'sillas', 'invitados en mesas', 'sentar'],
        answer: '🪑 <strong>¿Cómo acomodar a los invitados en las mesas?</strong><br><br>1. Dirígete a <strong>"Distribución de Mesas 2D"</strong> en el menú izquierdo.<br>2. En la subpestaña <strong>"1. Asignación & Sillas"</strong> puedes arrastrar invitados a cada mesa o hacer clic en <strong>"+ Nueva Mesa"</strong>.<br>3. En la subpestaña <strong>"2. Plano 2D & Capitán"</strong> puedes mover las mesas en el espacio métrico del salón, agrandar la pista de baile y ajustar decoraciones.',
        actionTab: 'seating'
    },
    {
        keywords: ['whatsapp', 'mandar invitacion', 'enviar invitacion', 'disparar', 'invitaciones'],
        answer: '📲 <strong>¿Cómo enviar las invitaciones por WhatsApp?</strong><br><br>1. Entra a <strong>"Envíos WhatsApp"</strong> en el menú izquierdo.<br>2. Verás la lista de invitados con su número telefónico.<br>3. Haz clic en el botón verde <strong>"📲 Enviar WhatsApp"</strong> en cada fila. El sistema abrirá WhatsApp con el mensaje personalizado y marcará con fecha y hora exacta que ya fue enviado con un checkbox verde.',
        actionTab: 'dispatch'
    },
    {
        keywords: ['hostess', 'puerta', 'escaner', 'scanner', 'entrada', 'check in', 'check-in'],
        answer: '📱 <strong>¿Cómo opera el Check-in de Hostess en puerta el Día D?</strong><br><br>1. En el menú de la izquierda, entra a <strong>"Control Acceso (Hostess)"</strong>.<br>2. La hostess en la entrada del salón presiona <strong>"📸 Simular Escáner QR"</strong> (o apunta su cámara).<br>3. Al escanear el pase del invitado, la pantalla muestra de inmediato su nombre, número de mesa asignada y alertas de alergias, marcando su entrada en tiempo real.',
        actionTab: 'hostess'
    },
    {
        keywords: ['barra', 'alcohol', 'botellas', 'descorche', 'vino', 'licor', 'tequila'],
        answer: '🍾 <strong>¿Cómo calcular las botellas de alcohol en la barra?</strong><br><br>1. Entra a <strong>"Cálculo de Barra & Vinos"</strong>.<br>2. Ajusta el número de invitados y la temporada (cálida o fría).<br>3. La calculadora te indicará cuántas botellas de tequila, whisky, ron, vino y champaña necesitas, y podrás registrar remisiones para conciliar botellas abiertas vs devueltas.',
        actionTab: 'barcalc'
    },
    {
        keywords: ['escaleta', 'minuta', 'horarios', 'cronograma', 'vals', 'dia d'],
        answer: '⏱️ <strong>¿Cómo organizar el cronograma minuto a minuto (Run of Show)?</strong><br><br>1. Entra a <strong>"Cronograma Minuto a Minuto"</strong>.<br>2. Verás cada momento del evento con su hora exacta (Getting Ready, Ceremonia, Vals, Cena).<br>3. Tienes una cuenta regresiva en vivo para el staff y puedes imprimir o compartir la minuta con el DJ, fotógrafo y banquetera.',
        actionTab: 'dayof'
    },
    {
        keywords: ['dj', 'musica', 'playlist', 'canciones', 'primer vals', 'vals', 'prohibidas'],
        answer: '🎵 <strong>¿Cómo gestionar el Briefing Musical para el DJ?</strong><br><br>1. Entra a <strong>"Playlist para el DJ"</strong>.<br>2. Define las canciones icónicas (Entrada al Salón, Primer Baile, Brindis, Corte de Pastel).<br>3. Agrega la <em>Lista Negra (Do Not Play)</em> para garantizar que el DJ no toque géneros vetados por la pareja.<br>4. Genera el PDF ejecutivo exclusivo para la cabina de audio.',
        actionTab: 'playlist'
    },
    {
        keywords: ['pdf', 'reporte pdf', 'imprimir reporte', 'descargar informe', 'exportar'],
        answer: '📄 <strong>¿Cómo generar el Reporte Ejecutivo en PDF?</strong><br><br>1. Haz clic en el botón <strong>"📄 Reporte PDF"</strong> en la esquina superior de Torre de Control.<br>2. Se compilará al instante un dossier ejecutivo con métricas de confirmados, desglose presupuestal, mapa de mesas y contactos de emergencia para proveedores.',
        actionTab: 'dashboard'
    },
    {
        keywords: ['planes', 'essential', 'signature', 'atelier', 'precios', 'upgrade', 'costo', 'stripe'],
        answer: '⚙️ <strong>¿Cuáles son los 3 planes de Wedding OS?</strong><br><br>• <strong>🥉 Essential ($800 MXN/mes):</strong> 1-3 bodas · Hasta 50 invitados por boda · CRM, regalos y confirmaciones manuales.<br>• <strong>🥈 Signature Pro ($1,500 MXN/mes):</strong> 1-10 bodas · Hasta 100 invitados · WhatsApp masivo, Plano 2D, Check-in QR Hostess y Playlist.<br>• <strong>👑 Atelier Elite ($2,800 MXN/mes):</strong> Hasta 15 bodas · Invitados ilimitados · Minuta Día D, Barra, Proveedores y Marca Blanca.',
        actionTab: 'settings'
    },
    {
        keywords: ['regalos', 'comprobantes', 'spei', 'dinero', 'luna de miel'],
        answer: '💳 <strong>¿Cómo validar las aportaciones de la mesa de regalos?</strong><br><br>1. Entra a <strong>"Comprobantes & SPEI"</strong>.<br>2. Verás las transferencias bancarias SPEI reportadas por los invitados con su comprobante adjunto.<br>3. Haz clic en <strong>"Aprobar"</strong> para validar el depósito y sumar los fondos a la cuenta de luna de miel de los novios.',
        actionTab: 'finance'
    },
    {
        keywords: ['proveedores', 'anticipos', 'contratos', 'pagos', 'deudas'],
        answer: '🏢 <strong>¿Dónde controlo los anticipos de proveedores?</strong><br><br>1. Entra a <strong>"Proveedores & Anticipos"</strong> en el menú lateral.<br>2. Puedes dar de alta fotógrafos, flores, música, banquete con sus costos pactados.<br>3. Registra cada abono y el sistema te alertará automáticamente qué saldo queda pendiente antes del evento.',
        actionTab: 'vendors'
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
            appendCopilotMessage('bot', match.answer, match.actionTab, match.actionModal, match.actionLabel);
        } else {
            const defaultReply = `Entendido. Para ayudarte mejor con esa duda sobre <strong>"${escapeHtml(query)}"</strong>:<br><br>• Si buscas accesos o usuario de novios, ve a <strong>"⚙️ Configuración & Planes"</strong>.<br>• Si buscas personas que confirmaron, ve a <strong>"👥 Lista de Invitados & Menú"</strong>.<br>• Si quieres registrar una boda, haz clic en el botón dorado superior <strong>"+ Nueva Boda"</strong>.<br>• Si buscas el plano del salón, ve a <strong>"🪑 Distribución de Mesas 2D"</strong>.<br><br>¿Te gustaría que te dirija a alguno de estos módulos?`;
            appendCopilotMessage('bot', defaultReply);
        }
    }, 400);
}

function findBestKnowledgeMatch(userText) {
    const textNorm = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 1. Detección Inteligente Dinámica: Credenciales, Usuario y Contraseña de los Novios
    const credKeywords = ['usuario', 'contrasena', 'contrasenia', 'password', 'clave', 'login novio', 'como entran', 'acceso novio', 'credencial', 'como ingresan', 'acceso pareja', 'claves'];
    const isAskingCreds = credKeywords.some(k => textNorm.includes(k));

    if (isAskingCreds) {
        const state = (typeof getWeddingState === 'function' && typeof currentWeddingId !== 'undefined' && currentWeddingId) ? getWeddingState(currentWeddingId) : (window.currentData || {});
        const couple = state && state.couple ? state.couple : 'tu boda activa';
        const user = (state && state.coupleUser) ? state.coupleUser : (currentWeddingId === 'aura' ? 'sofia-y-alejandro' : 'novios');
        const pass = (state && state.couplePass) ? state.couplePass : (currentWeddingId === 'aura' ? 'boda2027' : 'boda2027');

        return {
            answer: `🔑 <strong>ACCESO AL PORTAL PARA LOS NOVIOS</strong><br><br>` +
                    `Para la boda activa de <strong>${escapeHtml(couple)}</strong>, las credenciales son:<br>` +
                    `• <strong>Usuario:</strong> <code style="background:#e2e8f0; padding:2px 8px; border-radius:6px; font-weight:800; color:#0f172a;">${escapeHtml(user)}</code><br>` +
                    `• <strong>Contraseña:</strong> <code style="background:#e2e8f0; padding:2px 8px; border-radius:6px; font-weight:800; color:#0f172a;">${escapeHtml(pass)}</code><br><br>` +
                    `📍 <strong>¿Dónde cambiarlas o configurarlas?</strong><br>` +
                    `1. En <strong>"⚙️ Configuración & Planes"</strong> (tarjeta <em>Credenciales de Acceso</em>).<br>` +
                    `2. O en el menú lateral haciendo clic en <strong>"✏️ Datos & Accesos Novios"</strong>.<br><br>` +
                    `📲 Los novios ingresan desde cualquier celular o PC en: <em>https://paseboda.com</em>.`,
            actionTab: 'settings',
            actionModal: 'openEditActiveWeddingModal',
            actionLabel: '✏️ Abrir Ventana de Accesos'
        };
    }

    // 2. Búsqueda en Base de Conocimientos Estándar
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

function appendCopilotMessage(sender, htmlText, actionTab = null, actionModal = null, actionLabel = null) {
    const messagesBox = document.getElementById('copilotMessagesBox');
    if (!messagesBox) return;

    const row = document.createElement('div');
    row.className = `copilot-msg-row ${sender}`;
    row.style.cssText = `margin-bottom: 12px; display: flex; flex-direction: column; align-items: ${sender === 'user' ? 'flex-end' : 'flex-start'};`;

    const bubble = document.createElement('div');
    bubble.className = `copilot-bubble ${sender}`;
    bubble.style.cssText = `
        max-width: 88%;
        padding: 10px 14px;
        border-radius: ${sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px'};
        background: ${sender === 'user' ? '#0f172a' : '#f1f5f9'};
        color: ${sender === 'user' ? '#ffffff' : '#1e293b'};
        font-size: 0.86rem;
        line-height: 1.45;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    `;
    bubble.innerHTML = htmlText;

    const actionsContainer = document.createElement('div');
    actionsContainer.style.cssText = 'margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px;';

    let hasActions = false;

    if (actionModal && typeof window[actionModal] === 'function') {
        const btnModal = document.createElement('button');
        btnModal.type = 'button';
        btnModal.style.cssText = 'background: #059669; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(5,150,105,0.25);';
        btnModal.innerHTML = actionLabel || `✏️ Abrir Ventana &rarr;`;
        btnModal.onclick = () => {
            window[actionModal]();
            togglePlannerCopilot();
        };
        actionsContainer.appendChild(btnModal);
        hasActions = true;
    }

    if (actionTab && typeof showTab === 'function') {
        const btnNav = document.createElement('button');
        btnNav.type = 'button';
        btnNav.style.cssText = 'background: #d97706; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(217,119,6,0.25);';
        btnNav.innerHTML = `Ir a esa pantalla &rarr;`;
        btnNav.onclick = () => {
            showTab(actionTab);
            togglePlannerCopilot();
        };
        actionsContainer.appendChild(btnNav);
        hasActions = true;
    }

    if (hasActions) {
        bubble.appendChild(actionsContainer);
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
    if (typeof activeRole !== 'undefined' && activeRole === 'couple') {
        if (typeof showToast === 'function') {
            showToast('🔒 La generación e impresión de códigos QR para mesas es exclusiva de tu Wedding Planner.');
        }
        return;
    }
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
        : 'https://paseboda.com';

    return `${origin}/album.html?wedding=${encodeURIComponent(wId)}&couple=${encodeURIComponent(couple)}&table=${encodeURIComponent(tId)}&tableName=${encodeURIComponent(tName)}`;
}

function openLiveTableQrPage() {
    if (typeof activeRole !== 'undefined' && activeRole === 'couple') {
        if (typeof showToast === 'function') {
            showToast('🔒 El simulador de pruebas QR es exclusivo de tu Wedding Planner.');
        }
        return;
    }
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
