// test-full-lifecycle.js
const fs = require('fs');
const path = require('path');

console.log('=====================================================');
console.log('🧪 VERIFICACIÓN COMPLETA: FLUJO DE USUARIO Y PAGOS');
console.log('=====================================================');

// 1. Mock Browser Environment (localStorage, sessionStorage, DOM, fetch)
const storage = {
    local: {},
    session: {}
};

global.localStorage = {
    getItem: (k) => storage.local[k] !== undefined ? storage.local[k] : null,
    setItem: (k, v) => { storage.local[k] = String(v); },
    removeItem: (k) => { delete storage.local[k]; },
    clear: () => { storage.local = {}; }
};

global.sessionStorage = {
    getItem: (k) => storage.session[k] !== undefined ? storage.session[k] : null,
    setItem: (k, v) => { storage.session[k] = String(v); },
    removeItem: (k) => { delete storage.session[k]; },
    clear: () => { storage.session = {}; }
};

global.window = global;
function createMockElement(id = '') {
    return {
        id,
        value: '',
        innerText: '',
        innerHTML: '',
        style: {},
        classList: {
            add: () => {},
            remove: () => {},
            toggle: () => {},
            contains: () => false
        },
        setAttribute: () => {},
        getAttribute: () => '',
        removeAttribute: () => {},
        appendChild: () => {},
        remove: () => {},
        closest: () => createMockElement(),
        querySelector: () => createMockElement(),
        querySelectorAll: () => []
    };
}

let activeMockElements = {};
function setMockElements(map) {
    activeMockElements = map;
}

global.document = {
    body: createMockElement('body'),
    createElement: (tag) => createMockElement(tag),
    getElementById: (id) => {
        if (activeMockElements[id]) {
            return Object.assign(createMockElement(id), activeMockElements[id]);
        }
        return createMockElement(id);
    },
    querySelector: () => createMockElement(),
    querySelectorAll: () => [],
    addEventListener: () => {}
};

global.alert = (msg) => console.log('  [Alert]:', msg);
global.confirm = () => true;
global.prompt = () => '2101';
global.fetch = async (url, opts) => {
    if (url === '/api/stripe-charge') {
        const body = JSON.parse(opts.body);
        return {
            json: async () => ({
                success: true,
                id: 'ch_test_' + Date.now(),
                stripeUrl: 'https://dashboard.stripe.com/test/payments/ch_test_' + Date.now(),
                amount: body.amount,
                currency: body.currency
            })
        };
    }
    return { json: async () => ({}) };
};

const vm = require('vm');

// 2. Load codebase files in dependency order
function loadScript(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    try {
        vm.runInThisContext(code, { filename: path.basename(filePath) });
    } catch (e) {
        console.error(`Error loading ${filePath}:`, e);
        throw e;
    }
}

const baseDir = path.resolve(__dirname, 'scripts');
loadScript(path.join(baseDir, 'admin-data.js'));
loadScript(path.join(baseDir, 'admin-clients.js'));
loadScript(path.join(baseDir, 'admin-settings.js'));
loadScript(path.join(baseDir, 'admin-auth.js'));
loadScript(path.join(baseDir, 'admin-app.js'));
loadScript(path.join(baseDir, 'stripe-billing.js'));

let testsPassed = 0;
let testsFailed = 0;

function assert(cond, msg) {
    if (cond) {
        console.log(`  ✓ ${msg}`);
        testsPassed++;
    } else {
        console.error(`  ❌ FALLO: ${msg}`);
        testsFailed++;
    }
}

