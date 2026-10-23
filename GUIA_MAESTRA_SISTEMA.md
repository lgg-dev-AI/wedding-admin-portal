# 📖 GUÍA MAESTRA DEL SISTEMA: WEDDING OS & TORRE DE CONTROL SAAS
**Antigravity Web Studio · Documento Técnico y Operativo de Arquitectura**
*Versión: 2.4.0 · Propietario: Luis (Master Developer)*

---

## 🎯 1. VISIÓN GENERAL DE LA PLATAFORMA

Wedding OS es una plataforma **SaaS B2B2C (Software as a Service)** diseñada para monetizar dos niveles clave:
1. **B2B (Tú -> Wedding Planners):** Venta de suscripciones recurrentes ($800, $2,000 y $3,500 MXN mensuales) para que las agencias gestionen sus bodas.
2. **B2C (Wedding Planners -> Novios):** Herramientas donde los novios interactúan con sus invitados, confirman asistencias (RSVP), acomodan mesas y reciben regalos de luna de miel.

El sistema cuenta con un **mecanismo de 3 roles estrictamente aislados**:
- `💎 Master Developer` (Solo tú): Control financiero, clientes, Stripe y respaldos.
- `👑 Wedding Planner` (Tu cliente): Logística de eventos y empaquetado de servicios.
- `👰 Vista Novios` (Los clientes de la planner): Experiencia del evento de la pareja.

---

## 🧭 2. MAPA DE VISTAS Y MÓDULOS DEL SISTEMA

### 💎 VISTA: MASTER DEVELOPER (Exclusiva para ti)
*Acceso con tu correo `antigravitywebstudio@hotmail.com` y PIN `2101`.*

| Módulo / Pestaña | Qué hace y para qué sirve |
| :--- | :--- |
| **💎 Planners, Cobranza & Stripe** | **Tu consola de facturación central.** Muestra todas las agencias registradas, su estatus de pago (`paid`, `reminder_3w`, `due_72h`, `due_24h`, `grace_period`, `overdue`), botón para generar enlaces Stripe, envío de recordatorios de cobro y el **botón de Oferta de Lealtad (15%-20% OFF)** para clientas con más de 3 meses. |
| **⚙️ Configuración de Planes** | Catálogo comercial de los 3 planes de suscripción ($800, $2,000, $3,500 MXN) y la matriz de control granular que las planners pueden encender o apagar para sus parejas. |
| **💾 Respaldos de Base de Datos** | Motor de exportación/importación de archivos `.JSON` de toda la información de las bodas y el portafolio maestro para seguridad y migración. |

---

### 👑 VISTA: WEDDING PLANNER (Lo que ve tu cliente agencia)
*La planner gestiona sus bodas según el plan que te haya pagado.*

