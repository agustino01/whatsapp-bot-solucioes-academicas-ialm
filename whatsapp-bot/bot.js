const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const pino = require("pino");

// ── CONFIGURACIÓN ──────────────────────────────────────────────
// Tu número de WhatsApp (para recibir notificaciones de mensajes no reconocidos)
const TU_NUMERO = "5492966706665"; // sin + ni espacios

// ── MEMORIA: guarda a qué usuarios ya se les envió el saludo hoy ──
const saludoEnviado = new Map(); // jid -> fecha (YYYY-MM-DD)

function hoy() {
  return new Date().toISOString().slice(0, 10); // "2025-06-01"
}

function yaFueSaludado(jid) {
  return saludoEnviado.get(jid) === hoy();
}

function marcarSaludado(jid) {
  saludoEnviado.set(jid, hoy());
}

// ── RESPUESTAS ──────────────────────────────────────────────────
const SALUDO = `¡Hola! Te has comunicado con *Soluciones Académicas* ✨

Por favor, elegí una de las siguientes opciones escribiendo la frase exacta:

1. Necesito ayuda con mi trabajo práctico.
2. Me gustaría saber de qué se trata esta empresa.
3. ¿Cuánto están los precios?

Si querés preguntar otra cosa, escribí tu pregunta y en unos instantes te respondemos. 😊`;

const RESPUESTA_1 = `📚 *Trabajos Prácticos*

¡Con gusto te ayudamos! Trabajamos con:
- Monografías
- Ensayos
- Presentaciones en PowerPoint
- Trabajos escritos en general

Para avanzar, contanos:
👉 ¿Qué materia es?
👉 ¿Qué fecha de entrega tenés?
👉 ¿Cuántas páginas o qué extensión se pide?

Te responderemos a la brevedad. 🙌`;

const RESPUESTA_2 = `🏫 *¿Qué es Soluciones Académicas?*

Somos un equipo especializado en asistencia académica. Ayudamos a estudiantes a alcanzar la excelencia con trabajos de calidad, originales y entregados a tiempo.

✅ Trabajos personalizados
✅ Expertos en distintas áreas
✅ Discreción total
✅ Entrega puntual

¿Querés saber algo más o necesitás un presupuesto? ¡Escribinos! 😊`;

const RESPUESTA_3 = `💰 *Precios*

Nuestros planes son:

📄 *Básico — $10.000 ARS*
Texto académico sin diseño. Solo el contenido.

📋 *Estándar — $15.000 ARS*
Texto + diseño profesional incluido.

⭐ *Premium — $20.000 ARS*
Texto + diseño + búsqueda en foros/apps + revisión por expertos senior.

¿Te interesa alguno? ¡Escribinos y lo coordinamos! 🙌`;

// ── NORMALIZAR TEXTO (quita tildes, espacios extra, mayúsculas) ──
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function detectarOpcion(texto) {
  const t = normalizar(texto);
  if (
    t.includes("necesito ayuda con mi trabajo practico") ||
    t === "1" ||
    t === "opcion 1"
  )
    return 1;
  if (
    t.includes("me gustaria saber de que se trata") ||
    t.includes("de que se trata esta empresa") ||
    t === "2" ||
    t === "opcion 2"
  )
    return 2;
  if (
    t.includes("cuanto estan los precios") ||
    t.includes("cuales son los precios") ||
    t.includes("precios") ||
    t === "3" ||
    t === "opcion 3"
  )
    return 3;
  return null;
}

// ── BOT PRINCIPAL ───────────────────────────────────────────────
async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
  });

  // Mostrar QR en terminal
  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.clear();
      console.log("📱 Escaneá este QR con tu WhatsApp:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ Bot conectado exitosamente a WhatsApp");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("❌ Conexión cerrada. Reconectando:", shouldReconnect);
      if (shouldReconnect) iniciarBot();
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // Manejar mensajes entrantes
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      // Ignorar mensajes propios o de grupos
      if (msg.key.fromMe) continue;
      if (msg.key.remoteJid.endsWith("@g.us")) continue;

      const jid = msg.key.remoteJid;
      const texto =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "";

      if (!texto) continue;

      console.log(`📩 Mensaje de ${jid}: ${texto}`);

      // Si es la primera vez hoy → enviar saludo
      if (!yaFueSaludado(jid)) {
        marcarSaludado(jid);
        await sock.sendMessage(jid, { text: SALUDO });
        console.log(`👋 Saludo enviado a ${jid}`);
        continue;
      }

      // Detectar opción
      const opcion = detectarOpcion(texto);

      if (opcion === 1) {
        await sock.sendMessage(jid, { text: RESPUESTA_1 });
        console.log(`✅ Respondido opción 1 a ${jid}`);
      } else if (opcion === 2) {
        await sock.sendMessage(jid, { text: RESPUESTA_2 });
        console.log(`✅ Respondido opción 2 a ${jid}`);
      } else if (opcion === 3) {
        await sock.sendMessage(jid, { text: RESPUESTA_3 });
        console.log(`✅ Respondido opción 3 a ${jid}`);
      } else {
        // Pregunta no reconocida → notificar al dueño
        const notificacion = `🔔 *Nuevo mensaje sin respuesta automática*\n\nDe: ${jid.replace("@s.whatsapp.net", "")}\nMensaje: "${texto}"\n\n_Respondé vos directamente._`;
        await sock.sendMessage(TU_NUMERO + "@s.whatsapp.net", {
          text: notificacion,
        });
        // Avisarle al cliente que lo atenderán
        await sock.sendMessage(jid, {
          text: "¡Gracias por escribirnos! 🙌 Tu consulta fue recibida y te responderemos en unos instantes.",
        });
        console.log(`🔔 Notificación enviada al dueño por mensaje de ${jid}`);
      }
    }
  });
}

iniciarBot();
