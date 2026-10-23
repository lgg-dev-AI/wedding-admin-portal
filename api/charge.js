// ==========================================================================
// VERCEL SERVERLESS FUNCTION: STRIPE SECURE PAYMENT INTENTS ENGINE
// ANTIGRAVITY WEB DEVELOPER (antigravitywebstudio@hotmail.com)
// ==========================================================================

const https = require('https');

const STRIPE_TEST_KEY = process.env.STRIPE_TEST_KEY || '';
const STRIPE_LIVE_KEY = process.env.STRIPE_LIVE_KEY || '';

function postStripe(secretKey, endpoint, postData) {
    return new Promise((resolve, reject) => {
        const payload = new URLSearchParams(postData).toString();
        const options = {
            hostname: 'api.stripe.com',
            port: 443,
            path: endpoint,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: { raw: body } });
                }
            });
        });

        req.on('error', err => reject(err));
        req.write(payload);
        req.end();
    });
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch(e) {}
        }
        const { amount = 2000, currency = 'mxn', email = 'antigravitywebstudio@hotmail.com', agencyName = 'Aura Weddings', planName = 'Plan Signature Pro', paymentMethod = 'pm_card_visa', isLive = false } = body || {};

        const activeSecretKey = isLive ? STRIPE_LIVE_KEY : STRIPE_TEST_KEY;

        const paymentIntentData = {
            amount: Math.round(Number(amount) * 100), // En centavos
            currency: currency.toLowerCase(),
            payment_method: paymentMethod || 'pm_card_visa',
            confirm: 'true',
            description: `Suscripción ${planName} - ${agencyName}`,
            receipt_email: email,
            'automatic_payment_methods[enabled]': 'true',
            'automatic_payment_methods[allow_redirects]': 'never'
        };

        const stripeResponse = await postStripe(activeSecretKey, '/v1/payment_intents', paymentIntentData);

        if (stripeResponse.statusCode >= 200 && stripeResponse.statusCode < 300) {
            const pi = stripeResponse.data;
            return res.status(200).json({
                success: true,
                id: pi.id,
                amount: pi.amount / 100,
                currency: pi.currency,
                status: pi.status,
                livemode: pi.livemode,
                stripeUrl: pi.livemode 
                    ? `https://dashboard.stripe.com/payments/${pi.id}`
                    : `https://dashboard.stripe.com/test/payments/${pi.id}`
            });
        } else {
            return res.status(400).json({
                success: false,
                error: stripeResponse.data.error ? stripeResponse.data.error.message : 'Error al procesar el pago con Stripe'
            });
        }

    } catch (err) {
        console.error('Stripe Payment Intent error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
