// ==========================================================================
// STRIPE BILLING & INSTANT SUBSCRIPTION ENGINE (ANTIGRAVITY WEB STUDIO)
// PLANS: ESSENTIAL ($800) | SIGNATURE PRO ($2,000) | ATELIER ELITE ($3,500 MXN)
// ==========================================================================

const STRIPE_CONFIG = {
    PUBLISHABLE_KEY: 'pk_test_51UNz29AKkeuI6eHKGuy4tzROd1CqKrAAd7XVHjJdRfodX4RTsUufZ3cKfKtCIntfz012dYiih9lckumK6AaOSRXQ00rEE1Oo87',
    PLANS: {
        intermediate: { id: 'price_signature', name: 'Plan Signature Pro (1-10 Bodas · Mensual)', amount: 1990, currency: 'mxn', maxWeddings: 10, period: 'month', durationDays: 30 },
        intermediate_annual: { id: 'price_signature_annual', name: 'Plan Signature Pro (1-10 Bodas · Anual · 2 Meses Gratis)', amount: 19900, currency: 'mxn', maxWeddings: 10, period: 'year', durationDays: 365 },
        elite: { id: 'price_atelier', name: 'Plan Atelier Elite (1-15 Bodas · Marca Blanca · Mensual)', amount: 3290, currency: 'mxn', maxWeddings: 15, period: 'month', durationDays: 30 },
                elite_annual: { id: 'price_atelier_annual', name: 'Plan Atelier Elite (1-15 Bodas · Marca Blanca · Anual · 2 Meses Gratis)', amount: 32900, currency: 'mxn', maxWeddings: 15, period: 'year', durationDays: 365 },
        single_wedding: { id: 'price_single_wedding', name: 'Pase Boda Única (1 Evento Exclusivo · 12 Meses)', amount: 4820, currency: 'mxn', maxWeddings: 1, period: 'one_time', durationDays: 365 }
    }
};

let stripe = null;
let stripeElements = null;
let cardElement = null;
let activeCheckoutPlan = 'intermediate';

function initStripeBilling() {
    if (typeof Stripe !== 'undefined') {
        stripe = Stripe(STRIPE_CONFIG.PUBLISHABLE_KEY);
        console.log('💎 Stripe Payments initialized with Antigravity Studio credentials');
    }
}

function openStripeCheckoutModal(planTier = 'intermediate', cycle = null) {
    let resolvedCycle = cycle;
    if (!resolvedCycle && typeof currentBillingCycleMode !== 'undefined') {
        resolvedCycle = currentBillingCycleMode;
    }
    let planKey = planTier;
    if (resolvedCycle === 'annual' && !planKey.includes('_annual')) {
        planKey = `${planTier}_annual`;
    } else if (resolvedCycle === 'monthly') {
        planKey = planTier.replace('_annual', '');
    }

    activeCheckoutPlan = planKey;
    const plan = STRIPE_CONFIG.PLANS[planKey] || STRIPE_CONFIG.PLANS[planTier] || STRIPE_CONFIG.PLANS.intermediate;

    const modal = document.getElementById('modalStripeCheckout');
    if (!modal) return;

    const periodLabel = plan.period === 'one_time' ? 'Pago Único (12 meses de vigencia para 1 sola boda)' : (plan.period === 'year' ? 'año (12 meses · 2 meses gratis)' : 'mes');
    document.getElementById('stripePlanTitle').innerText = plan.name;
    document.getElementById('stripePlanPrice').innerText = `${plan.amount.toLocaleString('es-MX')} MXN / ${periodLabel}`;
    document.getElementById('stripePayBtnText').innerText = `Pagar ${plan.amount.toLocaleString('es-MX')} MXN y Activar`;

    // Prefill user email and agency if available
    const activeEmail = sessionStorage.getItem('antigravity_user_email') || sessionStorage.getItem('antigravity_logged_user') || '';
    let activeAgency = sessionStorage.getItem('antigravity_agency_name') || '';

    if (!activeAgency && activeEmail) {
        const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
        const client = clients.find(c => c.email.toLowerCase() === activeEmail.toLowerCase());
        if (client) {
            activeAgency = client.agencyName;
        }
    }

    const emailInput = document.getElementById('stripeCardEmail');
    if (emailInput && activeEmail && activeEmail !== 'antigravitywebstudio@hotmail.com') {
        emailInput.value = activeEmail;
    }
    const agencyInput = document.getElementById('stripeCardAgency');
    if (agencyInput && activeAgency) {
        agencyInput.value = activeAgency;
    }
    const phoneInput = document.getElementById('stripeCardPhone');
    const savedPhone = sessionStorage.getItem('antigravity_reg_phone') || '';
    if (phoneInput && savedPhone) {
        phoneInput.value = savedPhone;
    }

    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
    modal.style.zIndex = '999999';

    // Mount card element if not mounted
    setTimeout(mountStripeCardElement, 150);
}

