// ==========================================================================
// WEDDING OS & ANTIGRAVITY SECURITY: LOGIN, ROLES & 25-MIN AUTO-LOCK ENGINE
// ==========================================================================

const AUTH_CONFIG = {
    DEVELOPER_EMAIL: 'antigravitywebstudio@hotmail.com',
    DEVELOPER_PIN: '2101',
    TIMEOUT_MS: 25 * 60 * 1000, // 25 minutos ergonómicos para Wedding Planners
    SESSION_KEY: 'antigravity_wedding_session',
    USER_KEY: 'antigravity_logged_user',
    ROLE_KEY: 'antigravity_user_role', // 'developer' or 'planner'
    LAST_ACTIVITY_KEY: 'antigravity_last_activity'
};

let inactivityTimer = null;
let isSessionLocked = false;
let clientPendingReset = null;

// Initialize Auth on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // Purge test wedding data for gzzwicho2101@gmail.com once to guarantee 100% clean slate from scratch
    if (!localStorage.getItem('wp_cleaned_scratch_gzzwicho2101')) {
        try {
            const targetEmail = 'gzzwicho2101@gmail.com';
            localStorage.removeItem(`wp_weddings_by_planner_${targetEmail}`);
            const clientsRaw = localStorage.getItem('antigravity_clients_db');
            if (clientsRaw) {
                let clients = JSON.parse(clientsRaw);
                clients = clients.filter(c => c.email.toLowerCase() !== targetEmail);
                localStorage.setItem('antigravity_clients_db', JSON.stringify(clients));
            }
            localStorage.setItem('wp_cleaned_scratch_gzzwicho2101', 'true');
        } catch(e) {
            console.warn('Cleanup notice:', e);
        }
    }

    initAuthSystem();
    setupActivityListeners();
});

function initAuthSystem() {
    // Si el usuario llega por enlace de invitado (ej: ?guest=g4 o ?portal=g4)
    const urlParams = new URLSearchParams(window.location.search);
    const guestParam = urlParams.get('guest') || urlParams.get('portal');
    if (guestParam) {
        document.body.classList.add('guest-portal-standalone-mode');
        hideAuthOverlays();
        sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, 'authenticated');
        sessionStorage.setItem(AUTH_CONFIG.ROLE_KEY, 'guest');
        setTimeout(() => {
            if (typeof openGuestPaymentPortalModal === 'function') {
                openGuestPaymentPortalModal(guestParam);
            }
        }, 200);
        return;
    }

    const isAuth = sessionStorage.getItem(AUTH_CONFIG.SESSION_KEY);
    const lastActive = parseInt(sessionStorage.getItem(AUTH_CONFIG.LAST_ACTIVITY_KEY) || '0', 10);
    const now = Date.now();

    if (!isAuth || isAuth !== 'authenticated') {
        showFullLoginGatekeeper();
    } else if (lastActive && (now - lastActive > AUTH_CONFIG.TIMEOUT_MS)) {
        lockSessionByInactivity();
    } else {
        hideAuthOverlays();
        applyRoleVisibility();
        const savedRole = sessionStorage.getItem(AUTH_CONFIG.ROLE_KEY);
        if (savedRole === 'couple' && typeof setRole === 'function') {
            setRole('couple');
        }
        if (typeof populateWeddingSelectorForUser === 'function') {
            populateWeddingSelectorForUser();
        }
        resetInactivityTimer();
    }
}

function setupActivityListeners() {
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    
    activityEvents.forEach(evt => {
        window.addEventListener(evt, () => {
            if (!isSessionLocked && sessionStorage.getItem(AUTH_CONFIG.SESSION_KEY) === 'authenticated') {
                sessionStorage.setItem(AUTH_CONFIG.LAST_ACTIVITY_KEY, Date.now().toString());
                resetInactivityTimer();
            }
        }, { passive: true });
    });
}

function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    
    inactivityTimer = setTimeout(() => {
        if (sessionStorage.getItem(AUTH_CONFIG.SESSION_KEY) === 'authenticated') {
            lockSessionByInactivity();
        }
    }, AUTH_CONFIG.TIMEOUT_MS);
}

function lockSessionByInactivity() {
    isSessionLocked = true;
    document.body.classList.add('auth-locked');
    const lockOverlay = document.getElementById('sessionLockOverlay');
    if (lockOverlay) {
        lockOverlay.style.display = 'flex';
        const activeUser = sessionStorage.getItem(AUTH_CONFIG.USER_KEY) || AUTH_CONFIG.DEVELOPER_EMAIL;
        const lockUserDisplay = document.getElementById('lockUserDisplay');
        if (lockUserDisplay) lockUserDisplay.value = activeUser;

        const pinInput = document.getElementById('lockPinInput');
        if (pinInput) {
            pinInput.value = '';
            if (window.innerWidth > 900) {
                setTimeout(() => pinInput.focus(), 150);
            }
        }
        const errorMsg = document.getElementById('lockErrorMsg');
        if (errorMsg) errorMsg.style.display = 'none';
    }
}

