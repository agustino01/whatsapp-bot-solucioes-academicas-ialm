t de WhatsApp — Soluciones Académicas

## ¿Qué hace este bot?
- Saluda a cada contacto **una sola vez por día** con el menú de opciones
- Responde automáticamente las 3 opciones del menú
- Si alguien escribe algo que no reconoce, **te manda una notificación a vos** y le avisa al cliente que lo atenderán pronto

---

## ⚙️ Instalación (Windows)

### 1. Instalá Node.js
Descargalo de: https://nodejs.org (versión LTS)

### 2. Abrí la carpeta del bot
Copiá esta carpeta `whatsapp-bot` en tu PC.
Abrí una terminal (CMD o PowerShell) dentro de esa carpeta.

### 3. Instalá las dependencias
```
npm install
```

### 4. Iniciá el bot
```
npm start
```

### 5. Escaneá el QR
- Abrí WhatsApp en tu celular
- Ir a **Dispositivos vinculados → Vincular un dispositivo**
- Escaneá el QR que aparece en la terminal

¡Listo! El bot queda corriendo. 🎉

---

## 🌐 Para correrlo 24/7 (Railway)

1. Subí esta carpeta a GitHub
2. Entrá a https://railway.app
3. Creá un nuevo proyecto desde tu repo de GitHub
4. Railway lo detecta automáticamente y lo corre

---

## 📝 Personalización

Abrí `bot.js` y podés cambiar:
- `TU_NUMERO` → tu número para recibir notificaciones
- `SALUDO` → el mensaje de bienvenida
- `RESPUESTA_1`, `RESPUESTA_2`, `RESPUESTA_3` → las respuestas automáticas

---

## ⚠️ Nota
Este bot usa Baileys, una librería no oficial.
Funciona con número personal de WhatsApp, no requiere WhatsApp Business.
