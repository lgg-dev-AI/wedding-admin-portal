// ==========================================================================
// PASEBODA & ANTIGRAVITY SECURITY: LOGIN, ROLES & 25-MIN AUTO-LOCK ENGINE
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

    // 🔒 Interceptor de Periodo de Prueba de 15 Días
    if (!isDev && typeof isAccountTrialExpired === 'function' && isAccountTrialExpired()) {
        if (typeof showTrialExpiredFreezeModal === 'function') {
            showTrialExpiredFreezeModal();
        }
        return;
    } else if (!isDev && typeof isAccountInTrial === 'function' && isAccountInTrial()) {
        const demoBanner = document.getElementById('demoFloatingBanner');
        if (demoBanner) {
            demoBanner.style.display = 'flex';
            const daysLeft = typeof getTrialDaysRemaining === 'function' ? getTrialDaysRemaining() : 15;
            const demoText = document.getElementById('demoBannerText');
            if (demoText) {
                demoText.innerHTML = `<strong>⏳ PRUEBA DE 15 DÍAS:</strong> Te restan <strong>${daysLeft} días</strong> de prueba. Mesas 2D y CRM habilitados. <a href="javascript:void(0)" onclick="showTab('settings')" style="color:#fbbf24; text-decoration:underline; font-weight:800; margin-left:6px;">💳 Activar Plan para Desbloquear WhatsApp, Invitaciones Web y Dossier PDF</a>`;
            }
        }
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
        if (client.paymentStatus === 'trial_expired' || client.isTrialExpired) {
            sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, 'authenticated');
            sessionStorage.setItem(AUTH_CONFIG.USER_KEY, client.email);
            sessionStorage.setItem(AUTH_CONFIG.ROLE_KEY, 'planner');
            sessionStorage.setItem('antigravity_user_email', client.email);
            sessionStorage.setItem('antigravity_agency_name', client.agencyName);
            sessionStorage.setItem('antigravity_planner_name', client.plannerName || client.agencyName);
            sessionStorage.setItem('antigravity_is_trial_expired', 'true');
            sessionStorage.setItem('antigravity_is_trial', 'true');
            hideAuthOverlays();
            showTrialExpiredFreezeModal(client.agencyName, client.trialEndMs);
            return;
        }
        showLoginError(`🚫 <strong>Acceso Bloqueado Automáticamente</strong><br>El acceso a PaseBoda para <strong>${client.agencyName}</strong> se encuentra suspendido debido a que venció la fecha de corte (${client.nextDueDate}) y concluyó el periodo de gracia de 24 horas.<br><br>💳 Realiza tu pago con tarjeta vía Stripe o envía WhatsApp a soporte al <strong><a href="https://wa.me/528122199352?text=Hola%20Luis,%20mi%20cuenta%20de%20PaseBoda%20fue%20suspendida%20por%20vencimiento" target="_blank" style="color:#25d366; text-decoration:underline;">81 2219 9352</a></strong> para reactivar tu cuenta de inmediato.`);
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
        showToast(`🎉 ¡Contraseña actualizada con éxito! Has ingresado a PaseBoda.`);
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
// REGISTRO DE WEDDING PLANNERS & CONTROL DE PRUEBA DE 15 DÍAS
// ANTI-ABUSO: FILTRO ANTI-TEMPMAIL, WHATSAPP ÚNICO Y RATE LIMIT
// ==========================================================================