function showFullLoginGatekeeper() {
    isSessionLocked = true;
    document.body.classList.add('auth-locked');
    const loginOverlay = document.getElementById('loginGatekeeperOverlay');
    if (loginOverlay) {
        loginOverlay.style.display = 'flex';
        switchAuthView('login');
        
        const userInput = document.getElementById('loginUserInput');
        if (userInput && !userInput.value) {
            userInput.value = sessionStorage.getItem(AUTH_CONFIG.USER_KEY) || '';
        }
        const pinInput = document.getElementById('loginPinInput');
        if (pinInput) {
            pinInput.value = '';
            // Evitar auto-focus en móviles para que el teclado virtual no redimensione la ventana causando parpadeo
            if (window.innerWidth > 900) {
                setTimeout(() => pinInput.focus(), 150);
            }
        }
        const errorMsg = document.getElementById('loginErrorMsg');
        if (errorMsg) errorMsg.style.display = 'none';
    }
}

function hideAuthOverlays() {
    isSessionLocked = false;
    document.body.classList.remove('auth-locked');
    const loginOverlay = document.getElementById('loginGatekeeperOverlay');
    if (loginOverlay) loginOverlay.style.display = 'none';
    
    const lockOverlay = document.getElementById('sessionLockOverlay');
    if (lockOverlay) lockOverlay.style.display = 'none';
}

function togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        if (btnEl) {
            btnEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
            btnEl.setAttribute('title', 'Ocultar contraseña');
        }
    } else {
        input.type = 'password';
        if (btnEl) {
            btnEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            btnEl.setAttribute('title', 'Mostrar contraseña');
        }
    }
}

function switchAuthView(viewName) {
    const viewLogin = document.getElementById('authViewLogin');
    const viewForgot = document.getElementById('authViewForgot');
    const viewForgotVerify = document.getElementById('authViewForgotVerify');
    const viewForgotSuccess = document.getElementById('authViewForgotSuccess');
    const viewRegister = document.getElementById('authViewRegister');
    
    if (viewLogin) viewLogin.style.display = viewName === 'login' ? 'block' : 'none';
    if (viewForgot) viewForgot.style.display = viewName === 'forgot' ? 'block' : 'none';
    if (viewForgotVerify) viewForgotVerify.style.display = viewName === 'forgotVerify' ? 'block' : 'none';
    if (viewForgotSuccess) viewForgotSuccess.style.display = viewName === 'forgotSuccess' ? 'block' : 'none';
    if (viewRegister) viewRegister.style.display = viewName === 'register' ? 'block' : 'none';
}

function applyRoleVisibility() {
    const isDemo = sessionStorage.getItem('antigravity_demo_mode') === 'true' || 
                   sessionStorage.getItem('antigravity_is_demo_trial') === 'true' || 
                   sessionStorage.getItem('antigravity_role') === 'demo_planner';

    const role = sessionStorage.getItem(AUTH_CONFIG.ROLE_KEY);
    const userEmail = (sessionStorage.getItem(AUTH_CONFIG.USER_KEY) || sessionStorage.getItem('antigravity_user_email') || '').toLowerCase();
    
    // Regla de Oro: Solo tú (Luis) con tu correo oficial y contraseña puedes ver Master Dev.
    const isDev = !isDemo && (role === 'developer') && (userEmail === AUTH_CONFIG.DEVELOPER_EMAIL.toLowerCase());

    // Strictly show/hide Developer Master Panel in sidebar
    const devMenuItems = document.querySelectorAll('.dev-only');
    devMenuItems.forEach(el => {
        el.style.display = isDev ? 'flex' : 'none';
    });

    const btnDevPill = document.getElementById('btnRoleDeveloper');
    if (btnDevPill) {
        btnDevPill.style.display = isDev ? 'inline-block' : 'none';
        btnDevPill.classList.toggle('active', isDev);
        if (isDev) {
            btnDevPill.style.background = '#d97706';
            btnDevPill.style.color = '#ffffff';
        }
    }

    // Update brand badge if dev
    const brandBadge = document.querySelector('.brand-badge');
    if (brandBadge) {
        brandBadge.innerText = isDev ? 'Developer Master' : (role === 'couple' ? 'Portal de Novios' : 'Planner Portal');
        brandBadge.style.background = isDev ? 'rgba(217, 119, 6, 0.25)' : (role === 'couple' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)');
        brandBadge.style.color = isDev ? '#fbbf24' : (role === 'couple' ? '#818cf8' : '#34d399');
    }

    // Ocultar selector de roles a los novios para evitar cambios accidentales a vista Wedding Planner
    const roleSwitch = document.querySelector('.role-switch-container');
    if (roleSwitch) {
        roleSwitch.style.display = (role === 'couple') ? 'none' : 'block';
    }
}

