// Global Active Wedding Identifiers
window.currentWeddingId = null;
window.currentData = null;

const WEDDINGS_DB = {
    aura: {
        id: "aura",
        couple: "Sofía & Alejandro",
        themeTag: "🌿 Haute Editorial Botánico",
        date: "24 de Octubre, 2027",
        venue: "Finca Bell Recó · Mallorca",
        liveUrl: "https://aura-wedding-experience.vercel.app",
        targetGuests: 180,
        budget: 850000,
        honeymoonGoal: 150000,
        costPerGuestCatering: 1450,
        plannerNote: "¡Hola Sofía y Alejandro! Esta semana cerramos el contrato de floristería y validamos 4 comprobantes de regalos. Recuerden revisar el vencimiento del anticipo del DJ antes del viernes.",
        isDestination: true,
        guestCost: 20000,
        deadlineMonth: "Julio 2027",
        bankName: "BBVA México",
        beneficiary: "Mariana Garza / Aura Weddings",
        clabe: "012180015899234410",
        coupleUser: "sofia-y-alejandro",
        couplePass: "boda2027",
        tables: [
            { id: "t1", name: "Mesa 1 - Mesa de Honor", capacity: 6, shape: "rect", guests: ["g1", "g2"] },
            { id: "t2", name: "Mesa 2 - Familia Novia", capacity: 10, shape: "round", guests: ["g3", "g4", "g5"] },
            { id: "t3", name: "Mesa 3 - Familia Novio", capacity: 10, shape: "round", guests: ["g6", "g7"] },
            { id: "t4", name: "Mesa 4 - Amigos Universidad", capacity: 10, shape: "round", guests: [] },
            { id: "t5", name: "Mesa 5 - Amigos Empresa", capacity: 10, shape: "round", guests: [] }
        ],
        guests: [
            { id: "g1", name: "Sofía Valenzuela (Novia)", phone: "+34 612 345 678", email: "sofia@aura.es", passes: 1, companion: "", menu: "filete", allergies: "Ninguna", guest1Menu: "filete", guest1Allergies: "Ninguna", status: "confirmed", tableId: "t1" },
            { id: "g2", name: "Alejandro Morales (Novio)", phone: "+34 612 987 654", email: "alex@aura.es", passes: 1, companion: "", menu: "filete", allergies: "Ninguna", guest1Menu: "filete", guest1Allergies: "Ninguna", status: "confirmed", tableId: "t1" },
            { id: "g3", name: "Doña Carmen Valenzuela", phone: "+34 655 112 233", email: "carmen@valenzuela.es", passes: 2, companion: "Don Fernando Valenzuela", menu: "salmon", allergies: "Celíaca (Sin Gluten)", guest1Menu: "salmon", guest1Allergies: "Celíaca (Sin Gluten)", companionMenu: "filete", companionAllergies: "Ninguna", status: "confirmed", tableId: "t2" },
            { id: "g4", name: "Lic. Andrea Garza", phone: "+52 81 2219 9352", email: "andrea.garza@empresa.com", passes: 2, companion: "Ing. Mauricio Cantú", menu: "salmon", allergies: "Alérgica a Mariscos", guest1Menu: "salmon", guest1Allergies: "Alérgica a Mariscos", companionMenu: "filete", companionAllergies: "Alérgica a Mariscos", status: "confirmed", tableId: "t2" },
            { id: "g5", name: "Dr. Roberto Elizondo", phone: "+52 81 1285 5668", email: "roberto@clinica.com", passes: 1, companion: "", menu: "risotto", allergies: "Vegetariano estricto", guest1Menu: "risotto", guest1Allergies: "Vegetariano estricto", status: "confirmed", tableId: "t2" },
            { id: "g6", name: "Don Rodrigo Morales", phone: "+34 644 332 211", email: "rodrigo@morales.es", passes: 2, companion: "Sra. Elena Morales", menu: "filete", allergies: "Ninguna", guest1Menu: "filete", guest1Allergies: "Ninguna", companionMenu: "salmon", companionAllergies: "Ninguna", status: "confirmed", tableId: "t3" },
            { id: "g7", name: "Valeria Morales", phone: "+34 644 998 877", email: "valeria@morales.es", passes: 1, companion: "", menu: "risotto", allergies: "Alergia a Nueces / Frutos Secos", guest1Menu: "risotto", guest1Allergies: "Alergia a Nueces / Frutos Secos", status: "confirmed", tableId: "t3" },
            { id: "g8", name: "Carlos Eduardo Slim", phone: "+52 55 9988 7766", email: "carlos@slim.com", passes: 2, companion: "Lucía Méndez", menu: "filete", allergies: "Ninguna", guest1Menu: "filete", guest1Allergies: "Ninguna", companionMenu: "risotto", companionAllergies: "Intolerancia a Lactosa", status: "confirmed", tableId: null },
            { id: "g9", name: "Mariana Treviño", phone: "+52 81 5544 3322", email: "mariana@trevino.mx", passes: 1, companion: "", menu: "salmon", allergies: "Ninguna", guest1Menu: "salmon", guest1Allergies: "Ninguna", status: "confirmed", tableId: null },
            { id: "g10", name: "Santiago Nieto", phone: "+52 55 1122 3344", email: "santiago@nieto.mx", passes: 1, companion: "", menu: "filete", allergies: "Ninguna", guest1Menu: "filete", guest1Allergies: "Ninguna", status: "pending", tableId: null }
        ],
        vouchers: [
            { id: "v1", donor: "Lic. Andrea Garza", amount: 15000, concept: "Fondo de Luna de Miel (Vuelos)", date: "21 Sep 2026", status: "pending", proofImg: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400" },
            { id: "v2", donor: "Dr. Roberto Elizondo", amount: 5000, concept: "Cena Romántica en la Playa", date: "20 Sep 2026", status: "pending", proofImg: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400" },
            { id: "v3", donor: "Don Fernando Valenzuela", amount: 25000, concept: "Suite Nupcial & Spa", date: "18 Sep 2026", status: "approved", proofImg: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400" },
            { id: "v4", donor: "Mariana Treviño", amount: 3500, concept: "Cava de Vinos de Reserva", date: "15 Sep 2026", status: "approved", proofImg: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400" }
        ],
        vendors: [
            {
                id: "ven1",
                name: "Haute Cuisine Mallorca · Chef Marc Fosh",
                category: "Banquete & Catering",
                contactName: "Marc Fosh",
                phone: "+34 971 123 456",
                email: "banquetes@fosh.es",
                rfc: "B57891234",
                bank: "Santander España",
                clabe: "ES76 0049 1500 0512 3456 7890",
                contractTotal: 180000,
                paidTotal: 90000,
                status: "active",
                notes: "Menú de 4 tiempos. Incluye loza de autor y servicio de 1 mesero por cada 10 pax.",
                technicalDossier: {
                    setupTime: "11:00 AM",
                    serviceStart: "15:30 hrs (Entradas), 16:30 hrs (Fuertes), 17:45 hrs (Postre)",
                    powerRequirements: "2 tomas trifásicas industriales en cocina de servicio",
                    waterSupply: "Conexión directa de agua potable requerida"
                }
            },
            {
                id: "ven2",
                name: "L'Atelier Botánico · Floral Design",
                category: "Floristería & Ambientación",
                contactName: "Claire Dumont",
                phone: "+34 600 889 900",
                email: "claire@atelierbotanico.es",
                rfc: "B57999888",
                bank: "BBVA España",
                clabe: "ES91 0182 2370 4502 0154 8796",
                contractTotal: 65000,
                paidTotal: 32500,
                status: "active",
                notes: "Montaje de arco botánico, 14 centros de mesa altos/bajos y bouquet nupcial de eucalipto y olivo.",
                technicalDossier: {
                    setupTime: "08:00 AM",
                    teardownTime: "03:00 AM (Día siguiente)",
                    powerRequirements: "No requerida",
                    waterSupply: "Área de hidratación para follajes"
                }
            },
            {
                id: "ven3",
                name: "Sonic Vibe · Sound, Light & Live DJ",
                category: "Música & Iluminación",
                contactName: "DJ Mateo Alborán",
                phone: "+34 622 445 566",
                email: "mateo@sonicvibe.com",
                rfc: "A88445511",
                bank: "CaixaBank",
                clabe: "ES21 2100 0418 4502 0005 1234",
                contractTotal: 48000,
                paidTotal: 24000,
                status: "active",
                notes: "Audio Line Array, cabina DJ espejada, iluminación arquitectónica cálida y microfonía inalámbrica Shure.",
                technicalDossier: {
                    setupTime: "10:30 AM (Soundcheck 13:00 hrs)",
                    powerRequirements: "Circuito independiente de 220V / 40A",
                    keySongs: {
                        entrance: "Coldplay - A Sky Full of Stars",
                        firstDance: "Leon Bridges - Beyond",
                        cake: "Daft Punk - One More Time",
                        bouquet: "Beyoncé - Single Ladies"
                    },
                    doNotPlay: "Reggaetón explícito comercial, La Macarena, Aserejé"
                }
            },
            {
                id: "ven4",
                name: "Luz & Sombra · Editorial Wedding Photography",
                category: "Fotografía & Video Cinema",
                contactName: "Ignacio Bellver",
                phone: "+34 633 778 899",
                email: "ignacio@luzysombra.es",
                rfc: "Y99887766",
                bank: "Bankinter",
                clabe: "ES44 0128 0010 1201 0000 9876",
                contractTotal: 55000,
                paidTotal: 27500,
                status: "active",
                notes: "Cobertura 12 horas con 2 fotógrafos senior + 1 operador de Drone 4K + Teaser 60s.",
                technicalDossier: {
                    setupTime: "12:00 PM (Getting Ready Novia)",
                    dronePermits: "Permiso de vuelo en espacio aéreo de Valldemossa tramitado y aprobado."
                }
            }
        ],
        milestones: [
            { id: "m1", vendorId: "ven1", vendorName: "Haute Cuisine (Banquete)", title: "Liquidación Final 50%", amount: 90000, dueDate: "10 Oct 2027", daysBefore: 14, status: "pending", urgency: "high", clabe: "ES76 0049 1500 0512 3456 7890", bank: "Santander" },
            { id: "m2", vendorId: "ven2", vendorName: "L'Atelier Botánico (Flores)", title: "Liquidación 50%", amount: 32500, dueDate: "15 Oct 2027", daysBefore: 9, status: "pending", urgency: "high", clabe: "ES91 0182 2370 4502 0154 8796", bank: "BBVA" },
            { id: "m3", vendorId: "ven3", vendorName: "Sonic Vibe (DJ & Iluminación)", title: "Liquidación 50%", amount: 24000, dueDate: "18 Oct 2027", daysBefore: 6, status: "pending", urgency: "medium", clabe: "ES21 2100 0418 4502 0005 1234", bank: "CaixaBank" },
            { id: "m4", vendorId: "ven4", vendorName: "Luz & Sombra (Foto & Video)", title: "Liquidación 50%", amount: 27500, dueDate: "20 Oct 2027", daysBefore: 4, status: "pending", urgency: "medium", clabe: "ES44 0128 0010 1201 0000 9876", bank: "Bankinter" },
            { id: "m5", vendorId: "ven1", vendorName: "Haute Cuisine (Banquete)", title: "Anticipo 50%", amount: 90000, dueDate: "01 Feb 2027", daysBefore: 265, status: "paid", urgency: "none", clabe: "ES76 0049 1500 0512 3456 7890", bank: "Santander" }
        ],
        rentals: [
            { id: "r1", item: "Sillas Crossback Madera de Roble", vendor: "Event Rentals Mallorca", delivered: 180, returned: 178, broken: 2, penaltyPerItem: 450, totalPenalty: 900 },
            { id: "r2", item: "Copas de Cristal Tallado Vintage", vendor: "Event Rentals Mallorca", delivered: 360, returned: 355, broken: 5, penaltyPerItem: 180, totalPenalty: 900 },
            { id: "r3", item: "Platos Base Cerámica Esmaltada Verde Salvia", vendor: "Haute Tabletop", delivered: 180, returned: 180, broken: 0, penaltyPerItem: 350, totalPenalty: 0 },
            { id: "r4", item: "Servilletas de Lino Natural Deshilado", vendor: "Haute Tabletop", delivered: 200, returned: 198, broken: 2, penaltyPerItem: 120, totalPenalty: 240 }
        ],
        securityDeposit: 20000,
        timeline: [
            { time: "11:00 AM", title: "Montaje Técnico & Proveedores", desc: "Llegada de floristería, cocina y montaje de sonido/iluminación.", resp: "Wedding Planner & Staff" },
            { time: "12:30 PM", title: "Getting Ready Novios", desc: "Fotografía y maquillaje en Suite Nupcial.", resp: "Luz & Sombra" },
            { time: "15:00 PM", title: "Recepción de Invitados & Shuttles", desc: "Llegada de vans del Hotel Belmond a la Finca.", resp: "Hostess & Coordinación" },
            { time: "15:30 PM", title: "Ceremonia Nupcial en el Olivar", desc: "Votos sagrados e intercambio de anillos.", resp: "Officiant & Cuarteto de Cuerdas" },
            { time: "16:30 PM", title: "Cóctel de Bienvenida & Sesión Fotos", desc: "Canapés y música acústica.", resp: "Catering & Luz y Sombra" },
            { time: "18:00 PM", title: "Entrada Nupcial al Gran Salón & Banquete", desc: "Inicio formal del banquete de 4 tiempos.", resp: "Chef Marc Fosh & DJ" },
            { time: "20:30 PM", title: "Primer Vals & Apertura de Pista", desc: "Canción: Leon Bridges - Beyond. Efecto chisperos fríos.", resp: "DJ Mateo & Novios" },
            { time: "02:00 AM", title: "Cierre de Barra Libre & Shuttles Regreso", desc: "Salida de vans al hotel sede.", resp: "Transportes" }
        ],
        auditLogs: [
            { timestamp: "2026-09-22 18:34:10", user: "Sofía Valenzuela (Novia)", role: "couple", action: "Aprobación de Cotización de Floristería L'Atelier Botánico ($65,000 MXN) desde Reporte Semanal #8", ip: "187.190.24.11" },
            { timestamp: "2026-09-21 15:20:05", user: "Luis (Wedding Planner)", role: "planner", action: "Validación de comprobante SPEI ($15,000 MXN) de Lic. Andrea Garza", ip: "201.144.98.50" },
            { timestamp: "2026-09-20 11:15:30", user: "Alejandro Morales (Novio)", role: "couple", action: "Asignación de comensales en Mesa 1 y Mesa 2 en Seating Chart", ip: "187.190.24.11" }
        ]
    },
    riviera: {
        id: "riviera",
        couple: "Valentina & Sebastián",
        themeTag: "🌴 Coastal Boho Tulum",
        date: "15 de Mayo, 2027",
        venue: "Papaya Playa Project · Tulum",
        liveUrl: "https://riviera-destino-wedding.vercel.app",
        targetGuests: 150,
        costPerGuestCatering: 1650,
        plannerNote: "¡Hola Valentina y Sebas! Tenemos confirmadas 32 habitaciones en el hotel sede. Por favor revisen la propuesta de mixología.",
        tables: [
            { id: "rt1", name: "Mesa 1 - Arena Blanca (Honor)", capacity: 6, shape: "rect", guests: ["rg1"] },
            { id: "rt2", name: "Mesa 2 - Cenote Sagrado", capacity: 10, shape: "round", guests: ["rg2"] }
        ],
        guests: [
            { id: "rg1", name: "Valentina Domínguez", phone: "+52 998 123 4567", email: "vale@tulum.mx", passes: 1, companion: "", menu: "salmon", allergies: "Ninguna", status: "confirmed", tableId: "rt1" },
            { id: "rg2", name: "Sebastián Rivas", phone: "+52 998 987 6543", email: "sebas@tulum.mx", passes: 1, companion: "", menu: "filete", allergies: "Ninguna", status: "confirmed", tableId: "rt2" },
            { id: "rg3", name: "Camila Sodi", phone: "+52 55 1144 7788", email: "camila@sodi.mx", passes: 2, companion: "Diego Luna", menu: "risotto", allergies: "Sin Gluten", status: "confirmed", tableId: null }
        ],
        vouchers: [
            { id: "rv1", donor: "Camila Sodi", amount: 10000, concept: "Sunset Yate en Cozumel", date: "19 Sep 2026", status: "pending", proofImg: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400" }
        ],
        vendors: [
            { id: "rven1", name: "Papaya Playa Banquets & Beach Bar", category: "Banquete & Mixología", contactName: "Chef Rodrigo", phone: "+52 984 112 3344", email: "events@papayaplaya.com", rfc: "PPP150501ABC", bank: "BBVA México", clabe: "012691001234567890", contractTotal: 220000, paidTotal: 110000, status: "active", notes: "Menú caribeño de autor & barra libre de mezcales artesanales." }
        ],
        milestones: [
            { id: "rm1", vendorId: "rven1", vendorName: "Papaya Playa Banquets", title: "Liquidación Final", amount: 110000, dueDate: "01 May 2027", daysBefore: 14, status: "pending", urgency: "high", clabe: "012691001234567890", bank: "BBVA" }
        ],
        rentals: [],
        securityDeposit: 15000,
        timeline: [],
        auditLogs: []
    },
    nordic: {
        id: "nordic",
        couple: "Astrid & Lars",
        themeTag: "🏛️ Nordic Minimalist",
        date: "21 de Junio, 2027",
        venue: "Hallgrímskirkja & Harpa · Reikiavik",
        liveUrl: "", // Sin invitación web activa aún
        targetGuests: 110,
        costPerGuestCatering: 1550,
        plannerNote: "Boda estilo escandinavo con diseño sobrio y banquete de autor nórdico.",
        tables: [{ id: "nt1", name: "Mesa 1 - Fjord Honor", capacity: 8, shape: "rect", guests: [] }],
        guests: [{ id: "ng1", name: "Astrid Lindholm (Novia)", phone: "+354 555 1234", email: "astrid@reykjavik.is", passes: 1, menu: "salmon", status: "confirmed" }],
        vouchers: [],
        vendors: [],
        milestones: [],
        timeline: [],
        auditLogs: []
    },
    nuit: {
        id: "nuit",
        couple: "Camille & Vincent",
        themeTag: "✨ Nuit Étoilée",
        date: "18 de Diciembre, 2027",
        venue: "Château de Chambord · Valle del Loira",
        liveUrl: "",
        targetGuests: 140,
        costPerGuestCatering: 1800,
        plannerNote: "Gala invernal nocturna bajo candelabros en castillo francés.",
        tables: [{ id: "nut1", name: "Table d'Honneur", capacity: 8, shape: "rect", guests: [] }],
        guests: [{ id: "nug1", name: "Camille Laurent (Novia)", phone: "+33 6 12 34 56 78", email: "camille@loire.fr", passes: 1, menu: "filete", status: "confirmed" }],
        vouchers: [],
        vendors: [],
        milestones: [],
        timeline: [],
        auditLogs: []
    },
    zen: {
        id: "zen",
        couple: "Aoi & Kenji",
        themeTag: "🌸 Zen Oriental",
        date: "08 de Abril, 2027",
        venue: "Meiji Shrine & Happo-en · Tokio",
        liveUrl: "",
        targetGuests: 90,
        costPerGuestCatering: 2100,
        plannerNote: "Ceremonia tradicional shinto seguida de banquete kaiseki contemporáneo.",
        tables: [{ id: "zt1", name: "Mesa 1 - Cerezo", capacity: 6, shape: "round", guests: [] }],
        guests: [{ id: "zg1", name: "Aoi Tanaka (Novia)", phone: "+81 90 1234 5678", email: "aoi@tokyo.jp", passes: 1, menu: "filete", status: "confirmed" }],
        vouchers: [],
        vendors: [],
        milestones: [],
        timeline: [],
        auditLogs: []
    },
    disco: {
        id: "disco",
        couple: "Chloe & Mateo",
        themeTag: "🪩 Disco Glam 54",
        date: "31 de Diciembre, 2027",
        venue: "Studio 54 Rooftop · Nueva York",
        liveUrl: "",
        targetGuests: 160,
        costPerGuestCatering: 1950,
        plannerNote: "Boda de fin de año con pista de baile iluminada y cócteles de autor.",
        tables: [{ id: "dt1", name: "VIP Booth 1", capacity: 10, shape: "round", guests: [] }],
        guests: [{ id: "dg1", name: "Chloe Miller (Novia)", phone: "+1 212 555 0199", email: "chloe@nyc.com", passes: 1, menu: "filete", status: "confirmed" }],
        vouchers: [],
        vendors: [],
        milestones: [],
        timeline: [],
        auditLogs: []
    },
    tuscany: {
        id: "tuscany",
        couple: "Giulia & Matteo",
        themeTag: "🍇 Tuscany Vineyard",
        date: "12 de Septiembre, 2027",
        venue: "Villa Cora · Florencia",
        liveUrl: "",
        targetGuests: 120,
        costPerGuestCatering: 1600,
        plannerNote: "Boda toscana al aire libre entre cipreses y cata de vino Chianti.",
        tables: [{ id: "tt1", name: "Tavolo d'Onore", capacity: 8, shape: "rect", guests: [] }],
        guests: [{ id: "tg1", name: "Giulia Rossi (Novia)", phone: "+39 055 123 4567", email: "giulia@firenze.it", passes: 1, menu: "salmon", status: "confirmed" }],
        vouchers: [],
        vendors: [],
        milestones: [],
        timeline: [],
        auditLogs: []
    }
};

window.WEDDINGS_DB = WEDDINGS_DB;

function getWeddingState(weddingId) {
    if (!weddingId) return null;
    let state = null;
    const saved = localStorage.getItem(`wp_enterprise_os_${weddingId}`);
    if (saved) {
        try { state = JSON.parse(saved); } catch(e) {}
    }
    if (!state) {
        if (WEDDINGS_DB[weddingId]) {
            state = JSON.parse(JSON.stringify(WEDDINGS_DB[weddingId]));
        } else {
            state = {
                id: weddingId,
                couple: "Boda Personalizada",
                themeTag: "💍 Boda Activa",
                date: "Fecha por definir",
                venue: "Lugar por definir",
                liveUrl: "",
                targetGuests: 100,
                costPerGuestCatering: 1200,
                tables: [],
                guests: [],
                vouchers: [],
                vendors: [],
                isBriefingCompleted: false
            };
        }
    }
    if (state && WEDDINGS_DB[weddingId]) {
        // Enforce couple name and theme from database if weddingId is a built-in key
        // This ensures switching to 'nuit' always displays 'Camille & Vincent' even if stale localStorage had cached another name
        if (!state.couple || state.couple === "Boda Personalizada" || (WEDDINGS_DB[weddingId] && !saved)) {
            state.couple = WEDDINGS_DB[weddingId].couple;
        } else if (WEDDINGS_DB[weddingId] && state.couple === "Sofía & Alejandro" && weddingId !== 'aura') {
            state.couple = WEDDINGS_DB[weddingId].couple;
        }
        if (!state.themeTag || (WEDDINGS_DB[weddingId] && state.themeTag === "🌿 Haute Editorial Botánico" && weddingId !== 'aura')) {
            state.themeTag = WEDDINGS_DB[weddingId].themeTag;
        }
        if (!state.date) state.date = WEDDINGS_DB[weddingId].date;
        if (!state.venue) state.venue = WEDDINGS_DB[weddingId].venue;
        if (state.liveUrl === undefined) state.liveUrl = WEDDINGS_DB[weddingId].liveUrl;
        if (state.isDestination === undefined) state.isDestination = WEDDINGS_DB[weddingId].isDestination;
        if (state.guestCost === undefined) state.guestCost = WEDDINGS_DB[weddingId].guestCost;
        if (state.deadlineMonth === undefined) state.deadlineMonth = WEDDINGS_DB[weddingId].deadlineMonth;
        if (state.bankName === undefined) state.bankName = WEDDINGS_DB[weddingId].bankName;
        if (state.beneficiary === undefined) state.beneficiary = WEDDINGS_DB[weddingId].beneficiary;
        if (state.clabe === undefined) state.clabe = WEDDINGS_DB[weddingId].clabe;
        if (state.coupleUser === undefined) state.coupleUser = WEDDINGS_DB[weddingId].coupleUser;
        if (state.couplePass === undefined) state.couplePass = WEDDINGS_DB[weddingId].couplePass;
        if (state.budget === undefined) state.budget = WEDDINGS_DB[weddingId].budget || 850000;
        if (state.honeymoonGoal === undefined) state.honeymoonGoal = WEDDINGS_DB[weddingId].honeymoonGoal || 150000;
        if (state.targetGuests === undefined) state.targetGuests = WEDDINGS_DB[weddingId].targetGuests || 180;
    }
    if (state.budget === undefined) state.budget = 850000;
    if (state.targetGuests === undefined) state.targetGuests = 180;
    if (!state.guests) state.guests = [];
    if (!state.tables) state.tables = [];
    if (!state.vouchers) state.vouchers = [];
    if (!state.vendors) state.vendors = [];

    // Ensure all guests have companionMenu and companionAllergies attributes populated
    if (Array.isArray(state.guests)) {
        state.guests.forEach(g => {
            if (!g.guest1Menu) g.guest1Menu = g.menu || 'filete';
            if (!g.guest1Allergies) g.guest1Allergies = g.allergies || 'Ninguna';
            if (g.passes > 1) {
                if (!g.companionMenu) {
                    g.companionMenu = (g.guest1Menu === 'salmon') ? 'filete' : (g.guest1Menu === 'risotto' ? 'filete' : 'salmon');
                }
                if (!g.companionAllergies) {
                    if (g.allergies && g.allergies.toLowerCase() !== 'ninguna' && g.name.includes('Andrea Garza')) {
                        g.companionAllergies = 'Alérgica a Mariscos';
                    } else if (g.name.includes('Carlos Eduardo')) {
                        g.companionAllergies = 'Intolerancia a Lactosa';
                    } else {
                        g.companionAllergies = 'Ninguna';
                    }
                }
            }
        });
    }

    if (state.isBriefingCompleted === undefined) {
        state.isBriefingCompleted = (weddingId === 'aura' || weddingId === 'riviera');
    }
    if (localStorage.getItem(`briefing_done_${weddingId}`)) {
        state.isBriefingCompleted = true;
    }
    return state;
}

function saveWeddingState(weddingId, data) {
    if (!weddingId || !data) return;
    localStorage.setItem(`wp_enterprise_os_${weddingId}`, JSON.stringify(data));
}

function logAuditAction(weddingId, user, role, action) {
    const data = getWeddingState(weddingId);
    if (!data.auditLogs) data.auditLogs = [];
    const now = new Date();
    const ts = now.toISOString().replace('T', ' ').substring(0, 19);
    data.auditLogs.unshift({
        timestamp: ts,
        user: user,
        role: role,
        action: action,
        ip: "187.190.24.11"
    });
    saveWeddingState(weddingId, data);
}