const DISPOSABLE_EMAIL_DOMAINS = [
    'tempmail.com', 'temp-mail.org', 'yopmail.com', 'mailinator.com', 
    'guerrillamail.com', '10minutemail.com', 'trashmail.com', 'sharklasers.com', 
    'throwawaymail.com', 'dispostable.com', 'fakeinbox.com', 'burnermail.io',
    'getnada.com', 'mohmal.com', 'crazymailing.com', 'dropmail.me'
];

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

    // 1. Candado Anti-TempMail: Bloquear correos temporales o desechables
    const emailDomain = email.split('@')[1] || '';
    if (DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain.toLowerCase())) {
        alert('⚠️ Por favor utiliza un correo corporativo o personal legítimo (Gmail, Outlook, Hotmail, etc.). No se admiten correos temporales ni desechables.');
        return;
    }

    // 2. Candado de WhatsApp Único: 1 solo periodo de prueba por número celular
    const cleanPhone = (phoneNum || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
        alert('Por favor ingresa un número de WhatsApp válido de al menos 10 dígitos.');
        return;
    }
    const last10Input = cleanPhone.slice(-10);

    const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
    const duplicatePhone = clients.find(c => {
        const cp = (c.phone || '').replace(/\D/g, '');
        const last10C = cp.slice(-10);
        return last10C && last10Input && last10C.length === 10 && last10C === last10Input;
    });

    if (duplicatePhone) {
        alert(`Este número de WhatsApp (${countryCode} ${phoneNum}) ya fue registrado anteriormente con la cuenta "${duplicatePhone.email}". Cada número celular cuenta con 1 solo periodo de prueba de 15 días. Por favor inicia sesión con tu cuenta original o activa tu plan.`);
        switchAuthView('login');
        return;
    }

    // 3. Rate Limit por navegador / IP: Máximo 3 registros al día para evitar scripts
    const todayStr = new Date().toISOString().split('T')[0];
    const attemptsKey = 'paseboda_signup_attempts_' + todayStr;
    const currentAttempts = Number(localStorage.getItem(attemptsKey) || 0);
    if (currentAttempts >= 3) {
        alert('Has alcanzado el límite de registros permitidos por hoy (máx 3). Si ya eres usuario, por favor inicia sesión.');
        return;
    }
    localStorage.setItem(attemptsKey, (currentAttempts + 1).toString());

    let existingClient = clients.find(c => c.email.toLowerCase() === email);
    if (existingClient) {
        alert(`Ya existe una cuenta con el correo "${email}". Si ya eres usuario registrado, inicia sesión con tu contraseña.`);
        switchAuthView('login');
        return;
    }

    // 4. Inicializar Periodo de Prueba de 15 Días Exactos
    const nowMs = Date.now();
    const trialDurationMs = 15 * 24 * 60 * 60 * 1000; // 15 días en milisegundos
    const trialEndMs = nowMs + trialDurationMs;
    const trialEndDateStr = new Date(trialEndMs).toISOString();

    const newClient = {
        id: 'client_' + Date.now(),
        agencyName: agency,
        plannerName: planner,
        email: email,
        phone: fullPhone,
        planTier: null, // Sin plan de pago contratado aún
        maxWeddings: 1, // En prueba: 1 boda de exploración
        monthlyFee: 0,
        billingCycleDay: new Date().getDate(),
        lastPaymentDate: '',
        nextDueDate: '',
        paymentStatus: 'trial_15_days',
        trialStartDate: new Date(nowMs).toISOString(),
        trialEndDate: trialEndDateStr,
        trialEndMs: trialEndMs,
        isSuspended: false,
        suspensionNotice: '',
        tempPassword: '',
        tempPassUsesLeft: 0,
        hasPermanentPassword: true,
        permanentPassword: password,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'trial_15_days'
    };

    clients.unshift(newClient);
    if (typeof saveClientsDatabase === 'function') {
        saveClientsDatabase(clients);
    }

    // Iniciar sesión en modo prueba de 15 días
    sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, 'authenticated');
    sessionStorage.setItem(AUTH_CONFIG.USER_KEY, email);
    sessionStorage.setItem(AUTH_CONFIG.ROLE_KEY, 'planner');
    sessionStorage.setItem('antigravity_user_email', email);
    sessionStorage.setItem('antigravity_agency_name', agency);
    sessionStorage.setItem('antigravity_planner_name', planner);
    sessionStorage.setItem('antigravity_user_phone', fullPhone);
    sessionStorage.setItem('antigravity_demo_mode', 'true');
    sessionStorage.setItem('antigravity_is_demo_trial', 'true');
    sessionStorage.setItem('antigravity_is_trial', 'true');
    sessionStorage.setItem('antigravity_trial_end_ms', trialEndMs.toString());
    sessionStorage.setItem('antigravity_trial_end_date', trialEndDateStr);
    sessionStorage.removeItem('antigravity_is_trial_expired');
    sessionStorage.setItem(AUTH_CONFIG.LAST_ACTIVITY_KEY, Date.now().toString());

    localStorage.setItem('paseboda_client_trial_end_' + email, trialEndMs.toString());
    localStorage.removeItem('wedding_subscription_tier');

    hideAuthOverlays();
    applyRoleVisibility();
    if (typeof populateWeddingSelectorForUser === 'function') {
        populateWeddingSelectorForUser();
    }
    if (typeof setRole === 'function') setRole('planner');
    resetInactivityTimer();

    // Actualizar banner de prueba con cuenta regresiva de 15 días
    const demoBanner = document.getElementById('demoFloatingBanner');
    if (demoBanner) demoBanner.style.display = 'flex';
    const demoText = document.getElementById('demoBannerText');
    if (demoText) {
        demoText.innerHTML = `<strong>⏳ PRUEBA DE 15 DÍAS DE ${agency.toUpperCase()}:</strong> Te restan <strong>15 días</strong>. Mesas 2D y CRM activos. <a href="javascript:void(0)" onclick="showTab('settings')" style="color:#fbbf24; text-decoration:underline; font-weight:800; margin-left:6px;">Activa tu Plan para Desbloquear WhatsApp, Invitaciones Web y Dossier PDF</a>`;
    }

    if (typeof showToast === 'function') {
        showToast(`✨ ¡Bienvenida ${planner}! Tu prueba de 15 días para ${agency} está activa.`);
    }

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
    if (confirm('¿Deseas cerrar tu sesión actual de PaseBoda?')) {
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

// ==========================================================================
// CONTROL DE ACCESO, PERIODO DE PRUEBA DE 15 DÍAS & PAYWALL INTERCEPTOR
// ==========================================================================

function isAccountInTrial() {
    const role = sessionStorage.getItem(AUTH_CONFIG.ROLE_KEY);
    const email = (sessionStorage.getItem(AUTH_CONFIG.USER_KEY) || '').toLowerCase();
    if (role === 'developer' && email === AUTH_CONFIG.DEVELOPER_EMAIL.toLowerCase()) {
        return false;
    }
    const tier = localStorage.getItem('wedding_subscription_tier');
    if (tier && tier !== 'demo_trial' && tier !== 'trial_15_days' && tier !== 'null') {
        return false;
    }
    const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
    const client = clients.find(c => c.email.toLowerCase() === email);
    if (client && client.paymentStatus === 'paid' && client.planTier) {
        return false;
    }
    return true;
}

function isAccountTrialExpired() {
    if (!isAccountInTrial()) return false;
    const email = (sessionStorage.getItem(AUTH_CONFIG.USER_KEY) || '').toLowerCase();
    const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
    const client = clients.find(c => c.email.toLowerCase() === email);
    const now = Date.now();

    if (client) {
        let endMs = client.trialEndMs;
        if (!endMs && client.trialEndDate) {
            endMs = new Date(client.trialEndDate).getTime();
        }
        if (!endMs && client.createdAt) {
            endMs = new Date(client.createdAt).getTime() + (15 * 24 * 60 * 60 * 1000);
        }
        if (endMs && now > endMs) return true;
        if (client.paymentStatus === 'trial_expired') return true;
    }

    const sessionEnd = Number(sessionStorage.getItem('antigravity_trial_end_ms') || 0);
    if (sessionEnd && now > sessionEnd) return true;

    const localEnd = Number(localStorage.getItem('paseboda_client_trial_end_' + email) || 0);
    if (localEnd && now > localEnd) return true;

    return false;
}

function getTrialDaysRemaining() {
    if (!isAccountInTrial()) return 0;
    const email = (sessionStorage.getItem(AUTH_CONFIG.USER_KEY) || '').toLowerCase();
    const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
    const client = clients.find(c => c.email.toLowerCase() === email);
    const now = Date.now();
    let endMs = client ? (client.trialEndMs || (client.trialEndDate ? new Date(client.trialEndDate).getTime() : 0)) : 0;
    if (!endMs) {
        endMs = Number(sessionStorage.getItem('antigravity_trial_end_ms') || 0);
    }
    if (!endMs) {
        endMs = Number(localStorage.getItem('paseboda_client_trial_end_' + email) || 0);
    }
    if (!endMs) return 15;
    const diff = endMs - now;
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

function showTrialFeatureLockedModal(featureType = 'generic', customMessage = '') {
    let title = '🔒 Función Exclusiva de Planes Oficiales';
    let icon = '🔒';
    let desc = customMessage || 'Esta herramienta está reservada para cuentas con plan activo de PaseBoda.';

    if (featureType === 'whatsapp') {
        icon = '📲';
        title = 'Envíos Masivos WhatsApp Protegidos';
        desc = customMessage || 'Los despachos oficiales por WhatsApp con confirmación RSVP automática están bloqueados durante la prueba de 15 días para proteger la cuota y reputación de la línea oficial. Activa tu plan para enviar invitaciones masivas ilimitadas.';
    } else if (featureType === 'reports' || featureType === 'captain_print') {
        icon = '📑';
        title = 'Dossier Técnico y Reportes Oficiales en PDF';
        desc = customMessage || 'Para descargar o imprimir el Dossier Técnico Oficial para el Recinto, Ficha de Cocina para el Chef y Plano de Mesas para Capitanes, activa tu plan.';
    } else if (featureType === 'day_d' || featureType === 'hostess') {
        icon = '⚡';
        title = 'Modo Día D y Check-in QR Hostess en Puerta';
        desc = customMessage || 'El escáner QR en vivo para recepcionistas en puerta y la Minuta Interactiva en Vivo son herramientas operativas de ejecución exclusiva para eventos con plan contratado.';
    } else if (featureType === 'invitations') {
        icon = '💌';
        title = 'Publicación de Invitaciones Web Oficiales';
        desc = customMessage || 'La personalización y publicación de enlaces web oficiales con confirmación RSVP para tus invitados requiere la contratación de un plan.';
    }

    let modal = document.getElementById('modalTrialFeatureLocked');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalTrialFeatureLocked';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.85); backdrop-filter:blur(8px); z-index:9999999; display:flex; align-items:center; justify-content:center; padding:20px;';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:#ffffff; border-radius:24px; max-width:540px; width:100%; padding:36px; box-shadow:0 25px 60px rgba(0,0,0,0.35); text-align:center; position:relative; border:1.5px solid #e2e8f0; animation:modalPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);">
            <div style="width:68px; height:68px; border-radius:50%; background:#fef3c7; color:#d97706; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 18px; box-shadow:0 8px 20px rgba(217,119,6,0.2);">
                ${icon}
            </div>
            <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:1.5px; font-weight:800; color:#d97706; display:block; margin-bottom:6px;">
                Modo Prueba de 15 Días
            </span>
            <h3 style="font-family:'Playfair Display', serif; font-size:1.55rem; color:#0f172a; margin:0 0 12px; font-weight:700;">
                ${title}
            </h3>
            <p style="font-size:0.92rem; color:#475569; line-height:1.55; margin:0 0 24px;">
                ${desc}
            </p>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:16px; margin-bottom:24px; text-align:left;">
                <div style="font-size:0.75rem; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">
                    ¿Qué desbloqueas al contratar un plan?
                </div>
                <div style="font-size:0.84rem; color:#1e293b; display:flex; flex-direction:column; gap:6px;">
                    <span>✓ <strong>WhatsApp Masivo</strong> con confirmación RSVP con 1 clic.</span>
                    <span>✓ <strong>Dossier Técnico PDF</strong> para el banquete y salón.</span>
                    <span>✓ <strong>Check-in QR Hostess</strong> para recepción en puerta.</span>
                    <span>✓ <strong>Invitaciones Web Oficiales</strong> ilimitadas para tus invitados.</span>
                </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:10px;">
                <button type="button" onclick="closeTrialFeatureLockedModal(); showTab('settings');" style="width:100%; padding:14px; background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color:#ffffff; border:none; border-radius:12px; font-weight:800; font-size:0.95rem; cursor:pointer; box-shadow:0 4px 14px rgba(15,23,42,0.25);">
                    💳 Ver Planes & Activar Ahora (Desde $1,990 MXN)
                </button>
                <button type="button" onclick="closeTrialFeatureLockedModal()" style="width:100%; padding:10px; background:transparent; color:#64748b; border:none; font-weight:700; font-size:0.84rem; cursor:pointer;">
                    Continuar en Modo Prueba (Mesas 2D & CRM)
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

function closeTrialFeatureLockedModal() {
    const modal = document.getElementById('modalTrialFeatureLocked');
    if (modal) modal.style.display = 'none';
}

function showTrialExpiredFreezeModal(agencyName = '', trialEndMs = 0) {
    let modal = document.getElementById('modalTrialExpiredFreeze');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalTrialExpiredFreeze';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.96); backdrop-filter:blur(16px); z-index:99999999; display:flex; align-items:center; justify-content:center; padding:20px;';
        document.body.appendChild(modal);
    }

    const email = (sessionStorage.getItem(AUTH_CONFIG.USER_KEY) || '').toLowerCase();
    const clients = typeof getClientsDatabase === 'function' ? getClientsDatabase() : [];
    const client = clients.find(c => c.email.toLowerCase() === email);
    const agency = agencyName || (client ? client.agencyName : 'tu cuenta');

    modal.innerHTML = `
        <div style="background:#ffffff; border-radius:28px; max-width:620px; width:100%; padding:44px 36px; box-shadow:0 30px 80px rgba(0,0,0,0.5); text-align:center; position:relative; border:2px solid #cbd5e1; animation:modalPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
            <div style="width:76px; height:76px; border-radius:50%; background:#fee2e2; color:#ef4444; display:flex; align-items:center; justify-content:center; font-size:2.4rem; margin:0 auto 20px; box-shadow:0 8px 24px rgba(239,68,68,0.25);">
                🔒
            </div>
            
            <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:2px; font-weight:800; color:#ef4444; background:#fef2f2; padding:4px 12px; border-radius:20px; display:inline-block; margin-bottom:12px;">
                Periodo de Prueba de 15 Días Concluido
            </span>

            <h2 style="font-family:'Playfair Display', serif; font-size:1.85rem; color:#0f172a; margin:0 0 14px; font-weight:700;">
                Tu evento y mesas siguen 100% seguros
            </h2>

            <p style="font-size:0.95rem; color:#475569; line-height:1.6; margin:0 0 20px;">
                Estimad@ <strong>${agency}</strong>, tu prueba gratuita de 15 días ha finalizado. 
                <br>
                ✨ <strong>Todo tu trabajo está protegido:</strong> Tus invitados registrados, el acomodo de tus mesas 2D y las notas de tu banquete siguen guardados y resguardados en nuestros servidores.
            </p>

            <div style="background:#fffbeb; border:1.5px solid #fde68a; border-radius:14px; padding:14px 18px; margin-bottom:26px; text-align:left; display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.4rem;">⏳</span>
                <div style="font-size:0.83rem; color:#92400e; line-height:1.45;">
                    <strong>Política de Resguardo de Datos (60 días):</strong> Tus proyectos se conservarán resguardados de forma segura durante 60 días antes del archivo definitivo. Activa tu plan para desbloquear el acceso de inmediato.
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:20px;">
                <div style="border:1.5px solid #cbd5e1; border-radius:16px; padding:18px; text-align:left; display:flex; flex-direction:column; justify-content:space-between; background:#f8fafc;">
                    <div>
                        <span style="font-size:0.7rem; font-weight:800; color:#64748b; text-transform:uppercase; display:block;">Para Parejas (1 Boda)</span>
                        <h4 style="font-size:1.05rem; font-weight:800; color:#0f172a; margin:4px 0 8px;">Pase Boda Única</h4>
                        <div style="font-size:1.35rem; font-weight:900; color:#0f172a; margin-bottom:6px;">$4,820 <small style="font-size:0.75rem; color:#64748b;">MXN</small></div>
                        <p style="font-size:0.75rem; color:#475569; margin:0 0 12px;">12 meses sin mensualidades recurrentes. Incluye Invitación Web y WhatsApp.</p>
                    </div>
                    <button type="button" onclick="openStripeCheckoutModal('single_wedding', 'one_time')" style="width:100%; padding:10px; background:#0f172a; color:#ffffff; border:none; border-radius:10px; font-weight:800; font-size:0.82rem; cursor:pointer;">
                        💳 Pagar $4,820
                    </button>
                </div>

                <div style="border:2px solid #c59b27; border-radius:16px; padding:18px; text-align:left; display:flex; flex-direction:column; justify-content:space-between; background:#fffdf8; box-shadow:0 6px 20px rgba(197,155,39,0.15);">
                    <div>
                        <span style="font-size:0.7rem; font-weight:800; color:#b45309; text-transform:uppercase; display:block;">Wedding Planners</span>
                        <h4 style="font-size:1.05rem; font-weight:800; color:#0f172a; margin:4px 0 8px;">Plan Signature Pro</h4>
                        <div style="font-size:1.35rem; font-weight:900; color:#b45309; margin-bottom:6px;">$1,990 <small style="font-size:0.75rem; color:#64748b;">MXN / mes</small></div>
                        <p style="font-size:0.75rem; color:#475569; margin:0 0 12px;">Hasta 10 bodas simultáneas, marca blanca y soporte para eventos.</p>
                    </div>
                    <button type="button" onclick="openStripeCheckoutModal('intermediate', 'monthly')" style="width:100%; padding:10px; background:linear-gradient(135deg, #c59b27 0%, #947118 100%); color:#ffffff; border:none; border-radius:10px; font-weight:800; font-size:0.82rem; cursor:pointer; box-shadow:0 4px 12px rgba(197,155,39,0.35);">
                        ✨ Pagar $1,990 / mes
                    </button>
                </div>
            </div>

            <div style="display:flex; justify-content:center; align-items:center; gap:16px;">
                <button type="button" onclick="exitDemoMode()" style="background:transparent; border:none; color:#64748b; font-size:0.82rem; font-weight:700; cursor:pointer; text-decoration:underline;">
                    🚪 Cerrar Sesión
                </button>
                <span style="color:#cbd5e1;">•</span>
                <a href="https://wa.me/528122199352?text=Hola%20Luis,%20mi%20periodo%20de%20prueba%20en%20PaseBoda%20ha%20terminado%20y%20quiero%20reactivar%20mi%20cuenta" target="_blank" style="color:#16a34a; font-size:0.82rem; font-weight:800; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                    💬 WhatsApp de Soporte (81 2219 9352)
                </a>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

window.isAccountInTrial = isAccountInTrial;
window.isAccountTrialExpired = isAccountTrialExpired;
window.getTrialDaysRemaining = getTrialDaysRemaining;
window.showTrialFeatureLockedModal = showTrialFeatureLockedModal;
window.closeTrialFeatureLockedModal = closeTrialFeatureLockedModal;
window.showTrialExpiredFreezeModal = showTrialExpiredFreezeModal;