function switchOrUnlockDeveloper() {
    const role = sessionStorage.getItem(AUTH_CONFIG.ROLE_KEY);
    const isDev = role === 'developer';

    if (isDev) {
        if (typeof showTab === 'function') showTab('dev-clients');
        return;
    }

    // Prompt for PIN
    const entered = prompt('🔐 Consola Master Developer — Ingresa tu PIN de Desarrollador:');
    if (entered === AUTH_CONFIG.DEVELOPER_PIN || entered === '2101') {
        sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, 'authenticated');
        sessionStorage.setItem(AUTH_CONFIG.USER_KEY, AUTH_CONFIG.DEVELOPER_EMAIL);
        sessionStorage.setItem(AUTH_CONFIG.ROLE_KEY, 'developer');
        sessionStorage.setItem(AUTH_CONFIG.LAST_ACTIVITY_KEY, Date.now().toString());

        applyRoleVisibility();
        if (typeof showTab === 'function') showTab('dev-clients');
        if (typeof renderClientsDashboard === 'function') renderClientsDashboard();
        if (typeof showToast === 'function') {
            showToast('👑 Bienvenido Luis • Consola Master Developer Habilitada');
        }
    } else if (entered !== null) {
        alert('❌ PIN incorrecto. El acceso a la consola de cobranza requiere autorización Master.');
    }
}