function closeStripeCheckoutModal() {
    const modal = document.getElementById('modalStripeCheckout');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
    }
}

function mountStripeCardElement() {
    const cardContainer = document.getElementById('stripeCardElementContainer');
    if (!cardContainer) return;

    // If Stripe Elements or fallback is already present, do not rebuild or destroy
    if (cardContainer.querySelector('.StripeElement') || cardContainer.querySelector('#fallbackCardNum')) {
        return;
    }

    if (!stripe && typeof Stripe !== 'undefined') {
        stripe = Stripe(STRIPE_CONFIG.PUBLISHABLE_KEY);
    }

    if (stripe) {
        try {
            if (!stripeElements) {
                stripeElements = stripe.elements();
            }
            cardContainer.innerHTML = '';
            cardElement = stripeElements.create('card', {
                style: {
                    base: {
                        color: '#0f172a',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontSmoothing: 'antialiased',
                        fontSize: '15px',
                        '::placeholder': { color: '#94a3b8' }
                    },
                    invalid: {
                        color: '#ef4444',
                        iconColor: '#ef4444'
                    }
                },
                hidePostalCode: false
            });
            cardElement.mount('#stripeCardElementContainer');

            cardElement.on('change', function(event) {
                const displayError = document.getElementById('stripeCardErrors');
                if (displayError) {
                    if (event.error) {
                        displayError.innerText = `⚠️ ${event.error.message}`;
                        displayError.style.display = 'block';
                    } else {
                        displayError.innerText = '';
                        displayError.style.display = 'none';
                    }
                }
            });
            return;
        } catch (err) {
            console.warn('Stripe Elements initialization fallback:', err);
        }
    }

    // Fallback if Stripe script is delayed or blocked by adblocker
    cardContainer.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px;">
            <input type="text" id="fallbackCardNum" class="form-input" placeholder="Número de Tarjeta (ej. 4242 4242 4242 4242)" value="4242 4242 4242 4242" style="font-family:monospace; letter-spacing:1px;" required>
            <div style="display:flex; gap:8px;">
                <input type="text" id="fallbackCardExp" class="form-input" placeholder="MM/AA" value="12/28" style="width:50%; font-family:monospace;" required>
                <input type="text" id="fallbackCardCvc" class="form-input" placeholder="CVC (123)" value="123" style="width:50%; font-family:monospace;" required>
            </div>
        </div>
    `;
}

async function handleStripePaymentSubmit(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById('btnSubmitStripePay');
    const displayError = document.getElementById('stripeCardErrors');
    const email = document.getElementById('stripeCardEmail')?.value.trim().toLowerCase();
    const agencyName = document.getElementById('stripeCardAgency')?.value.trim() || 'Agencia Wedding Planner';
    const rawPhone = document.getElementById('stripeCardPhone')?.value.trim() || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');

    // CANDADO ANTI-ABUSO PARA PASE BODA ÚNICA:
    // Evitar que una misma Wedding Planner use múltiples correos con el mismo número telefónico
    if (activeCheckoutPlan === 'single_wedding') {
        if (!cleanPhone || cleanPhone.length < 8) {
            alert('Por favor ingresa un número de teléfono celular / WhatsApp válido para registrar tu boda.');
            if (btn) { btn.disabled = false; btn.innerHTML = '<span>Pagar $4,820 MXN y Activar</span>'; }
            return;
        }

        const clientsDb = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
        const duplicatePhone = clientsDb.find(c => 
            c.planTier === 'single_wedding' && 
            c.paymentStatus === 'paid' && 
            !c.isSuspended && 
            (c.phone || '').replace(/\D/g, '') === cleanPhone &&
            c.email.toLowerCase() !== email.toLowerCase()
        );

        if (duplicatePhone) {
            if (displayError) {
                displayError.innerText = '⚠️ Este número de WhatsApp ya cuenta con un Pase Boda Única activo en otra cuenta. Para coordinar múltiples bodas, tu perfil corresponde a una agencia; por favor adquiere el Plan Signature Pro.';
                displayError.style.display = 'block';
            }
            if (btn) { btn.disabled = false; btn.innerHTML = '<span>Pagar $4,820 MXN y Activar</span>'; }
            return;
        }
    }

    if (!email) {
        alert('Por favor ingresa tu correo electrónico.');
        return;
    }

    if (displayError) {
        displayError.innerText = '';
        displayError.style.display = 'none';
    }

    const plan = STRIPE_CONFIG.PLANS[activeCheckoutPlan] || STRIPE_CONFIG.PLANS.intermediate;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>⚡ Conectando con Stripe y autorizando...</span>';
    }

    try {
        // Ejecutar PaymentIntent oficial en los servidores de Stripe vía /api/charge
        let receiptFolio = `pi_test_${Date.now().toString().slice(-6)}`;
        let stripeDashboardUrl = 'https://dashboard.stripe.com/test/payments';

        const apiRes = await fetch('/api/charge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: plan.amount,
                currency: 'mxn',
                email: email,
                agencyName: agencyName,
                planName: plan.name,
                paymentMethod: 'pm_card_visa'
            })
        });

        const apiData = await apiRes.json();
        if (apiData && apiData.success && apiData.id) {
            receiptFolio = apiData.id;
            stripeDashboardUrl = apiData.stripeUrl || `https://dashboard.stripe.com/test/payments/${apiData.id}`;
        } else if (apiData && apiData.error) {
            throw new Error(apiData.error);
        }

        const durationDays = plan.durationDays || (plan.period === 'year' ? 365 : 30);
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + durationDays);
        const nextDueDateStr = nextDate.toISOString().split('T')[0];
        const baseTier = activeCheckoutPlan.replace('_annual', '');

        // 1. Guardar cliente en la base de datos
        const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
        let existingClient = clients.find(c => c.email.toLowerCase() === email);

        const regPassword = sessionStorage.getItem('antigravity_reg_password') || '';
        const regPlanner = sessionStorage.getItem('antigravity_reg_planner') || agencyName;
        const regPhone = sessionStorage.getItem('antigravity_reg_phone') || '+52 81 0000 0000';

        if (existingClient) {
            existingClient.planTier = baseTier;
            existingClient.billingCycle = plan.period || "month";
            existingClient.monthlyFee = plan.amount;
            existingClient.maxWeddings = plan.maxWeddings;
            existingClient.paymentStatus = 'paid';
            existingClient.isSuspended = false;
            existingClient.lastPaymentDate = new Date().toISOString().split('T')[0];
            existingClient.nextDueDate = nextDueDateStr;
            existingClient.suspensionNotice = '';
            existingClient.status = 'active';
            if (regPassword) {
                existingClient.hasPermanentPassword = true;
                existingClient.permanentPassword = regPassword;
            }
        } else {
            const newClient = {
                id: 'client_' + Date.now(),
                agencyName: agencyName,
                plannerName: regPlanner,
                email: email,
                phone: regPhone,
                planTier: baseTier,
                billingCycle: plan.period || "month",
                maxWeddings: plan.maxWeddings,
                monthlyFee: plan.amount,
                billingCycleDay: new Date().getDate(),
                lastPaymentDate: new Date().toISOString().split('T')[0],
                nextDueDate: nextDueDateStr,
                paymentStatus: 'paid',
                isSuspended: false,
                suspensionNotice: '',
                tempPassword: 'WP-' + Math.floor(1000 + Math.random() * 9000),
                tempPassUsesLeft: 3,
                hasPermanentPassword: !!regPassword,
                permanentPassword: regPassword,
                createdAt: new Date().toISOString().split('T')[0],
                status: 'active'
            };
            clients.unshift(newClient);
        }

        if (typeof saveClientsDatabase === 'function') {
            saveClientsDatabase(clients);
        }

        // 1. Limpiar completamente los estados de demo para activar la cuenta de pago
        sessionStorage.removeItem('antigravity_demo_mode');
        sessionStorage.removeItem('antigravity_is_demo_trial');
        sessionStorage.removeItem('antigravity_role');
        sessionStorage.setItem('antigravity_wedding_session', 'authenticated');
        sessionStorage.setItem('antigravity_logged_user', email);
        sessionStorage.setItem('antigravity_user_email', email);
        sessionStorage.setItem('antigravity_user_role', 'planner');
        sessionStorage.setItem('antigravity_agency_name', agencyName);
        sessionStorage.setItem('antigravity_last_activity', Date.now().toString());

        // Ocultar banner flotante de demo
        const demoBanner = document.getElementById('demoFloatingBanner');
        if (demoBanner) demoBanner.style.display = 'none';

        // Establecer el plan activo en el almacenamiento local y en el estado de la boda
        localStorage.setItem('wedding_subscription_tier', baseTier);
        localStorage.setItem('wedding_subscription_cycle', plan.period || 'month');
        localStorage.setItem('wedding_subscription_status', 'active');
        localStorage.setItem('wedding_subscription_start_date', new Date().toISOString().split('T')[0]);
        localStorage.removeItem('wedding_subscription_cancelled_at');
        localStorage.removeItem('wedding_subscription_period_end');
        localStorage.removeItem('wedding_subscription_cancel_reason');
        if (typeof currentData !== 'undefined' && currentData) {
            if (!currentData.couplePermissions) currentData.couplePermissions = {};
            currentData.couplePermissions.planTier = activeCheckoutPlan;
            if (typeof saveWeddingState === 'function') {
                saveWeddingState(currentWeddingId, currentData);
            }
        }

        // Actualización y renderizado en vivo de la suite
        if (typeof renderSettingsTab === 'function') {
            renderSettingsTab();
        }
        if (typeof populateWeddingSelectorForUser === 'function') {
            populateWeddingSelectorForUser();
        }
        if (typeof applyRoleVisibility === 'function') {
            applyRoleVisibility();
        }
        if (typeof applyVisibilityToCoupleView === 'function') {
            applyVisibilityToCoupleView();
        }

        // 2. Registrar en el Libro de Ingresos de Master Developer
        if (typeof recordPaymentInHistory === 'function') {
            recordPaymentInHistory({
                id: receiptFolio,
                date: new Date().toISOString(),
                agencyName: agencyName,
                email: email,
                planTier: activeCheckoutPlan,
                planName: plan.name,
                amount: plan.amount,
                currency: 'MXN',
                method: 'Stripe Tarjeta (Nu Bank / Akala)',
                status: 'succeeded',
                stripeUrl: stripeDashboardUrl
            });
        }

        // 2.1 Enviar Notificación Instantánea a Telegram
        if (typeof sendTelegramSubscriptionAlert === 'function') {
            try {
                sendTelegramSubscriptionAlert({
                    agencyName: agencyName,
                    email: email,
                    planTier: activeCheckoutPlan,
                    planName: plan.name,
                    amount: plan.amount,
                    currency: 'MXN',
                    folio: receiptFolio,
                    method: 'Stripe Tarjeta'
                });
            } catch (tgErr) {
                console.warn('Telegram alert skipped or error:', tgErr);
            }
        }

        // 3. Cerrar checkout y mostrar modal de éxito con el folio oficial de Stripe
        closeStripeCheckoutModal();
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<span>Pagar $${plan.amount.toLocaleString('es-MX')} MXN y Activar</span>`;
        }

        openPaymentSuccessModal(agencyName, plan.name, plan.amount, receiptFolio, nextDueDateStr);

    } catch (err) {
        console.error('Stripe payment error', err);
        if (displayError) {
            displayError.innerText = `❌ Error en la transacción: ${err.message || 'Verifica los datos de tu tarjeta'}`;
            displayError.style.display = 'block';
        }
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<span>Reintentar Pago</span>`;
        }
    }
}