async function runSuite() {
    console.log('\n[Paso 1] Registro de nueva Wedding Planner (Sofia & Co.)');
    // Mock form inputs
    const regInputs = {
        regAgencyName: { value: 'Sofia & Co. Weddings' },
        regPlannerName: { value: 'Sofia Morales' },
        regEmail: { value: 'sofia@bodasboutique.mx' },
        regCountryCode: { value: '+52' },
        regPhoneNum: { value: '8112345678' },
        regPassword: { value: 'SofiaNovias2027!' }
    };
    setMockElements(regInputs);

    submitPlannerRegistration({ preventDefault: () => {} });

    const clients = getClientsDatabase();
    const sofiaClient = clients.find(c => c.email === 'sofia@bodasboutique.mx');

    assert(!!sofiaClient, 'Cliente registrado en la base de datos de planners');
    assert(sofiaClient.paymentStatus === 'demo_trial', 'Estado inicial es "demo_trial"');
    assert(sofiaClient.planTier === null, 'Plan inicial en base de datos es null (sin plan contratado)');
    assert(sessionStorage.getItem('antigravity_is_demo_trial') === 'true', 'Bandera antigravity_is_demo_trial activa en sesión');
    assert(sessionStorage.getItem('antigravity_demo_mode') === 'true', 'Bandera antigravity_demo_mode activa en sesión');
    
    const initialTier = getActiveSubscriptionTier();
    assert(initialTier === null, 'getActiveSubscriptionTier() retorna null (bloquea funciones de pago / modo demo)');

    const initialWeddings = getWeddingsForActiveUser();
    assert(Array.isArray(initialWeddings) && initialWeddings.length === 0, 'Workspace aislado: Nueva planner no ve bodas demo de otros clientes');

    console.log('\n[Paso 2] Intento de pago de suscripción con Stripe (Plan Signature Pro: $1,500 MXN)');
    // Set up stripe checkout inputs
    activeCheckoutPlan = 'intermediate'; // Signature Pro
    const checkoutInputs = {
        stripeCardEmail: { value: 'sofia@bodasboutique.mx' },
        stripeCardAgency: { value: 'Sofia & Co. Weddings' },
        stripePayBtn: { disabled: false, innerHTML: '', style: {} },
        stripeCardError: { style: {}, innerText: '' },
        modalStripeCheckout: { classList: { remove: ()=>{} }, style: {} },
        modalStripeSuccess: { classList: { add: ()=>{}, remove: ()=>{} }, style: {} },
        successFolioText: { innerText: '' },
        successPlanText: { innerText: '' },
        successAmountText: { innerText: '' },
        successValidUntilText: { innerText: '' },
        demoFloatingBanner: { style: {} }
    };
    setMockElements(checkoutInputs);

    await handleStripePaymentSubmit({ preventDefault: () => {} });

    const updatedClients = getClientsDatabase();
    const paidSofia = updatedClients.find(c => c.email === 'sofia@bodasboutique.mx');

    assert(paidSofia.paymentStatus === 'paid', 'Estatus de pago actualizado a "paid"');
    assert(paidSofia.planTier === 'intermediate', 'Plan tier actualizado a "intermediate" en la DB');
    assert(sessionStorage.getItem('antigravity_demo_mode') === null, 'Bandera de sesión antigravity_demo_mode fue eliminada con éxito');
    assert(sessionStorage.getItem('antigravity_is_demo_trial') === null, 'Bandera de sesión antigravity_is_demo_trial fue eliminada con éxito');
    assert(localStorage.getItem('wedding_subscription_tier') === 'intermediate', 'localStorage wedding_subscription_tier actualizado a "intermediate"');

    const activeTierPostPayment = getActiveSubscriptionTier();
    assert(activeTierPostPayment === 'intermediate', 'getActiveSubscriptionTier() retorna "intermediate" inmediatamente tras el pago');

    const unlockedFeatures = TIER_FEATURES[activeTierPostPayment] || [];
    assert(unlockedFeatures.includes('showDispatch'), 'Módulo WhatsApp Dispatch desbloqueado');
    assert(unlockedFeatures.includes('showSeating'), 'Módulo Croquis y Acomodo desbloqueado');
    assert(unlockedFeatures.includes('showFinance'), 'Módulo Finanzas y Pagos desbloqueado');
    assert(unlockedFeatures.includes('showCRM'), 'Módulo CRM Invitados desbloqueado');

    console.log('\n[Paso 3] Creación de una boda en el espacio de trabajo de la planner');
    const weddingInputs = {
        newWNames: { value: 'Valentina & Mateo' },
        newWDate: { value: '2027-11-20' },
        newWVenue: { value: 'Hacienda San José · San Miguel de Allende' },
        newWRsvp: { value: 'open' },
        newWWidth: { value: '50' },
        newWLength: { value: '80' },
        newWGuests: { value: '250' },
        newWBudget: { value: '1200000' },
        modalNewWedding: { classList: { remove: ()=>{} }, style: {} },
        weddingSelect: { innerHTML: '', appendChild: ()=>{} }
    };
    setMockElements(weddingInputs);

    saveNewWeddingForm({ preventDefault: () => {} });

    const plannerWeddings = getWeddingsForActiveUser();
    assert(plannerWeddings.length === 1, 'Boda registrada exitosamente en el tenant de la planner');
    assert(plannerWeddings[0].couple === 'Valentina & Mateo', 'Los nombres de la pareja coinciden');
    assert(plannerWeddings[0].couplePermissions.planTier === 'intermediate', 'Permisos de la boda heredan automáticamente el plan pagado (intermediate)');

    console.log('\n[Paso 4] Simulación de Cierre de Sesión (Logout)');
    sessionStorage.clear();
    assert(sessionStorage.getItem('antigravity_wedding_session') === null, 'Sesión limpiada correctamente');

    console.log('\n[Paso 5] Re-inicio de sesión con correo y contraseña permanente');
    const loginInputs = {
        loginUserInput: { value: 'sofia@bodasboutique.mx' },
        loginPinInput: { value: 'SofiaNovias2027!' },
        loginErrorMsg: { innerHTML: '', style: {} },
        demoFloatingBanner: { style: {} },
        loginGatekeeperOverlay: { style: {} },
        sessionLockOverlay: { style: {} },
        weddingSelect: { innerHTML: '', appendChild: ()=>{} }
    };
    setMockElements(loginInputs);

    submitFullLogin();

    assert(sessionStorage.getItem('antigravity_wedding_session') === 'authenticated', 'Sesión reautenticada con éxito');
    assert(sessionStorage.getItem('antigravity_user_role') === 'planner', 'Rol autenticado como planner');
    assert(sessionStorage.getItem('antigravity_demo_mode') === null, 'Al reingresar, modo demo sigue inactivo (NO regresa al modo gratis)');
    assert(sessionStorage.getItem('antigravity_is_demo_trial') === null, 'Al reingresar, demo trial sigue inactivo');
    assert(getActiveSubscriptionTier() === 'intermediate', 'Al reingresar, getActiveSubscriptionTier() recupera inmediatamente "intermediate"');
    
    const reloadedWeddings = getWeddingsForActiveUser();
    assert(reloadedWeddings.length === 1, 'La planner recupera exactamente sus bodas creadas tras reingresar');

    console.log('\n=====================================================');
    console.log(`RESULTADO DE LA SUITE: ${testsPassed} Pasadas | ${testsFailed} Fallidas`);
    console.log('=====================================================');

    if (testsFailed > 0) {
        process.exit(1);
    } else {
        console.log('🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
        process.exit(0);
    }
}

runSuite().catch(err => {
    console.error('Error fatal durante la prueba:', err);
    process.exit(1);
});