function submitFullLogin(e) {
    if (e) e.preventDefault();
    const userInput = document.getElementById('loginUserInput').value.trim().toLowerCase();
    const pinInput = document.getElementById('loginPinInput').value.trim();
    const errorMsg = document.getElementById('loginErrorMsg');
    const successMsg = document.getElementById('loginSuccessMsg');
    if (successMsg) successMsg.style.display = 'none';

    // 1. DEVELOPER MASTER LOGIN
    if (userInput === AUTH_CONFIG.DEVELOPER_EMAIL.toLowerCase()) {
        if (pinInput === AUTH_CONFIG.DEVELOPER_PIN) {
            sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, 'authenticated');
            sessionStorage.setItem(AUTH_CONFIG.USER_KEY, AUTH_CONFIG.DEVELOPER_EMAIL);
            sessionStorage.setItem(AUTH_CONFIG.ROLE_KEY, 'developer');
            sessionStorage.setItem(AUTH_CONFIG.LAST_ACTIVITY_KEY, Date.now().toString());
            
            hideAuthOverlays();
            applyRoleVisibility();
            if (typeof populateWeddingSelectorForUser === 'function') {
                populateWeddingSelectorForUser();
            }
            resetInactivityTimer();
            if (typeof showToast === 'function') {
                showToast(`👑 Bienvenido Luis • Sesión Master Developer Iniciada`);
            }
            return;
        } else {
            showLoginError('❌ Contraseña incorrecta. Verifica tus datos de acceso.');
            return;
        }
    }

    // 2. COUPLE DIRECT ACCESS LOGIN (ACCESO PARA LOS NOVIOS)
    const cleanUserInput = userInput.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const slugUserInput = cleanUserInput.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Recopilar todas las bodas del sistema: integradas y creadas en localStorage
    const allWeddingIds = new Set(typeof WEDDINGS_DB !== 'undefined' ? Object.keys(WEDDINGS_DB) : []);
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k) {
                if (k.startsWith('wp_enterprise_os_')) {
                    allWeddingIds.add(k.replace('wp_enterprise_os_', ''));
                } else if (k.startsWith('wp_weddings_by_planner_')) {
                    try {
                        const list = JSON.parse(localStorage.getItem(k) || '[]');
                        if (Array.isArray(list)) list.forEach(id => allWeddingIds.add(id));
                    } catch(e) {}
                }
            }
        }
    } catch(e) {}

    let coupleCandidateMatch = null;

    for (const wId of allWeddingIds) {
        const wState = typeof getWeddingState === 'function' ? getWeddingState(wId) : (typeof WEDDINGS_DB !== 'undefined' ? WEDDINGS_DB[wId] : null);
        if (!wState) continue;

        const validUsernames = new Set();
        if (wState.coupleUser) {
            const u = wState.coupleUser.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            validUsernames.add(u);
            validUsernames.add(u.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
        }
        if (wState.couple) {
            const c = wState.couple.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            validUsernames.add(c.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
            validUsernames.add(c.replace(/\s*&\s*/g, ' y ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
            validUsernames.add(c.replace(/\s*y\s*/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
        }
        if (wId === 'aura') {
            validUsernames.add('sofia-y-alejandro');
            validUsernames.add('sofia-alejandro');
        }
        if (wId === 'camila') {
            validUsernames.add('camila-y-sebastian');
            validUsernames.add('camila-sebastian');
        }

        const isUserMatch = validUsernames.has(cleanUserInput) || validUsernames.has(slugUserInput) || validUsernames.has(userInput);
        if (isUserMatch) {
            coupleCandidateMatch = { wId, wState };
            const expectedPass = wState.couplePass || 'boda2027';
            if (pinInput === expectedPass) {
                sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, 'authenticated');
                sessionStorage.setItem(AUTH_CONFIG.USER_KEY, userInput);
                sessionStorage.setItem(AUTH_CONFIG.ROLE_KEY, 'couple');
                sessionStorage.setItem(AUTH_CONFIG.LAST_ACTIVITY_KEY, Date.now().toString());

                if (typeof switchWedding === 'function') {
                    switchWedding(wId);
                }
                if (typeof setRole === 'function') {
                    setRole('couple');
                }

                hideAuthOverlays();
                applyRoleVisibility();
                resetInactivityTimer();

                if (typeof showToast === 'function') {
                    showToast(`👰🤵 ¡Bienvenidos ${wState.couple || 'Pareja'}! Panel de novios activo.`);
                }
                return;
            }
        }
    }

    if (coupleCandidateMatch) {
        showLoginError('❌ Contraseña incorrecta para el acceso de los novios. (Por defecto: boda2027)');
        return;
    }

    // 3. WEDDING PLANNER CLIENT LOGIN
    if (typeof evaluateAndApplyClientGracePeriods === 'function') {
        evaluateAndApplyClientGracePeriods();
    }
    const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
    const client = clients.find(c => c.email.toLowerCase() === userInput);

    if (!client) {
        showLoginError(`❌ Credenciales no reconocidas para "${userInput}". Si eres la pareja o wedding planner, verifica tu usuario y contraseña.`);
        return;
    }

    // CHECK IF CLIENT ACCOUNT IS SUSPENDED (MANUAL OR AUTO-LOCK AFTER GRACE PERIOD)
    if (client.isSuspended) {
        showLoginError(`🚫 <strong>Acceso Bloqueado Automáticamente</strong><br>El acceso a Wedding OS para <strong>${client.agencyName}</strong> se encuentra suspendido debido a que venció la fecha de corte (${client.nextDueDate}) y concluyó el periodo de gracia de 24 horas.<br><br>💳 Realiza tu pago mensual vía SPEI y remite tu comprobante a <strong>antigravitywebstudio@hotmail.com</strong> para reactivar tu cuenta de inmediato.`);
        return;
    }

    // A) If client is using permanent password
    if (client.hasPermanentPassword && client.permanentPassword === pinInput) {
        sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, 'authenticated');
        sessionStorage.setItem(AUTH_CONFIG.USER_KEY, client.email);
        sessionStorage.setItem(AUTH_CONFIG.ROLE_KEY, 'planner');
        sessionStorage.setItem('antigravity_user_email', client.email);
        sessionStorage.setItem('antigravity_agency_name', client.agencyName);
        sessionStorage.setItem('antigravity_planner_name', client.plannerName || client.agencyName);
        sessionStorage.setItem(AUTH_CONFIG.LAST_ACTIVITY_KEY, Date.now().toString());

        if (client.paymentStatus === 'demo_trial' || !client.planTier) {
            sessionStorage.setItem('antigravity_demo_mode', 'true');
            sessionStorage.setItem('antigravity_is_demo_trial', 'true');
            localStorage.removeItem('wedding_subscription_tier');
            const demoBanner = document.getElementById('demoFloatingBanner');
            if (demoBanner) demoBanner.style.display = 'flex';
            const demoText = document.getElementById('demoBannerText');
            if (demoText) {
                demoText.innerHTML = `<strong>CUENTA DEMO DE ${client.agencyName.toUpperCase()}:</strong> Explora la plataforma como Wedding Planner. Activa tu plan en <em>Configuración de Planes</em>.`;
            }
        } else {
            sessionStorage.removeItem('antigravity_demo_mode');
            sessionStorage.removeItem('antigravity_is_demo_trial');
            localStorage.setItem('wedding_subscription_tier', client.planTier);
            const demoBanner = document.getElementById('demoFloatingBanner');
            if (demoBanner) demoBanner.style.display = 'none';
        }

        hideAuthOverlays();
        applyRoleVisibility();
        if (typeof populateWeddingSelectorForUser === 'function') {
            populateWeddingSelectorForUser();
        }
        if (typeof setRole === 'function') setRole('planner');
        resetInactivityTimer();

        if (client.paymentStatus === 'grace_period') {
            if (typeof showToast === 'function') {
                showToast(`⏳ ATENCIÓN: Tu cuenta está en TIEMPO DE GRACIA (+24h). Reporta tu mensualidad hoy.`);
            }
        } else if (client.paymentStatus === 'demo_trial' || !client.planTier) {
            if (typeof showToast === 'function') {
                showToast(`✨ Bienvenida ${client.plannerName} (${client.agencyName}) • Modo Demo Activo.`);
            }
        } else if (typeof showToast === 'function') {
            showToast(`✨ Bienvenida ${client.plannerName} (${client.agencyName}) • Sesión iniciada.`);
        }
        return;
    }

    // B) Alternative check: direct match with tempPassword if permanentPassword was not set yet
    if ((client.tempPassword && client.tempPassword === pinInput) || (client.tempPassword && client.tempPassword.toUpperCase() === pinInput.toUpperCase())) {
        sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, 'authenticated');
        sessionStorage.setItem(AUTH_CONFIG.USER_KEY, client.email);
        sessionStorage.setItem(AUTH_CONFIG.ROLE_KEY, 'planner');
        sessionStorage.setItem('antigravity_user_email', client.email);
        sessionStorage.setItem('antigravity_agency_name', client.agencyName);
        sessionStorage.setItem('antigravity_planner_name', client.plannerName || client.agencyName);
        sessionStorage.setItem(AUTH_CONFIG.LAST_ACTIVITY_KEY, Date.now().toString());

        if (client.paymentStatus === 'demo_trial' || !client.planTier) {
            sessionStorage.setItem('antigravity_demo_mode', 'true');
            sessionStorage.setItem('antigravity_is_demo_trial', 'true');
            localStorage.removeItem('wedding_subscription_tier');
            const demoBanner = document.getElementById('demoFloatingBanner');
            if (demoBanner) demoBanner.style.display = 'flex';
        } else {
            sessionStorage.removeItem('antigravity_demo_mode');
            sessionStorage.removeItem('antigravity_is_demo_trial');
            localStorage.setItem('wedding_subscription_tier', client.planTier);
            const demoBanner = document.getElementById('demoFloatingBanner');
            if (demoBanner) demoBanner.style.display = 'none';
        }

        hideAuthOverlays();
        applyRoleVisibility();
        if (typeof populateWeddingSelectorForUser === 'function') {
            populateWeddingSelectorForUser();
        }
        if (typeof setRole === 'function') setRole('planner');
        resetInactivityTimer();

        if (client.paymentStatus === 'grace_period') {
            if (typeof showToast === 'function') {
                showToast(`⏳ ATENCIÓN: Cuenta en TIEMPO DE GRACIA (+24h). Reporta tu mensualidad hoy.`);
            }
        } else if (typeof showToast === 'function') {
            showToast(`✨ Bienvenida ${client.plannerName || client.agencyName} • Sesión iniciada.`);
        }
        return;
    }

    // Invalid password
    showLoginError(`❌ Contraseña incorrecta para ${client.email}. Haz clic en "¿Olvidaste tu contraseña?" para ver tu contraseña o recuperarla.`);
}

function showLoginError(htmlMessage) {
    const errorMsg = document.getElementById('loginErrorMsg');
    if (errorMsg) {
        errorMsg.innerHTML = htmlMessage;
        errorMsg.style.display = 'block';
    }
    const pinField = document.getElementById('loginPinInput');
    if (pinField) {
        pinField.classList.add('input-auth-error');
        setTimeout(() => pinField.classList.remove('input-auth-error'), 800);
    }
}

// ==========================================================================
// FORGOT PASSWORD / CREATE PERMANENT PASSWORD FLOW
// ==========================================================================

async function submitForgotPassword(e) {
    if (e) e.preventDefault();
    const emailInput = document.getElementById('forgotEmailInput').value.trim().toLowerCase();
    const btnSubmit = document.querySelector('#authViewForgot button[type="submit"]');

    let clientName = 'Planner';
    let recoveredPass = '';

    // Check if developer email
    if (emailInput === AUTH_CONFIG.DEVELOPER_EMAIL.toLowerCase()) {
        clientName = 'Master Developer (Luis)';
        recoveredPass = AUTH_CONFIG.DEVELOPER_PIN;
    } else {
        const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
        const client = clients.find(c => c.email.toLowerCase() === emailInput);

        if (!client) {
            alert(`No encontramos ninguna cuenta con el correo "${emailInput}". Verifica que esté bien escrito o solicita tu alta como Wedding Planner.`);
            return;
        }

        clientPendingReset = client;
        clientName = client.plannerName || client.agencyName || 'Wedding Planner';
        recoveredPass = client.permanentPassword || client.tempPassword || '2101';
    }

    // UX Feedback on submit button
    const origBtnContent = btnSubmit ? btnSubmit.innerHTML : '';
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span>⏳ Generando y enviando correo de seguridad...</span>`;
    }

    try {
        let emailHtml = '';
        // Dispatch to Serverless Transactional Email Endpoint
        try {
            const resp = await fetch('/api/recover-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailInput,
                    name: clientName,
                    password: recoveredPass
                })
            });
            const data = await resp.json();
            if (data && data.emailPreviewHtml) {
                emailHtml = data.emailPreviewHtml;
            }
        } catch (err) {
            console.warn('API recover-password fetch notice:', err);
        }

        // 1. Switch directly back to Login view
        switchAuthView('login');

        // 2. Pre-fill user email in login input
        const loginUserInput = document.getElementById('loginUserInput');
        if (loginUserInput) {
            loginUserInput.value = emailInput;
        }

        // 3. Focus pin input
        const loginPinInput = document.getElementById('loginPinInput');
        if (loginPinInput) {
            loginPinInput.value = '';
            setTimeout(() => loginPinInput.focus(), 300);
        }

        // Display prominent UX/Security banner on Login View
        const loginSuccessMsg = document.getElementById('loginSuccessMsg');
        if (loginSuccessMsg) {
            loginSuccessMsg.innerHTML = `
                <div style="display:flex; align-items:flex-start; gap:12px;">
                    <div style="background:rgba(16, 185, 129, 0.2); border:1px solid rgba(16, 185, 129, 0.4); border-radius:8px; padding:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <div style="flex:1;">
                        <strong style="font-size:0.86rem; color:#34d399; display:block; margin-bottom:3px;">
                            Instrucciones de acceso enviadas a tu correo
                        </strong>
                        <span style="font-size:0.78rem; color:#cbd5e1; display:block; line-height:1.45;">
                            Hemos enviado los datos de acceso para <strong>${emailInput}</strong>. Por favor revisa tu bandeja de entrada o spam para ingresar con tu contraseña.
                        </span>
                    </div>
                </div>
            `;
            loginSuccessMsg.style.display = 'block';
        }

        // Hide any previous error messages
        const loginErrorMsg = document.getElementById('loginErrorMsg');
        if (loginErrorMsg) loginErrorMsg.style.display = 'none';

        if (typeof showToast === 'function') {
            showToast(`Instrucciones enviadas con éxito a ${emailInput}`);
        }

    } catch (error) {
        console.error('Error recovering password:', error);
        alert('Hubo un inconveniente al procesar tu solicitud. Por favor intenta de nuevo.');
    } finally {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = origBtnContent;
        }
    }
}



function openResetPasswordView() {
    if (!clientPendingReset) {
        switchAuthView('forgot');
        return;
    }
    const nameEl = document.getElementById('resetVerifyClientName');
    if (nameEl) nameEl.innerText = clientPendingReset.agencyName || 'tu cuenta';
    const emailEl = document.getElementById('resetVerifyClientEmail');
    if (emailEl) emailEl.innerText = clientPendingReset.email;

    const errorEl = document.getElementById('resetVerifyError');
    if (errorEl) errorEl.style.display = 'none';

    const newPassInput = document.getElementById('resetNewPassInput');
    if (newPassInput) newPassInput.value = '';
    const confirmPassInput = document.getElementById('resetConfirmPassInput');
    if (confirmPassInput) confirmPassInput.value = '';

    switchAuthView('forgotVerify');
}

function submitSetPermanentPassword(e) {
    if (e) e.preventDefault();
    if (!clientPendingReset) return;

    const newPass = document.getElementById('resetNewPassInput').value.trim();
    const confirmPass = document.getElementById('resetConfirmPassInput').value.trim();
    const errorEl = document.getElementById('resetVerifyError');

    if (newPass.length < 4) {
        if (errorEl) {
            errorEl.innerText = '❌ La nueva contraseña debe tener al menos 4 caracteres.';
            errorEl.style.display = 'block';
        }
        return;
    }

    if (newPass !== confirmPass) {
        if (errorEl) {
            errorEl.innerText = '❌ Las nuevas contraseñas no coinciden. Verifícalas.';
            errorEl.style.display = 'block';
        }
        return;
    }

    // Save permanent password to DB
    const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
    const client = clients.find(c => c.id === clientPendingReset.id || c.email.toLowerCase() === clientPendingReset.email.toLowerCase());
    if (client) {
        client.hasPermanentPassword = true;
        client.permanentPassword = newPass;
        client.tempPassword = newPass;
        client.tempPassUsesLeft = 999;
        if (typeof saveClientsDatabase === 'function') {
            saveClientsDatabase(clients);
        }
    }

    // Auto log in with permanent password
    sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, 'authenticated');
    sessionStorage.setItem(AUTH_CONFIG.USER_KEY, clientPendingReset.email);
    sessionStorage.setItem(AUTH_CONFIG.ROLE_KEY, 'planner');
    sessionStorage.setItem('antigravity_user_email', clientPendingReset.email);
    sessionStorage.setItem('antigravity_agency_name', clientPendingReset.agencyName || '');
    sessionStorage.setItem('antigravity_planner_name', clientPendingReset.plannerName || clientPendingReset.agencyName || '');
    sessionStorage.setItem(AUTH_CONFIG.LAST_ACTIVITY_KEY, Date.now().toString());

    hideAuthOverlays();
    applyRoleVisibility();
    if (typeof populateWeddingSelectorForUser === 'function') {
        populateWeddingSelectorForUser();
    }
    resetInactivityTimer();

    if (typeof showToast === 'function') {
        showToast(`🎉 ¡Contraseña actualizada con éxito! Has ingresado a Wedding OS.`);
    }
}

function applyAutoRecoveredPin() {
    const recoveredCode = document.getElementById('devRecoveryCodeDisplay')?.innerText.trim() || AUTH_CONFIG.DEVELOPER_PIN;
    const pinInput = document.getElementById('loginPinInput');
    if (pinInput) {
        pinInput.value = recoveredCode;
    }
    const userInput = document.getElementById('loginUserInput');
    if (userInput) {
        if (clientPendingReset && clientPendingReset.email) {
            userInput.value = clientPendingReset.email;
        } else {
            userInput.value = AUTH_CONFIG.DEVELOPER_EMAIL;
        }
    }
    switchAuthView('login');
    submitFullLogin();
}

// ==========================================================================
// WEDDING PLANNER ONBOARDING & REGISTRATION FLOW
// ==========================================================================

function submitPlannerRegistration(e) {
    if (e) e.preventDefault();
    const agency = document.getElementById('regAgencyName').value.trim();
    const planner = document.getElementById('regPlannerName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const countryCode = document.getElementById('regCountryCode')?.value || '+52';
    const phoneNum = document.getElementById('regPhoneNum')?.value.trim() || '';
    const fullPhone = `${countryCode} ${phoneNum}`.trim();
    const password = document.getElementById('regPassword').value.trim();

    if (!agency || !planner || !email || !password) {
        alert('Por favor completa todos los campos requeridos para crear tu cuenta.');
        return;
    }

    const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
    let existingClient = clients.find(c => c.email.toLowerCase() === email);

    if (existingClient) {
        alert(`Ya existe una cuenta con el correo "${email}". Si ya eres usuario registrado, inicia sesión con tu contraseña.`);
        switchAuthView('login');
        return;
    }

    // Registrar agencia en la base de datos con estatus demo_trial (sin plan contratado aún)
    const newClient = {
        id: 'client_' + Date.now(),
        agencyName: agency,
        plannerName: planner,
        email: email,
        phone: fullPhone,
        planTier: null, // Sin plan activo por defecto
        maxWeddings: 10,
        monthlyFee: 0,
        billingCycleDay: new Date().getDate(),
        lastPaymentDate: '',
        nextDueDate: '',
        paymentStatus: 'demo_trial',
        isSuspended: false,
        suspensionNotice: '',
        tempPassword: '',
        tempPassUsesLeft: 0,
        hasPermanentPassword: true,
        permanentPassword: password,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'demo_trial'
    };

    clients.unshift(newClient);
    if (typeof saveClientsDatabase === 'function') {
        saveClientsDatabase(clients);
    }

    // Iniciar sesión en modo demo de agencia
    sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, 'authenticated');
    sessionStorage.setItem(AUTH_CONFIG.USER_KEY, email);
    sessionStorage.setItem(AUTH_CONFIG.ROLE_KEY, 'planner');
    sessionStorage.setItem('antigravity_user_email', email);
    sessionStorage.setItem('antigravity_agency_name', agency);
    sessionStorage.setItem('antigravity_planner_name', planner);
    sessionStorage.setItem('antigravity_user_phone', fullPhone);
    sessionStorage.setItem('antigravity_demo_mode', 'true');
    sessionStorage.setItem('antigravity_is_demo_trial', 'true');
    sessionStorage.setItem(AUTH_CONFIG.LAST_ACTIVITY_KEY, Date.now().toString());

    // Asegurarse de que ningún plan aparezca activo en la configuración
    localStorage.removeItem('wedding_subscription_tier');

    hideAuthOverlays();
    applyRoleVisibility();
    if (typeof populateWeddingSelectorForUser === 'function') {
        populateWeddingSelectorForUser();
    }
    if (typeof setRole === 'function') setRole('planner');
    resetInactivityTimer();

    // Actualizar banner de demo con el nombre de la agencia
    const demoBanner = document.getElementById('demoFloatingBanner');
    if (demoBanner) demoBanner.style.display = 'flex';
    const demoText = document.getElementById('demoBannerText');
    if (demoText) {
        demoText.innerHTML = `<strong>CUENTA DEMO DE ${agency.toUpperCase()}:</strong> Estás explorando la suite completa como Wedding Planner. Activa tu plan en <em>Configuración de Planes</em>.`;
    }

    if (typeof showToast === 'function') {
        showToast(`✨ ¡Bienvenida ${planner}! Tu cuenta para ${agency} ha sido creada en Modo Demo.`);
    }

    // Refrescar configuración de planes
    if (typeof renderSettingsTab === 'function') {
        renderSettingsTab();
    }
}

function submitUnlockSession(e) {
    if (e) e.preventDefault();
    const pinInput = document.getElementById('lockPinInput').value.trim();
    const activeUser = sessionStorage.getItem(AUTH_CONFIG.USER_KEY) || AUTH_CONFIG.DEVELOPER_EMAIL;
    const errorMsg = document.getElementById('lockErrorMsg');

    // If dev
    if (activeUser.toLowerCase() === AUTH_CONFIG.DEVELOPER_EMAIL.toLowerCase()) {
        if (pinInput === AUTH_CONFIG.DEVELOPER_PIN) {
            sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, 'authenticated');
            sessionStorage.setItem(AUTH_CONFIG.LAST_ACTIVITY_KEY, Date.now().toString());
            hideAuthOverlays();
            resetInactivityTimer();
            if (typeof showToast === 'function') showToast('🔓 Sesión de Desarrollador reanudada.');
            return;
        }
    } else {
        // If client
        const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
        const client = clients.find(c => c.email.toLowerCase() === activeUser.toLowerCase());
        if (client) {
            const isMatch = (client.hasPermanentPassword && client.permanentPassword === pinInput) ||
                            (client.tempPassword && client.tempPassword.toUpperCase() === pinInput.toUpperCase());
            if (isMatch) {
                sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, 'authenticated');
                sessionStorage.setItem(AUTH_CONFIG.LAST_ACTIVITY_KEY, Date.now().toString());
                hideAuthOverlays();
                resetInactivityTimer();
                if (typeof showToast === 'function') showToast(`🔓 Sesión reanudada para ${client.agencyName}.`);
                return;
            }
        }
    }

    if (errorMsg) {
        errorMsg.innerText = '❌ Contraseña incorrecta para reanudar sesión.';
        errorMsg.style.display = 'block';
    }
    const pinField = document.getElementById('lockPinInput');
    if (pinField) {
        pinField.classList.add('input-auth-error');
        setTimeout(() => pinField.classList.remove('input-auth-error'), 800);
    }
}

function logoutManual() {
    if (confirm('¿Deseas cerrar tu sesión actual de Wedding OS?')) {
        sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
        sessionStorage.removeItem(AUTH_CONFIG.USER_KEY);
        sessionStorage.removeItem(AUTH_CONFIG.ROLE_KEY);
        sessionStorage.removeItem(AUTH_CONFIG.LAST_ACTIVITY_KEY);
        sessionStorage.removeItem('antigravity_user_email');
        sessionStorage.removeItem('antigravity_agency_name');
        sessionStorage.removeItem('antigravity_planner_name');
        sessionStorage.removeItem('antigravity_demo_mode');
        sessionStorage.removeItem('antigravity_is_demo_trial');
        localStorage.removeItem('wp_active_wedding_id');
        if (typeof populateWeddingSelectorForUser === 'function') {
            populateWeddingSelectorForUser();
        }
        showFullLoginGatekeeper();
        if (typeof showToast === 'function') {
            showToast('🔒 Sesión cerrada de forma segura.');
        }
    }
}

// ==========================================================================
// LEGAL & PRIVACY MODAL CONTROLLERS (LFPDPPP & PCI-DSS)
// ==========================================================================

function openLegalTermsModal() {
    const modal = document.getElementById('modalLegalTermsPrivacy');
    if (!modal) return;
    switchLegalTab('terms');
    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
    modal.style.zIndex = '999999';
}

function openLegalPrivacyModal() {
    const modal = document.getElementById('modalLegalTermsPrivacy');
    if (!modal) return;
    switchLegalTab('privacy');
    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
    modal.style.zIndex = '999999';
}

function closeLegalModal() {
    const modal = document.getElementById('modalLegalTermsPrivacy');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
    }
}

function switchLegalTab(tab) {
    const btnTerms = document.getElementById('btnTabTerms');
    const btnPrivacy = document.getElementById('btnTabPrivacy');
    const contentTerms = document.getElementById('legalContentTerms');
    const contentPrivacy = document.getElementById('legalContentPrivacy');
    const modalTitle = document.getElementById('legalModalTitle');

    if (tab === 'terms') {
        if (btnTerms) btnTerms.classList.add('active');
        if (btnPrivacy) btnPrivacy.classList.remove('active');
        if (contentTerms) contentTerms.style.display = 'block';
        if (contentPrivacy) contentPrivacy.style.display = 'none';
        if (modalTitle) modalTitle.innerText = 'Términos y Condiciones de Servicio';
    } else {
        if (btnTerms) btnTerms.classList.remove('active');
        if (btnPrivacy) btnPrivacy.classList.add('active');
        if (contentTerms) contentTerms.style.display = 'none';
        if (contentPrivacy) contentPrivacy.style.display = 'block';
        if (modalTitle) modalTitle.innerText = 'Aviso de Privacidad Integral (LFPDPPP)';
    }
}