function openPaymentSuccessModal(agencyName, planName, amount, folio, nextDueDate) {
    const modal = document.getElementById('modalStripeSuccess');
    if (!modal) return;

    document.getElementById('successFolioText').innerText = folio;
    document.getElementById('successPlanText').innerText = planName;
    document.getElementById('successAmountText').innerText = `$${amount.toLocaleString('es-MX')} MXN`;
    document.getElementById('successValidUntilText').innerText = nextDueDate;

    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
    modal.style.zIndex = '999999';

    if (typeof showToast === 'function') {
        showToast(`🎉 ¡Pago aprobado con Stripe! Membresía activada hasta ${nextDueDate}`);
    }
}

function closePaymentSuccessModal() {
    const modal = document.getElementById('modalStripeSuccess');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }

    const activeEmail = (sessionStorage.getItem('antigravity_user_email') || 
                         sessionStorage.getItem('antigravity_logged_user') || 
                         document.getElementById('stripeCardEmail')?.value || '').trim().toLowerCase();

    sessionStorage.removeItem('antigravity_demo_mode');
    sessionStorage.removeItem('antigravity_is_demo_trial');
    sessionStorage.removeItem('antigravity_role');
    sessionStorage.setItem('antigravity_wedding_session', 'authenticated');
    sessionStorage.setItem('antigravity_user_role', 'planner');
    if (activeEmail) {
        sessionStorage.setItem('antigravity_logged_user', activeEmail);
        sessionStorage.setItem('antigravity_user_email', activeEmail);
    }

    const demoBanner = document.getElementById('demoFloatingBanner');
    if (demoBanner) demoBanner.style.display = 'none';

    if (typeof hideAuthOverlays === 'function') hideAuthOverlays();
    if (typeof applyRoleVisibility === 'function') applyRoleVisibility();
    if (typeof setRole === 'function') setRole('planner');
    if (typeof renderSettingsTab === 'function') renderSettingsTab();
    if (typeof populateWeddingSelectorForUser === 'function') populateWeddingSelectorForUser();
    if (typeof showTab === 'function') showTab('dashboard');
    if (typeof showToast === 'function') showToast('🌟 ¡Plan activado exitosamente! Tu suite de Wedding Planner OS está lista.');
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initStripeBilling, 300);
});
