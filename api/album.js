// ==========================================================================
// VERCEL SERVERLESS API: LIVE COLLABORATIVE WEDDING ALBUM RELAY (/api/album)
// Connects Guest Mobile QR Camera Uploads -> Wedding Planner & Master Dev Portal
// ==========================================================================

global.__weddingAlbumStore = global.__weddingAlbumStore || {
    aura: [
        {
            id: 'p1',
            personName: 'Mariana Garza',
            author: 'Mariana Garza (Mesa 4 - Amigos Universidad)',
            table: 'Mesa 4 - Amigos Universidad',
            time: 'Hace 10 min',
            url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600',
            caption: '¡La mejor entrada de los novios! Los queremos muchísimo ✨'
        },
        {
            id: 'p2',
            personName: 'Valeria & Diego',
            author: 'Valeria & Diego (Mesa 4 - Amigos Universidad)',
            table: 'Mesa 4 - Amigos Universidad',
            time: 'Hace 14 min',
            url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=600',
            caption: '¡La Mesa 4 prendiendo la pista de baile desde el minuto uno! 🕺💃'
        },
        {
            id: 'p3',
            personName: 'Carlos Mendoza',
            author: 'Carlos Mendoza (Mesa 2 - Familia Novia)',
            table: 'Mesa 2 - Familia Novia',
            time: 'Hace 25 min',
            url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600',
            caption: 'Brindis inolvidable por toda una vida juntos 🥂'
        },
        {
            id: 'p4',
            personName: 'Tía Lucía Morales',
            author: 'Tía Lucía Morales (Mesa 2 - Familia Novia)',
            table: 'Mesa 2 - Familia Novia',
            time: 'Hace 32 min',
            url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600',
            caption: 'Qué emoción ver a mi sobrina tan radiante, Dios los bendiga siempre ❤️'
        },
        {
            id: 'p5',
            personName: 'Sofía & Alejandro',
            author: 'Sofía & Alejandro (Mesa 1 - Mesa de Honor)',
            table: 'Mesa 1 - Mesa de Honor',
            time: 'Hace 1 hora',
            url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600',
            caption: 'Nuestra sesión de First Look antes de entrar al banquete ✨'
        },
        {
            id: 'p6',
            personName: 'Padrinos Fernando & Elena',
            author: 'Padrinos Fernando & Elena (Mesa 1 - Mesa de Honor)',
            table: 'Mesa 1 - Mesa de Honor',
            time: 'Hace 50 min',
            url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=600',
            caption: 'Un honor acompañarlos en la Mesa de Honor en este día histórico 🥂💍'
        },
        {
            id: 'p7',
            personName: 'Dr. Roberto Elizondo',
            author: 'Dr. Roberto Elizondo (Mesa 3 - Familia Novio)',
            table: 'Mesa 3 - Familia Novio',
            time: 'Hace 1 hora',
            url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600',
            caption: 'Decoración botánica espectacular, felicidades de parte de la familia Elizondo 🌿'
        }
    ]
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const weddingId = (req.query.wedding || (req.body && req.body.weddingId) || 'aura').toString();
    if (!global.__weddingAlbumStore[weddingId]) {
        global.__weddingAlbumStore[weddingId] = [...(global.__weddingAlbumStore.aura || [])];
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            ok: true,
            weddingId,
            photos: global.__weddingAlbumStore[weddingId]
        });
    }

    if (req.method === 'POST') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
            const { author, personName, table, caption, url, id } = body;

            if (!url) {
                return res.status(400).json({ ok: false, error: 'Missing photo url/data' });
            }

            const cleanTable = (table || 'Mesa 1 - Mesa de Honor').trim();
            const cleanPerson = (personName || (author ? author.replace(/\s*\(Mesa.*?\)\s*/i, '').trim() : 'Invitado')).trim();

            const newPhoto = {
                id: id || ('qr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
                personName: cleanPerson,
                author: (author || `${cleanPerson} (${cleanTable})`).trim(),
                table: cleanTable,
                time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) + ' hrs (En Vivo)',
                url,
                caption: (caption || '¡Compartiendo este gran momento! 📸✨').trim(),
                uploadedViaQr: true,
                createdAt: Date.now()
            };

            const list = global.__weddingAlbumStore[weddingId];
            if (!list.some(p => p.id === newPhoto.id)) {
                list.unshift(newPhoto);
                if (list.length > 60) list.pop();
            }

            return res.status(200).json({
                ok: true,
                photo: newPhoto,
                photos: list
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: err.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const photoId = req.query.id || (req.body && req.body.id);
            if (photoId) {
                global.__weddingAlbumStore[weddingId] = (global.__weddingAlbumStore[weddingId] || []).filter(p => p.id !== photoId);
            }
            return res.status(200).json({
                ok: true,
                photos: global.__weddingAlbumStore[weddingId]
            });
        } catch (err) {
            return res.status(500).json({ ok: false, error: err.message });
        }
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
};