| Módulo / Pestaña | Qué hace y para qué sirve |
| :--- | :--- |
| **📊 Dashboard General** | Resumen ejecutivo de la boda: número de confirmados, porcentaje de asistencia, total recaudado en mesa de regalos y desglose de platillos para el chef. |
| **📲 Control Envíos WhatsApp** | Sistema de invitaciones digitales masivas con blindaje antispam (delays aleatorios) y trazabilidad de entrega a cada invitado con 1 clic. |
| **🪑 Acomodo & Plano 2D** | Diseñador interactivo del salón: arrastrar mesas (redondas, rectangulares, imperiales) y sentar comensales visualmente con control de capacidad. |
| **⏱️ Run of Show & Escaleta** | Minuta minuto a minuto del día del evento (llegada del mariachi, vals, cena, fuegos artificiales) con responsables asignados. |
| **📱 Check-in Hostess Día D** | Escáner QR en vivo para la puerta de la recepción. La hostess escanea el pase digital del invitado en su celular y lo marca como ingresado en tiempo real sin filas. |
| **🍾 Barra & Descorche** | Calculadora matemática de botellas de destilados y vinos según el perfil de invitados, más inventario de entrada/salida de cajas de licor. |
| **🏢 Proveedores & Anticipos** | Directorio confidencial de la planner: costos pactados, pagos realizados, saldos pendientes y contratos de fotografía, música, flores, etc. |
| **👥 CRM Invitados & Menú** | Base de datos maestra de invitados: acompañantes, alergias, intolerancias alimentarias y estatus de confirmación. |
| **💳 Comprobantes & Regalos** | Validación de comprobantes bancarios SPEI transferidos por los invitados a la cuenta de luna de miel de los novios. |
| **📸 Álbum Colaborativo (QR)** | Galería en la nube donde los invitados escanean un código en las mesas y suben sus fotos tomadas durante la boda en vivo. |
| **🎵 Playlist para el DJ** | Buzón musical interactivo donde los novios y sus invitados votan canciones que no deben faltar en la fiesta. |
| **✉️ Campañas de Correo** | Envíos programados de "Save the Date", recordatorios de vestimenta formal y cartas de agradecimiento. |
| **✈️ Logística & Hoteles** | Información para invitados foráneos: códigos de descuento en hoteles sede, mapas y rutas de transporte van. |
| **⚙️ Configuración de Planes** | **El centro de control de permisos para los novios.** Aquí la planner paga su membresía de Stripe y activa o apaga qué herramientas les permite ver a sus novios. Si no tiene plan activo, todos los interruptores están bloqueados con candado 🔒. |

---

### 👰 VISTA: NOVIOS (Lo que ve la pareja)
*Diseñada para ser simple y emocionante; todo lo financiero y administrativo está oculto.*

- Solo ven los módulos que la Wedding Planner les haya dejado activados en el "Control Granular".
- Típicamente: Su lista de invitados (**CRM**), el **Acomodo de Mesas**, su **Álbum de fotos**, el tablero de **Envíos de WhatsApp** para invitar a sus amigos y la **Mesa de regalos**.
- **Jamás ven:** Ni cobranzas de Stripe, ni la minuta interna de proveedores, ni costos reales del evento.

---

## 💳 3. POLÍTICA DE PLANES, PRECIOS Y UPGRADES (REGLAS DE NEGOCIO)

### Precios Base Mensuales:
1. **🥉 Plan Essential (Boutique):** `$800 MXN / mes` (1 a 3 bodas simultáneas).
2. **🥈 Plan Signature Pro (Logística):** `$2,000 MXN / mes` (1 a 10 bodas simultáneas).
3. **👑 Plan Atelier Elite (Full Experience):** `$3,500 MXN / mes` (Hasta 15 bodas · Marca Blanca).

### Regla Antimanipulación (Upgrade Inmediato):
- Si una planner contrata *Essential* ($800) y quiere subir de inmediato al *Signature Pro* ($2,000), se le cobran **$1,700 adicionales**, pagando un total de **$2,500 MXN** ($500 pesos más que si lo hubiera comprado directo). Esto incentiva adquirir el Signature Pro desde el principio.

### Regla de Lealtad (Recompensa tras 3 Meses):
- Cuando una planner cumple **3 meses consecutivos pagando puntualmente**, tú como desarrollador puedes pulsar el botón **`🎁 Lealtad`** en tu consola para enviarle una oferta con descuento permanente:
  - **De Essential a Signature Pro:** **15% de descuento** ($1,700/mes fijos).
  - **De Essential / Signature Pro a Atelier Elite:** **20% de descuento** ($2,800/mes fijos, ahorrándole $700 MXN cada mes).

---

## 🔒 4. MODO DE DEMO INTERACTIVA
- Desde la pantalla de inicio de sesión (`login`), cualquier planner nueva puede pulsar **`🎭 Probar Demo Interactiva`**.
- Esto le permite explorar una boda real de prueba (Mallorca 2027) con datos reales precargados para enamorarse del producto.
- Al terminar, presiona **`✕ Salir Demo`** y regresa de inmediato al inicio de sesión para contratar su cuenta oficial.
